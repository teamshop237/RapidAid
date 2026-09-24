# RapidAid — Architecture & Decision Addendum

**Purpose:** Record decisions made after the original `rapid_first_aid_app_spec.md` was produced.

**Status:** Current project decisions unless explicitly marked as future considerations.

## 1. Project Direction

RapidAid will be developed as a real software product, built incrementally and designed from the beginning to support:

- A user-facing emergency mobile application.
- A backend platform.
- A dedicated administrative dashboard.
- Project/developer infrastructure and cost monitoring.
- AI agents assisting with development, QA, research, administration, and medical-content organization.
- Human approval for high-impact changes.

## 2. Six-System Architecture

```text
RAPIDAID
│
├── 1. Mobile App
├── 2. Backend
├── 3. Admin Dashboard
├── 4. Project Services & Cost Layer
├── 5. AI Agent System
└── 6. Development / Tooling Layer
```

### Mobile App
User-facing emergency functionality: emergency mode, rapid triage, first-aid guidance, emergency-service contact, location, offline protocols, contacts, hospital information, accessibility, voice, and localization.

### Backend
User accounts, emergency sessions, protocols, emergency-service data, hospitals, location services, feedback, analytics, notifications, authentication, APIs, and audit logs.

### Admin Dashboard
A separate web interface for operational oversight of users, emergency activity, bugs, feedback, medical content, system health, and project operations.

### Project Services & Cost Layer
Tracks services that **the development team pays for**, including usage, costs, budgets, forecasts, and billing/service status.

### AI Agent System
Specialized agents for development, QA, research, administration/analytics, documentation, and medical-content organization.

### Development / Tooling Layer
Git/GitHub, development environments, testing, CI/CD, documentation, agent tooling, monitoring, and security tooling.

## 3. Admin Dashboard

### Users
- Total users
- Active users
- New registrations
- Account status
- Approximate geographic distribution
- User reports

### Emergency Activity
- Emergency sessions
- Emergency categories
- Emergency-call attempts
- Failed calls
- Location failures
- Offline sessions
- Session errors

### Bugs & Errors
- Crash reports
- API errors
- Failed emergency calls
- Failed location requests
- Device/OS information where appropriate
- Error logs
- Severity
- Bug status

Suggested lifecycle:

```text
NEW → INVESTIGATING → FIXED → VERIFIED → CLOSED
```

### Customer Feedback
- General feedback
- Bug reports
- Feature requests
- Ratings
- Comments
- Emergency-session feedback
- Support requests

### Medical Content
- Protocol versions
- Draft protocols
- Medical-review status
- Expired reviews
- Published protocols
- Emergency-number data
- Hospital data

### System Health
- Backend status
- Database status
- API latency
- Error rates
- Storage
- Notification systems
- External-service availability

## 4. Project Operating Costs

"Payments" means payments made by the development team to operate and build the service. It does **not** mean charging customers.

Potential service costs:

| Category | Purpose |
|---|---|
| AI/API | AI models and agent usage |
| Hosting | Backend/cloud infrastructure |
| Database | Hosted database infrastructure |
| Maps | Maps, geocoding, location |
| SMS/Phone | Communication services where appropriate |
| Email | Verification/support email |
| Push notifications | Mobile notifications |
| Error monitoring | Crash/error tracking |
| Analytics | Product analytics |
| Storage | Files and documents |
| App stores | Developer accounts |
| Domain | Website/API domain |
| Security | Certificates/security infrastructure |
| Development tools | Git, IDEs, design tools |
| Testing | Device/cloud testing |

The actual providers will be selected during infrastructure planning.

## 5. Cost Monitoring

The admin system should contain:

```text
ADMIN
│
└── PROJECT OPERATIONS
    ├── Services
    ├── API Usage
    ├── Monthly Costs
    ├── Cost Forecast
    ├── Service Status
    └── Billing Alerts
```

For each service, track where possible:

- Provider
- Service
- Purpose
- Billing model
- Current-month cost
- Previous-month cost
- Estimated next-month cost
- Usage
- Budget
- Status

Possible statuses:

```text
NORMAL
WARNING
CRITICAL
```

Example alert:

> AI API usage has reached 80% of the monthly budget.

The admin system should not unnecessarily store payment credentials. Actual payment credentials remain with the relevant provider.

## 6. AI Agent Architecture

RapidAid will use multiple specialized agents rather than one unrestricted AI agent.

```text
                    Lead / Project Agent
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
     Developer          QA / Bug           Research
       Agent              Agent              Agent
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                   ┌─────────┴─────────┐
                   ▼                   ▼
             Admin/Analytics     Medical Content
                  Agent              Assistant
```

### Lead / Project Agent
- Break large tasks into smaller tasks.
- Coordinate specialized agents.
- Track progress.
- Route work.
- Review outputs.
- Enforce workflow stages.

### Developer Agent
- Inspect code.
- Implement approved features.
- Fix technical bugs.
- Create components.
- Write/run tests.
- Prepare changes for review.

It should not independently modify medical protocols or critical emergency-routing logic.

### QA / Bug Agent
- Run tests.
- Inspect error reports.
- Reproduce bugs.
- Test edge cases.
- Create bug reports.
- Verify fixes.

### Research Agent
- Research technical documentation.
- Compare APIs/services.
- Investigate implementation options.
- Research technical requirements.
- Save useful findings to project documentation.

### Admin / Analytics Agent
- Analyze operational data.
- Summarize feedback.
- Identify recurring technical problems.
- Generate reports.
- Highlight unusual trends.

### Medical Content Assistant
- Organize authoritative first-aid sources.
- Convert approved material into structured protocol formats.
- Check required metadata.
- Identify missing information.
- Flag content for qualified medical review.

It must **not** independently invent, approve, or publish medical instructions.

## 7. Agent Permissions

Agents should have only the permissions required for their jobs.

```text
Developer Agent
├── Read code             ✓
├── Write code            ✓
├── Run tests             ✓
├── Modify production DB  ✗
└── Deploy production     Restricted

QA Agent
├── Read code             ✓
├── Run tests             ✓
├── Read test results     ✓
├── Create bug reports    ✓
└── Modify production DB  ✗

Medical Agent
├── Read approved sources ✓
├── Draft structured data  ✓
├── Flag problems          ✓
└── Publish medical data   ✗
```

Production permissions should be deliberately restricted.

## 8. Shared Project Knowledge

Agents need shared project documentation:

```text
/docs
    PROJECT.md
    ARCHITECTURE.md
    DATABASE.md
    API.md
    SECURITY.md
    MEDICAL_CONTENT.md
    ADMIN.md
    AGENTS.md
    DEVELOPMENT.md
```

The original RapidAid specification and this addendum should be stored alongside these documents.

## 9. Git/GitHub Workflow

Agents should work through version-controlled changes.

```text
Task
 ↓
Feature branch
 ↓
Implementation
 ↓
Tests
 ↓
QA
 ↓
Human review
 ↓
Merge
```

Example branches:

```text
main
develop
feature/emergency-mode
feature/admin-dashboard
feature/location
fix/location-error
```

The production/main branch should not be an unrestricted agent workspace.

## 10. Agent Communication

Agents may delegate work through controlled orchestration.

```text
Lead Agent
    │
    ├── Research Agent
    │       ↓
    │   research result
    │
    ├── Developer Agent
    │       ↓
    │   implementation
    │
    └── QA Agent
            ↓
        test result
```

Agents should not communicate indefinitely without defined tasks and stopping conditions.

Preferred workflow:

```text
TASK
 ↓
PLAN
 ↓
RESEARCH
 ↓
IMPLEMENT
 ↓
TEST
 ↓
REVIEW
 ↓
HUMAN APPROVAL
 ↓
MERGE / DEPLOY
```

## 11. Agent Runner

An **Agent Runner** is the software layer that executes the agent loop.

The model alone normally produces an answer. The runner lets it interact with tools.

Conceptually:

```text
User
 ↓
Agent Runner
 ↓
AI Model
 ↓
Tool request
 ↓
Agent Runner
 ↓
Tool
 ↓
Result
 ↓
AI Model
 ↓
Next action
 ↓
...
 ↓
Final result
```

The runner:

1. Receives a task.
2. Sends task/context to the model.
3. Executes requested tools.
4. Returns tool results to the model.
5. Continues until the model produces a final result or the workflow stops.

## 12. Selected Agent Framework

**Decision: Use the OpenAI Agents SDK with TypeScript/Node.js as the initial agent framework/runtime.**

Reasons:

- Code-first architecture.
- Tool calling.
- Multi-agent orchestration.
- Agent handoffs.
- Guardrails.
- State/session support.
- Tracing/observability.
- Good fit for a custom software-development environment.
- Keeps control of RapidAid's application infrastructure.

This decision can be revisited if project requirements change.

## 13. Agent Runtime Model

The basic agent consists of:

```text
AI Model
+
Instructions
+
Tools
+
Project Context
+
Agent Runner
```

Conceptual loop:

```text
while task is not complete:

    send task/context to model

    if model requests a tool:
        execute tool
        return result to model

    if model requests another action:
        continue

    if model produces final result:
        finish
```

The implementation should use the Agents SDK rather than unnecessarily reimplementing the complete framework.

## 14. Developer Agent Tools

Initial tools:

```text
read_file()
search_files()
search_code()
write_file()
edit_file()
run_tests()
git_status()
git_diff()
create_branch()
```

Potential later tools:

```text
GitHub issue creation
Pull-request creation
Documentation search
Database development queries
Web research
```

Production-impacting tools require stricter permissions.

## 15. QA Agent Tools

Initial tools:

```text
read_file()
search_code()
run_tests()
read_test_results()
read_error_logs()
create_bug_report()
```

The QA agent's purpose is verification and finding failures.

## 16. Admin Agent Data Flow

The Admin Agent should receive data through controlled interfaces.

```text
Database
   ↓
Analytics / Admin API
   ↓
Admin Agent
   ↓
Analysis
   ↓
Admin Dashboard
```

The agent should not automatically receive unrestricted database access.

## 17. Human Approval Gates

### Medical content

```text
Source
 ↓
Medical Content Assistant
 ↓
Draft
 ↓
Qualified medical reviewer
 ↓
Approval
 ↓
Production
```

### Production software

```text
Agent
 ↓
Code
 ↓
Tests
 ↓
QA
 ↓
Human approval
 ↓
Production
```

Additional review should be used for changes to:

- Emergency-service routing.
- Emergency-call behavior.
- Critical triage logic.
- Medical protocols.
- Location sharing.

## 18. Medical AI Boundary

The medical-content agent is an assistant for structured content management, not an autonomous medical authority.

It may:

- Organize sources.
- Transform approved material into structured data.
- Identify missing metadata.
- Flag content requiring review.

It may not:

- Invent first-aid protocols.
- Decide that an unreviewed protocol is medically safe.
- Publish medical instructions without approval.
- Override qualified medical reviewers.

## 19. Initial Agent Development Milestone

The first milestone is intentionally small.

```text
rapidaid-agents/
│
├── agents/
│   └── developer/
│       ├── instructions.md
│       └── tools/
│
├── tools/
│   ├── files.ts
│   ├── git.ts
│   ├── tests.ts
│   └── search.ts
│
├── knowledge/
│   ├── PROJECT.md
│   └── ARCHITECTURE.md
│
├── agent_runner.ts
├── package.json
└── README.md
```

First test task:

> Inspect the project and create a simple Hello World screen.

The agent should:

1. Inspect the project.
2. Determine where the screen belongs.
3. Create/edit the required code.
4. Run tests.
5. Report its changes.

Only after this works reliably should additional permissions and agents be added.

## 20. Development Sequence

```text
1. Finalize architecture
       ↓
2. Choose development tools/services
       ↓
3. Set up Git/GitHub
       ↓
4. Set up project repository
       ↓
5. Set up agent runtime
       ↓
6. Build Developer Agent
       ↓
7. Test Developer Agent
       ↓
8. Build QA Agent
       ↓
9. Build Research Agent
       ↓
10. Build Admin/Analytics Agent
       ↓
11. Build Medical Content Assistant
       ↓
12. Build Lead/Project orchestration
       ↓
13. Build RapidAid backend
       ↓
14. Build admin dashboard
       ↓
15. Build mobile app
       ↓
16. Connect systems
       ↓
17. Testing and security
       ↓
18. Medical validation
       ↓
19. Pilot
       ↓
20. Deployment
```

## 21. Current Decisions vs Future Considerations

### Decided

- RapidAid will have a dedicated admin dashboard.
- The dashboard will monitor users, emergencies, bugs, feedback, medical content, system health, and project operations.
- "Payments" means developer/project operating costs.
- Developer/service costs will be monitored.
- Customer emergency access is not being designed around a paywall.
- RapidAid will use multiple specialized agents.
- Agents will have restricted permissions.
- Git/version control will be part of the development workflow.
- Important production and medical changes require human review.
- The initial agent framework will be OpenAI Agents SDK.
- TypeScript/Node.js will be used for the initial agent runtime.
- The first agent to build is the Developer Agent.
- Agents will use shared project documentation.

### Future considerations

Not yet finalized:

- Exact cloud provider.
- Exact database hosting provider.
- Exact map provider.
- Exact SMS/phone provider.
- Exact error-monitoring provider.
- Exact analytics provider.
- Exact CI/CD provider.
- Final mobile framework.
- Final backend framework.
- Final AI model selection for every agent.
- Whether a different agent framework will eventually be preferable.
- Exact pricing/budget for each service.
- Official emergency-service integrations.
- Production deployment architecture.

## 22. Immediate Next Decision

Before building the first agent, finalize the development and service stack:

```text
Mobile framework?
Backend framework?
Database?
Hosting?
Git/GitHub setup?
AI model/API?
OpenAI Agents SDK setup?
Maps?
Authentication?
Error monitoring?
Analytics?
File storage?
Push notifications?
Development environment?
CI/CD?
```

Once these are selected:

**Create the RapidAid repository → configure TypeScript/Node.js → install the OpenAI Agents SDK → create the Developer Agent → give it its first safe tool → run its first task.**

## 23. Core Architecture Principle

RapidAid should treat AI agents as **controlled engineering tools**, not unrestricted autonomous operators.

```text
AI
 ↓
Reason
 ↓
Use permitted tools
 ↓
Check work
 ↓
Human review when necessary
 ↓
Safe change
```

For an emergency application, reliability, auditability, security, and medical safety take priority over maximum autonomy.
