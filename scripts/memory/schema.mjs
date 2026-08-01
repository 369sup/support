import {
  containsSensitiveValue,
  estimateTokens,
  evidenceTypes,
  memoryAuthorities,
  memoryDurabilities,
  memoryKinds,
  memoryLimits,
  memorySchemaVersion,
  memoryScopes,
  memoryStatuses,
  normalizeRepositoryPath,
  normalizeStatement,
  normalizeSubject,
} from "./model.mjs";

export const candidateBundleStart =
  "<!-- serena-memory-candidates:start -->";
export const candidateBundleEnd = "<!-- serena-memory-candidates:end -->";

const bundleKeys = new Set([
  "schemaVersion",
  "checkpointToken",
  "disposition",
  "candidates",
]);
const candidateKeys = new Set([
  "kind",
  "scope",
  "subject",
  "statement",
  "status",
  "authority",
  "confidence",
  "durability",
  "evidence",
  "invalidatedBy",
]);
const evidenceKeys = new Set(["type", "reference"]);

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertRecord(value, label) {
  if (!isRecord(value)) {
    throw new Error(`${label} must be a JSON object.`);
  }
}

function assertExactKeys(value, allowedKeys, label) {
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      throw new Error(`${label} contains unsupported field "${key}".`);
    }
  }
}

function assertRequiredKeys(value, requiredKeys, label) {
  for (const key of requiredKeys) {
    if (!(key in value)) {
      throw new Error(`${label} is missing required field "${key}".`);
    }
  }
}

function assertEnum(value, options, label) {
  if (!options.includes(value)) {
    throw new Error(`${label} must be one of: ${options.join(", ")}.`);
  }
}

function assertBoundedString(value, maximumLength, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string.`);
  }

  if (value.length > maximumLength) {
    throw new Error(`${label} exceeds ${maximumLength} characters.`);
  }

  if (value.includes("\0")) {
    throw new Error(`${label} contains a null byte.`);
  }

  if (containsSensitiveValue(value)) {
    throw new Error(`${label} appears to contain a sensitive value.`);
  }
}

function validateEvidence(repositoryRoot, evidence, candidateIndex, evidenceIndex) {
  const label = `Candidate ${candidateIndex + 1} evidence ${evidenceIndex + 1}`;
  assertRecord(evidence, label);
  assertExactKeys(evidence, evidenceKeys, label);
  assertRequiredKeys(evidence, evidenceKeys, label);
  assertEnum(evidence.type, evidenceTypes, `${label} type`);
  assertBoundedString(
    evidence.reference,
    memoryLimits.evidenceReferenceCharacters,
    `${label} reference`,
  );

  const reference = evidence.reference.trim();

  if (/[\r\n]/.test(reference)) {
    throw new Error(`${label} reference must be a single line.`);
  }

  if (
    evidence.type === "repository-file" &&
    normalizeRepositoryPath(repositoryRoot, reference) === null
  ) {
    throw new Error(
      `${label} repository-file reference must stay inside the repository.`,
    );
  }

  return {
    reference:
      evidence.type === "repository-file"
        ? normalizeRepositoryPath(repositoryRoot, reference)
        : reference,
    type: evidence.type,
  };
}

function validateCandidate(repositoryRoot, candidate, index) {
  const label = `Candidate ${index + 1}`;
  assertRecord(candidate, label);
  assertExactKeys(candidate, candidateKeys, label);
  assertRequiredKeys(candidate, candidateKeys, label);
  assertEnum(candidate.kind, memoryKinds, `${label} kind`);
  assertEnum(candidate.scope, memoryScopes, `${label} scope`);
  assertEnum(candidate.status, memoryStatuses, `${label} status`);
  assertEnum(candidate.authority, memoryAuthorities, `${label} authority`);
  assertEnum(candidate.durability, memoryDurabilities, `${label} durability`);
  assertBoundedString(
    candidate.subject,
    memoryLimits.subjectCharacters,
    `${label} subject`,
  );
  assertBoundedString(
    candidate.statement,
    memoryLimits.statementCharacters,
    `${label} statement`,
  );

  if (
    typeof candidate.confidence !== "number" ||
    !Number.isFinite(candidate.confidence) ||
    candidate.confidence < 0 ||
    candidate.confidence > 1
  ) {
    throw new Error(`${label} confidence must be between 0 and 1.`);
  }

  if (candidate.statement.includes("```")) {
    throw new Error(`${label} statement must not contain a code fence.`);
  }

  if ((candidate.statement.match(/\r?\n/g) ?? []).length > 3) {
    throw new Error(`${label} statement contains too many lines.`);
  }

  if (!Array.isArray(candidate.evidence)) {
    throw new Error(`${label} evidence must be an array.`);
  }

  if (candidate.evidence.length > memoryLimits.evidenceCount) {
    throw new Error(
      `${label} evidence exceeds ${memoryLimits.evidenceCount} entries.`,
    );
  }

  if (!Array.isArray(candidate.invalidatedBy)) {
    throw new Error(`${label} invalidatedBy must be an array.`);
  }

  if (candidate.invalidatedBy.length > memoryLimits.invalidatedByCount) {
    throw new Error(
      `${label} invalidatedBy exceeds ${memoryLimits.invalidatedByCount} entries.`,
    );
  }

  const evidence = candidate.evidence.map((item, evidenceIndex) => {
    return validateEvidence(repositoryRoot, item, index, evidenceIndex);
  });
  const invalidatedBy = candidate.invalidatedBy.map((item, itemIndex) => {
    assertBoundedString(
      item,
      memoryLimits.invalidatedByCharacters,
      `${label} invalidatedBy ${itemIndex + 1}`,
    );

    if (/[\r\n]/.test(item)) {
      throw new Error(`${label} invalidatedBy entries must be single-line.`);
    }

    return normalizeStatement(item);
  });

  if (
    candidate.authority === "canonical" &&
    !evidence.some((item) => item.type === "repository-file")
  ) {
    throw new Error(
      `${label} canonical authority requires repository-file evidence.`,
    );
  }

  const subject = normalizeSubject(candidate.subject);
  const statement = normalizeStatement(candidate.statement);

  if (subject === "") {
    throw new Error(`${label} subject has no safe normalized value.`);
  }

  const normalized = {
    authority: candidate.authority,
    confidence: candidate.confidence,
    durability: candidate.durability,
    evidence,
    invalidatedBy,
    kind: candidate.kind,
    scope: candidate.scope,
    statement,
    status: candidate.status,
    subject,
  };
  const estimatedRenderedTokens = estimateTokens(
    JSON.stringify(normalized) + statement,
  );

  if (estimatedRenderedTokens > memoryLimits.durableMemoryTokens) {
    throw new Error(
      `${label} exceeds the ${memoryLimits.durableMemoryTokens}-token durable-memory budget.`,
    );
  }

  return normalized;
}

export function validateCandidateBundle(repositoryRoot, value, options = {}) {
  assertRecord(value, "Candidate bundle");
  assertExactKeys(value, bundleKeys, "Candidate bundle");
  assertRequiredKeys(value, bundleKeys, "Candidate bundle");

  if (value.schemaVersion !== memorySchemaVersion) {
    throw new Error(
      `Candidate bundle schemaVersion must be ${memorySchemaVersion}.`,
    );
  }

  assertBoundedString(value.checkpointToken, 128, "Checkpoint token");

  if (value.checkpointToken.length < 16) {
    throw new Error("Checkpoint token must contain at least 16 characters.");
  }

  if (
    options.expectedCheckpointToken !== undefined &&
    value.checkpointToken !== options.expectedCheckpointToken
  ) {
    throw new Error("Candidate bundle checkpoint token is stale or invalid.");
  }

  assertEnum(
    value.disposition,
    ["distill", "no-memory"],
    "Candidate bundle disposition",
  );

  if (!Array.isArray(value.candidates)) {
    throw new Error("Candidate bundle candidates must be an array.");
  }

  if (value.candidates.length > memoryLimits.candidateCount) {
    throw new Error(
      `Candidate bundle exceeds ${memoryLimits.candidateCount} candidates.`,
    );
  }

  if (value.disposition === "no-memory" && value.candidates.length !== 0) {
    throw new Error("A no-memory bundle must contain zero candidates.");
  }

  if (value.disposition === "distill" && value.candidates.length === 0) {
    throw new Error("A distill bundle must contain at least one candidate.");
  }

  return {
    candidates: value.candidates.map((candidate, index) => {
      return validateCandidate(repositoryRoot, candidate, index);
    }),
    checkpointToken: value.checkpointToken,
    disposition: value.disposition,
    schemaVersion: memorySchemaVersion,
  };
}

export function parseCandidateBundleFromTask(
  repositoryRoot,
  contents,
  options = {},
) {
  if (typeof contents !== "string") {
    throw new Error("Current-task memory must be text.");
  }

  if (contents.length > memoryLimits.currentTaskCharacters) {
    throw new Error(
      `Current-task memory exceeds ${memoryLimits.currentTaskCharacters} characters.`,
    );
  }

  if (containsSensitiveValue(contents)) {
    throw new Error("Current-task memory appears to contain a sensitive value.");
  }

  const escapedStart = candidateBundleStart.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedEnd = candidateBundleEnd.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `${escapedStart}\\s*\`\`\`json\\s*([\\s\\S]*?)\\s*\`\`\`\\s*${escapedEnd}`,
    "g",
  );
  const matches = [...contents.matchAll(pattern)];

  if (matches.length !== 1) {
    throw new Error(
      "Current-task memory must contain exactly one marked JSON candidate bundle.",
    );
  }

  let parsed;

  try {
    parsed = JSON.parse(matches[0][1]);
  } catch {
    throw new Error("Current-task candidate bundle is not valid JSON.");
  }

  return validateCandidateBundle(repositoryRoot, parsed, options);
}

export function renderCandidateBundleTemplate(checkpointToken) {
  const bundle = {
    candidates: [],
    checkpointToken,
    disposition: "no-memory",
    schemaVersion: memorySchemaVersion,
  };

  return [
    candidateBundleStart,
    "```json",
    JSON.stringify(bundle, null, 2),
    "```",
    candidateBundleEnd,
  ].join("\n");
}

