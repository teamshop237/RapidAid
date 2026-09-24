# Administrative dashboard boundary

The dashboard is a separate Next.js application. It calls a role-restricted admin API
and never connects directly to Cloud SQL. Initial modules are content workflow,
directory verification, audit log, aggregate operations, scrubbed bug reports, system
health, and provider-cost reporting.

Roles: `ADMIN`, `MEDICAL_REVIEWER`, `RELEASE_OWNER`, `OPERATIONS`, and `READ_ONLY`.
MFA is mandatory for all roles.
