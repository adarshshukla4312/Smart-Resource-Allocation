# 🚀 Smart Resource Allocation (SRA)

### *Data-Driven Volunteer Coordination for Social Impact*

[![Status](https://img.shields.io/badge/Status-In--Progress-orange?style=for-the-badge)](https://github.com/your-repo-link)
[![Tech Stack](https://img.shields.io/badge/Tech--Stack-React%20%7C%20Capacitor%20%7C%20Firebase-blue?style=for-the-badge)](https://github.com/your-repo-link)
[![AI](https://img.shields.io/badge/AI-Gemini%201.5%20Pro-purple?style=for-the-badge)](https://github.com/your-repo-link)

---

## 🌟 Vision
**Smart Resource Allocation (SRA)** is a next-generation platform designed to turn fragmented field observations into actionable priorities. By leveraging Google Cloud's AI suite, SRA empowers NGOs to capture high-fidelity data in low-connectivity environments and instantly connect community needs with the most qualified volunteers.

---

## 🛠️ Key Features

### 1. AI-Augmented Reporting (Mobile)
*   **Multimodal Capture**: NGO Field Employees can record audio interviews, capture images, and shoot short videos to document community needs.
*   **Offline Resilience**: Full support for offline data entry with automatic background sync when connectivity returns.
*   **AI Transcription & Cleanup**: Automated conversion of field audio (Hindi/English) into clean, summarized reports using **Google Cloud Speech-to-Text** and **Gemini 1.5 Pro**.

### 2. NGO Management Dashboard (Web)
*   **Consolidated AI Briefing**: A unified view of all field reports with AI-generated situational summaries, urgency labels, and severity assessments.
*   **Governance & Review**: Management can override AI predictions, manage volunteer assignments, and monitor overall program health.
*   **Role-Based Access**: Secure data isolation between different NGOs and user personas.

### 3. Smart Volunteer Matching
*   **Personalized Ranking**: A weighted matching engine ranks tasks for volunteers based on a multi-factor scoring algorithm.
*   **Direct Communication**: Seamless coordination between accepted volunteers and NGO employees via shared contact details.
*   **Proof of Participation**: Volunteers submit media-rich proof of their work for management verification.

#### 🧠 Matching Engine Logic
The "Match Score" determines the order of tasks in a volunteer's feed. It is calculated using a weighted formula:
$$MatchScore = 0.40(P) + 0.25(I) + 0.20(A) + 0.15(S)$$

| Component | Weight | Description |
| :--- | :--- | :--- |
| **Proximity (P)** | 40% | Exponential decay based on distance: $e^{(-0.05 \times distance\_km)}$. |
| **Interest (I)** | 25% | Alignment between task category and volunteer's selected interests. |
| **Availability (A)** | 20% | Recency of platform activity to prioritize active users. |
| **Skill Level (S)** | 15% | Matching between required task skills and volunteer's expertise levels. |


---

## 💻 Technology Stack

### **Web Dashboard**
*   **Core**: React 19 + Vite
*   **Routing**: React Router 7
*   **Styling**: Vanilla CSS (Premium Custom Design)
*   **Icons**: Lucide React

### **Mobile Application**
*   **Core**: React + Capacitor (Cross-platform Android/iOS)
*   **Native Features**: GPS Location, Camera, Audio Recording
*   **Persistence**: Firebase Firestore (Offline-First)

### **Backend & AI Layer**
*   **Cloud Provider**: Google Cloud Platform (GCP)
*   **Backend**: Node.js (Express) on Firebase Functions
*   **Database**: Firestore + Cloud SQL (PostGIS for spatial matching)
*   **AI Services**: 
    *   **Vertex AI**: Gemini 1.5 Pro for summarization and analysis.
    *   **Cloud Speech-to-Text v2**: Multilingual transcription.
    *   **Cloud Vision API**: Image labeling and safe-search.
    *   **Video Intelligence API**: Shot change and object tracking.

---

## 📈 Future Roadmap

The following features are planned for future development cycles:

*   **[ ] QR Check-in System**: Individual, time-bound QR codes for secure, digital attendance tracking.
*   **[ ] Gamification Engine**: Advanced level-up mechanics (+1 per task), achievement badges, and category expert statuses.
*   **[ ] Digital Certificates**: Automated generation of NGO-issued PDF certificates for top contributors.
*   **[ ] Global Leaderboards**: Category-wise rankings to drive engagement and recognize community leaders.
*   **[ ] In-App Messaging**: Real-time chat between volunteers and NGO management to eliminate reliance on external apps.
*   **[ ] AI Document Verification**: Automated verification of NGO registration certificates (80G/FCRA) during onboarding.
*   **[ ] Dual-Role Switcher**: Enhanced UI for users who serve as both Volunteers and NGO Employees.

---

## 🔒 Compliance & Security
*   **GDPR / DPDPA 2023**: Adheres to the Digital Personal Data Protection Act of India.
*   **Role-Gated Data**: Sensitive management comments and internal assessments are physically isolated from volunteer views via Firestore Security Rules.
*   **Safe-Search**: Automated AI screening of all uploaded media for inappropriate content.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Firebase CLI
*   GCP Service Account Key (for AI features)

### Installation
1.  **Clone the repo**:
    ```bash
    git clone https://github.com/your-username/smart-resource-allocation.git
    ```
2.  **Web Dashboard**:
    ```bash
    cd web && npm install && npm run dev
    ```
3.  **Mobile App**:
    ```bash
    cd mobile && npm install && npm run dev
    ```
4.  **Backend Functions**:
    ```bash
    cd functions && npm install && npm run build
    ```

---

*Built with ❤️ for Social Impact.*
