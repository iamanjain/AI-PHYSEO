# AI Rehab Assistant 🩺🤖

AI-powered physical rehabilitation exercise monitoring and real-time posture coaching web application built with React, Vite, Tailwind CSS, MediaPipe Tasks Vision, and Web Speech API.

---

## 🚀 Quick Start (Run on Any Laptop)

### 1. Prerequisites
- **Node.js**: Version 18+ ([Download Node.js](https://nodejs.org/))
- **Browser**: Google Chrome, Microsoft Edge, or any Chromium browser with Webcam access enabled.

### 2. Setup & Installation
Clone or copy this folder to your laptop, open a terminal inside the project directory, and run:

```bash
# 1. Install all dependencies
npm install

# 2. Start the local development server
npm run dev
```

The application will launch immediately at:
👉 **`http://localhost:5173/`**

---

## 🌟 Key Features

1. **Computer Vision Pose Tracking**:
   - MediaPipe Pose Landmarker running directly in the browser with 0 server latency.
   - High-precision 33-landmark skeleton tracking and joint angle calculations.

2. **Proactive AI Voice Coach (Hinglish / Hindi / English)**:
   - Guides the user through every step (*Positioning* $\to$ *Start* $\to$ *Peak Contraction Hold* $\to$ *Descent* $\to$ *Rep Completion*).
   - Inactivity detection: Proactively nudges users if stationary for $\ge 1.5$ seconds.

3. **Multi-Exercise Rehabilitation Catalog**:
   - **Shoulder Lateral Raise** (Deltoids & Rotator Cuff)
   - **Bicep Curls** (Bilateral Elbow Flexion & Posture Tracking)
   - **Side Leg Raise** (Hip Abductor & Pelvis Alignment)
   - **Seated Knee Extension** (Quadriceps & Patellar Tendon)

4. **Biomechanical SVG Demo Animations**:
   - Interactive step-by-step vector guides with live angles, play/pause controls, and clinical form guidance.

5. **Post-Session Clinical Analytics & Storage**:
   - Detailed session accuracy score, valid/invalid rep breakdown, range of motion charts, and downloadable session reports.

---

## 🛠 Tech Stack
- **Frontend**: React 18, Vite, React Router DOM (HashRouter for zero-config routing)
- **Styling**: Tailwind CSS, Lucide React Icons, Canvas 2D
- **AI / Computer Vision**: `@mediapipe/tasks-vision` (WebAssembly & GPU delegate)
- **Audio / Speech**: Web Speech API (`SpeechSynthesis`) with natural Indian voice selection
