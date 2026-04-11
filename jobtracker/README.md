# JobTracker AI

AI-powered job application tracker with Kanban board. Paste a job description → AI auto-fills all details + generates tailored resume bullet points.

##  Features
- Kanban board with drag & drop (Applied → Phone Screen → Interview → Offer → Rejected)
- AI parses job descriptions — extracts company, role, skills, location, seniority
- AI generates 3–5 role-specific resume bullet points (with copy button)
- JWT auth — stays logged in after refresh
- Full CRUD — create, view, edit, delete applications

##  Tech Stack
- Frontend: React 18, TypeScript, Tailwind CSS, Vite, TanStack Query, Zustand, dnd-kit
- Backend: Node.js, Express, TypeScript
- Database: MongoDB + Mongoose
- Auth:JWT + bcrypt
- AI: OpenAI API (GPT-3.5-turbo, JSON mode)

##  Prerequisites
- Node.js v18+ → https://nodejs.org
- MongoDB Atlas free account → https://mongodb.com/atlas
- OpenAI API key → https://platform.openai.com

##  How to Run

### 1. Clone the repo
bash
git clone https://github.com/YOUR_USERNAME/jobtracker.git
cd jobtracker


### 2. Backend setup
bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see below)
npm run dev

You should see:

✅ Connected to MongoDB
🚀 Server running on http://localhost:5000


### 3. Frontend setup (new terminal)
bash
cd frontend
npm install
npm run dev

Open http://localhost:5173

##  Environment Variables

Create `backend/.env` with these values:

 Variable : Description 

PORT =5000 
MONGODB_URI = Your MongoDB Atlas connection string 
JWT_SECRET = Any random long string 
JWT_EXPIRES_IN = 7d
OPENAI_API_KEY = Your OpenAI API key 
CLIENT_URL = http://localhost:5173

Example:
env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jobtracker?appName=Cluster0
JWT_SECRET=anyrandomlongstring123abc
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-your-key-here
CLIENT_URL=http://localhost:5173


##  Architecture Decisions

- AI in service layer — all OpenAI calls in `backend/src/services/aiService.ts`, not in route handlers
- JSON mode — OpenAI's `response_format: json_object` for reliable structured output
- Optimistic drag-and-drop— local state used during drag, API called only on drop
- TanStack Query— handles caching and invalidation; Zustand only for auth state
- Single API call— JD parsing + resume suggestions in one request to keep UX simple
