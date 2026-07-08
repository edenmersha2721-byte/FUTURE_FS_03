# Luxe Beauty Salon & Spa — Frontend

Luxury single-page marketing site + booking flow + customer & admin dashboards.
Built with **React + Vite + Tailwind CSS**, React Router, Axios, Framer Motion, React Hook Form, Recharts, and Leaflet (OpenStreetMap).

## Requirements

- Node.js 18+
- The backend API running (see `../Backend`)

## Setup

```bash
cd Frontend
npm install
npm run dev        # http://localhost:5173
```

In development, Vite proxies `/api` and `/uploads` to the backend at `http://localhost:5055`
(see `vite.config.js`). No env var needed locally.

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

## Structure

```
src/
  api/          axios client + endpoint modules
  context/      AuthContext (JWT session)
  components/
    common/     Logo, Loader, Reveal, Modal, ServiceCard, DashboardShell, ProtectedRoute, ...
    sections/   Hero, Services, About, Promotions, Gallery, Testimonials, Contact
  layouts/      PublicLayout, Navbar, Footer
  pages/
    LandingPage.jsx        one continuous full-screen-section site
    BookingPage.jsx        multi-step booking flow
    auth/                  Login, Register
    customer/              Dashboard, Appointments, Reviews, Profile, Settings
    admin/                 Overview, Services, Categories, Appointments,
                           Customers, Gallery, Promotions, Reviews, Messages
  utils/        formatting helpers (currency, date, time, status)
```

## Routes

| Path | Access |
|------|--------|
| `/` | public — the full one-page site |
| `/login`, `/register` | public |
| `/book` | customer (login required) |
| `/dashboard/*` | customer |
| `/admin/*` | admin |

## Deployment (Vercel)

1. Import the repo, set the project root to `Frontend`.
2. Add env var `VITE_API_URL=https://<your-render-api>.onrender.com/api`.
3. `vercel.json` handles SPA rewrites.
4. On the backend, set `CLIENT_URL` to your Vercel origin (for CORS).
