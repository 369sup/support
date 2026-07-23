import { blockedUseCaseDesign, sourceFreshnessFor } from "./context.mjs";

function renderContextRelationship(relationship) {
  const events = relationship.events?.length > 0
    ? `; events ${relationship.events
        .map((event) => `\`${event.name}@${event.version}\``)
        .join(", ")}`
    : "";

  return `\`${relationship.context}::${relationship.contract}\` (${relationship.mode}${events})`;
}

export function renderContextReadme(context) {
  const contextPath = `${context.subdomain}/${context.name}`;
  const title = context.name
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
  const classification = context.classification ?? "not-applicable";
  const lines = [
    `# ${title} Bounded Context`,
    "",
    `- **Catalog path:** \`${contextPath}\``,
    `- **Kind:** \`${context.kind}\``,
    `- **Classification:** \`${classification}\``,
    `- **Maturity:** \`${context.maturity}\``,
    `- **Implementation:** \`${context.implementationStatus}\``,
    `- **Semantic status:** \`${context.semanticStatus}\``,
    "",
    "## Purpose",
    "",
    context.responsibility,
    "",
    "## Context content tree",
    "",
    `- \`${contextPath}\` [${context.implementationStatus}]`,
    `  - Purpose: ${context.responsibility}`,
    "  - Capabilities",
  ];

  if (context.activationScope.length === 0) {
    lines.push("    - No active use cases; activation scope remains empty.");
  } else {
    for (const scope of context.activationScope) {
      lines.push(`    - \`${scope}\` [active]`);
    }
  }

  lines.push("  - Owned domain concepts");
  for (const concept of context.owns) {
    lines.push(`    - \`${concept}\``);
  }

  lines.push("  - Business rules and invariants");
  if (context.semanticClaims.length === 0) {
    lines.push(
      context.semanticStatus === "not-applicable"
        ? "    - Product-semantic claims are not applicable to this technical context."
        : "    - Pending official-source validation before activation.",
    );
  } else {
    for (const claim of context.semanticClaims) {
      lines.push(`    - \`${claim.id}\`: ${claim.statement}`);
    }
  }

  lines.push("  - Published events");
  if (context.publishedEvents.length === 0) {
    lines.push(`    - None. ${context.eventRationale}`);
  } else {
    for (const event of context.publishedEvents) {
      lines.push(
        `    - \`${event.name}@${event.version}\` [${event.implementationStatus}]: ${event.meaning}`,
      );
    }
  }

  lines.push("- External relationships");
  if (context.dependencies.length === 0) {
    lines.push("  - Runtime dependencies: none.");
  } else {
    lines.push("  - Runtime dependencies");
    for (const relationship of context.dependencies) {
      lines.push(`    - ${renderContextRelationship(relationship)}`);
    }
  }
  if (context.plannedRelationships.length === 0) {
    lines.push("  - Planned relationships: none.");
  } else {
    lines.push("  - Planned relationships");
    for (const relationship of context.plannedRelationships) {
      lines.push(`    - ${renderContextRelationship(relationship)}`);
    }
  }

  lines.push("- Explicit exclusions");
  for (const exclusion of context.excludes) {
    lines.push(`  - \`${exclusion}\``);
  }

  if (context.implementationStatus === "planned") {
    lines.push(
      "",
      "## Designed use cases",
      "",
      blockedUseCaseDesign,
      "",
      "## Ownership and invariants",
      "",
      `This context owns ${context.owns.map((item) => `\`${item}\``).join(", ")}.`,
      `It excludes ${context.excludes.map((item) => `\`${item}\``).join(", ")}.`,
      "",
      "## Dependencies and consistency",
      "",
    );

    if (
      context.dependencies.length === 0 &&
      context.plannedRelationships.length === 0
    ) {
      lines.push("No runtime dependency or planned relationship is cataloged.");
    } else {
      lines.push("### Runtime dependencies", "");
      if (context.dependencies.length === 0) {
        lines.push("None.");
      } else {
        for (const relationship of context.dependencies) {
          lines.push(`- ${renderContextRelationship(relationship)}`);
        }
      }

      lines.push("", "### Planned relationships", "");
      if (context.plannedRelationships.length === 0) {
        lines.push("None.");
      } else {
        for (const relationship of context.plannedRelationships) {
          lines.push(`- ${renderContextRelationship(relationship)}`);
        }
      }
    }

    lines.push("", "## Official sources", "");
    if (context.officialSources.length === 0) {
      lines.push("Not applicable to this technical context.");
    } else {
      for (const source of context.officialSources) {
        const verification = source.verifiedOn === null
          ? "not yet verified"
          : `verified ${source.verifiedOn}`;
        lines.push(
          `- \`${source.id}\`: [${source.supports.join(", ")}](${source.url}) (${verification})`,
        );
      }
    }

    lines.push(
      "",
      "## Exceptions",
      "",
      "No context-specific exception is declared by the catalog. The central",
      "[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.",
      "",
    );

    return lines.join("\n");
  }

  lines.push(
    "",
    "## Designed use cases",
    "",
    blockedUseCaseDesign,
    "",
    "## Ubiquitous language",
    "",
    "The catalog reserves these terms for this context:",
    "",
  );
  for (const concept of context.owns) {
    lines.push(`- \`${concept}\``);
  }
  lines.push(
    "",
    context.implementationStatus === "active"
      ? "Implemented definitions and use-case terminology are refined in this README."
      : context.semanticStatus === "not-applicable"
        ? "Precise definitions must be refined against technical contracts before activation."
        : "Precise definitions must be refined against the official sources before activation.",
    "",
    "## Ownership and invariants",
    "",
    `This context owns ${context.owns.map((item) => `\`${item}\``).join(", ")}.`,
    `It excludes ${context.excludes.map((item) => `\`${item}\``).join(", ")}.`,
    "",
  );
  if (context.semanticClaims.length === 0) {
    lines.push(
      context.semanticStatus === "not-applicable"
        ? "Product-semantic claims are not applicable to this technical context."
        : "No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.",
      "",
    );
  } else {
    for (const claim of context.semanticClaims) {
      lines.push(
        `- \`${claim.id}\`: ${claim.statement}`,
        `  - Ownership: ${claim.ownership.length === 0 ? "none" : claim.ownership.map((item) => `\`${item}\``).join(", ")}`,
        `  - Events: ${claim.events.length === 0 ? "none" : claim.events.map((item) => `\`${item}\``).join(", ")}`,
        `  - Sources: ${claim.sourceIds.map((item) => `\`${item}\``).join(", ")}`,
      );
    }
    lines.push("");
  }

  lines.push("## Public capabilities", "");
  if (context.activationScope.length === 0) {
    lines.push(
      "None while planned. Activation requires at least one real use case and public consumer.",
      "",
    );
  } else {
    for (const scope of context.activationScope) {
      lines.push(`- \`${scope}\``);
    }
    lines.push(
      "",
      "Implementation details and use-case rules are maintained in this README.",
      "",
    );
  }

  lines.push("## Dependencies and consistency", "");
  if (
    context.dependencies.length === 0 &&
    context.plannedRelationships.length === 0
  ) {
    lines.push("No runtime dependency or planned relationship is cataloged.", "");
  } else {
    lines.push("### Runtime dependencies", "");
    if (context.dependencies.length === 0) {
      lines.push("None.", "");
    } else {
      for (const relationship of context.dependencies) {
        lines.push(`- ${renderContextRelationship(relationship)}`);
      }
      lines.push("");
    }
    lines.push("### Planned relationships", "");
    if (context.plannedRelationships.length === 0) {
      lines.push("None.", "");
    } else {
      for (const relationship of context.plannedRelationships) {
        lines.push(`- ${renderContextRelationship(relationship)}`);
      }
      lines.push("");
    }
  }

  const pendingDecision = (decision) => {
    return context.implementationStatus === "active"
      ? `${decision} must be recorded in this README.`
      : `${decision} are not defined while this context is planned. They must be decided and reviewed before activation.`;
  };

  lines.push(
    "## Authorization",
    "",
    pendingDecision("Authorization policy ownership and resource-scope rules"),
    "",
    "## Persistence and transactions",
    "",
    pendingDecision("Persistence ownership and transaction boundaries"),
    "",
    "## Data classification",
    "",
    pendingDecision("Sensitive-data classification and redaction rules"),
    "",
    "## Retention and erasure",
    "",
    pendingDecision("Retention, erasure, and tombstone rules"),
    "",
    "## Events and failure behavior",
    "",
  );
  if (context.publishedEvents.length === 0) {
    lines.push(`- None. ${context.eventRationale}`);
  } else {
    for (const event of context.publishedEvents) {
      const contract = event.schema === undefined
        ? "contract and ordering pending activation"
        : `schema \`${event.schema}\`; ordering key \`${event.orderingKey}\``;
      lines.push(
        `- \`${event.name}@${event.version}\` (${event.kind}, ${event.implementationStatus}): ${event.meaning} ${contract}.`,
      );
    }
  }

  lines.push("", "## Official sources", "");
  if (context.officialSources.length === 0) {
    lines.push("Not applicable to this technical context.");
  } else {
    for (const source of context.officialSources) {
      const verification = source.verifiedOn === null
        ? "not yet verified"
        : `verified ${source.verifiedOn}`;
      lines.push(
        `- \`${source.id}\`: [${source.supports.join(", ")}](${source.url}) (${verification})`,
      );
    }
  }

  lines.push(
    "",
    "## Exceptions",
    "",
    "No context-specific exception is declared by the catalog. The central",
    "[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.",
    "",
  );

  return lines.join("\n");
}

export function renderModuleMap(catalog) {
  const lines = [
    "<!-- Generated from module-map.json. Do not edit directly. -->",
    "# Module Map",
    "",
    catalog.product.goal,
    "",
    "## Product boundary",
    "",
    "### Excluded capabilities",
    "",
    "| Capability | Reason |",
    "| --- | --- |",
  ];

  for (const capability of catalog.excludedCapabilities) {
    lines.push(`| ${capability.name} | ${capability.reason} |`);
  }

  lines.push(
    "",
    "### Deferred capabilities",
    "",
    "| Capability | Activation prerequisite |",
    "| --- | --- |",
  );

  for (const capability of catalog.deferredCapabilities) {
    lines.push(`| ${capability.name} | ${capability.requires} |`);
  }

  lines.push(
    "",
    "## Bounded contexts",
    "",
    "| Subdomain | Bounded context | Kind | Classification | Maturity | Implementation | Source freshness | Semantic status | Responsibility |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  );

  for (const context of catalog.contexts) {
    lines.push(
      `| ${context.subdomain} | [${context.name}](../../apps/web/src/modules/${context.subdomain}/${context.name}/README.md) | ${context.kind} | ${context.classification ?? "—"} | ${context.maturity} | ${context.implementationStatus} | ${sourceFreshnessFor(context)} | ${context.semanticStatus} | ${context.responsibility} |`,
    );
  }

  lines.push("", "## Ownership and relationships", "");

  const renderRelationships = (relationships) => {
    return relationships.length === 0
      ? "None."
      : relationships
          .map((relationship) => {
            const events = relationship.events?.length > 0
              ? ` [${relationship.events.map((event) => `${event.name}@${event.version}`).join(", ")}]`
              : "";
            return `${relationship.context} via ${relationship.contract} (${relationship.mode})${events}`;
          })
          .join("; ");
  };

  for (const context of catalog.contexts) {
    const contextPath = `${context.subdomain}/${context.name}`;
    const dependencies = renderRelationships(context.dependencies);
    const plannedRelationships = renderRelationships(context.plannedRelationships);
    const activationScope = context.activationScope.length === 0
      ? "None while planned."
      : context.activationScope.join(", ");
    const sources =
      context.officialSources.length === 0
        ? "Not applicable; technical capability."
        : context.officialSources
            .map((source) => {
              const verification = source.verifiedOn === null
                ? "unverified"
                : `checked ${source.verifiedOn}`;
              return `${source.id} ([${source.supports.join(", ")}](${source.url}), ${verification})`;
            })
            .join("; ");
    const events = context.publishedEvents.length === 0
      ? `None. ${context.eventRationale}`
      : context.publishedEvents
          .map((event) => {
            const contract = event.schema === undefined
              ? "contract pending"
              : `${event.schema}, ordered by ${event.orderingKey}`;
            return `${event.name}@${event.version} (${event.kind}; ${event.implementationStatus}; ${contract})`;
          })
          .join(", ");
    const semanticClaims = context.semanticClaims.length === 0
      ? context.semanticStatus === "not-applicable"
        ? "Not applicable to technical capabilities."
        : "None while product semantics remain candidate."
      : context.semanticClaims
          .map((semanticClaim) => {
            const ownership = semanticClaim.ownership.length === 0
              ? "no ownership entries"
              : `owns ${semanticClaim.ownership.join(", ")}`;
            const claimedEvents = semanticClaim.events.length === 0
              ? "no events"
              : `events ${semanticClaim.events.join(", ")}`;
            return `${semanticClaim.id} (${ownership}; ${claimedEvents}; sources ${semanticClaim.sourceIds.join(", ")})`;
          })
          .join("; ");

    lines.push(
      `### [${contextPath}](../../apps/web/src/modules/${contextPath}/README.md)`,
      "",
      `- **Owns:** ${context.owns.join(", ")}.`,
      `- **Excludes:** ${context.excludes.join(", ")}.`,
      `- **Activation scope:** ${activationScope}`,
      `- **Runtime dependencies:** ${dependencies}`,
      `- **Planned relationships:** ${plannedRelationships}`,
      `- **Published events:** ${events}`,
      `- **Semantic claims:** ${semanticClaims}`,
      `- **Official sources:** ${sources}`,
      "",
    );
  }

  lines.push(
    "All product semantics are justified by HTTPS sources under docs.github.com/en/.",
    "Planned context directories contain README.md only and have no activation scope, runtime dependencies, or source code until implementation begins.",
    "",
  );

  return lines.join("\n");
}

