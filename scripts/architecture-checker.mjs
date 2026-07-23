import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { join, relative, sep } from "node:path";

import ts from "typescript";

import {
  catalogVersion,
  contextLayerNames,
  publicEntrypointBasenames,
} from "@support/tooling/architecture/policy";

import {
  activeContextReadmeHeadings,
  blockedUseCaseDesign,
  designedUseCaseFields,
  plannedContextReadmeHeadings,
  sourceFreshnessFor,
} from "./architecture/catalog.mjs";
import { validateExceptions } from "./architecture/exceptions.mjs";
import {
  assertArchitectureProfile,
  selectViolations,
} from "./architecture/violations.mjs";
import {
  validateAgentGuidance,
  validateGeneratedModuleMap,
  validateSerenaMemories,
} from "./architecture/generated-guidance.mjs";
import {
  buildSourceGraph,
  validateClientGraphs,
  validateDeclaredContextDependencies,
  validateSourceCycles,
} from "./architecture/source-graph.mjs";
import { validateWorkspacePackages } from "./architecture/workspace-packages.mjs";

const sourceExtensions = [".ts", ".tsx", ".mts", ".cts"];
const publicEntrypoints = new Set([
  ...publicEntrypointBasenames.map((entrypoint) => `${entrypoint}.ts`),
]);
const vagueBasenames = new Set([
  "base",
  "action",
  "actions",
  "client",
  "common",
  "constants",
  "handlers",
  "helper",
  "helpers",
  "interfaces",
  "manager",
  "misc",
  "models",
  "processor",
  "public",
  "server",
  "service",
  "shared",
  "types",
  "utils",
]);
const contextLayers = new Set(contextLayerNames);

function normalizePath(value) {
  return value.split(sep).join("/");
}

function projectRelative(rootDir, filePath) {
  return normalizePath(relative(rootDir, filePath));
}

function listFiles(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function isSourceFile(filePath) {
  return (
    sourceExtensions.some((extension) => filePath.endsWith(extension)) &&
    !filePath.endsWith(".d.ts")
  );
}

function readJson(filePath, errors, ruleId) {
  if (!existsSync(filePath)) {
    errors.push(`${ruleId} Missing ${normalizePath(filePath)}.`);
    return undefined;
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`${ruleId} Invalid JSON in ${normalizePath(filePath)}: ${message}`);
    return undefined;
  }
}

function isKebabCase(value) {
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value);
}

function sectionBody(readmeLines, heading) {
  const headingIndex = readmeLines.findIndex((line) => line === `## ${heading}`);

  if (headingIndex < 0) {
    return undefined;
  }

  const nextHeadingOffset = readmeLines
    .slice(headingIndex + 1)
    .findIndex((line) => line.startsWith("## "));
  const end = nextHeadingOffset < 0
    ? readmeLines.length
    : headingIndex + 1 + nextHeadingOffset;

  return readmeLines.slice(headingIndex + 1, end);
}

function inlineCodeValues(value) {
  return [...value.matchAll(/`([^`\n]+)`/g)].map((match) => match[1]);
}

function parseDesignedUseCases(readmeLines, contextPath, errors) {
  const bodyLines = sectionBody(readmeLines, "Designed use cases");
  const designs = new Map();

  if (bodyLines === undefined) {
    return designs;
  }

  const body = bodyLines.join("\n").trim();

  if (body === blockedUseCaseDesign) {
    return designs;
  }

  if (body === "" || body.includes(blockedUseCaseDesign)) {
    errors.push(
      `[ARCH-MAP-019] Context ${contextPath} must use either approved designed-use-case entries or the exact implementation-blocked sentinel.`,
    );
    return designs;
  }

  let currentDesign;
  let currentField;

  const finishDesign = () => {
    if (currentDesign === undefined) {
      return;
    }

    const missingFields = designedUseCaseFields.filter(
      (field) => !currentDesign.fields.has(field),
    );
    const emptyFields = [...currentDesign.fields]
      .filter(([, value]) => value.trim() === "")
      .map(([field]) => field);

    if (missingFields.length > 0 || emptyFields.length > 0) {
      errors.push(
        `[ARCH-MAP-019] Designed use case ${contextPath}/${currentDesign.name} requires non-empty fields: ${designedUseCaseFields.join(", ")}.`,
      );
    }

    designs.set(currentDesign.name, currentDesign);
  };

  for (const line of bodyLines) {
    const designHeading = /^### `([^`]+)` \[(planned|active)\]$/.exec(line);

    if (designHeading !== null) {
      finishDesign();
      const [, name, status] = designHeading;

      if (!isKebabCase(name) || designs.has(name)) {
        errors.push(
          `[ARCH-MAP-019] Context ${contextPath} has a duplicate or invalid designed use-case name ${name}.`,
        );
      }

      currentDesign = {
        name,
        status,
        fields: new Map(),
        expectedRejections: [],
      };
      currentField = undefined;
      continue;
    }

    const field = /^- \*\*([^*]+):\*\*\s*(.*)$/.exec(line);

    if (field !== null && currentDesign !== undefined) {
      const [, fieldName, value] = field;

      if (
        !designedUseCaseFields.includes(fieldName) ||
        currentDesign.fields.has(fieldName)
      ) {
        errors.push(
          `[ARCH-MAP-019] Designed use case ${contextPath}/${currentDesign.name} has an unknown or duplicate field ${fieldName}.`,
        );
      } else {
        currentDesign.fields.set(fieldName, value);
      }
      currentField = fieldName;
      continue;
    }

    if (
      line.trim() !== "" &&
      currentDesign !== undefined &&
      currentField !== undefined
    ) {
      const previous = currentDesign.fields.get(currentField) ?? "";
      currentDesign.fields.set(
        currentField,
        `${previous}\n${line.trim()}`.trim(),
      );
    } else if (line.trim() !== "" && currentDesign === undefined) {
      errors.push(
        `[ARCH-MAP-019] Context ${contextPath} has content outside a designed use-case entry.`,
      );
    }
  }

  finishDesign();
  return designs;
}

function contextRootFor(rootDir, context) {
  return join(rootDir, "src", "modules", context.subdomain, context.name);
}

function hasExportedContract(contents, symbol) {
  const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const declaration = new RegExp(
    `\\bexport\\s+(?:declare\\s+)?(?:type|interface|class|const|enum)\\s+${escapedSymbol}\\b`,
  );
  const exportList = new RegExp(`\\bexport\\s*\\{[^}]*\\b${escapedSymbol}\\b[^}]*\\}`);
  return declaration.test(contents) || exportList.test(contents);
}

function validateSourceRoot(rootDir, errors) {
  const sourceRoot = join(rootDir, "src");

  if (!existsSync(sourceRoot)) {
    errors.push("[ARCH-SRC-001] Missing src directory.");
    return;
  }

  for (const entry of readdirSync(sourceRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || (entry.name !== "app" && entry.name !== "modules")) {
      errors.push(
        `[ARCH-SRC-001] src may contain only the app and modules directories; found src/${entry.name}.`,
      );
    }
  }
}

function validateToolAliases(repositoryRoot, applicationRoot, errors) {
  const applicationComponentsPath = join(applicationRoot, "components.json");

  if (existsSync(applicationComponentsPath)) {
    errors.push(
      "[ARCH-TOOL-001] apps/web/components.json is prohibited; shadcn is configured only by packages/shadcn/components.json.",
    );
  }

  const shadcnRoot = join(repositoryRoot, "packages", "shadcn");

  if (!existsSync(shadcnRoot)) {
    return;
  }

  const componentsPath = join(shadcnRoot, "components.json");

  if (!existsSync(componentsPath)) {
    errors.push(
      "[ARCH-TOOL-001] Missing packages/shadcn/components.json.",
    );
    return;
  }

  const configuration = readJson(
    componentsPath,
    errors,
    "[ARCH-TOOL-001]",
  );

  if (configuration === undefined) {
    return;
  }

  const expectedAliases = {
    components: "@support/shadcn/custom",
    utils: "@support/shadcn/lib/class-names",
    ui: "@support/shadcn/ui",
    lib: "@support/shadcn/lib",
    hooks: "@support/shadcn/hooks",
  };

  for (const [name, expected] of Object.entries(expectedAliases)) {
    if (configuration.aliases?.[name] !== expected) {
      errors.push(
        `[ARCH-TOOL-001] components.json alias ${name} must be ${expected}.`,
      );
    }
  }
}

function validateCatalog(rootDir, catalog, now, errors, knowledgeErrors) {
  if (!Array.isArray(catalog?.contexts)) {
    errors.push("[ARCH-MAP-001] module-map.json must contain a contexts array.");
    return new Map();
  }

  if (
    catalog.version !== catalogVersion ||
    typeof catalog.product?.name !== "string" ||
    typeof catalog.product?.goal !== "string" ||
    catalog.product?.sourcePolicy?.protocol !== "https:" ||
    catalog.product?.sourcePolicy?.hostname !== "docs.github.com" ||
    catalog.product?.sourcePolicy?.pathPrefix !== "/en/"
  ) {
    errors.push(
      "[ARCH-MAP-013] module-map.json must use version 6 and declare the canonical product and source policy.",
    );
  }

  const excludedCapabilities = Array.isArray(catalog.excludedCapabilities)
    ? catalog.excludedCapabilities
    : [];
  const deferredCapabilities = Array.isArray(catalog.deferredCapabilities)
    ? catalog.deferredCapabilities
    : [];
  const capabilityNames = new Set();
  let hasInvalidCapability = false;

  for (const capability of [...excludedCapabilities, ...deferredCapabilities]) {
    if (
      !isKebabCase(capability?.name) ||
      capabilityNames.has(capability.name)
    ) {
      hasInvalidCapability = true;
      continue;
    }

    capabilityNames.add(capability.name);
  }

  if (
    excludedCapabilities.length === 0 ||
    deferredCapabilities.length === 0 ||
    excludedCapabilities.some((capability) => {
      return typeof capability?.reason !== "string" || capability.reason === "";
    }) ||
    deferredCapabilities.some((capability) => {
      return typeof capability?.requires !== "string" || capability.requires === "";
    }) ||
    hasInvalidCapability
  ) {
    errors.push(
      "[ARCH-MAP-016] Excluded and deferred capabilities must be unique, named, and explain their reason or prerequisite.",
    );
  }

  const contextsByPath = new Map();

  for (const context of catalog.contexts) {
    const contextPath = `${context.subdomain}/${context.name}`;

    if (!isKebabCase(context.subdomain) || !isKebabCase(context.name)) {
      errors.push(`[ARCH-MAP-002] Context path must be kebab-case: ${contextPath}.`);
    }

    if (contextsByPath.has(contextPath)) {
      errors.push(`[ARCH-MAP-003] Duplicate context in module-map.json: ${contextPath}.`);
    }

    contextsByPath.set(contextPath, context);

    if (
      context.implementationStatus !== "planned" &&
      context.implementationStatus !== "active"
    ) {
      errors.push(
        `[ARCH-MAP-004] ${contextPath} has invalid implementationStatus ${context.implementationStatus}.`,
      );
    }

    const hasValidKind =
      context.kind === "domain" ||
      context.kind === "projection" ||
      context.kind === "technical";
    const hasValidClassification =
      context.kind !== "domain" ||
      context.classification === "core" ||
      context.classification === "supporting";
    const hasValidSemanticStatus = context.kind === "technical"
      ? context.semanticStatus === "not-applicable"
      : context.semanticStatus === "candidate" || context.semanticStatus === "validated";
    const hasValidShape =
      hasValidKind &&
      hasValidClassification &&
      hasValidSemanticStatus &&
      (context.maturity === "stable" || context.maturity === "preview") &&
      typeof context.responsibility === "string" &&
      context.responsibility !== "" &&
      Array.isArray(context.owns) &&
      context.owns.length > 0 &&
      context.owns.every((item) => typeof item === "string" && item !== "") &&
      Array.isArray(context.excludes) &&
      context.excludes.length > 0 &&
      context.excludes.every((item) => typeof item === "string" && item !== "") &&
      Array.isArray(context.dependencies) &&
      Array.isArray(context.plannedRelationships) &&
      Array.isArray(context.activationScope) &&
      Array.isArray(context.semanticClaims) &&
      Array.isArray(context.officialSources);

    if (!hasValidShape) {
      errors.push(
        `[ARCH-MAP-013] ${contextPath} has an invalid v6 catalog shape.`,
      );
    }

    const hasValidActivationScope =
      Array.isArray(context.activationScope) &&
      context.activationScope.every((item) => isKebabCase(item)) &&
      new Set(context.activationScope).size === context.activationScope.length &&
      (context.implementationStatus !== "active" || context.activationScope.length > 0) &&
      (context.implementationStatus !== "planned" || context.activationScope.length === 0);

    if (!hasValidActivationScope) {
      errors.push(
        `[ARCH-MAP-023] ${contextPath} must declare a unique non-empty activationScope only when active.`,
      );
    }

    if (
      context.implementationStatus === "active" &&
      context.kind !== "technical" &&
      context.semanticStatus !== "validated"
    ) {
      errors.push(
        `[ARCH-MAP-021] Active context ${contextPath} requires semanticStatus validated.`,
      );
    }

    const officialSources = Array.isArray(context.officialSources)
      ? context.officialSources
      : [];
    const sourceIds = new Set();
    const hasInvalidSource =
      !Array.isArray(context.officialSources) ||
      officialSources.some((source) => {
        if (
          !isKebabCase(source?.id) ||
          sourceIds.has(source.id) ||
          typeof source?.url !== "string" ||
          !Array.isArray(source.supports) ||
          source.supports.length === 0 ||
          source.supports.some((item) => typeof item !== "string" || item === "") ||
          (source.verifiedOn !== null &&
            (typeof source.verifiedOn !== "string" ||
              !/^\d{4}-\d{2}-\d{2}$/.test(source.verifiedOn)))
        ) {
          return true;
        }

        sourceIds.add(source.id);

        try {
          const url = new URL(source.url);
          return (
            url.protocol !== "https:" ||
            url.hostname !== "docs.github.com" ||
            !url.pathname.startsWith("/en/")
          );
        } catch {
          return true;
        }
      });

    if (
      ((context.kind === "domain" || context.kind === "projection") &&
        (officialSources.length === 0 || hasInvalidSource)) ||
      (context.kind === "technical" && officialSources.length !== 0)
    ) {
      errors.push(
        `[ARCH-MAP-014] ${contextPath} must follow the official GitHub source policy for its context kind.`,
      );
    }

    const today = now.toISOString().slice(0, 10);

    for (const source of officialSources) {
      if (source.verifiedOn === null) {
        if (context.implementationStatus === "active") {
          errors.push(
            `[ARCH-MAP-017] Active context ${contextPath} requires verifiedOn for source ${source.id}.`,
          );
        }

        continue;
      }

      if (
        typeof source.verifiedOn !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(source.verifiedOn)
      ) {
        continue;
      }

      const verifiedTime = Date.parse(`${source.verifiedOn}T00:00:00.000Z`);
      const nowTime = Date.parse(`${today}T00:00:00.000Z`);
      const maximumAgeDays = (source.maturity ?? context.maturity) === "preview" ? 90 : 365;
      const ageDays = (nowTime - verifiedTime) / 86_400_000;

      if (!Number.isFinite(verifiedTime) || source.verifiedOn > today) {
        errors.push(
          `[ARCH-MAP-017] Source ${source.id} for ${contextPath} has an invalid or future verifiedOn date.`,
        );
      } else if (ageDays > maximumAgeDays) {
        knowledgeErrors.push(
          `[ARCH-KNOWLEDGE-001] Source ${source.id} for ${contextPath} is older than ${maximumAgeDays} days.`,
        );
      }
    }

    const publishedEvents = Array.isArray(context.publishedEvents)
      ? context.publishedEvents
      : [];
    const publishedEventKeys = new Set();
    const hasInvalidPublishedEvent =
      !Array.isArray(context.publishedEvents) ||
      publishedEvents.some((event) => {
        const eventKey = `${event?.name}@${event?.version}`;
        const validSourceIds = Array.isArray(event?.sourceIds) &&
          event.sourceIds.every((sourceId) => sourceIds.has(sourceId));
        const validTechnicalSources = context.kind !== "technical" ||
          (Array.isArray(event?.sourceIds) && event.sourceIds.length === 0);
        const validProductSources = context.kind === "technical" ||
          (Array.isArray(event?.sourceIds) && event.sourceIds.length > 0);
        const invalid =
          typeof event?.name !== "string" ||
          !/^[A-Z][A-Za-z0-9]+$/.test(event.name) ||
          !Number.isInteger(event.version) ||
          event.version < 1 ||
          (event.kind !== "domain" &&
            event.kind !== "integration" &&
            event.kind !== "technical") ||
          typeof event.meaning !== "string" ||
          event.meaning.trim() === "" ||
          !validSourceIds ||
          !validTechnicalSources ||
          !validProductSources ||
          publishedEventKeys.has(eventKey);

        publishedEventKeys.add(eventKey);
        return invalid;
      });
    const hasValidNoEventRationale =
      publishedEvents.length > 0 ||
      (typeof context.eventRationale === "string" && context.eventRationale.trim() !== "");

    if (hasInvalidPublishedEvent || !hasValidNoEventRationale) {
      errors.push(
        `[ARCH-MAP-018] ${contextPath} must declare unique versioned events with valid source traceability, or explain why it publishes none.`,
      );
    }

    const hasInvalidEventImplementationStatus = publishedEvents.some((event) => {
      const isPlanned = event?.implementationStatus === "planned";
      const isActive = event?.implementationStatus === "active";
      const plannedEventHasContractMetadata =
        isPlanned && (event.schema !== undefined || event.orderingKey !== undefined);

      return (
        (!isPlanned && !isActive) ||
        (context.implementationStatus === "planned" && isActive) ||
        plannedEventHasContractMetadata
      );
    });

    if (hasInvalidEventImplementationStatus) {
      errors.push(
        `[ARCH-MAP-026] ${contextPath} events must declare a valid implementationStatus; planned contexts cannot publish active events, and planned events cannot declare contract metadata.`,
      );
    }

    const semanticClaims = Array.isArray(context.semanticClaims)
      ? context.semanticClaims
      : [];
    const semanticClaimIds = new Set();
    const claimedOwnership = new Set();
    const claimedEvents = new Set();
    let hasInvalidSemanticClaim = false;

    for (const semanticClaim of semanticClaims) {
      const ownership = Array.isArray(semanticClaim?.ownership) ? semanticClaim.ownership : [];
      const events = Array.isArray(semanticClaim?.events) ? semanticClaim.events : [];
      const claimSourceIds = Array.isArray(semanticClaim?.sourceIds) ? semanticClaim.sourceIds : [];
      const invalidClaim =
        !isKebabCase(semanticClaim?.id) ||
        semanticClaimIds.has(semanticClaim.id) ||
        typeof semanticClaim?.statement !== "string" ||
        semanticClaim.statement.trim() === "" ||
        !Array.isArray(semanticClaim?.ownership) ||
        !Array.isArray(semanticClaim?.events) ||
        !Array.isArray(semanticClaim?.sourceIds) ||
        ownership.length + events.length === 0 ||
        new Set(ownership).size !== ownership.length ||
        new Set(events).size !== events.length ||
        new Set(claimSourceIds).size !== claimSourceIds.length ||
        ownership.some((item) => !context.owns.includes(item)) ||
        events.some((item) => !publishedEventKeys.has(item)) ||
        claimSourceIds.length === 0 ||
        claimSourceIds.some((item) => !sourceIds.has(item)) ||
        context.kind === "technical";

      if (invalidClaim) {
        hasInvalidSemanticClaim = true;
      }

      semanticClaimIds.add(semanticClaim?.id);
      for (const item of ownership) {
        claimedOwnership.add(item);
      }
      for (const item of events) {
        claimedEvents.add(item);
      }
    }

    const missingOwnershipClaims = context.owns.filter((item) => !claimedOwnership.has(item));
    if (hasInvalidSemanticClaim) {
      errors.push(
        `[ARCH-MAP-024] ${contextPath} has an invalid semantic claim or official-source reference.`,
      );
    }
    if (
      context.semanticStatus === "validated" &&
      (semanticClaims.length === 0 || missingOwnershipClaims.length > 0)
    ) {
      errors.push(
        `[ARCH-MAP-024] Validated context ${contextPath} requires valid official-source claims for every owned semantic.`,
      );
    }

    const missingEventClaims = [...publishedEventKeys].filter((item) => !claimedEvents.has(item));
    if (context.semanticStatus === "validated" && missingEventClaims.length > 0) {
      errors.push(
        `[ARCH-MAP-025] Validated context ${contextPath} requires an official-source claim for every published event.`,
      );
    }

    const contextRoot = contextRootFor(rootDir, context);

    if (!existsSync(contextRoot)) {
      errors.push(
        `[ARCH-MAP-027] Context ${contextPath} requires its own README-only design directory.`,
      );
      continue;
    }

    const contextEntries = readdirSync(contextRoot, { withFileTypes: true });
    if (
      context.implementationStatus === "planned" &&
      contextEntries.some((entry) => entry.name !== "README.md")
    ) {
      errors.push(
        `[ARCH-MAP-006] Planned context ${contextPath} may contain README.md only; activate it before adding source files or layers.`,
      );
    }

    const readmePath = join(contextRoot, "README.md");
    const activeEvents = publishedEvents.filter((event) => {
      return event.implementationStatus === "active";
    });

    if (!existsSync(readmePath)) {
      errors.push(`[ARCH-MAP-027] Context ${contextPath} requires README.md.`);
    } else {
      const readme = readFileSync(readmePath, "utf8").replaceAll("\r\n", "\n");
      const readmeLines = readme.split("\n");
      const headings = new Set(
        readmeLines
          .filter((line) => line.startsWith("## "))
          .map((line) => line.slice(3).trim()),
      );
      const requiredHeadings = context.implementationStatus === "active"
        ? activeContextReadmeHeadings
        : plannedContextReadmeHeadings;
      const missingHeadings = requiredHeadings.filter(
        (heading) => !headings.has(heading),
      );

      if (missingHeadings.length > 0) {
        errors.push(
          `[ARCH-MAP-019] Context ${contextPath} README.md is missing required headings: ${missingHeadings.join(", ")}.`,
        );
      }

      const contentTreeHeadingIndex = readmeLines.findIndex((line) => {
        return line.startsWith("## ") &&
          line.slice(3).trim() === "Context content tree";
      });

      if (contentTreeHeadingIndex >= 0) {
        const nextHeadingOffset = readmeLines
          .slice(contentTreeHeadingIndex + 1)
          .findIndex((line) => line.startsWith("## "));
        const contentTreeEnd = nextHeadingOffset >= 0
          ? contentTreeHeadingIndex + 1 + nextHeadingOffset
          : readmeLines.length;
        const contentTree = readmeLines
          .slice(contentTreeHeadingIndex + 1, contentTreeEnd)
          .join("\n");
        const references = new Set(
          [...contentTree.matchAll(/`([^`\n]+)`/g)].map((match) => match[1]),
        );
        const requiredReferences = [
          ...context.activationScope,
          ...context.owns,
          ...publishedEvents.map((event) => `${event.name}@${event.version}`),
        ];
        const missingReferences = requiredReferences.filter(
          (reference) => !references.has(reference),
        );

        if (missingReferences.length > 0) {
          errors.push(
            `[ARCH-MAP-019] Context ${contextPath} content tree is missing catalog references: ${missingReferences.join(", ")}.`,
          );
        }

        if (
          context.implementationStatus === "planned" &&
          contentTree.includes("[active]")
        ) {
          errors.push(
            `[ARCH-MAP-019] Planned context ${contextPath} content tree must not describe an active capability.`,
          );
        }
      }
    }

    if (context.implementationStatus === "active") {
      const hasEntrypoint = [...publicEntrypoints].some((entrypoint) => {
        return existsSync(join(contextRoot, entrypoint));
      });

      if (!hasEntrypoint) {
        errors.push(
          `[ARCH-MAP-009] Active context ${contextPath} requires at least one public root entrypoint.`,
        );
      }

      if (activeEvents.length > 0) {
        const contractsPath = join(contextRoot, "integration-contracts.ts");
        const contracts = existsSync(contractsPath)
          ? readFileSync(contractsPath, "utf8")
          : "";
        const hasInvalidContractMetadata = activeEvents.some((event) => {
          const match = typeof event.schema === "string"
            ? /^integration-contracts\.ts#([A-Z][A-Za-z0-9]+)$/.exec(event.schema)
            : null;
          return (
            match === null ||
            typeof event.orderingKey !== "string" ||
            event.orderingKey.trim() === "" ||
            !hasExportedContract(contracts, match[1])
          );
        });

        if (hasInvalidContractMetadata) {
          errors.push(
            `[ARCH-MAP-020] Active events in ${contextPath} require exported integration-contracts.ts schemas and non-empty ordering keys.`,
          );
        }
      }
    }
  }

  for (const [contextPath, context] of contextsByPath) {
    const relationshipKeys = new Set();

    for (const relationshipKind of ["dependencies", "plannedRelationships"]) {
      const relationships = context[relationshipKind] ?? [];

      for (const dependency of relationships) {
        const dependencyKey = `${dependency.context}:${dependency.mode}`;
        const target = contextsByPath.get(dependency.context);
        const targetEventsByKey = new Map(
          (target?.publishedEvents ?? []).map((event) => [
            `${event.name}@${event.version}`,
            event,
          ]),
        );
        const hasValidEventSelection =
          dependency.mode !== "event" ||
          (Array.isArray(dependency.events) &&
            dependency.events.length > 0 &&
            dependency.events.every((event) => {
              return (
                typeof event?.name === "string" &&
                Number.isInteger(event.version) &&
                targetEventsByKey.has(`${event.name}@${event.version}`)
              );
            }));
        const synchronousHasNoEventSelection =
          dependency.mode !== "synchronous" || dependency.events === undefined;
        const isInvalid =
          target === undefined ||
          dependency.context === contextPath ||
          relationshipKeys.has(dependencyKey) ||
          typeof dependency.contract !== "string" ||
          dependency.contract === "" ||
          (dependency.mode !== "synchronous" && dependency.mode !== "event") ||
          !hasValidEventSelection ||
          !synchronousHasNoEventSelection ||
          (context.kind === "domain" && target?.kind === "projection");

        if (isInvalid) {
          errors.push(
            `[ARCH-MAP-015] ${contextPath} has an invalid ${relationshipKind === "dependencies" ? "dependency" : "planned relationship"} on ${dependency.context ?? "unknown"}.`,
          );
        }

        const selectsPlannedRuntimeEvent =
          relationshipKind === "dependencies" &&
          dependency.mode === "event" &&
          Array.isArray(dependency.events) &&
          dependency.events.some((event) => {
            return targetEventsByKey.get(
              `${event?.name}@${event?.version}`,
            )?.implementationStatus !== "active";
          });

        if (selectsPlannedRuntimeEvent) {
          errors.push(
            `[ARCH-DEP-014] ${contextPath} runtime event dependency on ${dependency.context ?? "unknown"} may select only active events.`,
          );
        }

        relationshipKeys.add(dependencyKey);
      }
    }

    if (
      context.implementationStatus === "active" &&
      (context.dependencies ?? []).some((dependency) => {
        return contextsByPath.get(dependency.context)?.implementationStatus !== "active";
      })
    ) {
      errors.push(
        `[ARCH-MAP-022] Active context ${contextPath} may depend only on active contexts at runtime.`,
      );
    }
  }

  const contextNames = new Set(contextsByPath.keys());

  for (const capabilityName of capabilityNames) {
    if (contextNames.has(capabilityName)) {
      errors.push(
        `[ARCH-MAP-016] Capability ${capabilityName} cannot be both excluded or deferred and a bounded context.`,
      );
    }
  }

  const modulesRoot = join(rootDir, "src", "modules");

  if (!existsSync(modulesRoot)) {
    return contextsByPath;
  }

  for (const subdomainEntry of readdirSync(modulesRoot, { withFileTypes: true })) {
    if (!subdomainEntry.isDirectory()) {
      if (subdomainEntry.name !== "AGENTS.md") {
        errors.push(
          `[ARCH-STRUCT-001] src/modules root may contain only AGENTS.md and subdomain directories; found ${subdomainEntry.name}.`,
        );
      }

      continue;
    }

    const subdomainRoot = join(modulesRoot, subdomainEntry.name);

    for (const contextEntry of readdirSync(subdomainRoot, { withFileTypes: true })) {
      if (!contextEntry.isDirectory()) {
        if (contextEntry.name !== "README.md") {
          errors.push(
            `[ARCH-STRUCT-002] Subdomain ${subdomainEntry.name} may contain only README.md and bounded-context directories; found ${contextEntry.name}.`,
          );
        }

        continue;
      }

      const contextPath = `${subdomainEntry.name}/${contextEntry.name}`;
      const catalogContext = contextsByPath.get(contextPath);

      if (catalogContext === undefined) {
        errors.push(
          `[ARCH-MAP-010] Context directory ${contextPath} must be declared in module-map.json.`,
        );
      }

      const contextRoot = join(subdomainRoot, contextEntry.name);

      for (const contextRootEntry of readdirSync(contextRoot, {
        withFileTypes: true,
      })) {
        const isAllowedDirectory =
          contextRootEntry.isDirectory() &&
          contextLayers.has(contextRootEntry.name);
        const isAllowedFile =
          contextRootEntry.isFile() &&
          (contextRootEntry.name === "README.md" ||
            publicEntrypoints.has(contextRootEntry.name));

        if (!isAllowedDirectory && !isAllowedFile) {
          errors.push(
            `[ARCH-STRUCT-003] ${contextPath} root contains unsupported entry ${contextRootEntry.name}.`,
          );
        }
      }
    }
  }

  return contextsByPath;
}

function validateDesignedUseCases(rootDir, contextsByPath, errors) {
  const designsByContext = new Map();

  for (const [contextPath, context] of contextsByPath) {
    const readmePath = join(contextRootFor(rootDir, context), "README.md");

    if (!existsSync(readmePath)) {
      designsByContext.set(contextPath, new Map());
      continue;
    }

    const readmeLines = readFileSync(readmePath, "utf8")
      .replaceAll("\r\n", "\n")
      .split("\n");
    const designs = parseDesignedUseCases(readmeLines, contextPath, errors);
    designsByContext.set(contextPath, designs);

    const activeDesignNames = [...designs.values()]
      .filter((design) => design.status === "active")
      .map((design) => design.name)
      .sort();
    const activationScope = [...context.activationScope].sort();

    if (
      activeDesignNames.length !== activationScope.length ||
      activeDesignNames.some((name, index) => name !== activationScope[index])
    ) {
      errors.push(
        `[ARCH-USECASE-002] Context ${contextPath} active designed use cases must equal activationScope.`,
      );
    }

    if (
      context.implementationStatus === "planned" &&
      activeDesignNames.length > 0
    ) {
      errors.push(
        `[ARCH-USECASE-002] Planned context ${contextPath} cannot contain an active designed use case.`,
      );
    }

    const sourceIds = new Set(
      (context.officialSources ?? []).map((source) => source.id),
    );
    const eventByKey = new Map(
      (context.publishedEvents ?? []).map((event) => [
        `${event.name}@${event.version}`,
        event,
      ]),
    );
    const runtimeRelationships = new Set(
      (context.dependencies ?? []).map(
        (relationship) =>
          `${relationship.context}::${relationship.contract}`,
      ),
    );
    const plannedRelationships = new Set(
      (context.plannedRelationships ?? []).map(
        (relationship) =>
          `${relationship.context}::${relationship.contract}`,
      ),
    );

    for (const design of designs.values()) {
      const typeValue = design.fields.get("Type");
      const applicationBoundary = design.fields.get("Application boundary");
      const publicEntrypoint = design.fields.get("Public entrypoint");
      const expectedRejections = inlineCodeValues(
        design.fields.get("Expected rejections") ?? "",
      );
      const dependencies = inlineCodeValues(
        design.fields.get("Dependencies") ?? "",
      );
      const publishedEvents = inlineCodeValues(
        design.fields.get("Published events") ?? "",
      );
      const officialEvidence = inlineCodeValues(
        design.fields.get("Official evidence") ?? "",
      );
      const operationName = kebabToCamelCase(design.name);
      const interfaceName = `${kebabToPascalCase(design.name)}UseCase`;
      const expectedBoundary = `\`${interfaceName}.${operationName}()\``;

      if (
        design.status === "planned" &&
        existsSync(
          join(
            contextRootFor(rootDir, context),
            "application",
            "ports",
            "inbound",
            `${design.name}.use-case.ts`,
          ),
        )
      ) {
        errors.push(
          `[ARCH-USECASE-002] Planned designed use case ${contextPath}/${design.name} must not have an inbound port implementation.`,
        );
      }

      if (typeValue !== "`command`" && typeValue !== "`query`") {
        errors.push(
          `[ARCH-MAP-019] Designed use case ${contextPath}/${design.name} Type must be \`command\` or \`query\`.`,
        );
      }

      design.type = typeValue?.slice(1, -1);

      if (applicationBoundary !== expectedBoundary) {
        errors.push(
          `[ARCH-USECASE-002] Designed use case ${contextPath}/${design.name} must declare ${expectedBoundary} as its application boundary.`,
        );
      }

      const entrypointMatch =
        /^`(server-api\.ts|browser-ui\.ts|server-actions\.ts)#([a-z][A-Za-z0-9]*)`$/.exec(
          publicEntrypoint ?? "",
        );

      if (
        entrypointMatch === null ||
        entrypointMatch[2] !== operationName
      ) {
        errors.push(
          `[ARCH-USECASE-002] Designed use case ${contextPath}/${design.name} must name an allowed public entrypoint for ${operationName}.`,
        );
      } else if (design.status === "active") {
        const entrypointPath = join(
          contextRootFor(rootDir, context),
          entrypointMatch[1],
        );
        const entrypointContents = existsSync(entrypointPath)
          ? readFileSync(entrypointPath, "utf8")
          : "";

        if (
          entrypointContents === "" ||
          !new RegExp(`\\b${operationName}\\b`).test(entrypointContents)
        ) {
          errors.push(
            `[ARCH-USECASE-002] Active designed use case ${contextPath}/${design.name} requires ${entrypointMatch[1]} to export ${operationName}.`,
          );
        }
      }

      if (
        expectedRejections.length === 0 ||
        (expectedRejections.includes("none") &&
          expectedRejections.length !== 1) ||
        expectedRejections.some(
          (rejection) => rejection !== "none" && !isKebabCase(rejection),
        )
      ) {
        errors.push(
          `[ARCH-MAP-019] Designed use case ${contextPath}/${design.name} has invalid Expected rejections.`,
        );
      }
      design.expectedRejections = expectedRejections.filter(
        (rejection) => rejection !== "none",
      );

      const allowedRelationships = new Set(runtimeRelationships);
      if (design.status === "planned") {
        for (const relationship of plannedRelationships) {
          allowedRelationships.add(relationship);
        }
      }
      if (
        dependencies.length === 0 ||
        (dependencies.includes("none") && dependencies.length !== 1) ||
        dependencies.some(
          (dependency) =>
            dependency !== "none" && !allowedRelationships.has(dependency),
        )
      ) {
        errors.push(
          `[ARCH-MAP-019] Designed use case ${contextPath}/${design.name} references an uncataloged dependency.`,
        );
      }

      if (
        publishedEvents.length === 0 ||
        (publishedEvents.includes("none") && publishedEvents.length !== 1) ||
        publishedEvents.some((eventKey) => {
          if (eventKey === "none") {
            return false;
          }

          const event = eventByKey.get(eventKey);
          return (
            event === undefined ||
            (design.status === "active" &&
              event.implementationStatus !== "active")
          );
        })
      ) {
        errors.push(
          `[ARCH-MAP-019] Designed use case ${contextPath}/${design.name} references an unavailable published event.`,
        );
      }

      const hasValidOfficialEvidence =
        context.kind === "technical"
          ? officialEvidence.length === 1 &&
            officialEvidence[0] === "not-applicable"
          : officialEvidence.length > 0 &&
            !officialEvidence.includes("not-applicable") &&
            officialEvidence.every((sourceId) => sourceIds.has(sourceId));

      if (!hasValidOfficialEvidence) {
        errors.push(
          `[ARCH-MAP-019] Designed use case ${contextPath}/${design.name} requires valid cataloged official evidence.`,
        );
      }
    }
  }

  return designsByContext;
}

function roleLocationError(relativePath) {
  const checks = [
    [/\.aggregate\.[cm]?tsx?$/, "/domain/aggregates/"],
    [/\.entity\.[cm]?tsx?$/, "/domain/entities/"],
    [/\.value-object\.[cm]?tsx?$/, "/domain/value-objects/"],
    [/\.domain-service\.[cm]?tsx?$/, "/domain/services/"],
    [/\.policy\.[cm]?tsx?$/, "/domain/policies/"],
    [/\.domain-event\.[cm]?tsx?$/, "/domain/events/"],
    [/\.domain-error\.[cm]?tsx?$/, "/domain/errors/"],
    [/\.use-case\.[cm]?tsx?$/, "/application/ports/inbound/"],
    [/(?:\.repository|\.gateway)\.port\.[cm]?tsx?$/, "/application/ports/outbound/"],
    [/\.adapter\.[cm]?tsx?$/, "/adapters/"],
    [/\.mapper\.[cm]?tsx?$/, "/mappers/"],
  ];

  for (const [pattern, requiredPath] of checks) {
    if (pattern.test(relativePath) && !relativePath.includes(requiredPath)) {
      return requiredPath;
    }
  }

  if (/\.handler\.[cm]?tsx?$/.test(relativePath)) {
    const isApplicationHandler =
      relativePath.includes("/application/commands/") ||
      relativePath.includes("/application/queries/");
    const isRouteHandler = relativePath.includes(
      "/adapters/inbound/next/route-handlers/",
    );

    if (!isApplicationHandler && !isRouteHandler) {
      return "an application command/query or Next route-handlers directory";
    }
  }

  return undefined;
}

function hasExportModifier(node) {
  return node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function runtimeExportCount(sourceFile) {
  let count = 0;

  for (const statement of sourceFile.statements) {
    if (ts.isExportDeclaration(statement)) {
      if (statement.isTypeOnly || statement.exportClause === undefined) {
        continue;
      }

      if (ts.isNamedExports(statement.exportClause)) {
        count += statement.exportClause.elements.filter((element) => {
          return !element.isTypeOnly;
        }).length;
      }

      continue;
    }

    if (!hasExportModifier(statement)) {
      continue;
    }

    if (
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement)
    ) {
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      count += statement.declarationList.declarations.length;
    } else {
      count += 1;
    }
  }

  return count;
}

function kebabToCamelCase(value) {
  return value.replace(/-([a-z0-9])/g, (_match, character) => {
    return character.toUpperCase();
  });
}

function kebabToPascalCase(value) {
  const camelCase = kebabToCamelCase(value);
  return `${camelCase[0].toUpperCase()}${camelCase.slice(1)}`;
}

function methodName(node) {
  if (
    ts.isIdentifier(node.name) ||
    ts.isStringLiteral(node.name) ||
    ts.isNumericLiteral(node.name)
  ) {
    return node.name.text;
  }

  return undefined;
}

function hasUseCaseInterface(sourceFile, interfaceName, operationName) {
  return sourceFile.statements.some((statement) => {
    return (
      ts.isInterfaceDeclaration(statement) &&
      statement.name.text === interfaceName &&
      statement.members.some((member) => {
        return ts.isMethodSignature(member) && methodName(member) === operationName;
      })
    );
  });
}

function hasUseCaseHandler(sourceFile, interfaceName, operationName) {
  return sourceFile.statements.some((statement) => {
    if (!ts.isClassDeclaration(statement)) {
      return false;
    }

    const implementsUseCase = statement.heritageClauses?.some((clause) => {
      return (
        clause.token === ts.SyntaxKind.ImplementsKeyword &&
        clause.types.some((type) => type.expression.getText(sourceFile) === interfaceName)
      );
    }) ?? false;
    const operationNames = statement.members
      .filter(ts.isMethodDeclaration)
      .map(methodName);
    const hasGenericOperation = operationNames.some((name) => {
      return ["execute", "handle", "process", "run"].includes(name);
    });

    return (
      implementsUseCase &&
      operationNames.includes(operationName) &&
      !hasGenericOperation
    );
  });
}

function hasExpectedRejectionLiterals(
  sourceFile,
  resultTypeName,
  expectedRejections,
) {
  const resultType = sourceFile.statements.find((statement) => {
    return (
      ts.isTypeAliasDeclaration(statement) &&
      statement.name.text === resultTypeName
    );
  });

  if (resultType === undefined) {
    return false;
  }

  const stringLiterals = new Set();
  const collectLiteralTypes = (typeNode) => {
    if (ts.isUnionTypeNode(typeNode)) {
      for (const member of typeNode.types) {
        collectLiteralTypes(member);
      }
    } else if (
      ts.isLiteralTypeNode(typeNode) &&
      ts.isStringLiteral(typeNode.literal)
    ) {
      stringLiterals.add(typeNode.literal.text);
    }
  };
  const collectResultMembers = (typeNode) => {
    if (ts.isUnionTypeNode(typeNode)) {
      for (const member of typeNode.types) {
        collectResultMembers(member);
      }
      return;
    }

    if (
      ts.isTypeReferenceNode(typeNode) &&
      typeNode.typeArguments?.length === 1
    ) {
      collectResultMembers(typeNode.typeArguments[0]);
      return;
    }

    if (ts.isParenthesizedTypeNode(typeNode)) {
      collectResultMembers(typeNode.type);
      return;
    }

    if (ts.isTypeLiteralNode(typeNode)) {
      for (const member of typeNode.members) {
        if (ts.isPropertySignature(member) && member.type !== undefined) {
          collectLiteralTypes(member.type);
        }
      }
    }
  };
  collectResultMembers(resultType.type);

  return expectedRejections.every((rejection) =>
    stringLiterals.has(rejection),
  );
}

function validateUseCaseTraceability(
  rootDir,
  sourceFiles,
  contextsByPath,
  designsByContext,
  errors,
) {
  const useCasesByContext = new Map();

  for (const filePath of sourceFiles) {
    const relativePath = projectRelative(rootDir, filePath);
    const match = relativePath.match(
      /^src\/modules\/([^/]+)\/([^/]+)\/application\/(commands|queries)\/(?:.+\/)?([^/]+)\.handler\.(?:[cm]?ts|tsx)$/,
    );

    if (match === null) {
      continue;
    }

    const [, subdomain, contextName, handlerDirectory, useCaseName] = match;
    const contextPath = `${subdomain}/${contextName}`;
    const contextUseCases = useCasesByContext.get(contextPath) ?? new Map();
    contextUseCases.set(useCaseName, {
      type: handlerDirectory === "commands" ? "command" : "query",
      relativePath,
    });
    useCasesByContext.set(contextPath, contextUseCases);
    const design = designsByContext.get(contextPath)?.get(useCaseName);

    if (
      design === undefined ||
      design.status !== "active" ||
      design.type !== (handlerDirectory === "commands" ? "command" : "query")
    ) {
      errors.push(
        `[ARCH-USECASE-002] Handler ${relativePath} requires a matching active designed use case with the same command/query type.`,
      );
    }

    const operationName = kebabToCamelCase(useCaseName);
    const interfaceName = `${kebabToPascalCase(useCaseName)}UseCase`;
    const inboundPortPath = join(
      rootDir,
      "src",
      "modules",
      subdomain,
      contextName,
      "application",
      "ports",
      "inbound",
      `${useCaseName}.use-case.ts`,
    );

    if (!existsSync(inboundPortPath)) {
      errors.push(
        `[ARCH-USECASE-001] ${relativePath} requires application/ports/inbound/${useCaseName}.use-case.ts with ${interfaceName}.${operationName}().`,
      );
      continue;
    }

    const handlerSource = ts.createSourceFile(
      filePath,
      readFileSync(filePath, "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );
    const portSource = ts.createSourceFile(
      inboundPortPath,
      readFileSync(inboundPortPath, "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );

    if (
      !hasUseCaseInterface(portSource, interfaceName, operationName) ||
      !hasUseCaseHandler(handlerSource, interfaceName, operationName)
    ) {
      errors.push(
        `[ARCH-USECASE-001] ${contextPath}/${useCaseName} must trace semantic context -> ${interfaceName} -> ${operationName}() without generic execute/handle/process/run operations.`,
      );
    }

    if (
      design !== undefined &&
      design.expectedRejections.length > 0 &&
      !hasExpectedRejectionLiterals(
        portSource,
        `${kebabToPascalCase(useCaseName)}Result`,
        design.expectedRejections,
      )
    ) {
      errors.push(
        `[ARCH-USECASE-003] ${contextPath}/${useCaseName} inbound result must declare every designed expected rejection as a string literal.`,
      );
    }
  }

  for (const [contextPath, context] of contextsByPath) {
    const implementedUseCases =
      useCasesByContext.get(contextPath) ?? new Map();
    const designedUseCases =
      designsByContext.get(contextPath) ?? new Map();

    for (const activationScope of context.activationScope) {
      if (!implementedUseCases.has(activationScope)) {
        errors.push(
          `[ARCH-USECASE-001] Active semantic context ${contextPath} must implement activationScope ${activationScope} as a named use-case port, handler, and function.`,
        );
      }
    }

    for (const design of designedUseCases.values()) {
      if (
        design.status === "planned" &&
        implementedUseCases.has(design.name)
      ) {
        errors.push(
          `[ARCH-USECASE-002] Planned designed use case ${contextPath}/${design.name} must not have a handler implementation.`,
        );
      }
    }
  }
}

function validateModuleNamesAndRoles(rootDir, sourceFiles, errors) {
  const modulesRoot = join(rootDir, "src", "modules");

  if (!existsSync(modulesRoot)) {
    return;
  }

  for (const entry of readdirSync(modulesRoot, { withFileTypes: true })) {
    if (entry.isDirectory() && !isKebabCase(entry.name)) {
      errors.push(`[ARCH-NAME-001] Subdomain must be kebab-case: ${entry.name}.`);
    }
  }

  for (const filePath of sourceFiles) {
    const relativePath = projectRelative(rootDir, filePath);

    if (!relativePath.startsWith("src/modules/")) {
      continue;
    }

    const contextRelative = relativePath.split("/").slice(4).join("/");
    const filename = relativePath.split("/").at(-1);
    const basename = filename.replace(/\.(?:[cm]?ts|tsx)$/, "");
    const stem = basename.replace(/\.(?:spec|test)$/, "");
    const contextSegments = contextRelative.split("/");
    const directorySegments = contextSegments.slice(0, -1);
    const isKebabRoleFilename =
      /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*)*\.(?:[cm]?ts|tsx)$/.test(
        filename,
      );

    if (
      directorySegments.some((segment) => !isKebabCase(segment)) ||
      !isKebabRoleFilename
    ) {
      errors.push(
        `[ARCH-NAME-001] Module directories and source filenames must use kebab-case: ${relativePath}.`,
      );
    }

    if (vagueBasenames.has(stem)) {
      errors.push(`[ARCH-NAME-002] Ambiguous filename is prohibited: ${relativePath}.`);
    }

    if (filename === "index.ts" && contextRelative !== "index.ts") {
      errors.push(`[ARCH-NAME-003] Nested barrel index.ts is prohibited: ${relativePath}.`);
    }

    if (filename === "index.ts" || /\.action\.[cm]?tsx?$/.test(filename)) {
      errors.push(
        `[ARCH-NAME-005] Ambiguous module API filename is prohibited: ${relativePath}. Use an explicit public entrypoint or *.server-action.ts.`,
      );
    }

    const requiredPath = roleLocationError(`/${contextRelative}`);

    if (requiredPath !== undefined) {
      errors.push(
        `[ARCH-NAME-004] ${relativePath} must be located in ${requiredPath}.`,
      );
    }

    const isPublicEntrypoint =
      contextRelative !== "" &&
      !contextRelative.includes("/") &&
      publicEntrypoints.has(filename);
    const isTest = /\.(?:spec|test)\.[cm]?tsx?$/.test(filename);

    if (!isPublicEntrypoint && !isTest) {
      const sourceFile = ts.createSourceFile(
        filePath,
        readFileSync(filePath, "utf8"),
        ts.ScriptTarget.Latest,
        true,
      );

      if (runtimeExportCount(sourceFile) > 1) {
        errors.push(
          `[ARCH-FILE-001] ${relativePath} exports more than one runtime symbol. Split architectural responsibilities.`,
        );
      }
    }
  }
}

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

export function runArchitectureChecks({
  repositoryRoot,
  applicationRoot,
  now = new Date(),
  profile = "required",
  validateWorkspace = true,
}) {
  assertArchitectureProfile(profile);

  const requiredErrors = [];
  const generatedErrors = [];
  const knowledgeErrors = [];
  const sourceRoot = join(applicationRoot, "src");
  const sourceFiles = listFiles(sourceRoot).filter(isSourceFile);
  const catalogPath = join(repositoryRoot, "docs", "architecture", "module-map.json");
  const registryPath = join(
    repositoryRoot,
    "docs",
    "architecture",
    "exceptions",
    "registry.json",
  );

  validateSourceRoot(applicationRoot, requiredErrors);
  validateToolAliases(repositoryRoot, applicationRoot, requiredErrors);
  if (validateWorkspace) {
    validateWorkspacePackages(repositoryRoot, requiredErrors);
  }

  const catalog = readJson(catalogPath, requiredErrors, "[ARCH-MAP-001]");
  let contextsByPath = new Map();
  let designsByContext = new Map();

  if (catalog !== undefined) {
    contextsByPath = validateCatalog(
      applicationRoot,
      catalog,
      now,
      requiredErrors,
      knowledgeErrors,
    );
    designsByContext = validateDesignedUseCases(
      applicationRoot,
      contextsByPath,
      requiredErrors,
    );
    validateGeneratedModuleMap(
      repositoryRoot,
      renderModuleMap(catalog),
      generatedErrors,
    );
  }

  validateAgentGuidance(repositoryRoot, requiredErrors, generatedErrors);
  validateSerenaMemories(repositoryRoot, generatedErrors);

  validateModuleNamesAndRoles(applicationRoot, sourceFiles, requiredErrors);
  validateUseCaseTraceability(
    applicationRoot,
    sourceFiles,
    contextsByPath,
    designsByContext,
    requiredErrors,
  );

  const { graph, metadata } = buildSourceGraph(applicationRoot, sourceFiles);
  validateSourceCycles(applicationRoot, graph, requiredErrors);
  validateClientGraphs(applicationRoot, graph, metadata, requiredErrors);
  validateDeclaredContextDependencies(
    applicationRoot,
    graph,
    contextsByPath,
    requiredErrors,
  );

  const registry = readJson(
    registryPath,
    requiredErrors,
    "[ARCH-EXCEPTION-001]",
  );

  if (registry !== undefined) {
    validateExceptions(
      applicationRoot,
      registry,
      sourceFiles,
      now,
      requiredErrors,
    );
  }

  return selectViolations({
    generatedErrors,
    knowledgeErrors,
    profile,
    requiredErrors,
  });
}
