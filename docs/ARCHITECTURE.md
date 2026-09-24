# Architecture

## Core principle

Emergency guidance is local-first. Network, map, analytics, notification, and AI
failures must not prevent emergency mode, an approved offline protocol, or a system
dialer handoff.

```text
Android app (React Native / Expo development build)
├── encrypted local SQLite: approved protocol packs and directory snapshots
├── native location permission and capability status
└── user-confirmed system-dialer handoff
          │ optional TLS sync
          ▼
Cloud Run: NestJS modular API
├── public approved-content and directory endpoints
├── emergency-session and aggregate operations endpoints
├── administrator-only content, directory, audit, and cost endpoints
└── notification worker
          │                 │
          ▼                 ▼
Cloud SQL PostgreSQL + PostGIS    Private Cloud Storage

Next.js admin dashboard ── authenticated admin API only
```

The MVP is a modular monolith. Do not introduce microservices, event buses, or
always-on workers until pilot evidence justifies them.
