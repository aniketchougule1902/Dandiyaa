# Dandiyaa deployment

## 1. Create a dedicated Supabase project

Do **not** reuse another product's database. Dandiyaa should have its own project and secrets.

Recommended region for this event: India / Mumbai-compatible region when available in your Supabase plan.

Apply the migrations in order from:

```
supabase/migrations/
```

The migrations intentionally:
- enable RLS on every public table;
- revoke browser roles from participant, contact, match, report, block and audit data;
- allow privileged access only through the server-side Supabase secret key;
- keep PCCOE and DYP as separate college values;
- persist explicit consent timestamps and safety actions.

After applying migrations, run Supabase security and performance advisors before production.

## 2. Configure Vercel environment variables

Set these for Production and Preview as appropriate:

```
NEXT_PUBLIC_SUPABASE_URL=<dedicated Dandiyaa project URL>
SUPABASE_SECRET_KEY=<server-only Supabase secret key>
ADMIN_PASSWORD=<strong unique admin password, at least 12 chars>
ADMIN_SESSION_SECRET=<random 32+ char secret>
NEXT_PUBLIC_SITE_URL=<production URL>
```

Never prefix `SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD`, or `ADMIN_SESSION_SECRET` with `NEXT_PUBLIC_`.

## 3. Import GitHub repository into Vercel

Repository:

```
aniketchougule1902/Dandiyaa
```

Framework preset: Next.js.

Build command:

```
npm run build
```

The app is a single Next.js project: frontend pages and backend route handlers deploy together on Vercel.

## 4. Pre-launch gates

Do not publicly launch until all are true:

- [ ] Dedicated Supabase project is connected
- [ ] Both migrations applied
- [ ] Supabase security advisor reviewed
- [ ] Strong admin credentials configured
- [ ] Monitored support / grievance contact added to Privacy page
- [ ] Registration closing time tested in IST
- [ ] Registration tested for both colleges
- [ ] PCCOE participant never matches DYP participant
- [ ] Mutual acceptance verified before contact reveal
- [ ] Reject/rematch tested
- [ ] Block prevents repeat pairing
- [ ] Report reaches admin/moderation workflow
- [ ] Data deletion/withdrawal request tested
- [ ] Mobile QA completed
- [ ] CI build green
- [ ] Vercel production smoke test green

## Non-affiliation

Do not add official college logos, crests or claims of sponsorship/endorsement unless written authorization exists.

Dandiyaa should continue to identify itself as an independent student-run/social experience unless that status genuinely changes.
