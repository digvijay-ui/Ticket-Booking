# EventBooking

EventBooking is a full-stack event ticket booking application. Customers can discover events, reserve seats, and confirm bookings with an in-app wallet. Administrators manage events, seats, bookings, refunds, and reporting from a separate dashboard.

**Event Booking:** [Live link](https://frontend-five-bice-35.vercel.app/)

## Features

- Customer accounts, event discovery, seat selection, and time-limited reservations
- Wallet balance, transaction history, booking checkout, and booking history
- Admin tools for events, seats, bookings, refunds, transactions, and analytics

Wallet top-ups credit the in-app balance directly; no external payment gateway is connected.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | Vue 3, TypeScript, Vite, Vue Router, Pinia, Tailwind CSS, Axios, ApexCharts |
| Backend | Node.js, Express, TypeScript, Mongoose, JWT, bcrypt, Zod |
| Database | MongoDB |

## Run locally

**Requirements:** Node.js 22, npm, and a MongoDB replica set (required for wallet and booking transactions).

1. Create the environment files from the included examples:

   ```bash
   cp -n backend/.env.example backend/.env
   cp -n frontend/.env.example frontend/.env
   ```

2. In `backend/.env`, set `MONGODB_URI` to your replica-set connection string and `JWT_SECRET` to a strong secret. The examples already set the local API port and CORS origin. In `frontend/.env`, use `VITE_API_BASE_URL=http://localhost:5000`.

3. Start the API:

   ```bash
   cd backend
   npm ci
   npm start
   ```

4. In another terminal, start the frontend:

   ```bash
   cd frontend
   npm ci
   npm run dev
   ```

Open [http://localhost:5173](http://localhost:5173). The API runs at `http://localhost:5000`.

## Admin access

For a fresh database, create the first admin with `POST /api/auth/admin-signup` using a name, email, and password. This endpoint accepts a signup only while no admin account exists. Then sign in at [http://localhost:5173/admin/login](http://localhost:5173/admin/login). Existing admins can create additional admin accounts in the dashboard.

## API reference

See [backend/docs/API_DOCUMENTATION.md](backend/docs/API_DOCUMENTATION.md) for endpoints and request examples.
