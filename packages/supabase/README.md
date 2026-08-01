# `@support/supabase`

This server-only runtime package is the single Supabase SDK boundary for the
workspace. It exposes explicit `@support/supabase/auth` and
`@support/supabase/postgres` subpaths so browser and server dependency graphs
remain separate.

Only this package may declare or import `@supabase/*` dependencies. Workspace
consumers depend on `@support/supabase` and use an explicit exported subpath.
Adding another Supabase product integration begins here with a new server-only
subpath instead of a direct SDK dependency in an application or another
package.

It owns:

- Supabase Auth configuration validation;
- the framework-neutral Auth gateway and cookie bridge;
- password, OTP, PKCE, session refresh, and Google OAuth SDK operations;
- removal of provider access and refresh tokens before session persistence;
- normalization of Supabase SDK results into package-owned types;
- Supabase direct, session-pooler, and transaction-pooler endpoint validation;
- TLS policy for Supabase PostgreSQL connections; and
- construction of the existing `PostgresDatabase`.

It does not own Next.js request/response objects, Support accounts, usernames,
authorization, product tables, migrations, RLS policies, or provider secrets.
Applications adapt their framework cookies to `SupabaseCookieBridge`; product
modules retain account lifecycle and authorization decisions. Raw
`SupabaseClient`, JWT payload, provider tokens, and SDK errors are not part of
the public API.
