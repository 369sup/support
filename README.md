# Support

A production-ready starter built with Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routing

The App Router is split into two route groups. Group names do not appear in the URL.

```text
src/app/
├── (console)/
│   ├── account/
│   ├── dashboard/
│   ├── notifications/
│   ├── projects/
│   ├── repositories/
│   └── settings/
└── (public)/
    ├── accept-invitation/
    ├── accessibility/
    ├── docs/
    ├── forgot-password/
    ├── logout/
    ├── privacy/
    ├── reset-password/
    ├── search/
    ├── sign-in/
    ├── sign-up/
    ├── terms/
    └── verify-email/
```

Set `NEXT_PUBLIC_SITE_URL` in deployed environments so metadata routes emit the canonical production URL.

## Commands

- `npm run dev` — start the local development server
- `npm run build` — create a production build
- `npm run lint` — run ESLint
- `npx shadcn@latest add <component>` — add a shadcn/ui component
