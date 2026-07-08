# Luxe Beauty Salon & Spa — Full-Stack Management System

A production-style full-stack web app for a local beauty salon & spa: an elegant one-page
marketing site, online appointment booking, a customer dashboard, and a complete admin
management dashboard.

| Layer | Stack |
|-------|-------|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios, Framer Motion, React Hook Form, Recharts, Leaflet |
| Backend | Node.js, Express, PostgreSQL (`pg`), JWT, bcrypt, multer |
| Deploy | Frontend → Vercel · Backend + DB → Render |

## Features

**Public (one continuous full-screen-section page):** hero slider, featured services with
category filters, about + stats, seasonal promotions, filterable gallery with lightbox,
testimonials, and a contact section with an OpenStreetMap map (4 Kilo, Bashawelde Condominium,
Addis Ababa) + contact form.

**Customer:** register/login, browse & book services (multi-step flow), appointment history
with cancel, upcoming appointments, submit/manage reviews, edit profile, change password.

**Admin:** dashboard with live stats + charts, and full CRUD for services, categories,
appointments (confirm/complete/cancel), customers (view history / deactivate), gallery
(upload), promotions, reviews (feature/approve/delete), and contact messages.

**Auth:** JWT with bcrypt-hashed passwords, role-based (customer / admin) route protection
on both client and server.

## Quick start

```bash
# 1. Backend
cd Backend
npm install
cp .env.example .env          # set DB credentials
npm run db:reset              # create schema + seed demo data
npm run dev                   # http://localhost:5055

# 2. Frontend (new terminal)
cd Frontend
npm install
npm run dev                   # http://localhost:5173
```

Open http://localhost:5173.

### Demo accounts

| Role     | Email                    | Password      |
|----------|--------------------------|---------------|
| Admin    | admin@luxesalon.com      | Admin@123     |
| Customer | customer@luxesalon.com   | Customer@123  |

See [`Backend/README.md`](Backend/README.md) and [`Frontend/README.md`](Frontend/README.md)
for details and deployment instructions.

## Booking rules

- Booking requires login.
- Appointments cannot be booked in the past.
- New bookings default to **Pending**; only an admin can confirm/complete/cancel.
- All business data (services, categories, prices, gallery, promotions) is stored in the
  database and managed from the admin dashboard — nothing is hardcoded.
```
