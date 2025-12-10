# AI-Driven HR Management System (Frontend Only)

## Project Overview
This is a production-quality, frontend-only HR Management System built with React, Vite, and TailwindCSS. It features a modern dashboard, employee management, recruitment tracking with AI simulation, payroll, attendance, and performance reviews.

## Features
- **Dashboard**: Overview of key HR metrics and AI insights.
- **Employee Management**: View, add, and edit employee details.
- **Recruitment (ATS)**: Track candidates, score resumes (AI simulation), and generate offer letters.
- **Payroll**: Visualize salary data and payment status.
- **Attendance**: Track daily check-ins and absenteeism.
- **Performance**: Employee reviews and ratings.
- **AI Integration (Mock)**: Simulated AI features for resume scoring, attrition prediction, and smart insights.
- **Multilingual**: Supports English, Urdu, and Arabic.
- **Theming**: Light and Dark mode support.

## Tech Stack
- **Frontend Framework**: React 18 (Vite)
- **Styling**: TailwindCSS v4 + Framer Motion
- **Routing**: React Router v6 (Wouter used in this specific Replit setup as per environment preference)
- **State Management**: React Context (Theme)
- **Internationalization**: react-i18next
- **Icons**: Lucide React

## Setup & Installation

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Run Development Server**
    ```bash
    npm run dev
    ```

3.  **Build for Production**
    ```bash
    npm run build
    ```

## Backend Placeholder
A `backend_placeholder.py` file is included in `src/api/` to demonstrate how the API endpoints should be structured. It includes:
- `get_employees()`
- `score_resume()`
- `generate_offer_letter()`
- And more...

This frontend currently uses dummy JSON data located in `src/data/`. To connect a real backend, replace the API calls in the components with `axios` or `fetch` requests to your server.

## AI Features (Simulated)
The system includes mock AI functions in `src/utils/aiMockFunctions.js`:
- Resume Scoring
- Auto-Shortlisting
- Offer Letter Generation
- Attrition Risk Prediction

## Roadmap for AI Enhancement
- Integrate OpenAI/Gemini API for real-time text analysis.
- Implement RAG (Retrieval-Augmented Generation) for searching employee policies.
- Add voice-based commands for HR tasks.

## Limitations
- Data is not persisted (refreshes reset state).
- Authentication is not implemented (mock login only).
- AI features are simulated with randomizers and templates.
