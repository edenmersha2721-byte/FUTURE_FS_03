# Luxe Beauty Salon & Spa — Backend API

REST API for the Luxe Salon platform. Built with **Node.js + Express + PostgreSQL**, JWT auth, bcrypt password hashing, and multer image uploads.

## Requirements

- Node.js 18+
- PostgreSQL 14+

## Setup

```bash
cd Backend
npm install
cp .env.example .env      # then edit DB credentials + JWT secret
```

Create the database (once):

```sql
CREATE DATABASE beauty_salon_db;
```

Apply the schema and seed demo data:

```bash
npm run db:migrate    # creates all tables
npm run db:seed       # seeds categories, services, gallery, promos, admin + demo customer
npm run db:reset      # migrate + seed in one step
```

Run the server:

```bash
npm run dev           # auto-reload (node --watch)
npm start             # production
```

API runs at `http://localhost:5055` (configurable via `PORT`).

## Demo accounts (created by seed)

| Role     | Email                    | Password      |
|----------|--------------------------|---------------|
| Admin    | admin@luxesalon.com      | Admin@123     |
| Customer | customer@luxesalon.com   | Customer@123  |

## Project structure

```
src/
  config/      env + PostgreSQL pool (with DATE/NUMERIC type parsers)
  db/          schema.sql, migrate.js, seed.js
  middleware/  auth (protect/requireAdmin), errorHandler, upload (multer)
  controllers/ business logic per resource
  routes/      REST route definitions
  utils/       ApiError, asyncHandler, token, validation helpers
  app.js       express app (CORS, static /uploads, routes, error handling)
  server.js    boot + DB connectivity check
```

## API overview

All responses: `{ success, data | message, ... }`. Protected routes need `Authorization: Bearer <token>`.

| Group | Endpoint | Access |
|-------|----------|--------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile`, `PUT /api/auth/password` | public / self |
| Services | `GET /api/services`, `GET /api/services/:id` · `POST/PUT/DELETE` | public read / admin write |
| Categories | `GET /api/categories` · `POST/PUT/DELETE` | public read / admin write |
| Appointments | `POST /api/appointments`, `GET /api/appointments/mine`, `PUT /api/appointments/:id/cancel` (customer); `GET /api/appointments`, `PUT /api/appointments/:id/status` (admin) | auth |
| Reviews | `GET /api/reviews?featured=true`, `POST`, `GET /mine`, `DELETE` · `GET /all`, `PUT /:id` | public/customer/admin |
| Gallery | `GET /api/gallery` · `POST` (multipart) `DELETE` | public / admin |
| Promotions | `GET /api/promotions` · `POST/PUT/DELETE` | public / admin |
| Contact | `POST /api/contact` · `GET`, `PUT /:id/read`, `DELETE` | public / admin |
| Customers | `GET /api/customers`, `GET /:id`, `PUT /:id/status` | admin |
| Dashboard | `GET /api/dashboard/stats` | admin |
| Upload | `POST /api/upload` (multipart `image`) | admin |

## Deployment (Render)

`render.yaml` is a Blueprint that provisions the web service + a free PostgreSQL database.
After first deploy, run migrate + seed once from the Render Shell:

```bash
npm run db:reset
```

Set `CLIENT_URL` to your deployed frontend origin so CORS allows it.
