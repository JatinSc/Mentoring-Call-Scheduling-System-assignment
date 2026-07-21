# Mentoring Call Scheduling & Recommendation System

A modern, full-stack web application designed for managing mentoring sessions, weekly availability patterns, AI-driven mentor recommendations, and seamless meeting scheduling. Built with a dark glassmorphic design system using React, Node.js, Express, MongoDB, and Google Gemini AI.

---

## 🌟 Key Features

### 🤖 1. AI-Driven & Rule-Based Mentor Recommendation Engine
- **Intelligent Matching**: Uses Google Gemini AI (`gemini-flash-latest`) to match users with the most suitable mentors based on the session call type (`Resume Revamp`, `Mock Interview`, `Job Market Guidance`), user career goals, target role, skills, and mentor background (company, designation, experience, tags, expertise).
- **Personalized Scoring & Insights**: Displays an intuitive radial SVG match score ring ($0-100\%$) and concise "Why Recommended" match insights for each mentor.
- **Fail-Safe Fallback**: Includes a rule-based scoring engine that automatically takes over if Gemini AI quota limits are reached or API services are unavailable.

### 📅 2. Weekly Availability & Overlap Calculation
- **Template & Exception Architecture**: Efficiently handles recurring weekly availability patterns using `AvailabilityTemplate` and week-specific overrides via `AvailabilityException`.
- **Timezone Support**: Multi-timezone normalization (e.g. UTC, IST / `Asia/Kolkata`, `Europe/Dublin`) using Luxon.
- **Overlap Detection Engine**: Compares weekly calendars of selected Users and Mentors to calculate mutually available call slots in real-time.
- **Direct Slot Scheduling**: Admins can click any common available slot to immediately trigger pre-filled meeting scheduling.

### 🛡️ 3. Multi-Role Authentication & Access Control
- Role-based authentication (`ADMIN`, `MENTOR`, `USER`) powered by JWT tokens.
- Secure password hashing with `bcryptjs`.

### 🎛️ 4. Comprehensive Admin Workspace
- **User Requirements Viewer**: Displays selected user profiles, including career goals, target role, career stage, skills, interests, and bio.
- **Manage Mentor Metadata**: Live editor modal for admins to edit mentor tags, bio descriptions, expertise areas, company, designation, and LinkedIn profiles.
- **Interactive Call Type Selector**: Enhanced custom dropdown (`MqSelect`) with visual icons for selecting session types.
- **Scheduled Meetings Dashboard**: View all booked sessions, inspect participant lists, cancel upcoming meetings, or delete records.

### 🎨 5. Premium Dark Glassmorphic UI
- Built with Vanilla CSS + Tailwind CSS 3.
- Vibrant, soft-tinted tech tag badges (`Node.js`, `React`, `TypeScript`, `Azure`, `Kubernetes`, `Figma`, etc.).
- Custom scrollbars (`mq-scroll`), floating custom select dropdowns (`MqSelect`), and smooth hover micro-interactions.

---

## 📁 Repository Structure

```
Mentoring Call Scheduling System/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route handlers (admin, auth, availability, meetings)
│   │   ├── lib/              # Database connection & env setup
│   │   ├── middleware/       # JWT auth & role validation middleware
│   │   ├── models/           # Mongoose models (User, Meeting, AvailabilityTemplate, AvailabilityException)
│   │   ├── routes/           # Express router endpoints
│   │   ├── scripts/          # Database seed scripts
│   │   ├── services/         # Availability calculation & Gemini AI services
│   │   └── utils/            # Time parsing & timezone helper functions
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/              # API HTTP clients (admin, availability, meetings, auth)
│   │   ├── components/       # UI Components & Admin widgets
│   │   │   ├── admin/        # MentorRecommendations, AvailabilityViewer, ScheduledMeetings, etc.
│   │   │   ├── MqSelect.jsx  # Enhanced custom dropdown component
│   │   │   └── ...
│   │   ├── context/          # AuthContext provider
│   │   ├── pages/            # AdminDashboard, Availability, Login, Register
│   │   └── index.css         # Tailwind directives & global design tokens
│   └── package.json
└── README.md
```

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS 3 (Dark glassmorphism theme)
- **Router**: React Router DOM 6
- **Date & Time Utilities**: Luxon

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 4
- **Database**: MongoDB with Mongoose 8 (Partial Filter Indexing & UUID primary keys)
- **AI Service**: Google Gemini AI (`@google/genai` / REST API)
- **Security**: JWT (`jsonwebtoken`), `bcryptjs`, `cors`

---

## 🔌 API Endpoints Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Login user & issue JWT token |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile |

### Admin Operations (`/api/admin`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/users` | List all registered users |
| `GET` | `/api/admin/mentors` | List all registered mentors |
| `PUT` | `/api/admin/mentors/:id` | Update mentor metadata (tags, bio, expertise, etc.) |
| `POST` | `/api/admin/create-user` | Create new user or mentor account |
| `POST` | `/api/admin/recommendations` | Fetch AI/Rule-based mentor recommendations |
| `GET` | `/api/admin/availability/:userId` | Load weekly availability for user or mentor |
| `GET` | `/api/admin/availability/:userId/overlap` | Check overlapping free time slots |
| `POST` | `/api/admin/meetings` | Schedule a new mentoring session |

### Meetings (`/api/meetings`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/meetings` | List scheduled meetings for admin/user |
| `PATCH` | `/api/meetings/:id/cancel` | Cancel an upcoming meeting |
| `DELETE` | `/api/meetings/:id` | Delete a meeting record |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (Local or MongoDB Atlas)
- Google Gemini API Key (optional for AI recommendations)

### 1. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mentorque
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

Run seed script & start dev server:
```bash
npm run seed:admin
npm run dev
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📄 License
This project is open-source and available under the MIT License.
