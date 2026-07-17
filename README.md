# 🚀 Resume Screener & Job Matcher

An AI-powered Resume Screener and Job Matcher that helps candidates evaluate resumes against job descriptions and enables recruiters to discover suitable candidates using semantic matching.

## ✨ Features

### Candidate
- User Authentication (JWT)
- Upload Resume (PDF)
- AI Resume Parsing
- Skill Extraction
- ATS Match Score
- Resume Analysis
- Match History

### Recruiter
- Secure Login
- Create Job Posts
- View Candidate Matches
- Candidate Ranking
- AI Skill Matching

---

## 🛠 Tech Stack

### Frontend
- React
- Vite
- Axios
- CSS

### Backend
- FastAPI
- SQLAlchemy
- JWT Authentication
- PyMuPDF
- Sentence Transformers
- FAISS

### Database
- MySQL

### AI
- Groq API
- Sentence Transformers

---

## Project Structure

```
resume-screener-ai
│
├── backend
├── frontend
├── README.md
├── requirements.txt
└── .gitignore
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/Rakeshshah3/resume-screener-ai.git
```

### Backend

```bash
cd backend

python -m venv myenv

myenv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Future Improvements

- AI Resume Suggestions
- Interview Question Generator
- Email Notifications
- Recruiter Dashboard Analytics
- Resume PDF Reports

---

## Author

**Rakesh Shah**

MCA Final Year Student

Aspiring AI & Full Stack Developer
