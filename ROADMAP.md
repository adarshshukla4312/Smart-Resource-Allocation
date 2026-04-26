# Smart Resource Allocation — Development Roadmap & Implementation Strategy

This document outlines the remaining steps required to take the SRA project from its current scaffolding state (configured but empty backend, mock-data frontends) to a fully functional, end-to-end product.

---

## 1. Build the Backend Monolith (Cloud Run / Firebase Functions)

### What to do
We will build a single, monolithic Express API hosted on Firebase Functions (which runs on Cloud Run under the hood). This API will handle all the complex business logic that shouldn't live on the frontend. We will structure it with clear route separations:
- `/v1/tasks` — For report creation, status updates, and fetching the feed.
- `/v1/users` — For profile management and role verification.
- `/v1/match` — The matching engine that calculates scores.
- `/v1/admin` — For management approvals and proof-of-participation verification.

### Why we are doing it this way
- **Monolith over Microservices:** As decided, a single service is vastly easier for a team of 4 to manage, deploy, and debug during a hackathon. It avoids network latency between services and simplifies local development.
- **Security:** The backend validates Firebase Auth tokens. This ensures that no one can spoof a request or bypass the rules.
- **Geohash Matching:** The backend will handle the complex `MatchScore` calculations (Distance + Interest + Availability + Skills) securely before sending the sorted feed to the volunteer.

---

## 2. Implement the AI Processing Pipeline

### What to do
We will write asynchronous background workers (using Firebase Storage Triggers and Cloud Tasks) that execute when field employees upload media.
1. **Audio:** Transcribe via Cloud Speech-to-Text v2, then clean up using Vertex AI (Gemini 1.5 Pro).
2. **Images:** Analyze via Cloud Vision API (labels, safety), then summarize via Gemini.
3. **Videos:** Process using Video Intelligence API, then summarize via Gemini.
4. **Synthesis:** A final Gemini call to generate the "AI Information Screen" (Severity, Urgency, Category).

### Why we are doing it this way
- **Non-blocking UX:** Field employees are in low-connectivity areas. They need to hit "Submit" and close the app immediately. If the app waited for the AI to finish, it would time out and fail.
- **Cost & Rate Limits:** Cloud Tasks allows us to control the rate at which we hit the Gemini and Vision APIs, preventing quota errors if 50 employees upload reports at the exact same time.

---

## 3. Implement Firestore Security Rules & Indexes

### What to do
We must write `firestore.rules` to enforce the Role-Based Access Control (RBAC) defined in the PRD, and define composite indexes in `firestore.indexes.json` so complex queries work.
- **Volunteers** can only read `ACTIVE` tasks.
- **Field Employees** can only read/write their own drafts and reports.
- **Management** can read/write everything and see internal comments.

### Why we are doing it this way
- **Data Privacy:** This is a core requirement for compliance (GDPR/DPDPA). The frontend should never be trusted to hide sensitive data. Firestore rules enforce security at the database level, making it physically impossible for a volunteer's device to download management-only comments or other volunteers' PII.
- **Indexes:** Because we will query tasks by `status`, `category`, AND sort by `geohash`, Firestore requires pre-built composite indexes, otherwise the queries will crash.

---

## 4. Frontend Integration & Data Wiring

### What to do
Replace the mock data in the React (Web) and Flutter (Mobile) apps with real data connections.
1. **Auth Layer:** Implement Firebase Auth (Login/Signup) so users get real ID tokens.
2. **API Client:** Create a shared `api.js` (web) and `api.dart` (mobile) that automatically attaches the Auth token to every request sent to the Backend Monolith.
3. **Real-time Listeners:** Use Firestore `onSnapshot` on the Management Dashboard so that when a new report is submitted, it pops up on the screen instantly without needing a page refresh.

### Why we are doing it this way
- **Real-time Collaboration:** `onSnapshot` listeners mean that if Manager A approves a task, Manager B's screen updates instantly. 
- **Offline First:** By routing reads and writes through the Firebase client SDK (and only using the REST API for heavy actions like matching), we get offline-persistence for free on the mobile app.

---

## 5. Web App Multi-Persona Design Strategy

### What to do
The web application currently only supports the NGO Management (Admin) persona. We will expand it into a unified, multi-persona portal that supports Volunteers and Field Employees as well, mirroring their mobile workflows.
1. **Role-Based Routing:** Update `App.jsx` to check `user.role` after login and dynamically redirect the user to their specific workspace (e.g., `/admin/*`, `/volunteer/*`, or `/employee/*`).
2. **Web Screen Counterparts:** Port the existing mobile screen logic (Task Feed, Create Report, Submit Proof) into responsive React components optimized for desktop/tablet viewing.
3. **Shared Layouts:** Create distinct UI shells for each persona (e.g., `VolunteerLayout` with a simplified nav vs `AdminLayout` with heavy analytics sidebars).

### Why we are doing it this way
- **User Choice & Accessibility:** Many volunteers and employees prefer using a laptop or desktop computer to type out long reports or review detailed tasks rather than doing everything on a phone.
- **Code Reusability:** By housing all three personas in one React app, we can reuse the same Firebase Auth context, API client logic, and core UI components (buttons, cards, badges) rather than building separate web portals for each group.
