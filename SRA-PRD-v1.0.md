# Smart Resource Allocation
## Data-Driven Volunteer Coordination for Social Impact
### Product Requirements Document — v1.0 | April 2026 | Confidential

---

| | |
|---|---|
| **Version** | 1.0 — MVP Edition |
| **Date** | April 2026 |
| **Status** | Draft — Under Review |
| **Classification** | Confidential — Internal Use Only |
| **Platform** | Android & iOS (Flutter) + Web Application |
| **Cloud Provider** | Google Cloud Platform (GCP) + Firebase |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Strategic Goals](#2-product-vision--strategic-goals)
3. [Stakeholders & User Personas](#3-stakeholders--user-personas)
4. [System Architecture Overview](#4-system-architecture-overview)
5. [Feature Specifications](#5-feature-specifications)
   - 5.1 [NGO Field Employee — Reporting Module](#51-ngo-field-employee--reporting-module)
   - 5.2 [NGO Management — Review & Governance Module](#52-ngo-management--review--governance-module)
   - 5.3 [Volunteer Module](#53-volunteer-module)
6. [AI & ML Processing Layer](#6-ai--ml-processing-layer)
7. [Volunteer Matching Engine](#7-volunteer-matching-engine)
8. [Task Lifecycle & State Machine](#8-task-lifecycle--state-machine)
9. [Core Data Models](#9-core-data-models)
10. [Offline Sync Strategy](#10-offline-sync-strategy)
11. [Privacy, Security & Compliance](#11-privacy-security--compliance)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [KPIs & Success Metrics](#13-kpis--success-metrics)
14. [MVP Scope & Phased Roadmap](#14-mvp-scope--phased-roadmap)
15. [Out of Scope for MVP](#15-out-of-scope-for-mvp)

---

## 1. Executive Summary

Local NGOs and social groups operate in data-rich but insight-poor environments. Field employees generate volumes of audio interviews, photographs, videos, and written field reports — yet this information remains fragmented across drives, notebooks, and email threads, preventing management from seeing the full picture of community need. Meanwhile, the volunteer matching process is largely manual, slow, and inequitable.

**Smart Resource Allocation (SRA)** is a mobile-first (Android & iOS) + web platform that solves both problems. It gives NGO field employees a structured, AI-augmented reporting tool; gives management a powerful review and governance interface; and surfaces the right tasks to the right volunteers through a personalised, location-weighted matching algorithm. The entire stack is built on **Google Cloud Platform**, prioritising offline resilience, data privacy, and scalability.

| | |
|---|---|
| **Product Name** | Smart Resource Allocation (SRA) |
| **Core Problem** | Fragmented community data → poor visibility of need + inefficient volunteer coordination |
| **Primary Users** | NGO Field Employees, NGO Management, Volunteers |
| **Platform** | Flutter mobile (Android + iOS) + React web dashboard |
| **MVP Timeline** | 6–8 months from kickoff |
| **Tech Foundation** | Firebase, Vertex AI (Gemini), Google Cloud Storage, Google Maps Platform, Cloud Run |

---

## 2. Product Vision & Strategic Goals

### 2.1 Vision Statement

> Empower NGOs to turn fragmented field observations into clear, actionable priorities — and instantly connect those priorities with the people best positioned to help.

### 2.2 Strategic Goals

| # | Goal | Outcome |
|---|---|---|
| G1 | Data Consolidation | All field reports — audio, video, image, text — captured in one system with AI-generated summaries. |
| G2 | Speed to Action | Reduce time from field observation to approved task from days to hours. |
| G3 | Smart Matching | Volunteers see tasks most relevant to their location, skills, and interests first. |
| G4 | Management Oversight | NGO management retains full authority over task approval, AI overrides, and task closure. |
| G5 | Offline Resilience | Field employees can record, attach media, and draft reports with zero connectivity. |
| G6 | Privacy & Compliance | Adheres to GDPR and India's DPDPA 2023. All data is role-gated; internal data never leaks. |

---

## 3. Stakeholders & User Personas

### Persona 1 — NGO Field Employee (Reporter)

> **Role:** Records field observations, interviews, and incidents and creates structured reports for management review.
>
> **Context:** Works in low-connectivity rural or semi-urban environments. May conduct 5–15 interviews per day. Uses a mobile device (Android or iOS).
>
> **Technical comfort:** Moderate. Familiar with WhatsApp, camera apps, and basic forms.
>
> **Pain points:** Handwritten notes get lost or misinterpreted. No feedback loop on what happens after a report is filed.
>
> **Goals:** Quickly capture a situation accurately, attach supporting media, and know that management received and understood the full picture.

---

### Persona 2 — NGO Management

> **Role:** Reviews submitted field reports, governs task approval, manages volunteer assignments, and monitors overall programme health.
>
> **Context:** Based at an NGO office or working remotely. Manages 10–50 active tasks and 50–500 volunteers. Uses the web dashboard primarily.
>
> **Technical comfort:** High. Comfortable with dashboards, reports, and data tools.
>
> **Pain points:** Overwhelmed by unstructured reports. No unified view of urgent vs. routine needs. Volunteer coordination done via phone/WhatsApp.
>
> **Goals:** Approve tasks quickly with full context. Override AI predictions when ground reality differs. Know that the right volunteers are on each task.

---

### Persona 3 — Volunteer

> **Role:** Community member who wants to contribute skills and time to meaningful local tasks.
>
> **Context:** Age 18–45. Lives near an area of active NGO operations. Uses the mobile app. May have specialist skills (medical, legal, construction) or general capacity.
>
> **Technical comfort:** Basic to moderate. Comfortable with social media, maps, and camera.
>
> **Pain points:** No easy way to find relevant opportunities. Current volunteer systems are email-based and slow. Uncertain if contribution actually mattered.
>
> **Goals:** Find meaningful tasks near them that match their interests. Apply simply. Know when participation is confirmed and the task is done.

---

## 4. System Architecture Overview

### 4.1 Google Cloud Technology Stack

| Layer | Google Product / Service | Purpose |
|---|---|---|
| Mobile App | Flutter (Dart) | Single codebase → Android + iOS native apps |
| Web Dashboard | React + Firebase Hosting | NGO Management web interface, analytics, reporting |
| Offline Sync | Firebase Firestore (offline mode) | Local-first storage with automatic background sync and conflict resolution |
| Authentication | Firebase Authentication | Simple Role-based auth: **Unique Username + Password**. Roles: Volunteer / NGO Employee / NGO Management / Admin. |
| Media Storage | Google Cloud Storage (GCS) | Audio, image, short/long video — tiered storage with lifecycle policies |
| Audio → Text | Cloud Speech-to-Text v2 | Multi-language: Hindi, English, Tamil, Bengali + 10 more. Long-audio async. |
| Image Analysis | Cloud Vision API | Label detection, object recognition, quality scoring, safe-search |
| Video Analysis | Cloud Video Intelligence API | Scene detection, label detection for short videos (≤45 sec) |
| LLM Summarisation | Vertex AI — Gemini 1.5 Pro | Low-temperature structured summaries, AI predictions, report improvement |
| Maps & Location | Google Maps Platform | Geocoding, Places API, proximity calculation, interactive map views |
| Backend API | Google Cloud Run | Containerised REST API; auto-scales to zero between requests |
| Task Queue | Google Cloud Tasks | Async media processing pipeline, background AI jobs |
| Notifications | Firebase Cloud Messaging (FCM) | Task status updates, new task alerts, proof review notifications |
| Analytics | BigQuery + Looker Studio | KPI dashboards, operational metrics, equity reports |
| Database | Firestore + Cloud SQL (PostGIS) | Firestore for app data; PostGIS for spatial matching queries |

### 4.2 Architecture Overview

The system follows an **offline-first, event-driven architecture**. Client apps write to Firestore, which syncs to Cloud Run backend services when connectivity is available. Media assets upload directly to GCS with signed URLs. A Cloud Tasks queue triggers async AI processing for each media type. The matching engine runs as a scheduled Cloud Run job recomputing volunteer scores whenever tasks go ACTIVE.

```
┌───────────────────────────────────────────────────────────────────┐
│  CLIENT LAYER                                                     │
│  Flutter Mobile App (Android/iOS)    React Web Dashboard (Mgmt)  │
└─────────────────┬───────────────────────────┬─────────────────────┘
                  │ Firebase Auth              │ Firebase Auth + 2FA
       ┌──────────▼────────────────────────────▼──────────┐
       │     Firebase Firestore (Offline-First Sync)        │
       │     Google Cloud Storage (Media — GCS)             │
       └──────────────────────┬───────────────────────────-┘
                              │  Sync / Events
       ┌──────────────────────▼──────────────────────────--┐
       │         Google Cloud Run (REST API Services)        │
       │   Task Service | User Service | Match Service       │
       └────┬────────────────────────┬───────────────────---┘
            │ Cloud Tasks Queue      │ PostGIS Spatial DB
       ┌────▼──────────────────┐     │
       │  AI Processing Layer   │    │
       │  Speech-to-Text v2     │    │
       │  Cloud Vision API      │    │
       │  Video Intelligence    ├────┘
       │  Vertex AI Gemini 1.5  │
       └───────────────────────┘
```

---

## 5. Feature Specifications

### 5.1 NGO Field Employee — Reporting Module

The reporting module is the **primary data entry interface** of the system. It runs on the Flutter mobile app and is fully functional offline. All data is saved locally (Firestore offline cache) and queued for sync when connectivity returns.

---

#### 5.1.1 Audio Interview Recording

| Attribute | Detail |
|---|---|
| Description | Employee taps Record to capture an audio interview or field observation within the report creation flow. |
| Local Storage | Audio saved immediately to device storage (compressed AAC/M4A). Persisted even if the app is force-closed. |
| Cloud Upload | On sync: resumable upload to GCS via signed URL. Handles poor connectivity — upload resumes from where it left off. |
| Transcription | Cloud Speech-to-Text v2 triggered asynchronously. Supports Hindi, English, Tamil, Bengali, and 10+ regional languages via auto-detection. |
| LLM Cleanup | Raw transcript sent to Gemini 1.5 Pro: fix filler words, correct transcription errors, output clean readable text. Original transcript also preserved. |
| Output | Cleaned transcript displayed inline. Employee may edit minor errors. AI-generated summary paragraph also appended. |
| Offline Behaviour | Recording and local save work fully offline. Transcription and LLM processing are queued and run when device reconnects. |

---

#### 5.1.2 Document Tagging

- Employee can tag any document in the report with one or more type labels.
- Available tags: **Survey, Field Report, Distress Report, Information Gathering, Incident Record, Historical Data, Photographic Evidence, Medical Report.**
- Tags feed into the management filter system and the AI categorisation pipeline.
- Multiple tags may be applied to a single document; tags are not mutually exclusive.

---

#### 5.1.3 Report Types

| Report Type | Description & Use Case |
|---|---|
| Distress Report | For urgent, time-sensitive situations requiring immediate attention. E.g. flood, medical emergency, displacement. |
| Information Gathering | For surveying community needs, collecting background data, and baseline assessments. |
| Incident Record | Documenting an event that has already occurred for institutional memory. |
| Resource Request | Specific ask for supplies, personnel, or equipment at a given location. |
| Routine Field Report | Regular progress or status update from an active field area. |

---

#### 5.1.4 Media Attachments

Employee can attach the following media types to any report:

- **Images** — JPG/PNG/HEIC, up to 20 MB each, max 10 per report. High-resolution images prioritised by the AI pipeline.
- **Short Videos** — MP4/MOV, maximum **45 seconds**, max 3 per report. Fully processed by Video Intelligence API.
- **Long Videos** — MP4/MOV, any duration, max 2 per report. First 45 seconds sampled for AI; full video stored for management human review. Thumbnail extracted at frame 5.

All media is saved locally first and uploaded in the background on reconnect. Per-file upload progress indicators are shown. Employee can continue editing while uploads run.

---

#### 5.1.5 Report Fields & Submission

| Field | Required? | Notes |
|---|---|---|
| Title | Yes | Short descriptive title, max 120 chars. Editable by management post-submission. |
| Description | Yes | Free-text. Markdown supported. Minimum 30 characters. |
| Report Type | Yes | Dropdown: Distress / Info Gathering / Incident Record / Resource Request / Routine. |
| Document Tags | Optional | Multi-select tag picker. |
| Location | Yes | GPS auto-detected with **'Record Current Location' button** + manual override via Google Maps picker. Stored as lat/lng + human-readable address. |
| Initial Severity | Yes | Employee's ground-level assessment: **Critical / High / Medium / Low**. Shown alongside AI prediction to management. Management has final say. |
| Initial Urgency | Yes | Time assessment: **Immediate (<6h) / Same-Day / Within a Week / Non-Urgent**. Mandatory pre-submission field. |
| Audio Recording(s) | Optional | One or more audio clips; each transcribed and summarised. |
| Images | Optional | Up to 10 images. |
| Short Videos (≤45s) | Optional | Up to 3 short videos. |
| Long Videos (>45s) | Optional | Up to 2 long videos. First 45s processed by AI. |

- Pre-submission review screen shows all fields before publishing.
- Missing required fields are highlighted; submission is blocked until resolved.
- Submitted report transitions immediately to **SUBMITTED** status and is locked from further employee editing.
- Employee receives in-app and FCM notification when management changes the task status.

---

### 5.2 NGO Management — Review & Governance Module

NGO Management access is primarily via the **React web dashboard**, with a secondary management view available on mobile. Management users have elevated permissions and exclusive access to all internal data layers.

---

#### 5.2.1 Task Review Queue

- Management sees a queue of SUBMITTED reports sorted by combined employee + AI severity/urgency score.
- Each report card shows: Title, Reporter, Location, Report Type, Submission Time, Thumbnail, one-line AI summary.
- Clicking a report opens the full Review Screen.

---

#### 5.2.2 AI Information Screen

This is the **primary intelligence interface** for management — a consolidated AI briefing generated by Gemini 1.5 Pro from all submitted content.

| AI Output Field | Description |
|---|---|
| Situation Summary | 2–3 paragraph human-readable overview: what happened, where, how many affected, and urgency. Plain language, no jargon. |
| Category | Auto-classified: Medical Emergency / Infrastructure / Food & Water / Education / Shelter / Environmental / Other. |
| AI Severity | Critical / High / Medium / Low — derived from image analysis, video content, and textual description. |
| AI Urgency | Immediate / Within 24h / Within a Week / Non-Urgent — time-sensitivity from content analysis. |
| Estimated Affected | Estimated number of people affected, if inferable. Shown with a confidence indicator. |
| Key Observations | Bulleted findings from images, videos, and audio — the most actionable observations. |
| Per-Attachment Summary | Each image, video, and audio clip has its own exhaustive AI caption. E.g. "Image shows a collapsed bridge support pillar on the eastern approach. Structural cracks visible on left column." |

The AI Information Screen is regenerated any time management attaches new documents.

---

#### 5.2.3 AI Prediction Override

- Management can manually override any AI field: Category, Severity, Urgency, Estimated Affected.
- Overrides are shown inline with a **'Management Override'** badge. AI prediction remains visible (greyed) for audit.
- Employee's initial severity/urgency assessment is also shown alongside both AI and override values.
- Management's override is what propagates to the public volunteer-facing task card. **Final say always rests with management.**

---

#### 5.2.4 Editing, Documents & Internal Comments

- Management can edit: Title, Description. All edits are versioned internally.
- Document attachments:
  - **Public Documents** — visible to accepted volunteers. E.g. location maps, briefing sheets.
  - **Internal Documents** — visible to management only. Historical data, sensitive background material, internal assessments.
  - **Internal Comments** — rich-text timestamped notes, management-only, multiple per task. Useful for coordination.

---

#### 5.2.5 Task Configuration & Activation

| Setting | Description |
|---|---|
| Max Volunteers | Optional. If set, task auto-closes to new applications when this count of volunteers are ACCEPTED. If not set, task stays ACTIVE indefinitely until management manually closes it. |
| Required Skills | Management can tag the task with skill requirements (e.g. First Aid, Construction, Legal). These feed into the matching score. |
| Visibility | Management sets task to ACTIVE to make it visible on the volunteer feed. |
| Approval Action | **Approve → ACTIVE** or **Reject → REJECTED** with mandatory written reason. |

---

#### 5.2.6 Volunteer Application Management & Task Closure

- Management sees each application with: name, photo, distance from task, interests, skills, and match score breakdown.
- Management can Accept or Reject individual applications. Accepted volunteers receive FCM notification.
- Management reviews proof of participation for each volunteer and marks it Completed or requests re-submission.
- Management marks the overall task COMPLETED once all proofs are verified.

---

### 5.3 Volunteer Module

#### 5.3.1 Profile Creation & Interest Selection

During onboarding, volunteers complete a structured profile:

- Full name, profile photo, **Unique Username**, and Password.
- Location — GPS-detected home/base location with manual override via Google Maps picker.
- **Skills** — multi-select: First Aid, Construction, Legal Aid, Teaching, Driving, Counselling, Tech Support, Medical Professional, Other.
- **Interests** — multi-select from master category list: Medical Emergency, Infrastructure, Food & Water, Education, Shelter, Environmental, Child Welfare, Elder Care, Disability Support, Animal Welfare, Other.
- **Availability** — general windows: Weekdays / Weekends / Evenings / Full-time. Volunteers can also specify **specific daily time slots** (e.g., "Weekdays 4 PM–9 PM", "Weekends 9 AM–6 PM") and date ranges. Used as a signal in matching.

Profile can be updated at any time. Interest and skill changes take effect at the next matching engine cycle.

---

#### 5.3.2 Task Feed (Pull Model with Personalised Ranking)

- All ACTIVE tasks are visible to all volunteers — no hard exclusion based on matching score.
- Tasks are ranked by Match Score (highest first), giving each volunteer a personalised view.
- Task card shows: Title, Category badge, Severity badge, Distance, AI summary (2 sentences), volunteer slots remaining (if max set), thumbnail.
- Feed filters: Category, Severity, Distance radius (5 / 10 / 25 km / Any), Urgency.
- **Map View** mode shows all active tasks as clustered pins on a Google Map.
- Tasks with MatchScore > 0.7 display a **'Great Match'** badge.

---

#### 5.3.3 Task Application

- Volunteer taps Apply on any task. A confirmation screen appears before submitting.
- **No limit** on simultaneous task applications. Volunteers can apply to multiple tasks concurrently.
- Application status shown on card: Pending / Accepted / Rejected.
- If rejected, a brief management-provided reason is shown.
- Accepted volunteers gain access to full task detail: public documents, location, and contact instructions.

---

#### 5.3.4 Proof of Participation

After completing work, the volunteer submits proof of participation. Before upload, a soft guidance checklist is shown (not technically enforced):

- "Show the completed work or the situation after your intervention."
- "Include yourself at the location if possible."
- "If beneficiary consent is given, include them in the media."

Accepted formats: one or more images, one short video (≤45s), or one long video. Proof is visible only to NGO Management. Management marks participation Completed or requests re-submission with a note.

---

## 6. AI & ML Processing Layer

All AI processing is **asynchronous and non-blocking**. A field employee can submit a report immediately; AI pipelines run in the background via Google Cloud Tasks and update Firestore when complete. Management is notified when processing finishes.

---

### 6.1 Audio Processing Pipeline

| Step | Service | Action |
|---|---|---|
| 1 | Device | Audio recorded in AAC/M4A. Saved locally. Survives app restarts and crashes. |
| 2 | GCS | On sync: resumable upload to GCS bucket (audio/raw/). Reliable across poor connections. |
| 3 | Cloud Tasks | Upload completion triggers a Cloud Tasks job: transcription task enqueued. |
| 4 | Speech-to-Text v2 | Async recognition. Language auto-detected. Returns raw transcript with word-level timestamps. |
| 5 | Vertex AI Gemini 1.5 | Raw transcript → Gemini at temperature=0.1: (a) Fix errors and filler words. (b) Output clean transcript. (c) Write a 3–5 sentence human-readable summary. |
| 6 | Firestore | Raw transcript, clean transcript, and summary written back to the report. Management notified. |

---

### 6.2 Image Processing Pipeline

| Step | Service | Action |
|---|---|---|
| 1 | Cloud Vision API | Label detection (top 20), object localisation, safe-search, image quality score. High-res images prioritised. |
| 2 | Vertex AI Gemini 1.5 | Vision API output + full image (multimodal) → exhaustive, easy-to-read explanation of what the image shows, relevant to NGO response. |
| 3 | Firestore | Caption and observations stored against each image attachment. |

---

### 6.3 Video Processing Pipeline

| Video Type | Processing | AI Output |
|---|---|---|
| Short Video (≤ 45 sec) | Full video processed by Video Intelligence API: shot change detection, label detection, object tracking. Then Gemini for summary. | Scene-by-scene description + overall situation summary. Stored per-attachment. |
| Long Video (> 45 sec) | First 45 seconds extracted and processed identically to short video. Thumbnail extracted at frame 5. Full video stored in GCS for human review. | AI summary of first 45s only. Management sees a `[PARTIAL — first 45s analysed]` label and can review full video in an embedded player. |

---

### 6.4 Consolidated Report AI Summary

Once all media assets are individually processed, a final **consolidated Gemini call** synthesises all summaries + cleaned transcripts + title + description into the **AI Information Screen** shown to management. This produces the Situation Summary, Category, AI Severity, AI Urgency, Estimated Affected, and Key Observations.
- **Grounding Strategy**: The synthesis prompt must utilize **few-shot examples** to calibrate severity/urgency, ensuring the model distinguishes between "critical" life-safety issues and "high" priority infrastructure needs.
- **Regeneration**: Regenerated any time management attaches new documents.


---

### 6.5 LLM Configuration

| Parameter | Value & Rationale |
|---|---|
| Model | Vertex AI — Gemini 1.5 Pro |
| Temperature (cleanup) | **0.1** — Near-deterministic. Prevents the model from inventing content not in the transcript. |
| Temperature (summarisation) | **0.2** — Slightly higher for natural phrasing, still constrained to factual content. |
| Output Format | Structured JSON with defined schema. Parsed server-side before writing to Firestore. |
| Prompt Strategy | System prompt defines NGO domain context and output schema. **Utilise a few-shot system prompt** containing diverse edge-case examples (e.g., distinguishing a localized leak from a flood) to properly identify and ground actual severity and urgency. |


---

## 7. Volunteer Matching Engine

The matching engine determines the **order in which tasks appear in each volunteer's feed**. All active tasks are visible to all volunteers (Pull model). The engine ranks tasks per volunteer using a weighted scoring formula.

### 7.1 Match Score Formula

```
MatchScore(Volunteer V, Task T) =
    0.40 × ProximityScore(V, T)    // Highest weight — location proximity
  + 0.25 × InterestScore(V, T)     // Category interest alignment
  + 0.20 × AvailabilityScore(V)    // Activity-based availability signal
  + 0.15 × SkillScore(V, T)        // Skill match (default 1.0 for general tasks)

  Range: [0.0, 1.0]   Higher score = task appears earlier in this volunteer's feed
```

---

### 7.2 Score Component Definitions

| Component | Weight | Calculation |
|---|---|---|
| **ProximityScore** | 0.40 | Exponential decay: `e^(−0.05 × distance_km)`. 0km→1.0, 10km→0.60, 25km→0.29, 50km→0.08. Uses volunteer's saved home/base location vs. task GPS coordinates. |
| **InterestScore** | 0.25 | 1.0 if task's category matches any of volunteer's selected interests. 0.0 otherwise. Default 0.5 if volunteer has set no interests. |
| **AvailabilityScore** | 0.20 | 1.0 if volunteer was active on platform in last 7 days. 0.6 if active in last 30 days. 0.2 if inactive >30 days. Incentivises regular engagement. |
| **SkillScore** | 0.15 | (Matching skills count) / (Required skills count). Only applies if task has Required Skills set. Defaults to 1.0 for all volunteers on tasks with no skill requirements. |
---

### 7.4 Feed Display Logic

- Tasks sorted by MatchScore descending in each volunteer's feed.
- Tasks with MatchScore > 0.7 display a **'Great Match'** badge.
- Score ties broken by Urgency: Immediate > Same-Day > Within a Week > Non-Urgent.
- Feed is re-sorted in real-time when volunteers apply filter changes.

---

## 8. Task Lifecycle & State Machine

| Status | Actor | Description & Transitions |
|---|---|---|
| 🔘 **DRAFT** | NGO Employee | Report is being created. Not visible to management. Saved locally (offline-capable). → SUBMITTED on publish. |
| 🔵 **SUBMITTED** | System | Employee has published. Appears in management review queue. AI processing begins asynchronously. → UNDER REVIEW when management opens the report. |
| 🟠 **UNDER REVIEW** | NGO Management | Management is reviewing. Edits, overrides, internal comments can be added. → ACTIVE on approval. → REJECTED on rejection (with mandatory reason). |
| 🟢 **ACTIVE** | NGO Management | Task is live on the volunteer feed. Volunteers can apply. If maxVolunteers not set: stays ACTIVE until management closes manually. If maxVolunteers set: auto-transitions to CLOSED when limit is reached. |
| 🩵 **CLOSED** | System / Management | No more applications accepted. Accepted volunteers completing work and submitting proof. → COMPLETED once management is satisfied. |
| 🟣 **COMPLETED** | NGO Management | Terminal state. Management verified all proofs. Task archived and visible in history. KPIs updated. |
| 🔴 **REJECTED** | NGO Management | Rejected during review. Mandatory rejection reason recorded. Employee notified. Not visible to volunteers. Can be re-submitted after employee revision. |

---

## 9. Core Data Models

### 9.1 Task Document (Firestore)

```typescript
Task {
  id:                   string          // Auto-generated UUID
  status:               enum            // DRAFT | SUBMITTED | UNDER_REVIEW | ACTIVE | CLOSED | COMPLETED | REJECTED
  reportType:           enum            // DISTRESS | INFO_GATHERING | INCIDENT | RESOURCE_REQUEST | ROUTINE
  tags:                 string[]        // e.g. [SURVEY, FIELD_REPORT]
  title:                string
  description:          string          // Markdown
  location: {
    lat:                number,
    lng:                number,
    address:            string,         // Resolved by Google Places API
    geohash:            string          // For efficient spatial queries
  }
  employeeId:           string
  employeeAssessment: {
    severity:           enum,           // CRITICAL | HIGH | MEDIUM | LOW
    urgency:            enum            // IMMEDIATE | SAME_DAY | WITHIN_WEEK | NON_URGENT
  }
  aiAnalysis: {
    situationSummary:   string,
    category:           string,
    severity:           enum,
    urgency:            enum,
    estimatedAffected:  number | null,
    keyObservations:    string[],
    processingStatus:   enum            // PENDING | PROCESSING | DONE | FAILED
  }
  managementOverride: {                 // null if no override applied
    category:           string | null,
    severity:           enum | null,
    urgency:            enum | null,
    overriddenBy:       string,         // managerId
    overriddenAt:       timestamp
  }
  requiredSkills:       string[]
  maxVolunteers:        number | null   // null = unlimited
  acceptedCount:        number
  internalComments:     Comment[]       // Management-only
  rejectionReason:      string | null
  createdAt:            timestamp
  updatedAt:            timestamp
}
```

---

### 9.2 Media Attachment

```typescript
MediaAttachment {
  id:               string
  taskId:           string
  type:             enum           // AUDIO | IMAGE | SHORT_VIDEO | LONG_VIDEO
  gcsUri:           string         // gs://bucket/path/to/file
  thumbnailUri:     string | null  // For video types
  fileSize:         number         // Bytes
  durationSec:      number | null  // Audio / video only
  uploadedBy:       string         // userId
  visibility:       enum           // PUBLIC | INTERNAL
  aiCaption:        string | null
  aiObservations:   string[]
  transcript:       string | null  // Raw (audio only)
  cleanTranscript:  string | null  // Gemini-cleaned
  processingStatus: enum           // PENDING | DONE | FAILED
  uploadedAt:       timestamp
}
```

---

### 9.3 User / Volunteer Profile

```typescript
UserProfile {
  uid:            string       // Firebase Auth UID
  role:           enum         // VOLUNTEER | NGO_EMPLOYEE | NGO_MANAGEMENT | ADMIN
  displayName:    string
  photoURL:       string | null
  phone:          string       // OTP-verified
  homeLocation: {
    lat:          number,
    lng:          number,
    address:      string
  }
  interests:      string[]     // Selected from master interest list
  skills:         string[]     // Selected from master skill list
  availability:   string[]     // WEEKDAYS | WEEKENDS | EVENINGS | FULLTIME
  lastActiveAt:   timestamp
  createdAt:      timestamp
}
```

---

### 9.4 Volunteer Application

```typescript
VolunteerApplication {
  id:               string
  taskId:           string
  volunteerId:      string
  matchScore:       number        // Score at time of application
  status:           enum          // APPLIED | ACCEPTED | REJECTED | PROOF_SUBMITTED | COMPLETED
  rejectionNote:    string | null
  proofMedia:       string[]      // GCS URIs
  proofSubmittedAt: timestamp | null
  completedAt:      timestamp | null
  appliedAt:        timestamp
}
```

---

## 10. Offline Sync Strategy

The mobile app is **offline-first by design**. NGO field employees often operate in low or zero connectivity environments. The following strategy ensures no data is ever lost.

| Concern | Solution |
|---|---|
| Structured Data | Firestore's built-in offline persistence stores all reads and writes locally. Writes are queued and auto-synced when connectivity returns. |
| Media Upload Queue | A local upload queue tracks all pending media. On reconnect, uploads resume from where they left off using GCS Resumable Upload. Files are never re-uploaded from scratch. |
| Audio Recording | Audio saved to device filesystem immediately on recording stop. Survives app restarts and crashes. Linked to local Firestore draft by ID. |
| Conflict Resolution | Firestore server timestamps and last-write-wins handles conflicts. Since only the creating employee edits a DRAFT, conflicts are rare. Management edits are server-side only. |
| Sync Status UI | App shows clear sync status: "All synced", "Syncing...", or "X items pending upload". Warning shown if user tries to submit with unsynced media. |
| Draft Persistence | A DRAFT report is never deleted from the device until management confirms receipt. Drafts are recovered after logout/login on the same device. |

---

## 11. Privacy, Security & Compliance

The platform is designed to comply with **GDPR** and **India's Digital Personal Data Protection Act (DPDPA) 2023**.

### 11.1 Role-Based Access Control (RBAC)

| Data / Feature | Volunteer | NGO Employee | NGO Management | Notes |
|---|---|---|---|---|
| Task (public fields) | Read (ACTIVE only) | Read+Write (own) | Read+Write (all) | |
| Internal Comments | No Access | No Access | Full Access | Firestore security rules enforced |
| Internal Documents | No Access | No Access | Full Access | INTERNAL flag checked server-side |
| Volunteer Profiles | Own only | No Access | Read (summary) | Full PII never exposed to employee |
| Proof of Participation | Own only | No Access | Full Access | |
| Match Scores | Own badge | No Access | All scores | Volunteer sees badge, not raw number |

### 11.2 Privacy-by-Design Principles

- **Data Minimisation** — Only data necessary for operational purpose is collected.
- **Encryption at Rest** — All Firestore and GCS data encrypted with AES-256 Google-managed keys.
- **Encryption in Transit** — All API and Firebase connections use TLS 1.3.
- **Pseudonymisation** — Beneficiary references use location + category codes, not personal names unless operationally necessary.
- **Data Retention** — Task data archived after 3 years; media deleted after 2 years. Volunteer profiles deleted within 30 days of account deletion.
- **Audit Logs** — All data access, edits, and status changes logged immutably in Cloud Logging with actor ID, timestamp, and action.
- **Right to Erasure** — Volunteers can delete their account from the app. Cascade removes PII while preserving anonymised participation statistics.

---

## 12. Non-Functional Requirements

| Category | Requirement | Target |
|---|---|---|
| Performance | Feed Load Time | Task feed first page loads in < 2 seconds on a 4G connection. |
| Performance | Match Score Compute | Match scores recomputed within 5 minutes of a task going ACTIVE. |
| Availability | Platform Uptime | 99.5% monthly SLA. Cloud Run auto-scales; Firestore is Google-managed HA. |
| Scalability | Concurrent Users | MVP supports up to 5,000 concurrent users. Architecture scales horizontally without redesign. |
| Offline | Offline Duration | Full report creation works for up to 7 days offline. Media queued for sync on reconnect. |
| AI Processing | Processing Latency | Audio transcript available within 3 minutes for clips up to 30 min. Image: <30s. Short video: <2 min. |
| Accessibility | WCAG 2.1 AA | Web dashboard meets AA. Mobile follows Material Design accessibility guidelines. |
| Localisation | Languages | English and Hindi for MVP. Architecture supports additional language packs in Phase 2. |
| Security | Authentication | Firebase Auth (**Username + Password**). Sessions expire in 24 hours. |

---

## 13. KPIs & Success Metrics

| # | KPI | Target (3 months post-MVP) | Measurement |
|---|---|---|---|
| 1 | Task Coverage Rate | >80% of ACTIVE tasks receive ≥1 volunteer within 48 hours. | Tasks with ≥1 volunteer / Total ACTIVE tasks |
| 2 | Time to Active | Median < 4 hours from SUBMITTED → ACTIVE. | Timestamp delta: submitted_at → activated_at |
| 3 | Volunteer Engagement Rate | >60% of registered volunteers apply to ≥1 task per month. | MAU applicants / Total registered volunteers |
| 4 | Task Completion Rate | >75% of CLOSED tasks reach COMPLETED. | COMPLETED / (CLOSED + COMPLETED) |
| 5 | AI Accuracy (Override Rate) | <20% of AI severity/urgency predictions overridden. | Management overrides / Total AI predictions |
| 6 | Offline Report Success Rate | >95% of offline drafts sync within 30 min of reconnection. | Successful syncs / Total offline drafts |
| 7 | Media Processing Success | >97% of uploaded media processed successfully. | processingStatus=DONE / Total uploads |
| 8 | Volunteer Satisfaction (NPS) | NPS > 40 from post-task in-app surveys. | In-app survey after each COMPLETED task |
---
*Smart Resource Allocation — PRD v1.0 | April 2026 | Confidential — Internal Use Only*

*This document reflects MVP scope. All features are subject to revision based on stakeholder feedback and technical discovery.*

