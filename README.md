# Cafe on Wheels — Full-Stack Artisanal Caravan Platform

An artisanal moving cafe booking platform where customers book curated caravan experiences (Proposal & Sunset Romance, Golden Hour Birthday, Executive Coastal Retreat, Comfort Drive & Sunset Cruise), customize espresso menus, route waypoints, and chalkboard signage, and experience real-time GPS tracking via WebSockets.

---

## ☕ Visual & Design System Truth

The UI matches the Stitch design specifications (**Artisanal Mobile Rostrum / Velvet Noir**):
- **Typography**: Plus Jakarta Sans & Material Symbols Outlined
- **Palette**: Warm oat background (`#fdf9f4`), terracotta accent (`#a73412` / `#e8623d`), sage teal (`#35675a`), deep charcoal (`#1c1c19`)
- **Interactive 360° Interior Tour**: Custom canvas/CSS 360-degree panorama viewer with bearing coordinate readout, zoom controls, and feature hotspots.

---

## 🚀 Architecture

```
[React + Vite Frontend (Port 5173)]
   ├── Customer App (Home, Explore, Theme Detail + 360° Viewer, Multi-Step Booking Flow, Checkout, Dashboard)
   ├── Live Ride Tracking Screen (WebSocket client + interactive Leaflet map)
   ├── Driver Simulation Console (pushes real-time GPS coordinates)
   └── Admin Dashboard (Stats, Vehicles, Themes, Menu Items, Bookings, Pricing & Offers)
          │
          │ REST API (JSON) + WebSocket (/ws/ride/{booking_id})
          ▼
[FastAPI Backend (Port 8000)]
   ├── JWT Auth (Customer, Admin, Driver roles)
   ├── Pricing Engine (Base price + ₹8/km after 10km + add-ons + menu + taxes)
   ├── PayU Payment Gateway (Hash generation & Webhook verification)
   ├── WebSocket Connection Manager (Driver telemetry -> Customer subscribers)
   ├── AI / Rule-Based Recommendation Engine (Weather + time of day + occasions)
   └── Motor / MongoDB Async Database Layer (with auto-resilient fallback)
```

---

## 💰 Indian Rupee (₹) Pricing Engine

Pricing is calculated per the business rules:
- **Base Package**: Covers complete ride setup + first **10 km** (e.g. ₹4,999 for Proposal & Sunset Romance, ₹4,499 for Birthday Celebration).
- **Extra Distance**: **₹8 / km** for all travel beyond 10 km.
- **Formula**:
  $$\text{Total} = \text{Base Price} + \max(0, \text{Distance} - 10) \times 8 + \sum(\text{Add-Ons}) + \sum(\text{Menu}) - \text{Discount} + 5\%\text{ GST}$$
- Centralized `formatCurrencyINR()` formats all values using standard Indian digit grouping (e.g. ₹12,499).

---

## 💳 PayU (India) Payment Gateway

- **Hash Sequence**: `sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)`
- **Hosted Redirect**: Generates standard PayU parameter payload for secure external checkout.
- **Sandbox Simulation**: Includes an instantaneous sandbox authorization mode so demo users and evaluators can verify confirmed bookings and transition directly to live tracking without test card credentials.

---

## 📡 Live WebSocket Ride Tracking & Driver Simulator

- **WebSocket Route**: `/ws/ride/{booking_id}`
- **Subscribers**: Customers receive live `{ lat, lng, speed_kmh, status, progress_percent, eta_minutes }`.
- **Driver Push**: Drivers send GPS telemetry either over the WebSocket or via `POST /api/rides/driver/location`.
- **Built-in Driver Console**: Click **"Open Driver Simulation Console"** on the tracking screen to advance along the Mumbai coastline route (Gateway of India -> Marine Drive -> Worli Sea Face) and watch the customer map update in real time.

---

## 🛠️ Quick Start

### 1. Start Backend (FastAPI)
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/api/health`

### 2. Start Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173/`

### 3. Or Run with Docker Compose
```bash
docker compose up --build
```

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Customer** (Sophia Vance) | `sophia@example.com` | `Customer@123` |
| **Admin** (Artisan Owner) | `admin@cafeonwheels.com` | `Admin@123` |
| **Driver** (Kabir Sharma) | `driver@cafeonwheels.com` | `Driver@123` |

*Quick switch between personas directly using the top-right profile avatar in the navigation bar!*

---

## 🧪 Verification & Testing

Run the automated integration test suite:
```bash
cd backend
python verify_app.py
```
This automatically verifies:
1. Health check & currency metadata
2. Themes list with ₹ pricing and 10 km inclusion + ₹8/km rate
3. Live pricing calculation with distance surcharge, add-ons, menu items, and promo discount
4. JWT customer & admin authentication
5. Aggregated admin analytics & revenue pipeline
6. Rule-based AI recommendations
7. Live GPS telemetry push and WebSocket state propagation
8. Frontend server 200 OK delivery
