# Fair Chance – Next.js Starter

Includes:
- Next.js App Router, TypeScript.
- Supabase JS client (browser + admin).
- Auth UI for Email+Password, Microsoft OAuth, and SAML/SSO.
- Scaffolding for Dashboard, Employees, Admin sections.

## Configure Supabase Auth
- Email+Password: enable in Authentication → Providers.
- Microsoft: enable Azure provider. Callback: `https://<your-site>/auth/callback`.
- SAML/SSO: configure in Authentication → SSO. The login button calls `signInWithSSO()`.

## Environment
Copy `.env.example` to `.env.local` and set URL, keys.

## Run
npm i
npm run dev

## RLS Note
Your DB uses GUC-based policies. Access tables through server actions or RPCs that set GUCs and query within the same request.
