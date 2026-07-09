# VECTIS
**Venue Event Control & Telemetry Infrastructure System**  
*Autonomous Event Routing & Real-Time Decision Support for the FIFA World Cup 2026*

[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Gemini](https://img.shields.io/badge/Google%20GenAI-2.4-orange.svg)](https://aistudio.google.com/)
</div>

---

## 📖 Overview

Traditional stadium operations rely on fragmented legacy interfaces and delayed communication. **VECTIS** fundamentally reimagines operational monitoring for extreme-scale events like the FIFA World Cup 2026. 

By acting as a centralized coordination core, VECTIS ingests high-velocity, heterogeneous data streams (IoT sensors, visual telemetry, multilingual field reports, transit delays) and uses **Google Gemini 3.5 Flash** to output deterministic, machine-readable JSON payloads containing signage instructions, staff dispatch alerts, and transit routing updates.

---

## ⚡ Core Modules

VECTIS is built around three primary AI-driven use cases:

### 1. Dynamic Crowd De-congestion (Gate Matrix)
During peak ingress, VECTIS ingests live IoT gate load percentages and optical camera feed diagnostics. If bottlenecks occur, the system dynamically reroutes traffic to peripheral gates.
* **Input:** Gate loads (%), queue lengths, visual camera analytics.
* **Output (AI):** Updated physical digital signage text, targeted volunteer squad dispatch, and optimal fan-app routing pathways.

### 2. Multilingual Incident Coordination (Comm Log)
Event staff transmit field reports in various languages (Spanish, French, Portuguese, etc.). VECTIS acts as a universal translator and emergency coordinator.
* **Input:** Raw heterogenous multilingual radio communication logs.
* **Output (AI):** A unified English Situational Report (SitRep), severity indexing, standard operating procedure (SOP) cross-referencing, and triage dispatch alerts.

### 3. Predictive Transport Dispatch (Fleet Stream)
VECTIS aligns transit logistics with match-day reality. By analyzing live match scores and progression, it predicts egress bottlenecks and preemptively allocates eco-shuttles.
* **Input:** Match minute, live score, extra-time likelihood, transit grid load.
* **Output (AI):** Exit gate flow-rate configurations, dynamic EV fleet dispatch (Route A/B/C), egress peak predictions, and CO2 offset estimates.

---

## 🛠 Tech Stack

* **Frontend:** React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide React.
* **Backend:** Express.js, Node.js (via `tsx`).
* **AI Core:** `@google/genai` (Gemini SDK).
* **Build Tooling:** Vite, ESBuild.

---

## 🚀 Getting Started (Local Development)

**Prerequisites:** Node.js (v18+)

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Configuration (Environment Variables)
To enable the **LIVE_CORE** (real Gemini API calls), configure your `.env` file:
```bash
cp .env.example .env
```
Open `.env` and replace `MY_GEMINI_API_KEY` with your actual Google Gemini API key:
```env
GEMINI_API_KEY="your_actual_api_key_here"
```
*Note: If no valid API key is provided, VECTIS gracefully defaults to **SIMULATION_FALLBACK** mode, using high-fidelity mock data to maintain full UI functionality without crashing.*

### 3. Start the Server
Run the unified development server (hosts both Express API and Vite frontend):
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Architecture & Robustness

VECTIS is designed for mission-critical reliability:
* **Fault Tolerance:** If the Gemini API experiences timeouts or degradation, endpoints instantly return an explicit `503 TELEMETRY LINK DEGRADED` error, bubbling the visual state safely to the React frontend rather than silently failing.
* **Strict AI Schema Validation:** Leveraging Gemini's `responseSchema` configuration, all LLM outputs are guaranteed to return perfectly structured, machine-actionable JSON payloads—no unpredictable conversational prose.
* **Dynamic Feedback Loops:** The UI prevents race-conditions (e.g., locking ingest triggers during evaluation runs) and reacts dynamically to unacknowledged alarms.
