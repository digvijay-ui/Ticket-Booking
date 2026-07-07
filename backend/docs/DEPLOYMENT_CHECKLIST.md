# Ticket Booking Deployment Checklist

## Backend Deployment Checklist

- [ ] Confirm backend builds successfully with `npm run build`.
- [ ] Confirm all backend tests or manual Postman checks pass.
- [ ] Set production `NODE_ENV=production`.
- [ ] Set production `PORT`.
- [ ] Set production MongoDB URI.
- [ ] Set a strong `JWT_SECRET`.
- [ ] Set `JWT_EXPIRES_IN` as needed.
- [ ] Confirm CORS policy allows the production frontend domain.
- [ ] Confirm API health check works after deployment.
- [ ] Confirm logs do not expose JWT tokens, passwords, or secrets.

## Backend Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
JWT_SECRET=<strong-production-secret>
JWT_EXPIRES_IN=7d
```

The backend also supports `MONGODB_URI` if that is the variable used by the hosting provider.

## MongoDB Atlas Checklist

- [ ] Create a MongoDB Atlas project.
- [ ] Create a production cluster.
- [ ] Create a database user with a strong password.
- [ ] Allow access from the backend hosting provider IP range.
- [ ] Use the `mongodb+srv://` connection string in production env vars.
- [ ] Confirm the database name is correct.
- [ ] Confirm collections are created after first API write.
- [ ] Enable backups for production data.

## Frontend Vercel Deployment Checklist

- [ ] Confirm frontend builds successfully with `npm run build`.
- [ ] Set the frontend API base URL environment variable if the project uses one.
- [ ] Confirm Axios points to the production backend URL.
- [ ] Confirm `/`, `/events`, `/login`, and `/signup` load in production.
- [ ] Confirm protected Vue routes redirect correctly.
- [ ] Confirm admin routes redirect correctly.

## Vercel Vue Router Rewrite

For Vue Router history mode, Vercel must rewrite all frontend routes to `/index.html`.

Create or verify `frontend/vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Without this rewrite, direct visits such as `/events`, `/wallet`, or `/admin/dashboard` can return 404.

## Production Smoke Test Flow

- [ ] Open frontend production URL.
- [ ] Confirm public landing page loads.
- [ ] Open `/events` while logged out.
- [ ] Signup a normal user.
- [ ] Add wallet money.
- [ ] Login admin.
- [ ] Create an event.
- [ ] Bulk create seats.
- [ ] Publish event.
- [ ] Login user.
- [ ] Select seats and reserve.
- [ ] Confirm booking from wallet.
- [ ] Confirm booking appears in My Bookings.
- [ ] Confirm admin dashboard updates.
- [ ] Confirm admin transaction ledger shows CREDIT and DEBIT records.
- [ ] Test one refund or cancel flow in staging before using it in production.

## Final Production Checks

- [ ] API health endpoint is reachable.
- [ ] Auth tokens persist correctly after browser refresh.
- [ ] No frontend console errors on major pages.
- [ ] No backend unhandled errors during booking flow.
- [ ] Wallet balance never changes on frontend without backend response.
- [ ] Booking confirm is idempotent.
- [ ] Admin token and user token are stored separately.
- [ ] Mobile layout works for public, user, and admin pages.
