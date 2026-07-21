# TypeScript Configuration Workflow

This file governs `packages/typescript-config/**`.

## Preset contract

- `base.json` owns strict repository-wide compiler defaults.
- `nextjs.json`, `node.json`, and `react-library.json` add only runtime-specific
  settings to the base preset.
- Export presets explicitly from `package.json`; consumers extend the package
  subpath rather than copying settings.
- Keep this package declarative. Do not add runtime code, product types, path
  aliases for a consumer, or dependencies on application packages.

Do not disable a strictness or module-safety option to accommodate one package.
Fix the package or use the narrowest documented consumer override when an
external tool makes a shared setting impossible. Treat changes to `base.json`
as repository-wide changes and inspect every consumer.

## Validation

After changing a preset, run `pnpm typecheck` and `pnpm lint`. Run `pnpm check`
when practical because a compiler option can affect every workspace package.
