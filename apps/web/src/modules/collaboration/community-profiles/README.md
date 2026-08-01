# Community Profiles Bounded Context

- **Catalog path:** `collaboration/community-profiles`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Structured, app-owned repository community profile metadata and contribution-health indicators.

## Context content tree

- `collaboration/community-profiles` [planned]
  - Approved use cases: `get-repository-community-profile`
  - Owned concepts: `CommunityProfile`, `CommunityHealthIndicator`, `ContributionResourceLink`
  - Published events: none; Community profile queries publish no events before profile commands are designed.
- Planned relationships
  - `repositories/repository-features::RepositoryFeatureReference`
- Explicit exclusions: `RepositoryFile`, `SourceTree`, `CommunityFileDiscovery`

## Designed use cases

### `get-repository-community-profile` [planned]

- **Type:** `query`
- **Application boundary:** `GetRepositoryCommunityProfileUseCase.getRepositoryCommunityProfile()`
- **Public entrypoint:** `server-api.ts#getRepositoryCommunityProfile`
- **Input:** A repository reference.
- **Success result:** Structured community-health indicators and app-owned contribution links.
- **Expected rejections:** `repository-not-found`, `repository-not-readable`
- **Authorization:** Repository visibility gates the profile.
- **Transaction:** Read-only profile snapshot.
- **Idempotency:** Query.
- **Dependencies:** `repositories/repository-features::RepositoryFeatureReference`
- **Published events:** `none`
- **Official evidence:** `collaboration-community-profiles-source-01`
- **Local policy:** Indicators use structured app data only and never infer the presence or content of repository files.

## Ownership and invariants

This context alone owns `CommunityProfile`, `CommunityHealthIndicator`, `ContributionResourceLink`.
It explicitly excludes `RepositoryFile`, `SourceTree`, `CommunityFileDiscovery`.
No runtime source exists while the context remains planned.

## Dependencies and consistency

Runtime dependencies: none.

Planned relationships:

- `repositories/repository-features::RepositoryFeatureReference` (`synchronous`)

Cross-context results are read-only references. No planned relationship authorizes a runtime import before activation.

## Official sources

- `collaboration-community-profiles-source-01`: [repository community profile, community health indicators](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/accessing-a-projects-community-profile) (verified 2026-07-27)

## Exceptions

No context-specific exception is declared. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
