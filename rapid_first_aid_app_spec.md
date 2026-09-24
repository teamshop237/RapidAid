# Rapid First Aid Emergency App --- Product & Technical Specification

## 1. Project Overview

**Working name:** RapidAid

**Core idea:**\
RapidAid is an emergency first-aid application that helps a person
respond during the critical period between an emergency occurring and
professional help arriving.

The app should:

1.  Identify the type of emergency through a fast, simple triage flow.
2.  Give clear, step-by-step, clinician-reviewed first-aid guidance
    appropriate to the situation.
3.  Automatically contact the appropriate emergency service when the
    user permits it and when the situation meets the app's emergency
    criteria.
4.  Share the user's location with emergency responders when supported
    and authorized.
5.  Continue guiding the user while help is on the way.
6.  Work with limited or no internet connectivity as much as possible.
7.  Avoid replacing professional medical care.

**Important safety principle:** The app must never invent medical
advice. All medical protocols must be sourced from recognized
medical/emergency organizations and reviewed by qualified clinicians
before publication.

------------------------------------------------------------------------

# 2. Problem Statement

During emergencies, people may:

-   Panic or freeze.
-   Not know which emergency service to contact.
-   Not know what first-aid action is appropriate.
-   Waste time searching the internet.
-   Have difficulty explaining their location.
-   Lose internet connectivity.
-   Be physically unable to type or navigate complicated menus.
-   Give incorrect information to responders.
-   Be caring for someone who is unconscious, injured, bleeding,
    choking, burned, or otherwise in immediate danger.

The application addresses the period before professional responders
arrive.

------------------------------------------------------------------------

# 3. Goals

## Primary goals

-   Reduce the time between an emergency being recognized and
    appropriate help being contacted.
-   Provide simple, actionable first-aid instructions.
-   Reduce cognitive load during stressful situations.
-   Improve location sharing and emergency-service routing.
-   Make emergency guidance available offline where possible.
-   Support multiple countries and emergency systems.
-   Make the app accessible to users with disabilities or limited
    literacy.

## Secondary goals

-   Help users learn basic first aid outside emergencies.
-   Provide emergency-preparedness information.
-   Allow users to save essential emergency contacts.
-   Provide localized emergency information.

## Non-goals

The app should not:

-   Diagnose diseases.
-   Replace doctors, nurses, paramedics, or emergency dispatchers.
-   Guarantee a medical outcome.
-   Prescribe medication.
-   Provide individualized treatment beyond approved first-aid
    protocols.
-   Tell users to perform procedures that require professional training
    unless the relevant authority-approved protocol explicitly supports
    it.
-   Automatically make medical decisions without transparent rules and
    appropriate safeguards.

------------------------------------------------------------------------

# 4. Target Users

## Primary users

-   General public.
-   Teenagers and adults.
-   Parents and caregivers.
-   Teachers and school staff.
-   Drivers.
-   Travelers.
-   Workplace employees.
-   People with basic or limited first-aid knowledge.

## Secondary users

-   Schools.
-   Businesses.
-   Hotels.
-   Sports organizations.
-   Community organizations.
-   Emergency-response organizations.

------------------------------------------------------------------------

# 5. Core User Experience

The emergency experience should prioritize **speed, clarity, and
safety**.

The ideal flow:

``` text
Emergency occurs
       |
       v
Open app / activate emergency mode
       |
       v
"What happened?"
       |
       v
Rapid triage
       |
       +------> Life-threatening emergency
       |                 |
       |                 v
       |        Contact emergency service
       |                 |
       |                 v
       |        Share location if authorized
       |                 |
       |                 v
       |        Give first-aid guidance
       |                 |
       |                 v
       |        Continue monitoring/guidance
       |
       +------> Non-life-threatening situation
                         |
                         v
                 First-aid guidance
                         |
                         v
                 Escalation warnings
```

The emergency interface should avoid long paragraphs.

Use:

-   Large buttons.
-   Large text.
-   High contrast.
-   One primary action per screen.
-   Short sentences.
-   Voice guidance where possible.
-   Visual illustrations where appropriate.
-   Clear countdowns/timers when medically appropriate.
-   Persistent emergency-call status.

------------------------------------------------------------------------

# 6. Emergency Categories

The initial release should support a carefully selected set of
high-priority scenarios.

Potential categories:

-   Severe bleeding.
-   Choking.
-   Unconsciousness/unresponsiveness.
-   Cardiac arrest.
-   Breathing difficulty.
-   Serious injury.
-   Burns.
-   Suspected poisoning.
-   Severe allergic reaction.
-   Seizure.
-   Electric shock.
-   Drowning.
-   Heat-related emergencies.
-   Cold-related emergencies.
-   Fractures/suspected serious musculoskeletal injuries.
-   Head/neck/spinal injuries.
-   Eye injuries.
-   Severe chest pain.
-   Severe abdominal pain.
-   Stroke warning signs.
-   Road traffic injuries.
-   Multiple casualties.
-   Other/unsure emergency.

Exact protocols must be supplied and reviewed by qualified medical
professionals and authoritative first-aid organizations.

------------------------------------------------------------------------

# 7. Emergency Triage

## 7.1 Design principles

Triage must be:

-   Extremely fast.
-   Conservative when serious danger is possible.
-   Easy to understand.
-   Designed for stressed users.
-   Based on explicit clinical rules.
-   Reviewed by medical professionals.

The app should use plain-language questions.

Example:

> "Is the person awake and responding normally?"

Possible answers:

-   Yes
-   No
-   Not sure

Another example:

> "Are they breathing normally?"

-   Yes
-   No
-   Not sure

The "Not sure" option is important because users may not know how to
assess a condition.

## 7.2 Triage states

Suggested internal states:

``` text
UNKNOWN
LOW_RISK
MODERATE_RISK
HIGH_RISK
LIFE_THREATENING
MULTIPLE_CASUALTIES
UNABLE_TO_ASSESS
```

The system should favor escalation when a dangerous condition cannot
safely be ruled out.

## 7.3 Human override

The user must always have a visible option such as:

**CALL EMERGENCY SERVICES NOW**

The app should never trap the user inside a questionnaire.

------------------------------------------------------------------------

# 8. Automatic Emergency-Service Contact

## 8.1 Principle

When the situation meets defined emergency criteria, the app should
prompt or initiate the appropriate emergency contact depending on
operating-system capabilities, local law, device capabilities, and user
permissions.

The app must clearly communicate:

> "This may contact emergency services."

Where automatic calling is legally/technically permitted and explicitly
enabled, the system may initiate the call.

Where automatic calling is not permitted, the app should immediately
present a large call button.

## 8.2 Emergency-service directory

Emergency services should be represented by country/region.

Example data:

``` json
{
  "country": "CM",
  "services": {
    "general_emergency": [],
    "ambulance": [],
    "police": [],
    "fire": [],
    "poison_control": []
  }
}
```

Do not hard-code emergency numbers globally.

The backend should maintain a verified emergency-number directory.

## 8.3 Service routing

The app should determine the appropriate service based on:

-   Emergency type.
-   User location.
-   Country.
-   Region.
-   Available services.
-   Verified emergency-number database.
-   Whether ambulance, fire, police, or another service is appropriate.

When uncertain, route to the general emergency service where one exists.

## 8.4 Calling states

``` text
NOT_STARTED
CALL_READY
CALLING
CONNECTED
CALL_FAILED
USER_CANCELLED
SERVICE_UNAVAILABLE
```

If a call fails:

1.  Show the number.
2.  Provide a one-tap retry.
3.  Provide alternative emergency contacts where verified.
4.  Continue first-aid guidance.
5.  Encourage the user to seek help from nearby people when appropriate.

------------------------------------------------------------------------

# 9. Location

Location can be crucial during emergencies.

## 9.1 Location features

The app should support:

-   GPS coordinates.
-   Approximate location.
-   Address/geocoding where available.
-   Manual location entry.
-   Landmark description.
-   Offline last-known location where appropriate.
-   Map display.
-   Location sharing.

## 9.2 Permission

Location permission should be requested clearly.

Example:

> "Your location can help emergency responders find you faster."

The user must understand why location is being requested.

## 9.3 Poor GPS conditions

If GPS fails:

-   Display the last known location if appropriate.
-   Ask the user to provide a landmark.
-   Allow manual location.
-   Allow emergency dispatchers to obtain location through normal
    emergency systems where supported.

------------------------------------------------------------------------

# 10. First-Aid Guidance Engine

## 10.1 Content structure

Each protocol should be stored as structured data rather than only as
free text.

Example:

``` json
{
  "protocol_id": "example_protocol",
  "title": "Example Emergency",
  "severity": "high",
  "version": "1.0",
  "medical_review": {
    "reviewed": true,
    "review_date": "YYYY-MM-DD",
    "reviewer": "Qualified reviewer"
  },
  "steps": [],
  "warnings": [],
  "escalation_rules": []
}
```

## 10.2 Step structure

Each step should contain:

-   Step number.
-   Short instruction.
-   Optional image/animation.
-   Optional audio.
-   Safety warning.
-   Completion button.
-   Next condition.
-   Escalation condition.

Example:

``` json
{
  "step": 1,
  "instruction": "Clinician-reviewed instruction goes here.",
  "completion_options": [
    "DONE",
    "CANNOT_DO",
    "UNSURE"
  ]
}
```

## 10.3 Content requirements

Every medical protocol should have:

-   Medical source.
-   Review date.
-   Reviewer credentials.
-   Version number.
-   Geographic applicability.
-   Age applicability.
-   Contraindications.
-   Escalation criteria.
-   Last update.
-   Emergency-call requirements.

------------------------------------------------------------------------

# 11. Medical Content Governance

This is one of the most important components of the project.

Medical content must not be generated and published automatically by an
AI model.

## Required process

``` text
Medical source
      |
      v
Medical content draft
      |
      v
Qualified clinical review
      |
      v
Safety review
      |
      v
Localization review
      |
      v
Versioned publication
      |
      v
Monitoring and periodic review
```

## Sources

Potential authoritative sources include organizations such as:

-   International Red Cross/Red Crescent organizations.
-   World Health Organization.
-   National health ministries.
-   Recognized ambulance/emergency organizations.
-   Recognized resuscitation councils.
-   National poison-control organizations.
-   Other established medical authorities.

Exact protocol wording should be obtained from the relevant current
authoritative sources and licensed appropriately.

------------------------------------------------------------------------

# 12. Offline Mode

Emergency situations may occur without internet access.

The application should therefore store essential content locally.

## Offline data

At minimum:

-   First-aid protocols.
-   Emergency-number directory for the selected country.
-   Emergency UI.
-   Basic location functionality.
-   Saved emergency contacts.
-   Safety warnings.

## Offline limitations

The app should clearly distinguish:

-   Available offline.
-   Requires internet.
-   Requires cellular service.
-   Requires GPS.
-   Requires operating-system permission.

The app must never pretend that an emergency call was completed if it
was not.

------------------------------------------------------------------------

# 13. Voice Mode

Voice can reduce the need to interact with the screen.

Potential features:

-   Read instructions aloud.
-   Listen for voice commands.
-   Repeat current step.
-   Say "next".
-   Say "repeat".
-   Say "call emergency services".
-   Confirm important actions verbally.

Voice commands should never silently trigger dangerous or irreversible
actions.

For emergency calling, explicit confirmation may be required depending
on platform and jurisdiction.

------------------------------------------------------------------------

# 14. Accessibility

The application should support:

-   Screen readers.
-   Large text.
-   High contrast.
-   Color-independent warnings.
-   Haptic feedback.
-   Voice instructions.
-   Simple language.
-   Multiple languages.
-   Dyslexia-friendly presentation where practical.
-   Large touch targets.
-   Reduced-motion mode.

Do not rely solely on red/green colors.

------------------------------------------------------------------------

# 15. Languages

Initial architecture should support localization from the beginning.

Suggested initial languages:

-   English.
-   French.

Future languages can include:

-   Pidgin English.
-   Major regional languages where appropriate.
-   Spanish.
-   Portuguese.
-   Arabic.
-   Other languages based on deployment regions.

All medical translations should be reviewed by qualified
bilingual/medical reviewers.

------------------------------------------------------------------------

# 16. Cameroon-First Deployment

Because the project is intended to be usable in Cameroon, the initial
architecture should support Cameroon-specific emergency information.

The system should maintain a verified Cameroon emergency directory
rather than relying on assumptions.

Cameroon-specific data should include, where officially verified:

-   Emergency services.
-   Ambulance availability.
-   Police.
-   Fire services.
-   Poison-control resources.
-   Major hospitals.
-   Regional emergency resources.
-   Emergency-service coverage limitations.

The app should not claim that a service is available in a particular
location unless the information has been verified.

------------------------------------------------------------------------

# 17. Hospital Directory

A separate directory can help users locate medical facilities.

Each facility record may include:

``` json
{
  "hospital_id": "hospital_001",
  "name": "Hospital Name",
  "country": "CM",
  "region": "Region",
  "city": "City",
  "latitude": 0,
  "longitude": 0,
  "phone": "",
  "emergency_department": true,
  "verified": true,
  "last_verified": "YYYY-MM-DD"
}
```

Potential filters:

-   Emergency department.
-   Open now.
-   Distance.
-   Pediatric care.
-   Trauma capability.
-   Maternity care.
-   Poison treatment.
-   Other verified capabilities.

------------------------------------------------------------------------

# 18. Emergency Contacts

Users may optionally save:

-   Parent/guardian.
-   Family member.
-   Doctor.
-   School.
-   Workplace emergency contact.

Example:

``` json
{
  "name": "Emergency Contact",
  "relationship": "Parent",
  "phone": "+000000000"
}
```

The app should clearly distinguish personal emergency contacts from
official emergency services.

------------------------------------------------------------------------

# 19. Main Screens

## Screen 1 --- Home

Primary actions:

-   **EMERGENCY**
-   First Aid Guide
-   Emergency Contacts
-   Hospitals
-   Settings

The emergency button should be prominent.

## Screen 2 --- Emergency Type

Large categories:

-   Bleeding
-   Breathing
-   Choking
-   Unconscious
-   Chest pain
-   Burn
-   Injury
-   Poisoning
-   Allergy
-   Seizure
-   Drowning
-   Other

Also:

**I'm not sure**

## Screen 3 --- Rapid Triage

Short questions.

## Screen 4 --- Emergency Call

Display:

-   Emergency type.
-   Emergency service.
-   Location status.
-   Call button.
-   Alternative options.

## Screen 5 --- First Aid

Display:

-   Current action.
-   Simple visual.
-   Short explanation.
-   Next button.
-   Repeat button.
-   Call status.

## Screen 6 --- Help Is Coming

Display:

-   Emergency service contacted.
-   Location status.
-   First-aid instructions.
-   Important warnings.
-   Re-contact emergency service option.

## Screen 7 --- Completion

After the emergency:

-   Remind user to follow professional instructions.
-   Encourage medical assessment where required by the protocol.
-   Avoid declaring the person "safe" unless a qualified authority has
    provided that conclusion.

------------------------------------------------------------------------

# 20. User Interface Principles

The emergency UI should use:

-   Minimal navigation.
-   Large controls.
-   One instruction at a time.
-   Persistent emergency status.
-   No advertisements during emergencies.
-   No distracting content.
-   No unnecessary account creation.
-   No requirement to read long text.

During emergency mode, nonessential features should be hidden.

------------------------------------------------------------------------

# 21. Emergency Mode

Emergency mode should be a distinct application state.

``` text
NORMAL MODE
     |
     v
EMERGENCY MODE
     |
     +--> Triage
     |
     +--> Emergency contact
     |
     +--> Location
     |
     +--> First aid
     |
     +--> Responder status
     |
     v
EMERGENCY ENDED
```

Emergency mode should remain available even if the user has not logged
in.

------------------------------------------------------------------------

# 22. Data Model

Core entities:

``` text
User
EmergencySession
TriageResponse
Protocol
ProtocolStep
EmergencyService
EmergencyNumber
Location
Hospital
EmergencyContact
MedicalSource
MedicalReview
Country
Region
Language
AuditLog
```

## EmergencySession

Example:

``` json
{
  "session_id": "uuid",
  "created_at": "timestamp",
  "emergency_type": "string",
  "severity": "string",
  "location": {},
  "service_contacted": {},
  "protocol_id": "string",
  "status": "ACTIVE"
}
```

------------------------------------------------------------------------

# 23. Backend Architecture

Possible architecture:

``` text
Mobile App
   |
   v
API Gateway
   |
   +------------------+
   |                  |
   v                  v
Emergency Service   Content Service
Directory           First-Aid Protocols
   |                  |
   v                  v
Location Service    Medical Content DB
   |
   v
Hospital Directory
```

Optional components:

-   Authentication service.
-   Analytics service.
-   Notification service.
-   Content-management system.
-   Audit system.
-   Monitoring system.

------------------------------------------------------------------------

# 24. Suggested Technology Stack

The exact stack can be selected later.

## Mobile

Possible options:

-   Flutter.
-   React Native.
-   Native Android/iOS.

For an early cross-platform MVP, Flutter or React Native could reduce
duplicated development.

## Backend

Possible options:

-   Node.js/TypeScript.
-   Python/FastAPI.
-   Java/Kotlin.
-   Go.

## Database

Potential choices:

-   PostgreSQL.
-   SQLite for local offline storage.
-   Redis for short-lived state if required.

## Maps/location

Potential providers:

-   OpenStreetMap-based services.
-   Google Maps Platform.
-   Apple Maps services.
-   Other regional providers.

Provider choice should consider cost, offline capability, licensing, and
coverage.

------------------------------------------------------------------------

# 25. API Requirements

Potential endpoints:

``` text
GET /countries
GET /countries/{country}/emergency-services
GET /countries/{country}/emergency-numbers
GET /protocols
GET /protocols/{protocolId}
GET /hospitals/nearby
POST /emergency-sessions
POST /emergency-sessions/{id}/triage
POST /emergency-sessions/{id}/location
POST /emergency-sessions/{id}/status
```

The API must authenticate administrative operations and protect
sensitive information.

------------------------------------------------------------------------

# 26. Emergency-Service Integration

The application should distinguish between:

1.  **Opening the phone's emergency-call interface**
2.  **Initiating a phone call**
3.  **Sending structured data to an emergency-dispatch system**
4.  **Calling an integrated emergency-response API**

These are not equivalent.

Direct integration with emergency dispatch systems may require:

-   Government approval.
-   Emergency-service agreements.
-   Legal compliance.
-   Security certification.
-   Technical integration.
-   Liability agreements.

The MVP should not assume that emergency dispatch APIs are publicly
available.

------------------------------------------------------------------------

# 27. Privacy

Emergency data may be highly sensitive.

The app should follow data-minimization principles.

Collect only what is necessary.

Potential sensitive data:

-   Location.
-   Emergency type.
-   Emergency session.
-   Contact information.
-   Health-related information entered by the user.

## Principles

-   Encrypt data in transit.
-   Encrypt sensitive data at rest.
-   Use strict access controls.
-   Minimize retention.
-   Provide deletion controls where legally required.
-   Keep detailed audit logs for administrative access.
-   Do not sell emergency or health-related data.
-   Do not use emergency data for advertising.

------------------------------------------------------------------------

# 28. Security

Security requirements include:

-   HTTPS/TLS.
-   Secure authentication.
-   Strong administrative authentication.
-   Role-based access control.
-   API rate limiting.
-   Input validation.
-   Secure local storage.
-   Device-level protection where available.
-   Logging and monitoring.
-   Dependency vulnerability scanning.
-   Regular security testing.

Administrative medical-content changes should be auditable.

------------------------------------------------------------------------

# 29. AI Use

AI can be useful for:

-   Natural-language navigation.
-   Translation assistance.
-   Voice interaction.
-   Helping users describe an emergency.
-   Finding the correct pre-approved protocol.

AI should **not** independently generate emergency medical instructions
in real time.

Recommended architecture:

``` text
User
 |
 v
AI interpretation
 |
 v
Approved protocol selection
 |
 v
Clinician-reviewed instructions
```

Not:

``` text
User
 |
 v
AI invents medical treatment
 |
 v
User
```

If AI confidence is low, the system should escalate to emergency
services or present the safest available approved pathway.

------------------------------------------------------------------------

# 30. Medical Safety Guardrails

The application should:

-   Encourage professional emergency help for life-threatening
    situations.
-   Never discourage contacting emergency services.
-   Never claim to diagnose.
-   Never guarantee outcomes.
-   Clearly identify uncertainty.
-   Escalate when information is insufficient.
-   Avoid unnecessary medical jargon.
-   Use clinician-reviewed content.
-   Display protocol version and review metadata internally.
-   Maintain a medical-content audit trail.

------------------------------------------------------------------------

# 31. False Alarm Handling

False alarms are expected.

The app should avoid punishing users for seeking emergency assistance.

If the user accidentally activates emergency mode:

-   Provide a clear cancellation mechanism.
-   Make cancellation understandable.
-   If a call has already connected, tell the user to communicate with
    the dispatcher rather than silently disconnecting.

The exact behavior must follow local emergency-service requirements.

------------------------------------------------------------------------

# 32. Multiple Casualties

The app should have a dedicated mode:

**"More than one person is injured."**

The system should prioritize:

1.  Calling appropriate emergency services.
2.  Location.
3.  Immediate life-threatening conditions.
4.  Simple instructions that one bystander can perform.
5.  Avoiding instructions that unnecessarily endanger the helper.

The app should not attempt to replace professional mass-casualty triage
systems.

------------------------------------------------------------------------

# 33. Child Safety

If the patient is a child, the app should select the appropriate
age-specific protocol where available.

Possible age groups:

``` text
INFANT
CHILD
ADOLESCENT
ADULT
OLDER_ADULT
UNKNOWN
```

Age-specific medical instructions must be separately reviewed.

------------------------------------------------------------------------

# 34. Network Failure

The application should degrade gracefully.

Possible states:

``` text
ONLINE
LIMITED_CONNECTION
OFFLINE
CALL_ONLY
GPS_UNAVAILABLE
```

If the internet is unavailable:

-   Local first-aid content should continue working.
-   Phone calling should be attempted through normal cellular
    functionality.
-   The app should not claim that online location sharing occurred.
-   The user should be told what failed.

------------------------------------------------------------------------

# 35. Battery Conservation

Emergency mode should avoid unnecessarily draining the phone.

Requirements:

-   Efficient GPS polling.
-   Avoid continuous high-power background processes.
-   Dim unnecessary animations.
-   Cache content.
-   Continue essential functions on low battery.

------------------------------------------------------------------------

# 36. Analytics

Analytics should be privacy-preserving.

Useful aggregate metrics:

-   Emergency-mode activations.
-   Protocol usage.
-   Call-button activation.
-   Call failure rate.
-   Location availability.
-   Offline usage.
-   Protocol completion.
-   User-reported difficulty.

Avoid collecting unnecessary personal information.

------------------------------------------------------------------------

# 37. Content Management System

Administrators need to manage:

-   Protocols.
-   Translations.
-   Emergency numbers.
-   Emergency services.
-   Hospitals.
-   Medical sources.
-   Review status.
-   Version history.

Every medical protocol should require an approval workflow.

Suggested states:

``` text
DRAFT
MEDICAL_REVIEW
SAFETY_REVIEW
APPROVED
PUBLISHED
DEPRECATED
ARCHIVED
```

Only approved content may appear in emergency mode.

------------------------------------------------------------------------

# 38. Testing

Testing must include normal and emergency-specific scenarios.

## Functional testing

-   Emergency activation.
-   Triage.
-   Protocol navigation.
-   Calling.
-   Location.
-   Offline mode.
-   Language selection.
-   Voice.
-   Accessibility.

## Medical-content testing

-   Correct protocol selection.
-   Correct branching.
-   Correct escalation.
-   No contradictory instructions.
-   Correct age-specific behavior.
-   Correct contraindications.

## Failure testing

-   No internet.
-   No GPS.
-   No cellular network.
-   Low battery.
-   Denied permissions.
-   Failed API.
-   Failed call.
-   Incorrect location.
-   User enters "not sure."
-   Multiple casualties.

## Usability testing

Test with users under simulated stress, without creating real
emergencies.

Measure:

-   Time to identify emergency.
-   Time to initiate emergency contact.
-   Error rate.
-   Time to first appropriate action.
-   Comprehension.
-   Accessibility.

------------------------------------------------------------------------

# 39. Legal and Regulatory Work

Before public deployment, obtain appropriate legal and medical advice.

Areas to investigate:

-   Medical-device/software regulation.
-   Emergency-service regulations.
-   Privacy laws.
-   Data protection.
-   Telecommunications rules.
-   Emergency-call requirements.
-   Liability.
-   Terms of service.
-   Medical-content licensing.
-   Accessibility obligations.
-   Child-data regulations.

Requirements differ by country.

The project should have country-specific compliance review before launch
in each jurisdiction.

------------------------------------------------------------------------

# 40. Liability and Disclaimers

A disclaimer is not a substitute for safe product design.

The app should clearly state that:

-   It does not replace emergency professionals.
-   Users should contact emergency services for serious emergencies.
-   Information is first-aid guidance from reviewed sources.
-   Emergency services should be followed when they provide
    instructions.

The exact legal wording should be reviewed by qualified counsel.

------------------------------------------------------------------------

# 41. MVP

The first version should stay focused.

## MVP features

### Emergency

-   Emergency button.
-   Rapid emergency-category selection.
-   Basic triage.
-   Approved first-aid protocols.
-   Emergency-service call button.
-   Location retrieval.
-   Offline first-aid content.
-   Emergency contacts.
-   English/French support.

### Technical

-   Mobile application.
-   Local database.
-   Basic backend.
-   Emergency-number database.
-   Content-management workflow.
-   Secure update system.

### Safety

-   Clinician-reviewed protocols.
-   Medical source tracking.
-   Protocol versioning.
-   Escalation rules.
-   Clear emergency-service messaging.

------------------------------------------------------------------------

# 42. Phase 2

Potential additions:

-   Voice guidance.
-   More languages.
-   Hospital directory.
-   Improved offline maps.
-   Wearable support.
-   Smartwatch emergency activation.
-   Better accessibility.
-   Emergency-preparedness education.
-   School/business accounts.

------------------------------------------------------------------------

# 43. Phase 3

Potential additions:

-   Official emergency-service integrations.
-   Dispatcher data sharing.
-   Connected medical devices.
-   Advanced location sharing.
-   Institutional dashboards.
-   Emergency-response analytics.
-   Regional partnerships.

These features require significantly greater regulatory, legal,
security, and technical work.

------------------------------------------------------------------------

# 44. Suggested User Journey

### Example scenario

A person sees someone suddenly become unresponsive.

The user:

1.  Opens RapidAid.
2.  Selects **Emergency**.
3.  Selects **Unconscious / Not responding**.
4.  Answers rapid triage questions.
5.  The app determines that the situation meets its emergency criteria.
6.  The app presents/carries out the authorized emergency call flow.
7.  Location is obtained.
8.  The app provides the appropriate approved first-aid protocol.
9.  The user follows one instruction at a time.
10. The app maintains the emergency status.
11. The user follows instructions from the professional dispatcher if
    connected.
12. The session ends when the user indicates that professional help has
    taken over.

The exact first-aid actions in this flow must come from current,
clinician-reviewed protocols.

------------------------------------------------------------------------

# 45. Project Folder Structure

Suggested repository:

``` text
rapidaid/
│
├── mobile/
│   ├── android/
│   ├── ios/
│   ├── lib/
│   │   ├── emergency/
│   │   ├── first_aid/
│   │   ├── location/
│   │   ├── contacts/
│   │   ├── hospitals/
│   │   └── settings/
│
├── backend/
│   ├── api/
│   ├── services/
│   ├── database/
│   ├── auth/
│   └── emergency_directory/
│
├── content/
│   ├── protocols/
│   ├── translations/
│   ├── emergency_numbers/
│   └── medical_sources/
│
├── admin/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── accessibility/
│   └── safety/
│
├── docs/
│
└── README.md
```

------------------------------------------------------------------------

# 46. Example Protocol Metadata

``` yaml
protocol_id: example
title:
severity:
age_group:
country_scope:
version:
status: DRAFT

medical_sources:
  - organization:
    document:
    publication_date:
    url:

medical_review:
  required: true
  status: PENDING
  reviewer:
  review_date:

steps:
  - id:
    instruction:
    visual:
    audio:
    warning:
    next:

escalation:
  emergency_service_required:
  conditions:

last_updated:
```

------------------------------------------------------------------------

# 47. Emergency Session State Machine

``` text
CREATED
   |
   v
TRIAGE
   |
   +----> LOW_RISK ----> FIRST_AID ----> COMPLETED
   |
   +----> HIGH_RISK ----> EMERGENCY_CONTACT
                              |
                              v
                         FIRST_AID
                              |
                              v
                       PROFESSIONAL_HELP
                              |
                              v
                           CLOSED
```

Possible exceptional states:

``` text
CALL_FAILED
LOCATION_FAILED
OFFLINE
USER_CANCELLED
UNKNOWN
```

------------------------------------------------------------------------

# 48. Success Metrics

The project should measure safety and usefulness rather than simply
downloads.

Important metrics:

-   Time from emergency activation to emergency-contact action.
-   Time to first appropriate first-aid instruction.
-   Percentage of sessions where users successfully reach emergency
    services.
-   Call failure rate.
-   Location availability.
-   Protocol comprehension.
-   User error rate.
-   Offline reliability.
-   Accessibility success rate.
-   Medical-content incident rate.
-   Number of outdated protocols detected.

No metric should encourage users to avoid calling emergency services.

------------------------------------------------------------------------

# 49. Key Risks

  Risk                         Mitigation
  ---------------------------- -------------------------------------------
  Incorrect medical guidance   Mandatory clinician review
  Outdated protocols           Versioning and scheduled review
  Wrong emergency number       Verified country-specific database
  Failed emergency call        Clear retry/alternative flow
  Wrong location               Display and confirm location
  Internet outage              Offline content
  AI hallucination             AI cannot generate emergency protocols
  User panic                   Simple UI and voice guidance
  Liability                    Legal review and safety governance
  Data breach                  Encryption and minimization
  Poor translation             Professional/medical review
  False confidence             Clear escalation and uncertainty handling
  Platform restrictions        Native emergency-call integration review

------------------------------------------------------------------------

# 50. Product Principle

The most important design principle is:

> **The app should help a person do the right safe thing quickly while
> professional help is being contacted or is on the way.**

The application should optimize for:

``` text
FAST
CLEAR
SAFE
LOCALIZED
OFFLINE-CAPABLE
MEDICALLY REVIEWED
```

not for:

``` text
COMPLEX
AI-GENERATED
OVERLOADED
DEPENDENT ON INTERNET
```

------------------------------------------------------------------------

# 51. Immediate Development Roadmap

## Step 1 --- Research

-   Identify authoritative first-aid sources.
-   Identify Cameroon emergency services and verified numbers.
-   Investigate legal requirements.
-   Define initial emergency categories.
-   Find qualified medical reviewers.

## Step 2 --- UX

Design:

-   Home.
-   Emergency mode.
-   Triage.
-   Emergency call.
-   First-aid protocol.
-   Help-is-coming screen.
-   Contacts.
-   Hospital directory.

## Step 3 --- Content

Create a protocol template.

Then build the first small set of clinician-reviewed protocols.

## Step 4 --- Prototype

Build a clickable prototype without real emergency calling.

## Step 5 --- Technical MVP

Implement:

-   Mobile UI.
-   Offline database.
-   Protocol engine.
-   Location.
-   Emergency-number directory.
-   Calling interface.

## Step 6 --- Safety Validation

Perform:

-   Medical review.
-   Usability testing.
-   Accessibility testing.
-   Failure testing.
-   Security testing.

## Step 7 --- Pilot

Test with:

-   First-aid professionals.
-   Students.
-   Teachers.
-   Parents.
-   Emergency-response professionals.

Use simulated scenarios only.

## Step 8 --- Deployment

Only deploy public emergency functionality after medical, legal,
security, and emergency-service requirements have been reviewed.

------------------------------------------------------------------------

# 52. Final MVP Definition

The MVP is complete when a user can:

1.  Open the app.
2.  Start an emergency.
3.  Quickly describe what is happening.
4.  Receive the correct pre-approved first-aid pathway.
5.  Contact the appropriate verified emergency service.
6.  Share or communicate their location.
7.  Continue receiving simple guidance while waiting.
8.  Use the essential system even with limited internet connectivity.
9.  Access the service without creating an account.
10. Understand clearly when professional emergency help is required.

The system must prioritize safety and reliability over feature count.
