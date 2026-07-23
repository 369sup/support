import { createHash } from "node:crypto";
import { isAbsolute, relative, resolve, sep } from "node:path";

export const memorySchemaVersion = 1;

export const memoryKinds = Object.freeze([
  "decision",
  "constraint",
  "verified-result",
  "environment",
  "workflow",
  "unresolved",
]);

export const memoryScopes = Object.freeze([
  "task",
  "worktree",
  "repository",
  "environment",
]);

export const memoryAuthorities = Object.freeze([
  "canonical",
  "user-decision",
  "verified-result",
  "repeated-observation",
  "inference",
]);

export const memoryDurabilities = Object.freeze([
  "episode",
  "working",
  "durable",
]);

export const memoryStatuses = Object.freeze(["confirmed", "unresolved"]);

export const evidenceTypes = Object.freeze([
  "user-instruction",
  "repository-file",
  "test-result",
  "diagnostic",
  "tool-observation",
]);

export const authorityRank = Object.freeze({
  canonical: 5,
  "user-decision": 4,
  "verified-result": 3,
  "repeated-observation": 2,
  inference: 1,
});

export const memoryLimits = Object.freeze({
  candidateCount: 8,
  currentTaskCharacters: 8_000,
  evidenceCount: 6,
  evidenceReferenceCharacters: 240,
  indexTokens: 800,
  invalidatedByCount: 6,
  invalidatedByCharacters: 180,
  subjectCharacters: 80,
  statementCharacters: 600,
  durableMemoryTokens: 700,
  hookInputCharacters: 1_000_000,
});

export const memoryTtlDays = Object.freeze({
  episode: 14,
  working: 30,
  environment: 60,
  workflow: 90,
});

export const lockPolicy = Object.freeze({
  retryDelayMilliseconds: 50,
  retryLimit: 40,
  staleMilliseconds: 30_000,
});

const secretPatterns = [
  /\bsk-(?:proj-)?[a-z0-9_-]{16,}\b/i,
  /\bgh[pousr]_[a-z0-9]{20,}\b/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bauthorization\s*:\s*bearer\s+[^\s]{4,}/i,
  /\b(?:api[_ -]?key|access[_ -]?token|password|secret)\s*[:=]\s*["']?[^\s"']{8,}/i,
  /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^/\s]+:[^@\s]+@/i,
];

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function estimateTokens(value) {
  return Math.ceil(value.length / 4);
}

export function containsSensitiveValue(value) {
  return secretPatterns.some((pattern) => pattern.test(value));
}

export function normalizeStatement(value) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeSubject(value) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll("\\", "/")
    .replace(/[^a-z0-9/-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "");
}

export function normalizeRepositoryPath(repositoryRoot, candidate) {
  if (typeof candidate !== "string" || candidate.trim() === "") {
    return null;
  }

  const trimmed = candidate.trim();
  const absolutePath = isAbsolute(trimmed)
    ? resolve(trimmed)
    : resolve(repositoryRoot, trimmed);
  const repositoryPath = relative(repositoryRoot, absolutePath);

  if (
    repositoryPath === "" ||
    repositoryPath === ".." ||
    repositoryPath.startsWith(`..${sep}`) ||
    repositoryPath.startsWith("../") ||
    isAbsolute(repositoryPath)
  ) {
    return null;
  }

  return repositoryPath.replaceAll(sep, "/");
}

export function candidateIdentity(candidate) {
  return `${candidate.kind}:${candidate.scope}:${candidate.subject}`;
}

export function candidateContentHash(candidate) {
  return sha256(
    JSON.stringify({
      authority: candidate.authority,
      identity: candidateIdentity(candidate),
      statement: candidate.statement,
      status: candidate.status,
    }),
  );
}

export function candidateId(candidate) {
  return `sha256:${candidateContentHash(candidate)}`;
}

export function expirationFor(candidate, now) {
  let ttlDays = null;

  if (candidate.durability === "episode") {
    ttlDays = memoryTtlDays.episode;
  } else if (candidate.durability === "working") {
    ttlDays = memoryTtlDays.working;
  } else if (candidate.kind === "environment") {
    ttlDays = memoryTtlDays.environment;
  } else if (
    candidate.kind === "workflow" ||
    candidate.authority === "repeated-observation"
  ) {
    ttlDays = memoryTtlDays.workflow;
  }

  if (ttlDays === null) {
    return null;
  }

  return new Date(now.getTime() + ttlDays * 86_400_000).toISOString();
}

export function managedMemoryName(candidate) {
  return `local/durable/${candidate.kind}/${candidate.scope}--${candidate.subject}`;
}

export function memoryTitle(candidate) {
  return candidate.subject
    .split(/[-/]/)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

const managedHeader =
  "<!-- Managed by scripts/memory. Do not edit this rendered view directly. -->";

function formatMetadata(label, value) {
  return `**${label}:** ${value ?? "none"}`;
}

export function renderDurableMemory(entry) {
  const lines = [
    managedHeader,
    `# ${memoryTitle(entry)}`,
    "",
    formatMetadata("Status", entry.status),
    formatMetadata("Scope", entry.scope),
    formatMetadata("Authority", entry.authority),
    formatMetadata("Confidence", entry.confidence),
    formatMetadata("Last confirmed", entry.lastConfirmedAt),
    formatMetadata("Expires", entry.expiresAt),
    "",
    "## Statement",
    "",
    entry.statement,
  ];

  if (entry.evidence.length > 0) {
    lines.push("", "## Evidence", "");
    for (const evidence of entry.evidence) {
      lines.push(`- ${evidence.type}: \`${evidence.reference}\``);
    }
  }

  if (entry.invalidatedBy.length > 0) {
    lines.push("", "## Revalidate when", "");
    for (const condition of entry.invalidatedBy) {
      lines.push(`- ${condition}`);
    }
  }

  lines.push("");
  const rendered = lines.join("\n");
  if (estimateTokens(rendered) > memoryLimits.durableMemoryTokens) {
    throw new Error(
      `Rendered memory ${managedMemoryName(entry)} exceeds the durable-memory token budget.`,
    );
  }
  return rendered;
}

function compactIndex(entries, options = {}) {
  const lines = [
    managedHeader,
    "# Local Memory Index",
    "",
    "## Current work",
    "",
    "- `mem:local/unresolved`",
    "",
    "## Managed durable memories",
    "",
  ];
  if (options.includeCurrentTask) {
    lines.splice(5, 0, "- `mem:local/current-task`");
  }
  const sorted = [...entries].sort((left, right) =>
    managedMemoryName(left).localeCompare(managedMemoryName(right)),
  );
  const entryLines = [];

  for (const entry of sorted) {
    const nextLine = `- \`mem:${managedMemoryName(entry)}\``;
    const remaining = sorted.length - entryLines.length - 1;
    const candidate = [...lines, ...entryLines, nextLine];
    if (remaining > 0) {
      candidate.push(
        "",
        `${remaining} additional managed memories are available by topic under \`local/durable\`.`,
      );
    }
    candidate.push(
      "",
      "Repository authorities and generated shared memories remain authoritative.",
      "",
    );
    if (estimateTokens(candidate.join("\n")) > memoryLimits.indexTokens) {
      break;
    }
    entryLines.push(nextLine);
  }

  lines.push(...entryLines);
  if (entryLines.length < sorted.length) {
    lines.push(
      "",
      `${sorted.length - entryLines.length} additional managed memories are available by topic under \`local/durable\`.`,
    );
  }
  lines.push(
    "",
    "Repository authorities and generated shared memories remain authoritative.",
    "",
  );
  return lines.join("\n");
}

export function renderIndex(entries, options = {}) {
  const rendered = compactIndex(entries, options);
  if (estimateTokens(rendered) > memoryLimits.indexTokens) {
    throw new Error("Rendered local memory index exceeds its token budget.");
  }
  return rendered;
}

export function renderUnresolved(conflicts, quarantines = []) {
  const lines = [managedHeader, "# Unresolved Memory Items", ""];
  const activeConflicts = [...conflicts]
    .filter((conflict) => conflict.status === "unresolved")
    .sort((left, right) => right.recordedAt.localeCompare(left.recordedAt));
  const activeQuarantines = [...quarantines]
    .filter((quarantine) => quarantine.status === "unresolved")
    .sort((left, right) => right.archivedAt.localeCompare(left.archivedAt));

  if (activeConflicts.length === 0 && activeQuarantines.length === 0) {
    lines.push("No unresolved managed-memory items.", "");
    return lines.join("\n");
  }

  let renderedCount = 0;
  for (const conflict of activeConflicts) {
    const section = [
      `## ${conflict.identity}`,
      "",
      formatMetadata("Recorded", conflict.recordedAt),
      formatMetadata("Resolution", conflict.resolution),
      "",
      `- Existing (${conflict.existing.authority}): ${conflict.existing.statement}`,
      `- Candidate (${conflict.incoming.authority}): ${conflict.incoming.statement}`,
      "",
    ];
    if (
      estimateTokens(`${lines.concat(section).join("\n")}\n`) >
      memoryLimits.durableMemoryTokens
    ) {
      break;
    }
    lines.push(...section);
    renderedCount += 1;
  }
  if (renderedCount < activeConflicts.length) {
    lines.push(
      `${activeConflicts.length - renderedCount} additional conflicts remain in the managed manifest.`,
      "",
    );
  }
  if (activeQuarantines.length > 0) {
    lines.push("## Quarantined unmanaged memories", "");
  }

  let renderedQuarantines = 0;
  for (const quarantine of activeQuarantines) {
    const section = [
      `### ${quarantine.memoryName}`,
      "",
      formatMetadata("Archived", quarantine.archivedAt),
      formatMetadata("Reason", quarantine.reason),
      formatMetadata("SHA-256", quarantine.contentHash),
      formatMetadata("Archive", quarantine.archiveRelativePath),
      "",
    ];
    if (
      estimateTokens(`${lines.concat(section).join("\n")}\n`) >
      memoryLimits.durableMemoryTokens
    ) {
      break;
    }
    lines.push(...section);
    renderedQuarantines += 1;
  }
  if (renderedQuarantines < activeQuarantines.length) {
    lines.push(
      `${activeQuarantines.length - renderedQuarantines} additional quarantines remain in ownership state.`,
      "",
    );
  }
  return lines.join("\n");
}
