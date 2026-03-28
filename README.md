# Sahay - Multimodal Disaster Response Advisor

A modern React (Vite) and Python (Flask) application that acts as an emergency bridge during monsoons, cyclones, and flooding. It processes messy multimodal inputs using Gemini 1.5 Pro to provide structured, life-saving evacuation and safety plans.

## Features
- **Multimodal Upload:** Supports image upload, in-browser audio recording, and text.
- **AI Triage:** Gemini 1.5 Pro analyzes the situation, extracts safety hazards, and grades the urgency (Red/Yellow/Green).
- **Evacuation Maps:** Integrated Google Maps for route guidance and shelter finding.
- **Shareable Action Cards:** Easily copy standard responses for WhatsApp family groups.

## Prerequisites
- Node.js
- Python (3.10+)
- Gemini API Key

## Setup Instructions

### 1. Flask Backend Server
```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Create a `.env` file in the `server` directory:
```
GEMINI_API_KEY=your_gemini_api_key_here
```
Run the server (it runs on port 5000):
```bash
flask run
```

### 2. React Vite Client
```bash
cd client
npm install
```
Create a `.env` file in the `client` directory (Optional - to enable live Google Map view):
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```
Run the client dev server:
```bash
npm run dev
```

Open your browser to the local Vite preview address (usually `http://localhost:5173`) to experience Sahay.
