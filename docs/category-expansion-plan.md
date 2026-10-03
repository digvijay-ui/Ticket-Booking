# Category expansion plan

Planning only. Keep the existing Events flow and its `/api/events`, `/api/bookings/reserve`, `/api/bookings/confirm`, `/events`, checkout, wallet, and history contracts working while new categories are added.

## What exists and can be reused

- **Events:** `Event` is a dated, published listing; `Seat` belongs to an `eventId` and has its own price and availability. `Reservation` holds `eventId` plus `seatIds` for five minutes. `Booking` records those seats, the reservation, wallet debit, and an idempotency key. Reuse these models and the current event routes for the **Events** category.
- **Shared infrastructure:** reuse `User` authentication and balance, `WalletTransaction` ledger, integer-paise money rules, transaction/idempotency patterns, admin authorization, and the frontend Axios, Pinia, router, and checkout conventions. Extract shared payment/refund logic only after tests protect the current event flow. The current `Booking`, `Reservation`, and `Seat` schemas are event-specific; they cannot directly represent a dining table, activity capacity, or movie showtime.
- **Current constraints:** publishing an event requires seats. The public event list contains published events. Seat holds check ownership and availability; confirmation checks the active hold and balance, debits the wallet, books seats, and writes the ledger atomically. Admin cancellation refunds and releases event seats; the separate admin refund action refunds without releasing them. Preserve these semantics for existing bookings.

## Domain data and inventory

| Category | Required models and fields | Inventory rule |
| --- | --- | --- |
| Dining | `Restaurant` (name, address, timezone, status, service hours, deposit policy); `RestaurantTable` (restaurant, capacity, active); `DiningReservation` (restaurant, service start/end, party size, assigned table IDs, hold expiry/status) | Find a suitable table or explicit table combination for the party and service interval. Prevent overlapping active or confirmed allocations. A table is **not** a `Seat`. |
| Events | Existing `Event`, `Seat`, `Reservation`, `Booking` | Select specific event seats and retain the existing five-minute hold and confirmation flow. |
| Activities | `Activity` (title, venue, timezone, status); `ActivitySession` (start/end, capacity, price per person in paise, held/confirmed counts); `ActivityReservation` (session, participant count, hold expiry/status) | Atomically reserve a quantity against one session's remaining capacity. A slot is **not** a `Seat`. |
| Movies | `Film` (title, runtime, rating/status); `Cinema` and `Auditorium` (location, timezone, seat map); `Showtime` (film, auditorium, start/end, status); `ShowtimeSeat` (showtime, seat label, price in paise, status); `MovieReservation` (showtime, selected showtime-seat IDs, hold expiry/status) | Select seats for one showtime. Reuse the event seat *workflow*, but use showtime-scoped seat records so the same physical chair can be sold for different showtimes. |

Add a tagged `CategoryBooking` for Dining, Activities, and Movies: category, user, category reservation ID, category-specific item/slot reference, quantity or table/seat snapshot, total in paise, status, payment status, wallet transaction ID when paid, and idempotency key. Use a discriminated payload so dining stores table allocation, activities store session and party size, and movies store showtime-seat IDs. Keep the legacy event `Booking` collection/API intact; combine both sources in the booking-history UI. Define unique reservation and per-user idempotency indexes. Record the venue timezone and exact UTC start/end on each reservation/booking snapshot.

## APIs and frontend routes to add

All writes require user authentication; management writes require admin authorization. Validate inputs with Zod and return `409` for inventory conflicts.

| Category | Public/read and reservation APIs | Frontend routes |
| --- | --- | --- |
| Dining | `GET /api/dining/restaurants`, `GET /api/dining/restaurants/:id`, `GET /api/dining/restaurants/:id/availability?date&time&partySize`, `POST /api/dining/reservations` | `/dining`, `/dining/:restaurantId`, `/dining/:restaurantId/book` |
| Events | Existing `GET /api/events`, `GET /api/events/:eventId`, `GET /api/events/:eventId/seats`, `POST /api/bookings/reserve`, `POST /api/bookings/confirm` | Existing `/events`, `/events/:eventId`, `/events/:eventId/seats`, checkout and success routes |
| Activities | `GET /api/activities`, `GET /api/activities/:id`, `GET /api/activities/:id/sessions`, `POST /api/activities/reservations` | `/activities`, `/activities/:activityId`, `/activities/:activityId/book` |
| Movies | `GET /api/movies`, `GET /api/movies/:id`, `GET /api/movies/:id/showtimes`, `GET /api/movies/showtimes/:showtimeId/seats`, `POST /api/movies/reservations` | `/movies`, `/movies/:filmId`, `/movies/showtimes/:showtimeId/seats` |

Add `POST /api/category-bookings/confirm`, `GET /api/category-bookings/my-bookings`, and authenticated category checkout/success routes (`/booking/:category/checkout/:reservationId`, `/booking/:category/success/:bookingId`). Add admin CRUD/availability routes under `/api/admin/dining`, `/api/admin/activities`, and `/api/admin/movies`, plus matching `/admin/...` screens. Keep existing event admin routes. Shared discovery navigation may point to the four category list routes; each category owns its own API module and Pinia store.

## Booking rules and sequence

1. Publish only valid future inventory. Treat dates and times in the venue's timezone; store UTC instants. Never expose cancelled or completed inventory as bookable. Require positive party size/participant count, valid service hours, and a showtime or session that has not started.
2. Quote the server-side price in integer paise and create a short expiring hold in a MongoDB transaction. Dining locks a non-overlapping table allocation; Activities atomically increments held capacity; Events uses its existing seat hold; Movies locks seats within one showtime. Recheck availability at confirmation, expire and release abandoned holds, and reject duplicate or cross-category references.
3. Confirm only a hold owned by the user. Use a stable idempotency key and one transaction for inventory, booking, wallet debit, and ledger entry. Activities charge per participant; Movies per selected seat; Events retain per-seat prices. Dining uses the restaurant's explicit deposit policy: a zero-deposit booking has `paymentStatus: NOT_REQUIRED` and no wallet transaction; a positive deposit uses the wallet.
4. Define category-specific cancellation cutoffs and refund policy before launch. Cancellation releases the relevant table interval, session quantity, or showtime seats and refunds only the amount actually paid, exactly once. A refund without cancellation must not silently reopen inventory. Preserve current event admin cancellation/refund behavior.
5. Implement in order: domain models and indexes; availability/hold services with concurrency tests; category confirmation and refund integration; public/admin APIs; category pages and shared history; then end-to-end checks for hold expiry, double booking, insufficient balance, idempotency, cancellation, and legacy event regression.
