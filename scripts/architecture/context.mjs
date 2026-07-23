export const activeContextReadmeHeadings = Object.freeze([
  "Purpose",
  "Context content tree",
  "Designed use cases",
  "Ubiquitous language",
  "Ownership and invariants",
  "Public capabilities",
  "Dependencies and consistency",
  "Authorization",
  "Persistence and transactions",
  "Data classification",
  "Retention and erasure",
  "Events and failure behavior",
  "Official sources",
  "Exceptions",
]);

export const plannedContextReadmeHeadings = Object.freeze([
  "Purpose",
  "Context content tree",
  "Designed use cases",
  "Ownership and invariants",
  "Dependencies and consistency",
  "Official sources",
  "Exceptions",
]);

export const designedUseCaseFields = Object.freeze([
  "Type",
  "Application boundary",
  "Public entrypoint",
  "Input",
  "Success result",
  "Expected rejections",
  "Authorization",
  "Transaction",
  "Idempotency",
  "Dependencies",
  "Published events",
  "Official evidence",
  "Local policy",
]);

export const blockedUseCaseDesign =
  "No approved use cases. Implementation remains blocked.";

export function sourceFreshnessFor(context, now = new Date()) {
  if (context.kind === "technical") {
    return "not-applicable";
  }

  const sources = context.officialSources ?? [];

  if (sources.some((source) => source.verifiedOn === null)) {
    return "unverified";
  }

  const today = now.toISOString().slice(0, 10);
  const nowTime = Date.parse(`${today}T00:00:00.000Z`);
  const hasStaleSource = sources.some((source) => {
    const verifiedTime = Date.parse(`${source.verifiedOn}T00:00:00.000Z`);
    const maximumAgeDays =
      (source.maturity ?? context.maturity) === "preview" ? 90 : 365;
    const ageDays = (nowTime - verifiedTime) / 86_400_000;
    return !Number.isFinite(verifiedTime) ||
      source.verifiedOn > today ||
      ageDays > maximumAgeDays;
  });

  return hasStaleSource ? "stale" : "fresh";
}
