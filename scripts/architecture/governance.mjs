import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import {
  dirname,
  join,
  relative,
  resolve,
  sep,
} from "node:path";

import {
  architectureRuleRegistry,
  isArchitectureProfile,
} from "@support/tooling/architecture/policy";

const guidanceTraversalExclusions = new Set([
  ".git",
  ".next",
  ".pnpm-store",
  ".turbo",
  "coverage",
  "dist",
  "node_modules",
]);
const startupBoilerplate = "For Codex 5.3 startup";
const inheritedParagraphMinimumLength = 120;

function normalizePath(value) {
  return value.split(sep).join("/");
}

function projectRelative(rootDir, filePath) {
  return normalizePath(relative(rootDir, filePath));
}

function listDocumentationFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && guidanceTraversalExclusions.has(entry.name)) {
      continue;
    }

    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...listDocumentationFiles(entryPath));
    } else if (
      entry.isFile() &&
      (entry.name === "AGENTS.md" ||
        entry.name === "AGENTS.override.md" ||
        entry.name === "README.md")
    ) {
      files.push(entryPath);
    }
  }

  return files;
}

function estimatedTokens(contents) {
  return Math.ceil(Buffer.byteLength(contents, "utf8") / 4);
}

function normalizedParagraphs(contents) {
  return contents
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter((paragraph) => paragraph.length >= inheritedParagraphMinimumLength);
}

function agentChainFor(repositoryRoot, filePath) {
  const chain = [];
  let currentDirectory = dirname(filePath);
  const resolvedRepositoryRoot = resolve(repositoryRoot);

  while (true) {
    const candidate = join(currentDirectory, "AGENTS.md");

    if (existsSync(candidate)) {
      chain.unshift(candidate);
    }

    if (resolve(currentDirectory) === resolvedRepositoryRoot) {
      break;
    }

    const parentDirectory = dirname(currentDirectory);

    if (parentDirectory === currentDirectory) {
      break;
    }

    currentDirectory = parentDirectory;
  }

  return chain;
}

export function validateGeneratedModuleMap(
  repositoryRoot,
  expectedContents,
  errors,
) {
  const markdownPath = join(
    repositoryRoot,
    "docs",
    "architecture",
    "module-map.md",
  );

  if (!existsSync(markdownPath)) {
    errors.push("[ARCH-MAP-011] Missing generated docs/architecture/module-map.md.");
    return;
  }

  const actual = readFileSync(markdownPath, "utf8").replaceAll("\r\n", "\n");

  if (actual !== expectedContents) {
    errors.push(
      "[ARCH-MAP-012] module-map.md is stale; regenerate it from module-map.json.",
    );
  }
}

export function validateAgentGuidance(
  repositoryRoot,
  applicationRoot,
  contextsByPath,
  errors,
  knowledgeErrors,
) {
  const documentationFiles = listDocumentationFiles(repositoryRoot);
  const guidanceFiles = documentationFiles.filter((filePath) => {
    return filePath.endsWith(`${sep}AGENTS.md`) ||
      filePath.endsWith(`${sep}AGENTS.override.md`) ||
      filePath === join(repositoryRoot, "AGENTS.md");
  });
  const agentFiles = guidanceFiles.filter((filePath) => {
    return !filePath.endsWith(`${sep}AGENTS.override.md`);
  });
  for (const filePath of documentationFiles) {
    const contents = readFileSync(filePath, "utf8");

    if (contents.includes(startupBoilerplate)) {
      errors.push(
        `[ARCH-GUIDE-003] ${projectRelative(repositoryRoot, filePath)} repeats model-version startup boilerplate.`,
      );
    }
  }

  for (const filePath of guidanceFiles) {
    const relativePath = projectRelative(repositoryRoot, filePath);

    if (filePath.endsWith(`${sep}AGENTS.override.md`)) {
      errors.push(
        `[ARCH-GUIDE-001] Permanent AGENTS.override.md is prohibited: ${relativePath}.`,
      );
      continue;
    }

    const contents = readFileSync(filePath, "utf8");

    for (const match of contents.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      let target = match[1].trim();

      if (
        target.startsWith("https://") ||
        target.startsWith("http://") ||
        target.startsWith("mailto:") ||
        target.startsWith("#")
      ) {
        continue;
      }

      if (target.startsWith("<") && target.endsWith(">")) {
        target = target.slice(1, -1);
      }

      target = target.split("#", 1)[0];

      if (target === "") {
        continue;
      }

      const resolvedTarget = resolve(dirname(filePath), target);
      const repositoryPrefix = `${resolve(repositoryRoot)}${sep}`;

      if (
        resolvedTarget !== resolve(repositoryRoot) &&
        (!resolvedTarget.startsWith(repositoryPrefix) ||
          !existsSync(resolvedTarget))
      ) {
        errors.push(
          `[ARCH-GUIDE-001] ${relativePath} contains an invalid local link: ${target}.`,
        );
      } else if (!existsSync(resolvedTarget)) {
        errors.push(
          `[ARCH-GUIDE-001] ${relativePath} contains a missing local link: ${target}.`,
        );
      }
    }
  }

  const paragraphsByAgent = new Map(
    agentFiles.map((filePath) => [
      filePath,
      new Set(normalizedParagraphs(readFileSync(filePath, "utf8"))),
    ]),
  );

  for (const filePath of agentFiles) {
    const childParagraphs = paragraphsByAgent.get(filePath);

    for (const ancestorPath of agentChainFor(repositoryRoot, filePath)) {
      if (ancestorPath === filePath) {
        continue;
      }

      const ancestorParagraphs = paragraphsByAgent.get(ancestorPath);
      const hasDuplicate = [...childParagraphs].some((paragraph) => {
        return ancestorParagraphs?.has(paragraph) === true;
      });

      if (hasDuplicate) {
        knowledgeErrors.push(
          `[ARCH-GUIDE-004] ${projectRelative(repositoryRoot, filePath)} repeats an inherited paragraph from ${projectRelative(repositoryRoot, ancestorPath)}.`,
        );
        break;
      }
    }
  }

  const rootAgentPath = join(repositoryRoot, "AGENTS.md");
  const rootAgentTokens = estimatedTokens(readFileSync(rootAgentPath, "utf8"));

  if (rootAgentTokens > 1_200) {
    knowledgeErrors.push(
      `[ARCH-GUIDE-005] AGENTS.md is estimated at ${rootAgentTokens} tokens; the ceiling is 1200.`,
    );
  }

  for (const filePath of agentFiles) {
    const relativePath = projectRelative(repositoryRoot, filePath);
    const chainTokens = agentChainFor(repositoryRoot, filePath)
      .map((agentPath) => estimatedTokens(readFileSync(agentPath, "utf8")))
      .reduce((total, tokens) => total + tokens, 0);
    const ceiling = relativePath.startsWith("packages/") ? 2_000 : 3_000;

    if (chainTokens > ceiling) {
      knowledgeErrors.push(
        `[ARCH-GUIDE-005] AGENTS chain ending at ${relativePath} is estimated at ${chainTokens} tokens; the ceiling is ${ceiling}.`,
      );
    }
  }

  const rootReadmePath = join(repositoryRoot, "README.md");

  if (existsSync(rootReadmePath)) {
    const tokens = estimatedTokens(readFileSync(rootReadmePath, "utf8"));

    if (tokens > 1_800) {
      knowledgeErrors.push(
        `[ARCH-GUIDE-005] README.md is estimated at ${tokens} tokens; the ceiling is 1800.`,
      );
    }
  }

  for (const filePath of documentationFiles) {
    const relativePath = projectRelative(repositoryRoot, filePath);

    if (
      relativePath.startsWith("apps/web/src/app/") &&
      relativePath.endsWith("/README.md")
    ) {
      const tokens = estimatedTokens(readFileSync(filePath, "utf8"));

      if (tokens > 1_200) {
        knowledgeErrors.push(
          `[ARCH-GUIDE-005] Route README ${relativePath} is estimated at ${tokens} tokens; the ceiling is 1200.`,
        );
      }
    }
  }

  for (const [contextPath, context] of contextsByPath) {
    if (context.implementationStatus !== "planned") {
      continue;
    }

    const readmePath = join(
      applicationRoot,
      "src",
      "modules",
      ...contextPath.split("/"),
      "README.md",
    );

    if (!existsSync(readmePath)) {
      continue;
    }

    const tokens = estimatedTokens(readFileSync(readmePath, "utf8"));

    if (tokens > 3_000) {
      knowledgeErrors.push(
        `[ARCH-GUIDE-005] Planned context README ${contextPath} is estimated at ${tokens} tokens; the ceiling is 3000.`,
      );
    }
  }

}

const exceptionFields = [
  "id",
  "rule",
  "scope",
  "owner",
  "approvedOn",
  "expiresOn",
  "reason",
  "alternatives",
  "risk",
  "spreadPrevention",
  "removalCondition",
];

export function validateExceptions(rootDir, registry, sourceFiles, now, errors) {
  if (!Array.isArray(registry)) {
    errors.push("[ARCH-EXCEPTION-001] exceptions/registry.json must contain an array.");
    return;
  }

  const registryById = new Map();
  for (const exception of registry) {
    const missingFields = exceptionFields.filter(
      (field) =>
        typeof exception[field] !== "string" ||
        exception[field].trim() === "",
    );
    if (missingFields.length > 0) {
      errors.push(
        `[ARCH-EXCEPTION-002] Architecture exception is missing: ${missingFields.join(", ")}.`,
      );
      continue;
    }
    if (!/^ARCH-EX-\d{3}$/.test(exception.id)) {
      errors.push(`[ARCH-EXCEPTION-003] Invalid exception id ${exception.id}.`);
    }
    if (registryById.has(exception.id)) {
      errors.push(`[ARCH-EXCEPTION-004] Duplicate exception id ${exception.id}.`);
    }
    registryById.set(exception.id, exception);
    if (architectureRuleRegistry[exception.rule] === undefined) {
      errors.push(
        `[ARCH-EXCEPTION-010] ${exception.id} references unregistered rule ${exception.rule}.`,
      );
    }
    const today = now.toISOString().slice(0, 10);
    const hasValidApprovalDate =
      /^\d{4}-\d{2}-\d{2}$/.test(exception.approvedOn) &&
      exception.approvedOn <= today;
    const hasValidExpiryDate =
      /^\d{4}-\d{2}-\d{2}$/.test(exception.expiresOn) &&
      exception.approvedOn < exception.expiresOn;

    if (!hasValidApprovalDate || !hasValidExpiryDate) {
      errors.push(
        `[ARCH-EXCEPTION-005] ${exception.id} approvedOn and expiresOn must use YYYY-MM-DD, approval cannot be future, and expiry must be later than approval.`,
      );
    } else if (exception.expiresOn <= today) {
      errors.push(
        `[ARCH-EXCEPTION-006] ${exception.id} expired on ${exception.expiresOn}.`,
      );
    }
  }

  const references = new Map();
  for (const filePath of sourceFiles) {
    const contents = readFileSync(filePath, "utf8");
    for (const match of contents.matchAll(/ARCH-EX-\d{3}/g)) {
      const paths = references.get(match[0]) ?? [];
      paths.push(projectRelative(rootDir, filePath));
      references.set(match[0], paths);
    }
  }
  for (const [id, paths] of references) {
    const exception = registryById.get(id);
    if (exception === undefined) {
      errors.push(`[ARCH-EXCEPTION-007] ${id} is referenced but not registered.`);
      continue;
    }
    const scope = normalizePath(exception.scope).replace(/\/$/, "");
    for (const referencePath of paths) {
      if (
        referencePath !== scope &&
        !referencePath.startsWith(`${scope}/`)
      ) {
        errors.push(
          `[ARCH-EXCEPTION-008] ${id} scope ${scope} does not cover ${referencePath}.`,
        );
      }
    }
  }
  for (const id of registryById.keys()) {
    if (!references.has(id)) {
      errors.push(`[ARCH-EXCEPTION-009] Registered exception ${id} is not referenced.`);
    }
  }
}

export function assertArchitectureProfile(profile) {
  if (!isArchitectureProfile(profile)) {
    throw new Error(
      `Invalid architecture profile ${profile}. Expected required, generated, knowledge, or all.`,
    );
  }
}

export function toViolation(value, expectedGate) {
  const match = /^\[([A-Z]+(?:-[A-Z]+)*-\d{3})\]\s*(.*)$/.exec(value);
  if (match === null) {
    throw new Error(`Architecture diagnostic is missing a rule ID: ${value}`);
  }
  const ruleId = match[1];
  const policy = architectureRuleRegistry[ruleId];
  if (policy === undefined) {
    throw new Error(`Architecture diagnostic uses unregistered rule ID ${ruleId}.`);
  }
  if (policy.gate !== expectedGate) {
    throw new Error(
      `Architecture diagnostic ${ruleId} was reported as ${expectedGate}, but policy assigns ${policy.gate}.`,
    );
  }
  return Object.freeze({
    ruleId,
    gate: policy.gate,
    category: policy.category,
    message: match[2],
  });
}

export function selectViolations({
  generatedErrors,
  knowledgeErrors,
  profile,
  requiredErrors,
}) {
  const violations = [
    ...requiredErrors.map((error) => toViolation(error, "required")),
    ...generatedErrors.map((error) => toViolation(error, "generated")),
    ...knowledgeErrors.map((error) => toViolation(error, "knowledge")),
  ];
  return profile === "all"
    ? violations
    : violations.filter((violation) => violation.gate === profile);
}
