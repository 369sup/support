import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { afterAll, describe, it } from "vitest";

import { architectureBoundariesPlugin } from "../src/eslint-rules/architecture-boundaries.mjs";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    parser: tseslint.parser,
    sourceType: "module",
  },
});

ruleTester.run(
  "enforce-import-boundaries",
  architectureBoundariesPlugin.rules["enforce-import-boundaries"],
  {
    valid: [
      {
        filename: "D:/project/src/app/page.tsx",
        code: 'import { RepositoryCard } from "@/modules/core-domain/repositories/browser-ui";',
      },
      {
        filename:
          "D:/project/src/modules/core-domain/repositories/domain/entities/repository.entity.ts",
        code: 'import type { RepositoryId } from "../value-objects/repository-id.value-object";',
      },
      {
        filename:
          "D:/project/src/modules/core-domain/repositories/application/commands/create-repository/create-repository.handler.ts",
        code: 'import type { Repository } from "../../../domain/entities/repository.entity";',
      },
      {
        filename: "D:/project/src/app/global-error.tsx",
        code: '"use client"; import { RepositoryCard } from "@/modules/core-domain/repositories/browser-ui";',
      },
    ],
    invalid: [
      {
        filename: "D:/project/src/app/page.tsx",
        code: 'import { RepositoryCard } from "@/modules/core-domain/repositories/adapters/inbound/react/repository-card";',
        errors: [{ messageId: "appPrivateModule" }],
      },
      {
        filename:
          "D:/project/src/modules/core-domain/repositories/domain/entities/repository.entity.ts",
        code: 'import { save } from "../../adapters/outbound/save";',
        errors: [{ messageId: "domainDirection" }],
      },
      {
        filename:
          "D:/project/src/modules/core-domain/repositories/application/commands/create-repository/create-repository.handler.ts",
        code: 'import React from "react";',
        errors: [{ messageId: "innerExternal" }],
      },
      {
        filename:
          "D:/project/src/modules/core-domain/repositories/application/commands/create-repository/create-repository.handler.ts",
        code: 'import { page } from "@/app/page";',
        errors: [{ messageId: "moduleImportsApp" }],
      },
      {
        filename:
          "D:/project/src/modules/collaboration/issues/application/queries/get-issue/get-issue.handler.ts",
        code: 'import { Repository } from "@/modules/core-domain/repositories/domain/entities/repository.entity";',
        errors: [{ messageId: "crossContextPrivate" }],
      },
      {
        filename:
          "D:/project/src/modules/collaboration/issues/application/queries/get-issue/get-issue.handler.ts",
        code: 'import { Repository } from "../../../../../core-domain/repositories/domain/entities/repository.entity";',
        errors: [{ messageId: "crossContextPrivate" }],
      },
      {
        filename:
          "D:/project/src/modules/core-domain/repositories/domain/entities/repository.entity.ts",
        code: 'import type { RepositoryId } from "@/modules/core-domain/repositories/domain/value-objects/repository-id.value-object";',
        errors: [{ messageId: "sameContextAlias" }],
      },
      {
        filename: "D:/project/src/app/global-error.tsx",
        code: '"use client"; import { api } from "@/modules/core-domain/repositories/server-api";',
        errors: [{ messageId: "clientEntrypoint" }],
      },
    ],
  },
);

ruleTester.run(
  "no-domain-ambient-infrastructure",
  architectureBoundariesPlugin.rules["no-domain-ambient-infrastructure"],
  {
    valid: [
      {
        filename:
          "D:/project/src/modules/core-domain/repositories/domain/entities/repository.entity.ts",
        code: "export function rename(name: string) { return name; }",
      },
    ],
    invalid: [
      {
        filename:
          "D:/project/src/modules/core-domain/repositories/domain/entities/repository.entity.ts",
        code: "const createdAt = new Date();",
        errors: [{ messageId: "ambientInfrastructure" }],
      },
      {
        filename:
          "D:/project/src/modules/core-domain/repositories/domain/entities/repository.entity.ts",
        code: "const id = crypto.randomUUID();",
        errors: [{ messageId: "ambientInfrastructure" }],
      },
    ],
  },
);

ruleTester.run(
  "public-entrypoint-contract",
  architectureBoundariesPlugin.rules["public-entrypoint-contract"],
  {
    valid: [
      {
        filename:
          "D:/project/src/modules/core-domain/repositories/browser-ui.ts",
        code: '"use client"; export { Button } from "./adapters/inbound/react/button";',
      },
      {
        filename:
          "D:/project/src/modules/core-domain/repositories/server-actions.ts",
        code: '"use server"; export { createRepository } from "./adapters/inbound/next/server-actions/create-repository.server-action";',
      },
    ],
    invalid: [
      {
        filename:
          "D:/project/src/modules/core-domain/repositories/browser-ui.ts",
        code: 'export { Button } from "./button";',
        errors: [{ messageId: "missingClientDirective" }],
      },
      {
        filename:
          "D:/project/src/modules/core-domain/repositories/server-actions.ts",
        code: "export function createRepository() {}",
        errors: [
          { messageId: "missingServerDirective" },
          { messageId: "nonAsyncAction" },
        ],
      },
    ],
  },
);
