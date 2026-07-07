# Ticket Booking Testing Checklist

Use this checklist before demo, review, or deployment.

## Backend API Testing

- [ ] Start MongoDB locally or connect to MongoDB Atlas.
- [ ] Start backend with the correct `.env`.
- [ ] Verify `GET /api/health` returns `Backend running`.
- [ ] Create the first admin with `POST /api/auth/admin-signup`.
- [ ] Login admin with `POST /api/auth/admin-login`.
- [ ] Signup a normal user with `POST /api/auth/signup`.
- [ ] Login normal user with `POST /api/auth/login`.
- [ ] Verify protected routes reject missing or invalid JWT tokens.
- [ ] Verify admin routes reject normal user tokens.
- [ ] Verify validation errors return `success: false` and a useful `message`.

## Frontend UI Testing

- [ ] Open `/` and confirm the public landing page appears.
- [ ] Confirm landing buttons navigate to `/login`, `/signup`, and `/events`.
- [ ] Confirm `/events` and `/events/:eventId` are public.
- [ ] Confirm `/wallet`, `/bookings`, `/events/:eventId/seats`, and checkout redirect to `/login` when logged out.
- [ ] Signup and confirm the navbar changes to Events, My Bookings, Wallet, Logout.
- [ ] Logout and confirm the navbar changes to Events, Login, Signup.
- [ ] Verify mobile layout does not overlap text or buttons.
- [ ] Verify Box Office Noir typography is consistent.

## Admin Testing

- [ ] Open `/admin/login`.
- [ ] Login with an admin account.
- [ ] Confirm `/admin/dashboard` is protected and loads after login.
- [ ] Open `/admin/events`.
- [ ] Create a new event with valid dates and price in rupees.
- [ ] Edit event title, dates, status, and price.
- [ ] Cancel an event and confirm the UI updates.
- [ ] Open `/admin/events/:eventId/seats`.
- [ ] Bulk create seats with rows such as `A,B,C`.
- [ ] Confirm duplicate seat creation shows backend error.
- [ ] Open `/admin/bookings` and verify booking cards render.
- [ ] Open `/admin/transactions` and verify filters work.

## Wallet Testing

- [ ] Login as a normal user.
- [ ] Open `/wallet`.
- [ ] Confirm balance loads from `GET /api/wallet/balance`.
- [ ] Add money with a whole rupee amount.
- [ ] Confirm frontend sends `amountInPaise`, not rupees or decimals.
- [ ] Confirm decimal values such as `10.5` are rejected in the UI.
- [ ] Confirm balance refreshes after add money.
- [ ] Confirm transaction history shows CREDIT rows.

## Reservation Expiry Testing

- [ ] Create an event and seats.
- [ ] Login as a user and open seat selection.
- [ ] Reserve available seats.
- [ ] Confirm checkout shows reservation countdown.
- [ ] Wait until expiry.
- [ ] Confirm Pay From Wallet is disabled after expiry.
- [ ] Refresh seats and confirm expired reserved seats become available again.
- [ ] Try confirming an expired reservation and confirm backend returns an error.

## Idempotency Testing

- [ ] Reserve seats as a user.
- [ ] Add enough wallet balance.
- [ ] Call `POST /api/bookings/confirm` with a unique `idempotencyKey`.
- [ ] Repeat the same request with the same body and same `idempotencyKey`.
- [ ] Confirm the response is stable and wallet is not debited twice.
- [ ] Repeat with the same `idempotencyKey` and a different body.
- [ ] Confirm backend rejects the conflicting idempotent request.

## Refund and Cancel Testing

- [ ] Create a confirmed booking.
- [ ] Open `/admin/bookings`.
- [ ] Call `POST /api/admin/bookings/:bookingId/cancel` in Postman.
- [ ] Confirm booking status becomes `CANCELLED`.
- [ ] Confirm payment status becomes `REFUNDED`.
- [ ] Confirm seats are released when cancellation applies.
- [ ] Confirm wallet receives a REFUND transaction.
- [ ] Create another confirmed booking.
- [ ] Call `POST /api/admin/bookings/:bookingId/refund`.
- [ ] Confirm booking status/payment status reflect refund.
- [ ] Confirm duplicate refunds are rejected.

## Edge Cases

- [ ] Signup with an existing email.
- [ ] Login with wrong password.
- [ ] Add wallet money with `0`, negative value, decimal value, and missing amount.
- [ ] Create event with end date before start date.
- [ ] Create event with missing title, description, location, or price.
- [ ] Bulk create seats with empty rows.
- [ ] Reserve booked seats.
- [ ] Reserve duplicate seat IDs in one request.
- [ ] Confirm booking without enough wallet balance.
- [ ] Confirm booking with missing `idempotencyKey`.
- [ ] Access admin endpoints with a user token.
- [ ] Access user endpoints with no token.
