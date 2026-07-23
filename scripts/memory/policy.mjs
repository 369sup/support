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
  sessionEventCount: 50,
});

export const memoryTtlDays = Object.freeze({
  episode: 14,
  working: 30,
  environment: 60,
  workflow: 90,
  repeatedObservation: 90,
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

