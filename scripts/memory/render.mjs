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

  for (const entry of sorted) {
    lines.push(`- \`mem:${managedMemoryName(entry)}\``);

    if (estimateTokens(`${lines.join("\n")}\n`) > memoryLimits.indexTokens) {
      lines.pop();
      break;
    }
  }

  const listedCount = lines.filter((line) => line.startsWith("- `mem:local/durable/"))
    .length;

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

export function renderUnresolved(conflicts) {
  const lines = [
    managedHeader,
    "# Unresolved Memory Conflicts",
    "",
  ];

  if (conflicts.length === 0) {
    lines.push("No unresolved managed-memory conflicts.", "");
    return lines.join("\n");
  }

  const activeConflicts = [...conflicts]
    .filter((conflict) => conflict.status === "unresolved")
    .sort((left, right) => right.recordedAt.localeCompare(left.recordedAt));
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

  return lines.join("\n");
}
