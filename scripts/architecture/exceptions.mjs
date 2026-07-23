import { readFileSync } from "node:fs";
import { relative, sep } from "node:path";

import { architectureRuleRegistry } from "@support/tooling/architecture/policy";

const exceptionFields = [
  "id",
  "rule",
  "scope",
  "owner",
  "reason",
  "alternatives",
  "risk",
  "spreadPrevention",
  "reviewAfter",
  "removalCondition",
];

function normalizePath(value) {
  return value.split(sep).join("/");
}

function projectRelative(rootDir, filePath) {
  return normalizePath(relative(rootDir, filePath));
}

export function validateExceptions(rootDir, registry, sourceFiles, now, errors) {
  if (!Array.isArray(registry)) {
    errors.push("[ARCH-EXCEPTION-001] exceptions/registry.json must contain an array.");
    return;
  }

  const registryById = new Map();

  for (const exception of registry) {
    const missingFields = exceptionFields.filter((field) => {
      return typeof exception[field] !== "string" ||
        exception[field].trim() === "";
    });

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

    if (!/^\d{4}-\d{2}-\d{2}$/.test(exception.reviewAfter)) {
      errors.push(
        `[ARCH-EXCEPTION-005] ${exception.id} reviewAfter must use YYYY-MM-DD.`,
      );
    } else if (exception.reviewAfter <= today) {
      errors.push(
        `[ARCH-EXCEPTION-006] ${exception.id} reached its review date ${exception.reviewAfter}.`,
      );
    }
  }

  const references = new Map();

  for (const filePath of sourceFiles) {
    const contents = readFileSync(filePath, "utf8");

    for (const match of contents.matchAll(/ARCH-EX-\d{3}/g)) {
      const id = match[0];
      const paths = references.get(id) ?? [];
      paths.push(projectRelative(rootDir, filePath));
      references.set(id, paths);
    }
  }

  for (const [id, paths] of references) {
    const exception = registryById.get(id);

    if (exception === undefined) {
      errors.push(`[ARCH-EXCEPTION-007] ${id} is referenced but not registered.`);
      continue;
    }

    for (const referencePath of paths) {
      const normalizedScope = normalizePath(exception.scope).replace(/\/$/, "");

      if (
        referencePath !== normalizedScope &&
        !referencePath.startsWith(`${normalizedScope}/`)
      ) {
        errors.push(
          `[ARCH-EXCEPTION-008] ${id} scope ${normalizedScope} does not cover ${referencePath}.`,
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
