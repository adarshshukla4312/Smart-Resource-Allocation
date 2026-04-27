# 🚀 Smart Resource Allocation (SRA)

### *Data-Driven Volunteer Coordination for Social Impact*

[![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)](https://team-ro-ko-hackathon-project.web.app)
[![Tech Stack](https://img.shields.io/badge/Tech--Stack-React%20%7C%20Capacitor%20%7C%20Firebase-blue?style=for-the-badge)]()
[![AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-purple?style=for-the-badge)]()

---

## 🌟 Vision
**Smart Resource Allocation (SRA)** is a next-generation platform designed to turn fragmented field observations into actionable priorities. By leveraging Google's Gemini AI suite, SRA empowers NGOs to capture high-fidelity data in low-connectivity environments, analyze media and documents instantly, and connect community needs with the most qualified volunteers through a location-aware matching engine.

---

## 🛠️ Key Features

### 1. AI-Augmented Field Reporting
*   **Quick vs Detailed Reports**: NGO Field Employees can submit fully-structured detailed reports or rapid Quick Reports containing just images/audio, which AI structures into actionable data.
*   **Offline-First Architecture**: Built-in **IndexedDB Persistence** caches all data locally. The app includes a dynamic `NetworkBanner` that informs users when they drop offline, queueing all their writes for background sync when connectivity returns.

### 2. On-Demand Multimodal AI Analysis (Admin Dashboard)
*   **Intelligent Media Previews**: Management can click to instantly generate AI summaries for images, audio, or video attachments using `gemini-2.5-flash` vision/multimodal capabilities.
*   **Deep Document Analysis**: PDF documents feature a dual-tab interface:
    *   **AI Summary**: High-level overview of document type and key findings.
    *   **Content Analysis**: Deep section-by-section extraction of headers, critical data points, action items, and structural assessment.

### 3. Smart Volunteer Matching Engine
*   **Location-Aware Feeding**: Tasks are sorted and displayed to volunteers based on live GPS calculations and proximity formulas.
*   **Weighted Matching Algorithm**:
    *   $$MatchScore = 0.35(P) + 0.25(Se) + 0.20(I) + 0.20(Sk)$$

| Component | Weight | Description |
| :--- | :--- | :--- |
| **Proximity (P)** | 35% | Exponential decay based on live GPS distance: $e^{(-0.05 \times distance\_km)}$. |
| **Severity (Se)** | 25% | Prioritizes critical/high-severity tasks based on AI or management assessment. |
| **Interest (I)** | 20% | Alignment between the task's category and the volunteer's selected interests. |
| **Skill (Sk)** | 20% | Ratio of matching skills the volunteer possesses versus the task requirements. |

*   **Digital Proofing**: Volunteers can upload proof of task completion for NGO management verification.

### 4. WisprFlow Design System
*   **Premium UX/UI**: The entire application is built on custom **WisprFlow** CSS principles featuring Glassmorphism, deep purple/warm cream palettes, and editorial typography (Outfit/Inter).
*   **Brand Loaders**: Dynamic CSS-driven spinning loaders and micro-animations replace generic loading screens to establish a premium brand feel.

---

## 💻 Technology Stack

### **Web & Mobile Interface**
*   **Core**: React 19 + Vite
*   **Cross-Platform Shell**: Capacitor v6 (Android APK compiled and bundled)
*   **Styling**: Vanilla CSS (WisprFlow Design Tokens)
*   **Icons**: Lucide React
*   **Hosting**: Firebase Hosting (Live at `team-ro-ko-hackathon-project.web.app`)

### **Backend & AI Infrastructure**
*   **Database**: Firebase Firestore (Realtime & Offline-enabled)
*   **Storage**: Firebase Cloud Storage (Images, Audio, PDFs)
*   **AI Services**: `@google/generative-ai` (`gemini-2.5-flash`) integrated directly into the Firebase data flow.

---

## 📱 Mobile App (APK) Setup
SRA supports Android deployment via Capacitor by wrapping the optimized production web build.

**To build the APK locally:**
1. Generate the web production build:
   ```bash
   cd web && npm run build
   ```
2. Copy the build to the Capacitor shell:
   ```bash
   xcopy /E /I /Y "..\web\dist" "dist" # (Windows)
   ```
3. Sync and build using Gradle:
   ```bash
   cd mobile
   npx cap sync android
   cd android
   .\gradlew assembleDebug
   ```
The compiled APK will be located at `mobile/android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🔒 Compliance & Security
*   **Role-Gated Views**: Strict routing and Firestore Security Rules isolate Administrative management views, Employee reporting tools, and Volunteer task feeds.
*   **Cached AI**: AI analysis results are persisted in Firestore subcollections to minimize redundant API calls and save tokens.

---

*Built with ❤️ for Social Impact.*
