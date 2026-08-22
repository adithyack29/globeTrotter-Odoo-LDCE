# Globe Trotter 🌍 - Smart Full-Stack Travel Intelligence & Planner

Globe Trotter is a full-stack, production-ready travel planning web application featuring algorithmic itinerary optimization, real-time multi-currency support, smart contextual packing checklists, platform admin analytics, and printable PDF exports.

---

## 🌟 Key Features

1. **Light & Modern UI/UX Design System**:
   - Clean `#FFFFFF` backgrounds, `#F8FAFC` slate-50 section contrast, crisp borders, and high-contrast typography.
   - Floating Pill Tabs for **Timeline View**, **Day-Wise Agenda**, **Calendar Grid**, **Smart Checklist**, and **Budget Analytics**.

2. **Smart Itinerary Optimizer Algorithm**:
   - Deterministic schedule-packing algorithm sequencing activities logically: Morning (Sightseeing/Walking) → Afternoon (Culture/Food) → Evening (Leisure/Nightlife).
   - Automatically calculates 30-minute transition buffers and assigns start times.

3. **Dynamic Multi-Currency Support**:
   - Persistent currency selector (USD $, EUR €, GBP £, INR ₹, JPY ¥, CAD CA$).
   - Real-time conversion across target budgets, stay/transit estimates, and activity costs based on database exchange rates.

4. **Smart Contextual Packing Checklist**:
   - Automatically generates personalized packing items based on trip activity categories (Adventure, Culture, Food, Sightseeing).
   - Saved persistently in PostgreSQL/SQLite database with completion progress bars and custom item adders.

5. **Platform Admin Analytics Dashboard (`/admin`)**:
   - Telemetry overview: Total Trips, Users, Avg Budget per Trip, Total Cities & Activities.
   - Recharts visual charts: Top 5 Booked Destinations Horizontal Bar Chart & Expense Category Distribution Pie Chart.
   - Searchable public shared itineraries table.

6. **Print & PDF Export**:
   - Dedicated modal rendering printer-friendly A4 format with day-by-day tables, emergency contact info, and travel notes.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide React, Recharts
- **Backend**: Node.js, Express, Prisma ORM, JWT Authentication, bcrypt
- **Database**: PostgreSQL / SQLite (via Prisma)
- **Validation**: Zod schemas for client forms & server endpoints

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Database Setup & Seed
```bash
npm run db:seed
```

### 3. Run Application
```bash
npm run dev
```

- Frontend Dev Server: `http://localhost:3005`
- Backend API Server: `http://localhost:5001`

---

## 👤 Demo Credentials

- **Email**: `elena@globetrotter.com`
- **Password**: `Password123!`
