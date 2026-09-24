# RapidAid project charter

## Pilot scope

- **Platform:** Android only.
- **Locations:** Douala and Yaounde, Cameroon.
- **Languages:** English and French.
- **Accounts:** none for ordinary users.
- **Calling:** visible, user-confirmed system-dialer handoff; never automatic calling.
- **Connectivity:** approved emergency content must work offline.

## Source of truth

The product specification in `rapid_first_aid_app_spec.md` and the architecture
addendum in `rapid_aid_architecture_decision_addendum.md` are the current source of
truth. This document records the approved MVP decisions that narrow those documents.

## Approved MVP stack

- React Native with Expo development builds (Android only).
- NestJS/Fastify API; Next.js/TypeScript admin dashboard.
- PostgreSQL/PostGIS on Cloud SQL; encrypted local SQLite for offline content.
- Google Cloud in `africa-south1`; Cloud Run, Cloud Storage, Firebase/Identity
  Platform for administrators only, and FCM for non-critical notifications.
- Device location first; maps are optional and cannot be required for emergency help.
- Sentry with aggressive scrubbing; PostHog aggregate analytics with no replay,
  health, or location payloads.
- Private GitHub, Actions, CodeQL, Dependabot, pnpm, and Turborepo.

## Budget

Development and pilot operating target: no more than USD 75/month. Configure
provider alerts at USD 60 and USD 75 before pilot deployment.
