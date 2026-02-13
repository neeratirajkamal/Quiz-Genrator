# DeepKlarity AI Wiki Quiz Generator

A full-stack application that generates quizzes from Wikipedia articles using Google's Gemini LLM.

## Features
- **Generate Quiz**: Enter a Wikipedia URL to scrape content and generate a 5-10 question quiz.
- **Quiz History**: View a list of previously generated quizzes.
- **Interactive Quiz**: Take the quiz with immediate feedback.
- **Tech Stack**: FastAPI (Backend), React + Vite (Frontend), SQLAlchemy (Database), Tailwind CSS (Styling), LangChain + Gemini (AI).

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- Google Gemini API Key

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file from `.env.example` and add your Google API Key:
   ```bash
   cp .env.example .env
   # Edit .env and set GOOGLE_API_KEY
   ```
   **How to get a Google API Key:**
   1. Go to [Google AI Studio](https://aistudio.google.com/).
   2. Sign in with your Google account.
   3. Click on **"Get API key"** (top left).
   4. Click **"Create API key"** (select a project or create a new one).
   5. Copy the key and paste it into your `backend/.env` file:
      ```env
      GOOGLE_API_KEY=your_copied_key_here
      ```

5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

## API Endpoints
- `POST /api/generate`: Generate a quiz from a URL.
- `GET /api/quizzes`: List all generated quizzes.
- `GET /api/quizzes/{id}`: Get details of a specific quiz.

## Project Structure
```
├── backend/
│   ├── app/
│   │   ├── services/ (Scraper, LLM)
│   │   ├── routers/ (API routes)
│   │   ├── models.py (DB Models)
│   │   └── main.py (Entry point)
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   └── services/
    ├── package.json
    └── tailwind.config.js
```
