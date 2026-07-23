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
  agentGuidanceSourcePaths,
  generatedMemoryPaths,
  loadSerenaMemorySources,
  renderSerenaMemories,
} from "../serena-memory-generator.mjs";

const guidanceTraversalExclusions = new Set([
  ".git",
  ".next",
  ".pnpm-store",
  "coverage",
  "dist",
  "node_modules",
]);

function normalizePath(value) {
  return value.split(sep).join("/");
}

function projectRelative(rootDir, filePath) {
  return normalizePath(relative(rootDir, filePath));
}

function listGuidanceFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && guidanceTraversalExclusions.has(entry.name)) {
      continue;
    }

    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...listGuidanceFiles(entryPath));
    } else if (
      entry.isFile() &&
      (entry.name === "AGENTS.md" || entry.name === "AGENTS.override.md")
    ) {
      files.push(entryPath);
    }
  }

  return files;
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
  errors,
  generatedErrors,
) {
  const guidanceFiles = listGuidanceFiles(repositoryRoot);
  const actualAgentPaths = guidanceFiles
    .filter((filePath) => {
      return filePath.endsWith(`${sep}AGENTS.md`) ||
        filePath === join(repositoryRoot, "AGENTS.md");
    })
    .map((filePath) => projectRelative(repositoryRoot, filePath))
    .sort();
  const expectedAgentPaths = [...agentGuidanceSourcePaths].sort();

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

  if (JSON.stringify(actualAgentPaths) !== JSON.stringify(expectedAgentPaths)) {
    generatedErrors.push(
      "[ARCH-GUIDE-002] Serena memory source allowlist must exactly match repository AGENTS.md files.",
    );
  }
}

export function validateSerenaMemories(repositoryRoot, errors) {
  const memoryRoot = join(repositoryRoot, ".serena", "memories");
  const projectConfigurationPath = join(
    repositoryRoot,
    ".serena",
    "project.yml",
  );
  const gitignorePath = join(repositoryRoot, ".gitignore");

  if (!existsSync(memoryRoot)) {
    errors.push("[ARCH-MEM-001] Missing generated .serena/memories directory.");
    return;
  }

  let expected;

  try {
    expected = renderSerenaMemories(loadSerenaMemorySources(repositoryRoot));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`[ARCH-MEM-001] Cannot render Serena memories: ${message}`);
    return;
  }

  const expectedPaths = new Set(generatedMemoryPaths);
  const actualPaths = readdirSync(memoryRoot, {
    recursive: true,
    withFileTypes: true,
  })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      return normalizePath(
        relative(memoryRoot, join(entry.parentPath, entry.name)),
      );
    })
    .filter((relativePath) => {
      return !relativePath.startsWith("local/");
    });

  for (const relativePath of actualPaths) {
    if (!expectedPaths.has(relativePath)) {
      errors.push(
        `[ARCH-MEM-001] Unexpected shared Serena memory: ${relativePath}.`,
      );
    }
  }

  for (const [relativePath, expectedContents] of expected) {
    const filePath = join(memoryRoot, ...relativePath.split("/"));

    if (!existsSync(filePath)) {
      errors.push(`[ARCH-MEM-001] Missing generated Serena memory: ${relativePath}.`);
      continue;
    }

    const actualContents = readFileSync(filePath, "utf8").replaceAll(
      "\r\n",
      "\n",
    );

    if (actualContents !== expectedContents) {
      errors.push(
        `[ARCH-MEM-001] Generated Serena memory is stale: ${relativePath}.`,
      );
    }

    for (const match of actualContents.matchAll(/mem:([a-z0-9][a-z0-9/-]*)/g)) {
      const referencedPath = `${match[1]}.md`;

      if (!expectedPaths.has(referencedPath)) {
        errors.push(
          `[ARCH-MEM-001] ${relativePath} references missing memory mem:${match[1]}.`,
        );
      }
    }
  }

  const gitignore = existsSync(gitignorePath)
    ? readFileSync(gitignorePath, "utf8")
    : "";
  const projectConfiguration = existsSync(projectConfigurationPath)
    ? readFileSync(projectConfigurationPath, "utf8")
    : "";

  if (!gitignore.split(/\r?\n/).includes(".serena/memories/local/")) {
    errors.push(
      "[ARCH-MEM-001] .serena/memories/local/ must be ignored for machine-local memories.",
    );
  }

  if (
    !projectConfiguration.includes(
      '"^(memory_maintenance|core|shared/.*)$"',
    )
  ) {
    errors.push(
      "[ARCH-MEM-001] Generated shared Serena memories must be configured read-only.",
    );
  }

  const automationPaths = [
    ".codex/hooks/memory-orchestrator.mjs",
    ".codex/hooks/memory-orchestrator.test.mjs",
    ".serena/README.md",
    "scripts/memory/AGENTS.md",
    "scripts/memory/candidate-bundle.schema.json",
    "scripts/memory/cli.mjs",
    "scripts/memory/engine.mjs",
    "scripts/memory/engine.test.mjs",
    "scripts/memory/policy.mjs",
    "scripts/memory/render.mjs",
    "scripts/memory/render.test.mjs",
    "scripts/memory/schema.mjs",
    "scripts/memory/schema.test.mjs",
    "scripts/memory/storage.mjs",
    "scripts/memory/storage.test.mjs",
  ];

  for (const relativePath of automationPaths) {
    if (!existsSync(join(repositoryRoot, ...relativePath.split("/")))) {
      errors.push(
        `[ARCH-MEM-002] Missing automatic Serena memory asset: ${relativePath}.`,
      );
    }
  }

  const serenaGuidancePath = join(repositoryRoot, ".serena", "AGENTS.md");
  const operatorGuidePath = join(repositoryRoot, ".serena", "README.md");
  const modelInstructionsPath = join(
    repositoryRoot,
    ".codex",
    "instructions",
    "model-instructions.md",
  );
  const serenaGuidance = existsSync(serenaGuidancePath)
    ? readFileSync(serenaGuidancePath, "utf8")
    : "";
  const operatorGuide = existsSync(operatorGuidePath)
    ? readFileSync(operatorGuidePath, "utf8")
    : "";
  const modelInstructions = existsSync(modelInstructionsPath)
    ? readFileSync(modelInstructionsPath, "utf8")
    : "";

  if (
    !serenaGuidance.includes("## Exclusive local memory ownership") ||
    !serenaGuidance.includes("pnpm memory:migrate -- --apply") ||
    !operatorGuide.includes("## Exclusive ownership and quarantine") ||
    !operatorGuide.includes("pnpm memory:migrate -- --apply") ||
    !operatorGuide.includes("permanently remove the retired legacy Markdown") ||
    !modelInstructions.includes(
      "Do not create or preserve unmanaged visible local memories.",
    ) ||
    !modelInstructions.includes("only `local/current-task`")
  ) {
    errors.push(
      "[ARCH-MEM-002] Serena policy, operator guidance, and model instructions must enforce exclusive local-memory ownership and the reviewed migration path.",
    );
  }

  if (
    !projectConfiguration.includes(
      'activation_command: "node scripts/memory/cli.mjs activate --json"',
    ) ||
    !projectConfiguration.includes("activation_command_timeout: 15.0") ||
    !projectConfiguration.includes(
      '"^local/(episodes|archive|_state)/.*$"',
    )
  ) {
    errors.push(
      "[ARCH-MEM-002] Serena project configuration must register the bounded activation command and hide machine-managed local memories.",
    );
  }

  const packageManifestPath = join(repositoryRoot, "package.json");
  let packageManifest;

  try {
    packageManifest = JSON.parse(readFileSync(packageManifestPath, "utf8"));
  } catch {
    errors.push(
      "[ARCH-MEM-002] package.json must be valid JSON for memory automation validation.",
    );
  }

  const requiredScripts = {
    "memory:activate": "node scripts/memory/cli.mjs activate",
    "memory:checkpoint": "node scripts/memory/cli.mjs checkpoint",
    "memory:distill": "node scripts/memory/cli.mjs distill",
    "memory:maintain": "node scripts/memory/cli.mjs maintain",
    "memory:migrate": "node scripts/memory/cli.mjs migrate",
    "memory:status": "node scripts/memory/cli.mjs status",
    "memory:validate": "node scripts/memory/cli.mjs validate",
    "test:memory": "node --test scripts/memory/schema.test.mjs scripts/memory/render.test.mjs scripts/memory/storage.test.mjs scripts/memory/engine.test.mjs .codex/hooks/repository-guard.test.mjs .codex/hooks/memory-orchestrator.test.mjs",
  };

  if (
    packageManifest !== undefined &&
    Object.entries(requiredScripts).some(([name, command]) => {
      return packageManifest.scripts?.[name] !== command;
    })
  ) {
    errors.push(
      "[ARCH-MEM-002] package.json must expose the canonical automatic Serena memory commands.",
    );
  }

  const hookConfigurationPath = join(repositoryRoot, ".codex", "hooks.json");
  let hookConfiguration;

  try {
    hookConfiguration = JSON.parse(
      readFileSync(hookConfigurationPath, "utf8"),
    );
  } catch {
    errors.push(
      "[ARCH-MEM-002] .codex/hooks.json must be valid JSON for memory automation validation.",
    );
  }

  if (hookConfiguration !== undefined) {
    const serializedHooks = JSON.stringify(hookConfiguration.hooks ?? {});
    const requiredEvents = [
      "SessionStart",
      "PreToolUse",
      "PostToolUse",
      "PreCompact",
      "Stop",
    ];

    if (
      !serializedHooks.includes("memory-orchestrator.mjs") ||
      requiredEvents.some(
        (eventName) => !Object.hasOwn(hookConfiguration.hooks ?? {}, eventName),
      )
    ) {
      errors.push(
        "[ARCH-MEM-002] Codex hooks must register the memory orchestrator for the complete lifecycle.",
      );
    }
  }
}
