# Dandiyaa 24-hour delivery checklist

This checklist is intentionally ordered so every hourly run leaves the product in a usable state.

## Run 01 — Product foundation
- [x] Next.js production scaffold
- [x] Environment contract
- [x] Security headers
- [x] Privacy-first data model
- [x] 18+ and non-affiliation requirements encoded in the product

## Run 02 — Landing experience
- [ ] Dandiya visual system
- [ ] Splash animation
- [ ] Scroll-driven image-frame sequence
- [ ] Live event countdown
- [ ] Mobile-first responsive polish

## Run 03 — Registration
- [ ] College selector (PCCOE Nigdi / DYP Akurdi)
- [ ] Name, contact, optional social, PRN/roll number
- [ ] Year and senior/junior/same-year/any preference
- [ ] Explicit 18+ / matching / privacy / non-affiliation consent
- [ ] Anti-spam honeypot and server validation

## Run 04 — Supabase
- [ ] Migration for settings, participants, matches, reports
- [ ] RLS enabled everywhere in public schema
- [ ] Private contact and PRN data inaccessible from browser clients
- [ ] Uniqueness / dedupe constraints and useful indexes

## Run 05 — Admin
- [ ] Protected /admin authentication
- [ ] Set registration close time
- [ ] Open / close event controls
- [ ] Participant counts by college
- [ ] Generate matches action with audit information

## Run 06 — Match engine
- [ ] Never mix colleges
- [ ] Preference-aware randomized pairing
- [ ] Graceful fallback when preferences cannot be satisfied
- [ ] Cryptographically strong shuffle
- [ ] Idempotent generation

## Run 07 — Participant match reveal
- [ ] Claim-token based private lookup
- [ ] No private contact before mutual acceptance
- [ ] Accept / reject / rematch
- [ ] Clear safety copy

## Run 08 — Safety
- [ ] Block flow
- [ ] Report flow
- [x] Contact/grievance schema foundation
- [ ] Account/data deletion request flow
- [ ] Admin moderation view

## Run 09 — Legal/privacy UX
- [ ] Privacy policy
- [ ] Terms and event rules
- [ ] Independent student-run/non-college declaration in footer and registration
- [ ] No college logos/crests without documented authorization

## Run 10 — Test pass
- [ ] Build/typecheck
- [ ] Validate API error paths
- [ ] Test uneven participant counts
- [ ] Test each preference
- [ ] Test college isolation

## Runs 11–18 — UI/UX refinement
- [ ] Landing animation refinement
- [ ] Registration form micro-interactions
- [ ] Match reveal celebration
- [ ] Accessibility / reduced-motion support
- [ ] Empty/error/loading states
- [ ] Cross-device QA

## Runs 19–22 — Production hardening
- [ ] Supabase security/performance advisors
- [ ] Rate-limit/abuse review
- [ ] Environment validation
- [ ] Logging and redaction review
- [ ] Vercel deployment inspection

## Runs 23–24 — Release
- [ ] Production smoke test
- [ ] Final privacy/security review
- [ ] README deployment instructions
- [ ] Completion report
