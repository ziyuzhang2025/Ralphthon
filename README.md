# Ralphthon
baseball coaching platform
# CoachLink Baseball

A lean MVP for a guardian-led online baseball coaching marketplace.

## What is implemented

- Responsive Next.js App Router UI for coach discovery, coach profiles, checkout, dashboards, coach applications, and admin approval.
- Production-shaped domain model for guardians, coaches, player profiles, availability, bookings, payments, Daily rooms, reviews, messages, and audit events.
- API routes for coach applications, admin approve/reject, coach listing, booking checkout, Stripe webhook fulfillment, and join-room access.
- Demo-safe integration boundaries: without Stripe or Daily keys, checkout and video rooms use local demo URLs.
- Supabase schema starter with core tables and RLS policy examples.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verify

```bash
npm run lint
npm run test
npm run build
```

## Integrations

Copy `.env.example` to `.env.local` and fill the keys for Supabase, Stripe, and Daily. The app runs without those values in demo mode.

Coach profiles can persist in MongoDB by setting `MONGODB_URI`, `MONGODB_DB`, and `MONGODB_COACHES_COLLECTION`. When MongoDB is configured, the app reads and writes coach records in the configured `coaches` collection and falls back to seeded demo coaches only if the database is unavailable for read-only pages.
