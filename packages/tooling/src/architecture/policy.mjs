export const architectureProfiles = Object.freeze([
  "required",
  "generated",
  "knowledge",
  "all",
]);

export const catalogVersion = 6;

export const publicEntrypointBasenames = Object.freeze([
  "server-api",
  "browser-ui",
  "server-actions",
  "integration-contracts",
]);

export const contextLayerNames = Object.freeze([
  "domain",
  "application",
  "contracts",
  "adapters",
  "composition",
  "tests",
]);

export const workspacePackagePolicy = Object.freeze({
  "support-workspace": Object.freeze({ kind: "root", path: "." }),
  "@support/web": Object.freeze({ kind: "app", path: "apps/web" }),
  "@support/contracts": Object.freeze({
    kind: "contracts",
    path: "packages/contracts",
  }),
  "@support/eslint-config": Object.freeze({
    kind: "config",
    path: "packages/eslint-config",
  }),
  "@support/observability": Object.freeze({
    kind: "runtime",
    path: "packages/observability",
  }),
  "@support/shadcn": Object.freeze({
    kind: "ui",
    path: "packages/shadcn",
  }),
  "@support/testing-config": Object.freeze({
    kind: "testing",
    path: "packages/testing-config",
  }),
  "@support/tooling": Object.freeze({
    kind: "tooling",
    path: "packages/tooling",
  }),
  "@support/typescript-config": Object.freeze({
    kind: "config",
    path: "packages/typescript-config",
  }),
});

export const allowedWorkspaceDependencyKinds = Object.freeze({
  dependencies: Object.freeze({
    root: Object.freeze([]),
    app: Object.freeze(["runtime", "ui", "contracts"]),
    runtime: Object.freeze(["runtime", "contracts"]),
    ui: Object.freeze(["runtime", "ui", "contracts"]),
    contracts: Object.freeze([]),
    config: Object.freeze(["config", "tooling"]),
    testing: Object.freeze(["config", "testing", "tooling"]),
    tooling: Object.freeze([]),
  }),
  devDependencies: Object.freeze({
    root: Object.freeze(["config", "testing", "tooling"]),
    app: Object.freeze(["config", "testing", "tooling"]),
    runtime: Object.freeze(["config", "testing", "tooling"]),
    ui: Object.freeze(["config", "testing", "tooling"]),
    contracts: Object.freeze(["config", "testing", "tooling"]),
    config: Object.freeze(["config", "testing", "tooling"]),
    testing: Object.freeze(["config", "testing", "tooling"]),
    tooling: Object.freeze(["config", "testing", "tooling"]),
  }),
  peerDependencies: Object.freeze({
    root: Object.freeze([]),
    app: Object.freeze(["runtime", "ui", "contracts"]),
    runtime: Object.freeze(["runtime", "contracts"]),
    ui: Object.freeze(["runtime", "ui", "contracts"]),
    contracts: Object.freeze([]),
    config: Object.freeze(["config", "tooling"]),
    testing: Object.freeze(["config", "testing", "tooling"]),
    tooling: Object.freeze([]),
  }),
  optionalDependencies: Object.freeze({
    root: Object.freeze([]),
    app: Object.freeze(["runtime", "ui", "contracts"]),
    runtime: Object.freeze(["runtime", "contracts"]),
    ui: Object.freeze(["runtime", "ui", "contracts"]),
    contracts: Object.freeze([]),
    config: Object.freeze(["config", "tooling"]),
    testing: Object.freeze(["config", "testing", "tooling"]),
    tooling: Object.freeze([]),
  }),
});

function rule(id, category, gate, enforcer, summary) {
  return [
    id,
    Object.freeze({
      category,
      gate,
      enforcer,
      summary,
    }),
  ];
}

const ruleEntries = [
  rule("ARCH-API-001", "public-api", "required", "eslint", "Browser entrypoints declare the client runtime."),
  rule("ARCH-API-002", "public-api", "required", "eslint", "Server Action entrypoints declare the server runtime."),
  rule("ARCH-API-003", "public-api", "required", "eslint", "Server Action exports are asynchronous."),
  rule("ARCH-API-004", "public-api", "required", "eslint", "Server Action re-exports target action modules."),
  rule("ARCH-API-005", "public-api", "required", "eslint", "Public entrypoints expose boundary-safe capabilities."),
  rule("ARCH-CLIENT-001", "dependency", "required", "checker", "Browser graphs do not reach server-only code."),
  rule("ARCH-DEP-001", "dependency", "required", "eslint", "App code imports contexts through public entrypoints."),
  rule("ARCH-DEP-002", "dependency", "required", "eslint", "Contexts do not import App Router delivery."),
  rule("ARCH-DEP-003", "dependency", "required", "eslint", "Cross-context imports use public entrypoints."),
  rule("ARCH-DEP-004", "dependency", "required", "eslint", "Domain imports remain in the domain layer."),
  rule("ARCH-DEP-005", "dependency", "required", "eslint", "Application imports point inward."),
  rule("ARCH-DEP-006", "dependency", "required", "eslint", "Inner layers do not import external infrastructure."),
  rule("ARCH-DEP-007", "dependency", "required", "eslint", "Client components use browser-safe entrypoints."),
  rule("ARCH-DEP-008", "dependency", "required", "eslint", "Contracts remain framework and implementation free."),
  rule("ARCH-DEP-009", "dependency", "required", "eslint", "Same-context imports use relative paths."),
  rule("ARCH-DEP-010", "dependency", "required", "checker", "Runtime context dependencies are declared."),
  rule("ARCH-DEP-011", "dependency", "required", "eslint", "Adapters and composition follow the layer matrix."),
  rule("ARCH-DEP-012", "dependency", "required", "eslint", "All module-loading syntax follows boundary rules."),
  rule("ARCH-DEP-013", "dependency", "required", "checker", "Planned relationships do not authorize runtime imports."),
  rule("ARCH-DEP-014", "dependency", "required", "checker", "Event dependencies consume active event contracts."),
  rule("ARCH-DOM-001", "domain", "required", "eslint", "Domain behavior does not use ambient infrastructure."),
  rule("ARCH-EXCEPTION-001", "exception", "required", "checker", "The exception registry is readable."),
  rule("ARCH-EXCEPTION-002", "exception", "required", "checker", "Exceptions contain every required field."),
  rule("ARCH-EXCEPTION-003", "exception", "required", "checker", "Exception identifiers are valid."),
  rule("ARCH-EXCEPTION-004", "exception", "required", "checker", "Exception identifiers are unique."),
  rule("ARCH-EXCEPTION-005", "exception", "required", "checker", "Exception review dates are valid."),
  rule("ARCH-EXCEPTION-006", "exception", "required", "checker", "Expired exceptions fail validation."),
  rule("ARCH-EXCEPTION-007", "exception", "required", "checker", "Referenced exceptions are registered."),
  rule("ARCH-EXCEPTION-008", "exception", "required", "checker", "Exception scopes cover their references."),
  rule("ARCH-EXCEPTION-009", "exception", "required", "checker", "Registered exceptions are used."),
  rule("ARCH-EXCEPTION-010", "exception", "required", "checker", "Exceptions waive registered architecture rules."),
  rule("ARCH-FILE-001", "structure", "required", "checker", "Runtime files keep one architectural responsibility."),
  rule("ARCH-GRAPH-001", "dependency", "required", "checker", "Source dependency graphs are acyclic."),
  rule("ARCH-GUIDE-001", "guidance", "required", "checker", "Repository guidance links and placement are valid."),
  rule("ARCH-GUIDE-002", "generated", "generated", "checker", "Generated-memory authorities match repository guidance."),
  rule("ARCH-KNOWLEDGE-001", "knowledge", "knowledge", "checker", "Official-source verification remains fresh."),
  rule("ARCH-MAP-001", "catalog", "required", "checker", "The context catalog is readable."),
  rule("ARCH-MAP-002", "catalog", "required", "checker", "Catalog context identifiers are valid."),
  rule("ARCH-MAP-003", "catalog", "required", "checker", "Catalog context identifiers are unique."),
  rule("ARCH-MAP-004", "catalog", "required", "checker", "Catalog ownership entries are valid."),
  rule("ARCH-MAP-006", "catalog", "required", "checker", "Planned contexts contain README files only."),
  rule("ARCH-MAP-009", "catalog", "required", "checker", "Active contexts expose a public entrypoint."),
  rule("ARCH-MAP-010", "catalog", "required", "checker", "Catalog relationships use valid contracts."),
  rule("ARCH-MAP-011", "generated", "generated", "checker", "The generated module map exists."),
  rule("ARCH-MAP-012", "generated", "generated", "checker", "The generated module map is current."),
  rule("ARCH-MAP-013", "catalog", "required", "checker", "The catalog matches its declared version contract."),
  rule("ARCH-MAP-014", "catalog", "required", "checker", "Product sources use approved official documentation."),
  rule("ARCH-MAP-015", "catalog", "required", "checker", "Catalog relationships target valid contexts."),
  rule("ARCH-MAP-016", "catalog", "required", "checker", "Excluded and deferred capabilities are unambiguous."),
  rule("ARCH-MAP-017", "catalog", "required", "checker", "Active source verification is present, valid, and non-future."),
  rule("ARCH-MAP-018", "catalog", "required", "checker", "Published-event catalogs are explicit."),
  rule("ARCH-MAP-019", "catalog", "required", "checker", "Context README contracts match lifecycle requirements."),
  rule("ARCH-MAP-020", "catalog", "required", "checker", "Active events expose schemas and ordering keys."),
  rule("ARCH-MAP-021", "catalog", "required", "checker", "Active product contexts have validated semantics."),
  rule("ARCH-MAP-022", "catalog", "required", "checker", "Active runtime dependencies target active contexts."),
  rule("ARCH-MAP-023", "catalog", "required", "checker", "Activation scopes match context status."),
  rule("ARCH-MAP-024", "catalog", "required", "checker", "Validated ownership has source-backed claims."),
  rule("ARCH-MAP-025", "catalog", "required", "checker", "Validated events have source-backed claims."),
  rule("ARCH-MAP-026", "catalog", "required", "checker", "Event implementation status is coherent."),
  rule("ARCH-MAP-027", "catalog", "required", "checker", "Every context owns one README directory."),
  rule("ARCH-MEM-001", "generated", "generated", "checker", "Shared Serena memories are current and read-only."),
  rule("ARCH-NAME-001", "naming", "required", "checker", "Source names use canonical casing."),
  rule("ARCH-NAME-002", "naming", "required", "checker", "Source filenames communicate architectural roles."),
  rule("ARCH-NAME-003", "naming", "required", "checker", "Role suffixes match source placement."),
  rule("ARCH-NAME-004", "naming", "required", "checker", "Public entrypoint filenames are canonical."),
  rule("ARCH-NAME-005", "naming", "required", "checker", "Architecture symbols use canonical names."),
  rule("ARCH-PKG-001", "workspace", "required", "checker", "Workspace manifests match the package policy."),
  rule("ARCH-PKG-002", "workspace", "required", "checker", "Internal dependencies target workspace packages."),
  rule("ARCH-PKG-003", "workspace", "required", "checker", "Packages never depend on applications."),
  rule("ARCH-PKG-004", "workspace", "required", "checker", "Internal dependencies use permitted package kinds and sections."),
  rule("ARCH-PKG-005", "workspace", "required", "checker", "Internal imports are declared by the importer."),
  rule("ARCH-PKG-006", "workspace", "required", "checker", "Internal imports use exported package subpaths."),
  rule("ARCH-PKG-007", "workspace", "required", "checker", "Workspace source does not cross package roots directly."),
  rule("ARCH-PKG-008", "workspace", "required", "checker", "Package exports exist and the package graph is acyclic."),
  rule("ARCH-SRC-001", "structure", "required", "checker", "Application source roots are restricted."),
  rule("ARCH-STRUCT-001", "structure", "required", "checker", "Context roots contain canonical entries."),
  rule("ARCH-STRUCT-002", "structure", "required", "checker", "Subdomain roots contain bounded contexts only."),
  rule("ARCH-STRUCT-003", "structure", "required", "checker", "Module roots follow their documented shape."),
  rule("ARCH-TOOL-001", "tooling", "required", "checker", "Generators and aliases target canonical locations."),
  rule("ARCH-USECASE-001", "use-case", "required", "checker", "Active semantics map to concrete use cases."),
  rule("ARCH-USECASE-002", "use-case", "required", "checker", "Designed use cases match implementation traceability."),
  rule("ARCH-USECASE-003", "use-case", "required", "checker", "Expected rejections are represented in contracts."),
];

export const architectureRuleIds = Object.freeze(
  ruleEntries.map(([id]) => id),
);

if (new Set(architectureRuleIds).size !== architectureRuleIds.length) {
  throw new Error("Architecture rule registry contains a duplicate rule ID.");
}

export const architectureRuleRegistry = Object.freeze(
  Object.fromEntries(ruleEntries),
);

export function isArchitectureProfile(value) {
  return architectureProfiles.includes(value);
}
