<!-- Generated from module-map.json. Do not edit directly. -->
# Module Map

| Subdomain | Bounded context | Kind | Status | Responsibility |
| --- | --- | --- | --- | --- |
| core-domain | repositories | product | planned | Repository identity, ownership, profile, visibility, and lifecycle. |
| core-domain | repository-access | product | planned | Repository grants, roles, principals, and effective access. |
| core-domain | repository-features | product | planned | Repository product feature enablement and configuration. |
| core-domain | repository-metadata | product | planned | Topics, custom-property values, and social preview metadata. |
| core-domain | repository-relations | product | planned | Fork, template, generated-from, and redirect relationships. |
| collaboration | issues | product | planned | Issue lifecycle, assignment, hierarchy, transfer, and work tracking. |
| collaboration | work-taxonomy | product | planned | Repository labels, milestones, and work classification. |
| collaboration | discussions | product | planned | Discussion categories, questions, answers, polls, pins, and lifecycle. |
| collaboration | conversations | product | planned | Comments, reactions, mentions, revisions, and conversation locks. |
| collaboration | community-health | product | planned | Community profile and contribution-resource completeness. |
| collaboration | moderation | product | planned | Content reports, interaction limits, and moderation decisions. |
| engagement-and-delivery | repository-engagement | product | planned | Repository stars and public engagement signals. |
| engagement-and-delivery | subscriptions | product | planned | Repository and conversation notification subscription preferences. |
| engagement-and-delivery | releases | product | planned | Release metadata, publication lifecycle, and asset references. |
| engagement-and-delivery | repository-integrations | product | planned | Repository webhook configuration and delivery policy. |
| query-and-projections | repository-search | product | planned | Permission-filtered repository search projections. |
| query-and-projections | repository-activity | product | planned | User-visible repository activity timelines. |
| query-and-projections | repository-insights | product | planned | Repository product statistics, traffic, and trend projections. |
| platform | identity-directory | product | planned | Actor, user, team, and organization reference resolution. |
| platform | authorization-policy | product | planned | Application authorization decisions across GitHub resource policies. |
| platform | notification-delivery | product | planned | Inbox, email, push, and notification state delivery. |
| platform | media-storage | product | planned | Media and asset references used by repository product features. |
| platform | audit-log | product | planned | Security, governance, and administrative audit records. |
| platform | messaging-outbox | product | planned | Reliable publication of domain and integration events. |

Product semantics must be justified by the official GitHub documentation URLs recorded in `module-map.json`.
Planned contexts do not receive source directories until implementation begins.
