# 🌿 AyurCare — Ayurvedic Healthcare Management Platform

A full-stack healthcare management system designed specifically for **Ayurvedic clinics and hospitals**. Built with a premium dark-mode UI, role-based dashboards, and comprehensive therapy management features.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Email Configuration](#email-configuration)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Data Models](#data-models)
- [Key Features Deep Dive](#key-features-deep-dive)
- [Deployment](#deployment)
- [Author](#author)

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based auth with access + refresh tokens (httpOnly cookies)
- Role-based access control (Patient, Doctor, Admin)
- Password reset via email with secure token (1-hour expiry)
- Doctor account approval workflow (admin verification required)
- Rate limiting on auth endpoints

### 👤 Patient Portal
- **Appointments** — Book, reschedule, and cancel therapy sessions
- **Therapy Progress** — Track ongoing treatments and session history
- **Treatment Plans** — View doctor-prescribed Ayurvedic treatment plans
- **Medical Records** — Access prescriptions, lab results, and vitals
- **Pre/Post Care** — View therapy preparation and aftercare instructions
- **Feedback** — Submit session feedback within a 2-hour window
- **Profile** — Manage personal info, health details, and allergies

### 👨‍⚕️ Doctor Dashboard
- **Patient Management** — View and manage assigned patients
- **Therapy Sessions** — Schedule, start, complete, and mark no-shows
- **Treatment Plans** — Create plans with weekly recurring schedules
- **Calendar** — Weekly appointment overview
- **Profile** — Professional info, Ayurvedic specialization, availability slots
- **Verification Badge** — Shows admin approval status on profile

### 🛡️ Admin Panel
- **Analytics** — Platform-wide statistics and charts
- **Doctors** — Approve/reject registrations, manage doctor accounts
- **Patients** — View all patients and their records
- **Appointments** — Oversee all bookings across the platform
- **Therapy Types** — Manage Ayurvedic therapy categories
- **Therapy Rooms** — Room allocation and availability
- **Inventory** — Ayurvedic medicine stock management with low-stock alerts
- **Departments** — Manage hospital departments
- **Reports** — Generate and export platform reports
- **Settings** — Platform configuration

### 💬 Messaging System
- Real-time-like messaging between doctors and patients (10s polling)
- Conversation threads tied to appointments
- Read receipts, date separators, unread badge counts
- WhatsApp-style chat bubbles with emerald/white design

### 🔔 Notification System
- In-app notifications with bell icon and unread badge (30s polling)
- Email notifications for key events (appointments, treatment plans, etc.)
- 90-day auto-expiry (TTL index)
- Notification triggers: bookings, cancellations, reschedules, treatment plans, low stock

### ⏰ Session Auto-Complete
- Background scheduler runs every 5 minutes
- Auto-completes sessions 2 hours past expected end time
- Patient feedback window: 2 hours after session ends
- No-show marking is manual (doctor-only action)

### 🌿 Ayurvedic Specializations
10 traditional Ayurvedic specialization branches with info tooltips:

| Key | Specialization | Description |
|-----|---------------|-------------|
| `kayachikitsa` | Kayachikitsa | Internal Medicine |
| `panchakarma` | Panchakarma | Detox & Purification |
| `shalya_tantra` | Shalya Tantra | Ayurvedic Surgery |
| `shalakya_tantra` | Shalakya Tantra | ENT & Ophthalmology |
| `kaumarabhritya` | Kaumarabhritya | Pediatrics & Gynecology |
| `agada_tantra` | Agada Tantra | Toxicology |
| `rasayana` | Rasayana | Rejuvenation & Anti-aging |
| `vajikarana` | Vajikarana | Reproductive Medicine |
| `dravyaguna` | Dravyaguna | Pharmacology |
| `manas_roga` | Manas Roga | Psychiatry & Mental Health |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **Vite 7** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **Redux Toolkit** | Global state management |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client |
| **React Icons** | Icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime |
| **Express 4** | REST API framework |
| **MongoDB** | Database |
| **Mongoose 8** | ODM |
| **JWT** | Authentication |
| **Nodemailer** | Email delivery |
| **bcryptjs** | Password hashing |
| **express-validator** | Request validation |
| **express-rate-limit** | API rate limiting |
| **Morgan** | HTTP request logging |

---

## 📁 Project Structure

```
AyurCare/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Modal, Button, Input, Toast
│   │   │   ├── dashboard/           # DataTable, StatusBadge, Charts
│   │   │   ├── doctor/              # TreatmentPlanModal
│   │   │   ├── layout/              # DashboardLayout, Sidebar, SessionFollowUp
│   │   │   └── patient/             # BookTherapyModal
│   │   ├── hooks/                   # useToast
│   │   ├── pages/
│   │   │   ├── auth/                # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── admin/               # Analytics, Doctors, Patients, Inventory, etc.
│   │   │   ├── doctor/              # Profile, Calendar, Patients, TherapySessions
│   │   │   ├── patient/             # Appointments, MedicalRecords, TherapyPlan, etc.
│   │   │   ├── shared/              # Messages
│   │   │   └── Landing.jsx          # Public landing page
│   │   ├── redux/slices/            # authSlice
│   │   ├── services/                # api.js (Axios instance)
│   │   ├── utils/                   # formatters, specializations
│   │   └── App.jsx                  # Routes
│   └── .env                         # VITE_API_URL
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── config/                  # Database connection
│   │   ├── controllers/             # Route handlers
│   │   ├── middleware/              # auth, errorHandler, validate
│   │   ├── models/                  # 19 Mongoose schemas
│   │   ├── routes/                  # 12 route files
│   │   ├── scripts/                 # Seed scripts
│   │   ├── utils/                   # notificationService, sessionAutoComplete
│   │   └── server.js                # Entry point
│   └── .env                         # Server configuration
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18
- **MongoDB** (local or Atlas cluster)
- **npm** or **yarn**

### 1. Clone the repository
```bash
git clone <repo-url>
cd AyurCare
```

### 2. Install dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure environment variables
See [Environment Variables](#environment-variables) below.

### 4. Start development servers
```bash
# Terminal 1 — Backend (port 3000)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

### 5. Open the app
Navigate to `http://localhost:5173`

---

## 🔧 Environment Variables

### Server (`server/.env`)

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ayurcare

# JWT Configuration
JWT_ACCESS_SECRET=<random-64-char-hex>
JWT_REFRESH_SECRET=<random-64-char-hex>

# Client Configuration
CLIENT_URL=http://localhost:5173

# SMTP / Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="AyurCare" <your-email@gmail.com>
```

> **Generate JWT secrets:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 📧 Email Configuration

AyurCare uses **Nodemailer** with SMTP to send emails for:
- Password reset links
- Appointment notifications
- Treatment plan updates
- Low stock alerts

### Gmail Setup
1. Enable **2-Step Verification** on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an App Password for "Mail"
4. Use the 16-character code as `SMTP_PASS` (remove spaces)

> **⚠️ Important:** Do NOT use your regular Gmail password — it won't work. Gmail requires App Passwords for SMTP.

### Troubleshooting Email Delivery
- **Emails not going to some addresses:** Check server console for `Email send FAILED to <address>` — Gmail may reject some domains. Check spam folders.
- **SMTP not configured warning:** Ensure all 4 env vars are set: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- **Alternative providers:** You can use any SMTP provider (SendGrid, Mailgun, etc.) by changing `SMTP_HOST` and credentials.

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Register new user |
| `POST` | `/login` | Login with credentials |
| `POST` | `/refresh-token` | Refresh access token |
| `POST` | `/logout` | Logout and clear tokens |
| `POST` | `/forgot-password` | Send password reset email |
| `POST` | `/reset-password/:token` | Reset password with token |
| `GET` | `/me` | Get current user profile |

### Patient (`/api/patient`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/appointments/upcoming` | Get upcoming appointments |
| `GET` | `/appointments/history` | Get past appointments |
| `POST` | `/appointments/book` | Book a new appointment |
| `PATCH` | `/appointments/:id/cancel` | Cancel appointment |
| `POST` | `/appointments/:id/reschedule` | Reschedule appointment |
| `GET` | `/medical-records` | Get medical records |
| `GET` | `/profile` | Get patient profile |
| `PATCH` | `/profile` | Update patient profile |

### Doctor (`/api/doctor`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/patients` | Get assigned patients |
| `GET` | `/appointments` | Get doctor's appointments |
| `PATCH` | `/profile/personal` | Update personal info |
| `PATCH` | `/profile/professional` | Update professional info |
| `PATCH` | `/profile/availability` | Update availability slots |
| `POST` | `/profile/change-password` | Change password |

### Therapy Sessions (`/api/therapy-sessions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/book` | Book therapy session |
| `PATCH` | `/:id/status` | Update session status |
| `GET` | `/pending-feedback` | Get sessions awaiting patient feedback |
| `GET` | `/overdue` | Get overdue sessions (doctor) |

### Treatment Plans (`/api/treatment-plans`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/` | Create treatment plan |
| `GET` | `/patient/:id` | Get patient's plan |
| `PATCH` | `/:id` | Update plan |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard` | Get dashboard analytics |
| `GET` | `/doctors` | Get all doctors |
| `PATCH` | `/doctors/:id/approve` | Approve doctor |
| `GET` | `/patients` | Get all patients |
| `GET` | `/appointments` | Get all appointments |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get user notifications |
| `PATCH` | `/:id/read` | Mark notification as read |
| `PATCH` | `/read-all` | Mark all as read |

---

## 👥 User Roles

### Patient
- Self-registration
- Can book therapy sessions, view records, submit feedback
- Access to treatment plans and therapy progress

### Doctor
- Self-registration → **requires admin approval** before accessing features
- Can manage patients, sessions, treatment plans
- Ayurvedic specialization with 10 traditional branches
- Profile shows verification badge (Verified / Pending Verification)

### Admin
- Self-registration (for development; restrict in production)
- Full platform management: doctors, patients, inventory, analytics
- Approves/rejects doctor registrations
- Manages therapy types, rooms, departments

---

## 📊 Data Models

| Model | Description |
|-------|-------------|
| `User` | All users (patient/doctor/admin) with role-specific fields |
| `Appointment` | General consultations |
| `TherapySession` | Ayurvedic therapy sessions with status tracking |
| `TherapyType` | Types of Ayurvedic therapies offered |
| `TherapyRoom` | Physical rooms for therapy |
| `TreatmentPlan` | Doctor-prescribed plans with recurring session schedules |
| `Conversation` | Messaging threads (tied to appointments) |
| `Message` | Individual chat messages |
| `Notification` | In-app + email notifications (90-day TTL) |
| `AyurvedicMedicine` | Inventory of Ayurvedic medicines |
| `Medication` | Prescribed medications |
| `VitalSign` | Patient vital recordings |
| `LabResult` | Lab test results |
| `HealthScore` | Patient health scores |
| `DietPlan` | Ayurvedic diet plans |
| `Allergy` | Patient allergies |
| `AILog` | AI-generated recommendations log |
| `DoctorStatus` | Doctor online/availability status |
| `Waitlist` | Appointment waitlist |

---

## 🔑 Key Features Deep Dive

### Session Follow-Up System
- **Auto-complete:** Background job runs every 5 minutes. Sessions 2+ hours past expected end are auto-completed.
- **Feedback window:** Patients have 2 hours after session completion to submit feedback.
- **No-show:** Strictly manual — only the doctor can mark a patient as no-show.
- **UI:** `SessionFollowUp` component shows role-aware popups (patient: feedback form, doctor: overdue banner).

### Notification Pipeline
```
Event Trigger → createNotification() → In-App Notification (DB)
                                     → Email (if SMTP configured)
```
Supported triggers: appointment booked/cancelled/rescheduled, treatment plan created/updated, session scheduled/completed, doctor registered, low stock alert.

### Design System
- **Theme:** Dark stone (950/900) backgrounds, emerald (500/600) accents
- **Typography:** System font stack with extrabold headings
- **Components:** Rounded-3xl cards, emerald-bordered buttons, stone pills
- **Auth pages:** Split-screen layout (branding left, form right)
- **Dashboard:** Sidebar navigation with role-specific menu items

---

## 🚢 Deployment

### Frontend (Vercel / Netlify)
```bash
cd client
npm run build    # Outputs to dist/
```
Set `VITE_API_URL` to your production API URL.

### Backend (Railway / Render / VPS)
```bash
cd server
npm start
```

> **⚠️ Note:** The session auto-complete scheduler uses `setInterval` and is disabled on Vercel (`!process.env.VERCEL`). For serverless deployment, migrate to a **Cron Job** (e.g., Vercel Cron, Railway Cron).

### Environment
- Set all environment variables in your hosting platform
- Ensure MongoDB Atlas allows connections from your server's IP
- Configure CORS in `server.js` if frontend and backend are on different domains

---

## 👨‍💻 Author

**Muhammed Hisham A**

---

## 📄 License

ISC
