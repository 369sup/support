import {
  estimateTokens,
  managedMemoryName,
  memoryLimits,
  memoryTitle,
} from "./policy.mjs";

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
  const sorted = [...entries].sort((left, right) => {
    return managedMemoryName(left).localeCompare(managedMemoryName(right));
  });
  const entryLines = [];

  for (const entry of sorted) {
    const nextEntryLines = [
      ...entryLines,
      `- \`mem:${managedMemoryName(entry)}\``,
    ];
    const remaining = sorted.length - nextEntryLines.length;
    const candidate = [...lines, ...nextEntryLines];

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

    entryLines.push(nextEntryLines.at(-1));
  }

  lines.push(...entryLines);
  const listedCount = entryLines.length;

  if (listedCount < sorted.length) {
    lines.push(
      "",
      `${sorted.length - listedCount} additional managed memories are available by topic under \`local/durable\`.`,
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
  const lines = [
    managedHeader,
    "# Unresolved Memory Items",
    "",
  ];

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
    const candidate = `${lines.concat(section).join("\n")}\n`;

    if (estimateTokens(candidate) > memoryLimits.durableMemoryTokens) {
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
    const candidate = `${lines.concat(section).join("\n")}\n`;

    if (estimateTokens(candidate) > memoryLimits.durableMemoryTokens) {
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
