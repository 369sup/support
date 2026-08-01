# Planned Physical Model

Planned bounded contexts are design-only. They may have source traceability,
logical entities, lifecycle decisions, and a future physical disposition, but
they must have no schema, table, view, function, policy, adapter, or migration.
The machine check fails if a planned context name appears in declarative SQL.

| Planned context | Migration-ready disposition | Blocking decisions before activation |
| --- | --- | --- |
| `enterprises/enterprise-iam` | future `support_enterprises_enterprise_iam` | provider subjects, provisioning authority, group mapping, revocation and audit |
| `enterprises/enterprise-policies` | future `support_enterprises_enterprise_policies` | policy target types, precedence, bypass and effective-date model |
| `enterprises/custom-properties` | future `support_enterprises_custom_properties` | definition/value types, inheritance, targeting and repository projection |
| `repositories/repository-features` | future `support_repositories_repository_features` | feature set excludes code/Git capabilities; policy and visibility effects |
| `repositories/repository-metadata` | future `support_repositories_repository_metadata` | typed metadata, topics, ownership, indexing and erasure |
| `collaboration/issue-schema` | future `support_collaboration_issue_schema` | type/field inheritance, typed values, validation and evolution |
| `collaboration/labels-and-milestones` | future `support_collaboration_labels_and_milestones` | scope, rename/delete effects, progress and due-date semantics |
| `integrations/github-app-registrations` | future `support_integrations_github_app_registrations` | secrets, callback validation, permissions and ownership |
| `integrations/github-app-installations` | future `support_integrations_github_app_installations` | installation target, grant reconciliation, suspension and deletion |
| `integrations/oauth-app-registrations` | future `support_integrations_oauth_app_registrations` | client secret custody, callback validation and ownership |
| `integrations/oauth-authorizations` | future `support_integrations_oauth_authorizations` | scope grant, token provider boundary, revoke and audit |
| `integrations/repository-autolinks` | future `support_integrations_repository_autolinks` | pattern validation, target ownership and repository lifecycle |
| `integrations/webhooks` | future `support_integrations_webhooks` | secret custody, delivery lifecycle, retries and retention |
| `commerce/billing` | future `support_commerce_billing` | payer, provider ledger, invoices, tax and retention |
| `commerce/entitlements` | future `support_commerce_entitlements` | source-of-truth, effective dates, downgrade and authorization boundary |
| `governance/audit-logs` | future `support_governance_audit_logs` | semantic event catalog, visibility, export and retention ownership |
| `projections/repository-insights` | future `support_projections_repository_insights` | source events, aggregation windows, staleness and rebuild |
| `platform/site-content` | future `support_platform_site_content` | editorial ownership, publication, localization and cache invalidation |
| `integrations/marketplace-catalog` | future `support_integrations_marketplace_catalog` | listing ownership, review state, pricing references and publication |
| `platform/actions-route-compatibility` | no schema while GitHub Actions is excluded | route-only unavailable behavior; no durable product model |
| `platform/repository-content-route-compatibility` | no schema while repository content is excluded | route-only unavailable behavior; no durable product model |
| `platform/repository-history-route-compatibility` | no schema while Git history is excluded | route-only unavailable behavior; no durable product model |
| `platform/repository-reference-route-compatibility` | no schema while Git refs are excluded | route-only unavailable behavior; no durable product model |
| `platform/pull-request-route-compatibility` | no schema while pull requests are excluded | route-only unavailable behavior; no durable product model |
| `commerce/package-registry` | future `support_commerce_package_registry` | metadata-only boundary, payload provider, ownership and retention |
| `platform/site-publishing` | future `support_platform_site_publishing` | source boundary, build/publish state, domains and rollback |
| `repositories/repository-releases` | future `support_repositories_repository_releases` | Git tag provider boundary, asset lifecycle and publication |
| `repositories/repository-forks` | future `support_repositories_repository_forks` | Git history provider boundary and retained relationship metadata |
| `collaboration/community-profiles` | future `support_collaboration_community_profiles` | structured app-owned content versus excluded repository files |
| `collaboration/wikis` | future `support_collaboration_wikis` | app-owned versus Git-backed content, history and erasure |
| `projections/repository-traffic` | future `support_projections_repository_traffic` | trustworthy telemetry source, windows, privacy and retention |

Activation requires changing `module-map.json`, completing every blocking
decision, adding exact source and requirement IDs to `active-model.md`, and only
then adding declarative SQL and a forward migration.
