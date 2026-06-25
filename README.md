# Serenova — Full-Stack Emotional Wellness App

A beautiful, animated mental wellness app with AI-powered emotion analysis.

## ✨ Features

**Visual Design**
- Soft gradient backgrounds (#EEF3FF → #F8F5FF)
- Glassmorphism cards with blur and shadows
- Poppins font with clean typography hierarchy
- Micro-animations (200-300ms) with reduced motion support
- Primary accent: #6C63FF, Warning: #FF9F9F

**Animations (Framer Motion)**
- Staggered card entrances with fade + slide
- Breathing pulse on mic button
- Smooth mood slider with bounce feedback
- Gradient progress bar with animated thumb
- Tab switching with underline slide
- Respects `prefers-reduced-motion`

**Pages & Routes**
- `/auth` — Login/signup with Firebase Auth ready
- `/home` — Daily check-in with animated greeting
- `/check-in/text` — Text input with prompt chips
- `/check-in/voice` — Voice recording with waveform rings
- `/results/:sessionId` — Emotion analysis with visual feedback
- `/insights` — Trends chart + journal history
- `/activities` — Coping tools library
- `/support` — Crisis resources
- `/settings` — Theme, notifications, privacy

**Tech Stack**
- Frontend: React 18 + TypeScript, Vite, Tailwind CSS, Framer Motion
- Backend: FastAPI (Python) with stubbed AI endpoints
- AI (ready to integrate): Hugging Face distilbert, Librosa + PyTorch
- DB: MongoDB Atlas (environment-configured)
- Auth: Firebase Authentication (ready)

## 🚀 Quick Start

### Frontend
```powershell
cd frontend
npm install
npm run dev
```
Visit http://localhost:3000

### Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API at http://localhost:8000

## 📦 What's Included

**Reusable Components**
- `<AnimatedCard>` — Glassmorphic card with entrance animation
- `<PrimaryButton>` — Animated button with variants
- `<MoodSlider>` — Interactive emoji mood picker
- `<MicButton>` — Pulsing mic with recording rings
- `<GradientProgressBar>` — Emotion intensity visualizer

**Design Tokens (CSS vars)**
- `--radius-xl: 24px` — Corner radius
- `--anim-fast: 200ms` — Animation duration
- `--easing-standard: cubic-bezier(0.25, 0.8, 0.25, 1)`
- `--color-primary`, `--color-warning`, `--gradient-bg`, `--shadow-md`

## 🎨 Animation Principles

- Duration: 200-300ms for interactions, 500ms for page transitions
- Easing: cubic-bezier(0.25, 0.8, 0.25, 1) for standard, bounce for playful
- Micro-interactions only: button taps, card hovers, smooth slides
- Accessibility: auto-disables animations with `prefers-reduced-motion`

## 🔧 Next Steps

1. **Install dependencies**: Run `npm install` in `frontend/`
2. **Firebase Auth**: Add your Firebase config to integrate login
3. **MongoDB**: Set `MONGO_URI` in `backend/.env` for persistence
4. **AI Models**: Replace stubbed analysis with real Hugging Face + PyTorch inference
5. **Deploy**: Use Render free tier for backend, Vercel/Netlify for frontend

## 📝 Configuration

Create `backend/.env`:
```
MONGO_URI=mongodb+srv://...
FIREBASE_CONFIG_JSON={}
```

## 🎯 Implementation Notes

- All animations use `framer-motion` with `useReducedMotion()` hook
- Tailwind configured with custom design tokens
- API endpoints return mock data (ready for model integration)
- Glassmorphism via `backdrop-filter: blur(10px)`

---

Built with care for mental wellness 💜
