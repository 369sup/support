# TypeScript Clarity Standard

This standard prevents code whose meaning drifts between its definition, its
use, and its runtime behavior. Prefer the form that an ordinary TypeScript
developer can understand without reconstructing operator precedence, advanced
inference, re-export chains, or hidden side effects.

Mechanical rules in ESLint and TypeScript are authoritative. This document
also covers design decisions that static analysis cannot prove.

## Imports and exports

### Preserve names and sources

Use an exported symbol's original name:

```ts
import { createUser } from "./create-user";
```

Do not rename imports or exports to different domain language:

```ts
import { createUser as run } from "./create-user";
export { createUser as register } from "./create-user";
```

An import alias is permitted only for a real name collision or an external API
whose source must remain visible, such as `parseYaml` versus `parseJson`. The
exception must be added to the centralized allowlist in `eslint.config.mjs`;
do not scatter inline exceptions across the codebase.

### Make the public API explicit

- Use named exports for project modules.
- Default exports are limited to filenames required by Next.js.
- Do not use `export *` or `export * as Namespace`.
- Re-export only deliberately selected names from a bounded context's public
  entrypoint.
- Do not build multi-level barrel chains. A public entrypoint may re-export a
  private implementation once; another barrel must not re-export that entry.

```ts
export { createUser, findUser } from "./users";
export type { User, UserId } from "./user-types";
```

### Separate types from runtime dependencies

Use standalone type imports and exports:

```ts
import { createUser } from "./users";
import type { User } from "./users";

export type { UserId } from "./user-types";
```

Do not mix ESM with `require`, `module.exports`, `import = require`, or
`export =`. If a vendor requires CommonJS compatibility, isolate it in one
named adapter.

### Keep module loading visible

- Namespace imports such as `import * as utils` are prohibited.
- Side-effect imports are prohibited outside reviewed framework entrypoints.
- Prefer an explicit initialization function over `import "./register"`.
- Dynamic imports must use a fixed literal path. For a finite set, use a typed
  lookup object whose values each contain a fixed import.
- Use one canonical import path for each module. Do not mix deep relative paths
  with `@/` paths for the same definition.
- Avoid a same-named file and directory such as `user.ts` and `user/index.ts`.

## Expressions and control flow

- Do not use nested ternaries.
- Do not rely on mixed operator precedence. Parenthesize or extract a named
  boolean when combining logical operators.
- Do not use `&&`, `||`, or `??` to trigger side effects.
- Do not use `!!value`; use `Boolean(value)` or test the intended state.
- Do not use truthiness when `0`, `""`, or `false` is a valid value.
- Always use braces for `if`, `else`, `for`, `while`, and `do` blocks.
- Do not compress multiple actions into a sequence expression or one line.
- Extract complex conditions into names that describe business meaning.
- Prefer guard clauses over nested control flow.
- Optional chaining must not hide required data. Validate a required boundary
  instead of extending a long `?.` chain.
- Do not use exceptions for an expected business outcome. Model expected
  success and failure as a discriminated result.

## Type safety without escape hatches

### Validate instead of asserting

External input, decoded JSON, URL data, form data, provider responses, and
stored untyped data begin as `unknown`. Narrow them with a schema, predicate, or
explicit checks before use.

Do not use:

```ts
value as User;
value as unknown as User;
value!;
```

Type assertions and non-null assertions do not perform runtime validation.
When checking an object literal without widening its inferred members, use
`satisfies`:

```ts
const statuses = {
  active: "Active",
  disabled: "Disabled",
} satisfies Record<AccountStatus, string>;
```

Use `as const` only when literal narrowing is required. Do not stack `as const`
with a complex generic expression; introduce a named type instead.

### Model states explicitly

Use a discriminated union when fields are valid only in particular states:

```ts
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "error"; error: Error };
```

Do not represent the same state with several booleans that can contradict one
another. Exhaustively handle discriminated unions.

### Keep absence semantics stable

- `value?: T` means the property may be absent.
- `value: T | undefined` means the property exists but its value may be
  `undefined`.
- `parameter?: T` means the caller may omit the argument.
- Use `parameter: T | undefined` when the argument position is required.

Do not interchange these forms during refactoring.

### Avoid misleading containers

- Do not use broad unions such as `string | number | boolean | object` as a
  substitute for a data model.
- Do not add an index signature beside known fields; isolate dynamic entries in
  a `metadata` or similarly named property.
- Remember that `Record<string, T>` does not prove a runtime key exists. Use a
  checked lookup, `Partial<Record<Key, T>>`, or `Map` when absence is possible.
- Do not return an unlabeled tuple for business data. Use a named object. Tuples
  remain appropriate for coordinates and established external APIs.
- Do not use positional boolean parameters. Use a named options object, or
  separate functions when the flag changes the function's responsibility.

## Restrained TypeScript features

- Do not use TypeScript `enum`; use a string union or a literal constant object.
- Do not create namespaces, declaration merging, module augmentation, or global
  augmentation in application code. Vendor augmentation belongs in one clearly
  named `.d.ts` compatibility file with a reason.
- Prefer a union parameter over overloads when one implementation accepts all
  inputs. Use overloads only when distinct input shapes genuinely determine
  distinct output types.
- A generic parameter must express a useful relationship between at least two
  positions. Do not add generics merely to reduce a small amount of repetition.
- Avoid more than three generic parameters, nested conditional types,
  recursive types, multi-layer `infer`, and long indexed-access chains in
  product code. Split them into named intermediate types or a simpler model.
- Small finite template-literal types are acceptable. Do not build a hidden
  string parser in the type system.
- Branded values must be created by a validating factory, never by a caller's
  assertion.
- In TSX, prefer a named function declaration for generic functions so generic
  syntax cannot be mistaken for JSX.
- Do not introduce decorators unless an adopted framework requires them.
- Expand class parameter properties into an explicit field and constructor
  assignment.
- Getters must not perform I/O, mutate state, hide expensive work, or throw an
  expected business error. Use a named method for observable work.

## Naming and API clarity

- Give exported functions, module contracts, and complex callbacks explicit
  parameter and return types. Allow obvious local inference.
- Use names that reveal business meaning. Single-letter names are limited to
  conventional short indices or mathematical coordinates.
- Boolean names begin with a semantic predicate such as `is`, `has`, `can`,
  `should`, `was`, or `did`.
- Keep one principal action per statement and one responsibility per function.
- Do not create `utils`, `helpers`, or other catch-all modules.

## Exception process

A third-party API or framework can make a prohibited form unavoidable. Use the
smallest possible exception and document why the boundary cannot be expressed
more clearly. Do not disable a rule for an entire file when one line is enough.

```ts
// eslint-disable-next-line clarity/no-renamed-import-export -- Two vendor packages export the same parser name.
import { parse as parseYaml } from "yaml";
```

Prefer a centralized allowlist for stable, repeated vendor aliases. Remove
migration exceptions when the migration ends.

## Completion checklist

Before finishing a TypeScript change:

1. Inspect the actual diff for renamed imports, hidden exports, assertions,
   truthiness, nested ternaries, and new abstraction.
2. Run `pnpm typecheck`.
3. Run `pnpm lint`.
4. Run relevant tests and `pnpm build` when practical.
5. Report every check that did not run.
