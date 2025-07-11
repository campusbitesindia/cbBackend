# 📦 CampusBites – Fullstack Monorepo (Backend + Frontend)

**CampusBites** is an end-to-end food-ordering platform tailored for university campuses. The platform delivers a seamless experience across three user roles:

- 🎓 **Student**: Browse menus, manage cart, place orders, and complete payments.
- 🏪 **Canteen / Store**: Manage menus, track incoming orders, and update order statuses.
- 🛠️ **Admin**: Onboard campuses and canteens, oversee analytics, and manage escalations.

---

## 📚 Table of Contents

- [✨ Features](#-features)  
- [🛠️ Tech Stack](#-tech-stack)  
- [📁 Project Structure](#-project-structure)  
- [⚡ Quick Start](#-quick-start)  
- [🔐 Environment Variables](#-environment-variables)  
- [📜 Available NPM Scripts](#-available-npm-scripts)  
- [🍽️ Seeding & Sample Data](#-seeding--sample-data)  
- [📦 Dependency Reference](#-dependency-reference)  
- [🚀 Deployment Notes](#-deployment-notes)  
- [🤝 Contributing](#-contributing)  
- [📄 License](#-license)

---

## ✨ Features

- 🔐 JWT-based authentication with Google OAuth2
- 🛡️ Role-based access control (Student / Canteen / Admin)
- 🧾 CRUD for campuses, canteens, menus, items, orders & reviews
- ☁️ Cloudinary image uploads via Multer middleware
- 🔔 Real-time order status updates with notifications
- 📧 Email OTP verification & password reset (via Nodemailer)
- 🎨 Responsive UI with dark/light theme toggle and landing animations
- 🛒 Cart and checkout flow with mock payment integration
- 📊 Dashboard analytics powered by Chart.js & Recharts

---

## 🛠️ Tech Stack

### 🔧 Backend (API)
- Node.js 20 (LTS)
- Express 5
- MongoDB 7 (Mongoose ODM)
- Passport.js (Google OAuth2)
- Cloudinary (media storage)
- Nodemailer (SMTP e-mail)
- JSON Web Tokens (JWT)

### 🖥️ Frontend (Client)
- Next.js 14 (App Router)
- React 18 + TypeScript 5
- Radix UI Primitives + Tailwind CSS 3
- Framer Motion (animations)
- Chart.js 4 & Recharts 2
- Axios, Zod for runtime validation

### 🧰 Dev Tooling
- ESLint, Prettier
- Nodemon, ts-node, cross-env
- pnpm / npm support

---

## 📁 Project Structure

```
CampusBites/
├── backend/             # Express REST API
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── utils/
└── frontend/            # Next.js 14 app
    ├── app/
    ├── components/
    ├── context/
    ├── hooks/
    ├── lib/
    └── styles/
```

---

## ⚡ Quick Start

### 1. Prerequisites

- Node.js ≥ 18 (tested with 20 LTS)
- MongoDB Atlas or local instance
- Cloudinary account
- SMTP credentials (Gmail or similar)

### 2. Clone & Install

```bash
git clone https://github.com/<your-org>/CampusBites.git
cd CampusBites

# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install
```

### 3. Configure Environment Variables

Create the following files and populate with your own secrets:

```
backend/.env
frontend/.env.local
```

> ⚠️ Never commit real credentials or secrets.

### 4. Seed Sample Data (optional)

```bash
# From /backend
npm run seed:canteens  # seeds sample canteens and menus
```

### 5. Run Locally

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev  # runs on http://localhost:3000
```

---

## 🔐 Environment Variables

| Variable | Purpose | Used By |
|----------|---------|---------|
| `PORT` | Backend API Port | Backend |
| `DB_URI` | MongoDB connection string | Backend |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth2 credentials | Backend & Frontend |
| `JWT_SECRET` | JWT signing | Backend |
| `CLOUD_*` | Cloudinary configuration | Backend |
| `EMAIL_*` | Nodemailer SMTP config | Backend |
| `FRONTEND_HOST` | CORS + email links | Backend |
| `NEXT_PUBLIC_API_BASE_URL` | Axios base URL | Frontend |

---

## 📜 Available NPM Scripts

### Backend (`/backend/package.json`)

```bash
npm run dev       # Run with nodemon
npm start         # Production mode
```

### Frontend (`/frontend/package.json`)

```bash
npm run dev       # Next.js dev mode
npm run build     # Production build
npm start         # Run built app
npm run lint      # Lint code
```

---

## 🍽️ Seeding & Sample Data

The script `backend/seed-canteens.js` seeds demo data for canteens and menu items.

```bash
# Be sure DB_URI points to a test database
npm run seed:canteens
```

---

## 📦 Dependency Reference

### Backend

| Package | Version |
|---------|---------|
| bcryptjs | 3.0.2 |
| cloudinary | 2.7.0 |
| cookie-parser | 1.4.7 |
| cors | 2.8.5 |
| crypto | 1.0.1 |
| dotenv | 17.0.1 |
| express | 5.1.0 |
| jsonwebtoken | 9.0.2 |
| mongoose | 8.16.1 |
| multer | 2.0.1 |
| nodemailer | 7.0.4 |
| passport | 0.7.0 |
| passport-google-oauth20 | 2.0.0 |
| nodemon (dev) | 3.1.10 |

### Frontend (Runtime)

| Package | Version |
|---------|---------|
| next | 14.2.0 |
| react | 18.2.0 |
| typescript | 5.8.3 |
| tailwindcss | 3.4.17 |
| axios | 1.10.0 |
| zod | latest |
| framer-motion | 12.23.0 |
| chart.js | 4.5.0 |
| recharts | 2.15.0 |
| radix-ui | 1.x - 2.x |
| lucide-react | 0.454.0 |
| ...and many more (see package.json)

> Tip: Run `npm outdated` or `pnpm up -i` to keep libraries up-to-date.

---

## 🚀 Deployment Notes

- Configure all required `.env` variables on your hosting platform (e.g., Render, Vercel).
- For frontend:
  ```bash
  cd frontend
  npm run build
  npm start
  ```
- Backend can be deployed via Dockerfile, Procfile, or hosted behind the same domain using a reverse proxy.
- Ensure correct CORS setup via `FRONTEND_HOST`.

---

## 🤝 Contributing

1. Fork the repo and create a feature branch:
   ```bash
   git checkout -b feat/your-feature
   ```

2. Follow conventional commits for clear commit messages.
3. Run `npm run lint` in both frontend and backend before pushing.
4. Submit a PR with a detailed description and screenshots (if UI-related).
5. At least one maintainer review is required for merging.

---

## 📄 License

MIT © 2024 CampusBites Team
