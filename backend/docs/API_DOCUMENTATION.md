# Ticket Booking Backend API

## Base URL

```txt
http://localhost:5000
```

## Authentication

Protected APIs use JWT bearer authentication.

Send the token in the `Authorization` header:

```txt
Authorization: Bearer <token>
```

The token is returned by the signup and login APIs.

## Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ticket-booking
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

The backend also supports `MONGODB_URI` for MongoDB connections.

## Postman Environment Variables

```txt
baseUrl = http://localhost:5000
token =
adminToken =
eventId =
seatId1 =
seatId2 =
reservationId =
bookingId =
idempotencyKey =
```

## APIs

### 1. Health Check

`GET /api/health`

Sample response:

```json
{
  "success": true,
  "message": "Backend running"
}
```

### 2. User Signup

`POST /api/auth/signup`

Request body:

```json
{
  "name": "Test User",
  "email": "user@example.com",
  "password": "password123"
}
```

Sample response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "Test User",
      "email": "user@example.com",
      "role": "USER",
      "walletBalanceInPaise": 0
    },
    "token": "jwt_token"
  }
}
```

### 3. User Login

`POST /api/auth/login`

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Sample response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "Test User",
      "email": "user@example.com",
      "role": "USER",
      "walletBalanceInPaise": 0
    },
    "token": "jwt_token"
  }
}
```

### 4. Admin Login

`POST /api/auth/admin-login`

Request body:

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Sample response:

```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "user": {
      "id": "admin_user_id",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN",
      "walletBalanceInPaise": 0
    },
    "token": "jwt_token"
  }
}
```

Admin login requires an existing user with `role` set to `ADMIN`.

### 4.1 First Admin Signup

`POST /api/auth/admin-signup`

Creates the first admin account for a fresh database. If an admin already exists,
this endpoint returns `409`.

Request body:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123"
}
```

Sample response:

```json
{
  "success": true,
  "message": "Admin registered successfully",
  "data": {
    "user": {
      "id": "admin_user_id",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN",
      "walletBalanceInPaise": 0
    },
    "token": "jwt_token"
  }
}
```

### 4.2 Create Admin As Existing Admin

`POST /api/auth/admin/users/admins`

Headers:

```txt
Authorization: Bearer <admin_token>
```

Creates another admin account. This route is protected and requires an existing
admin token.

Request body:

```json
{
  "name": "Second Admin",
  "email": "second-admin@example.com",
  "password": "password123"
}
```

Sample response:

```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "user": {
      "id": "admin_user_id",
      "name": "Second Admin",
      "email": "second-admin@example.com",
      "role": "ADMIN",
      "walletBalanceInPaise": 0
    }
  }
}

```

### 5. Get Current User

`GET /api/auth/me`

Headers:

```txt
Authorization: Bearer <token>
```

Sample response:

```json
{
  "success": true,
  "message": "Current user fetched successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "Test User",
      "email": "user@example.com",
      "role": "USER",
      "walletBalanceInPaise": 0
    }
  }
}
```

### 6. Add Money

`POST /api/wallet/add-money`

Headers:

```txt
Authorization: Bearer <token>
```

Request body:

```json
{
  "amountInPaise": 10000
}
```

Sample response:

```json
{
  "success": true,
  "message": "Money added to wallet successfully",
  "data": {
    "walletBalanceInPaise": 10000,
    "transaction": {
      "id": "transaction_id",
      "type": "CREDIT",
      "amountInPaise": 10000,
      "balanceAfterInPaise": 10000,
      "description": "Money added to wallet",
      "referenceType": "ADD_MONEY",
      "createdAt": "date"
    }
  }
}
```

### 7. Get Wallet Balance

`GET /api/wallet/balance`

Headers:

```txt
Authorization: Bearer <token>
```

Sample response:

```json
{
  "success": true,
  "message": "Wallet balance fetched successfully",
  "data": {
    "walletBalanceInPaise": 10000
  }
}
```

### 8. Get Wallet Transactions

`GET /api/wallet/transactions`

Headers:

```txt
Authorization: Bearer <token>
```

Sample response:

```json
{
  "success": true,
  "message": "Wallet transactions fetched successfully",
  "data": {
    "transactions": [
      {
        "id": "transaction_id",
        "type": "CREDIT",
        "amountInPaise": 10000,
        "balanceAfterInPaise": 10000,
        "description": "Money added to wallet",
        "referenceType": "ADD_MONEY",
        "createdAt": "date"
      }
    ]
  }
}
```

### 9. Create Event

`POST /api/admin/events`

Headers:

```txt
Authorization: Bearer <admin_token>
```

Request body:

```json
{
  "title": "Coldplay Concert",
  "description": "Live music concert event",
  "location": "Ahmedabad Stadium",
  "startDate": "2026-08-10T18:00:00.000Z",
  "endDate": "2026-08-10T22:00:00.000Z",
  "seatPriceInPaise": 50000,
  "status": "PUBLISHED"
}
```

Sample response:

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "event": {
      "id": "event_id",
      "title": "Coldplay Concert",
      "description": "Live music concert event",
      "location": "Ahmedabad Stadium",
      "status": "PUBLISHED",
      "seatPriceInPaise": 50000,
      "totalSeats": 0,
      "availableSeats": 0,
      "reservedSeats": 0,
      "bookedSeats": 0
    }
  }
}
```

### 10. Update Event

`PATCH /api/admin/events/:eventId`

Headers:

```txt
Authorization: Bearer <admin_token>
```

Request body:

```json
{
  "location": "Ahmedabad Stadium Gate 2",
  "status": "PUBLISHED"
}
```

### 11. Cancel Event

`DELETE /api/admin/events/:eventId`

Headers:

```txt
Authorization: Bearer <admin_token>
```

This is a soft delete. It sets event `status` to `CANCELLED`.

### 12. Bulk Create Seats

`POST /api/admin/events/:eventId/seats/bulk`

Headers:

```txt
Authorization: Bearer <admin_token>
```

Request body:

```json
{
  "rows": ["A", "B", "C"],
  "seatsPerRow": 10,
  "priceInPaise": 50000
}
```

Sample response:

```json
{
  "success": true,
  "message": "Seats created successfully",
  "data": {
    "createdCount": 30,
    "eventSeatCounts": {
      "totalSeats": 30,
      "availableSeats": 30,
      "reservedSeats": 0,
      "bookedSeats": 0
    }
  }
}
```

### 13. List Events

`GET /api/events`

Returns `PUBLISHED` events sorted by `startDate` ascending.

Sample response:

```json
{
  "success": true,
  "message": "Events fetched successfully",
  "data": {
    "events": []
  }
}
```

### 14. Get Event Details

`GET /api/events/:eventId`

Sample response:

```json
{
  "success": true,
  "message": "Event fetched successfully",
  "data": {
    "event": {}
  }
}
```

### 15. Get Event Seats

`GET /api/events/:eventId/seats`

Sample response:

```json
{
  "success": true,
  "message": "Seats fetched successfully",
  "data": {
    "seats": []
  }
}
```

### 16. Admin View Event Seats

`GET /api/admin/events/:eventId/seats`

Headers:

```txt
Authorization: Bearer <admin_token>
```

### 17. Reserve Seats

`POST /api/bookings/reserve`

Headers:

```txt
Authorization: Bearer <token>
```

Request body:

```json
{
  "eventId": "{{eventId}}",
  "seatIds": ["{{seatId1}}", "{{seatId2}}"]
}
```

Sample response:

```json
{
  "success": true,
  "message": "Seats reserved successfully",
  "data": {
    "reservation": {
      "id": "reservation_id",
      "eventId": "event_id",
      "seatIds": ["seat_id_1", "seat_id_2"],
      "status": "ACTIVE",
      "totalAmountInPaise": 100000,
      "expiresAt": "2026-08-10T18:05:00.000Z"
    }
  }
}
```

Reservations expire after 5 minutes. Expired reserved seats are released lazily when event seats are viewed.

### 18. Confirm Booking

`POST /api/bookings/confirm`

Headers:

```txt
Authorization: Bearer <token>
```

Request body:

```json
{
  "reservationId": "{{reservationId}}",
  "idempotencyKey": "confirm-booking-{{$timestamp}}"
}
```

Sample response:

```json
{
  "success": true,
  "message": "Booking confirmed successfully",
  "data": {
    "booking": {
      "id": "booking_id",
      "userId": "user_id",
      "eventId": "event_id",
      "seatIds": ["seat_id_1", "seat_id_2"],
      "reservationId": "reservation_id",
      "status": "CONFIRMED",
      "paymentStatus": "PAID",
      "totalAmountInPaise": 100000,
      "walletTransactionId": "wallet_transaction_id",
      "idempotencyKey": "unique-key",
      "createdAt": "date"
    }
  }
}
```

This API validates the reservation, debits the wallet, creates the wallet transaction, creates the booking, marks seats as `BOOKED`, and marks the reservation as `CONFIRMED` in one MongoDB transaction.

Booking confirmation uses an idempotency record for retry safety. If the same user sends the same `idempotencyKey` to `POST /api/bookings/confirm` after a successful request, the API returns the saved response without debiting the wallet again. If another request with the same key is still processing, the API returns `409`.

### 19. Get My Bookings

`GET /api/bookings/my-bookings`

Headers:

```txt
Authorization: Bearer <token>
```

Returns the current user's bookings latest first. Event and seat basic details are populated.

Sample response:

```json
{
  "success": true,
  "message": "Bookings fetched successfully",
  "data": {
    "bookings": [
      {
        "id": "booking_id",
        "event": {
          "id": "event_id",
          "title": "Coldplay Concert"
        },
        "seats": [
          {
            "id": "seat_id",
            "seatNumber": "A1",
            "row": "A"
          }
        ],
        "status": "CONFIRMED",
        "paymentStatus": "PAID",
        "totalAmountInPaise": 50000,
        "createdAt": "date"
      }
    ]
  }
}
```

### 20. Admin Get Bookings

`GET /api/admin/bookings`

Headers:

```txt
Authorization: Bearer <adminToken>
```

Optional query filters:

```txt
userId
eventId
status
```

Example:

```txt
GET /api/admin/bookings?eventId={{eventId}}&status=CONFIRMED
```

Returns all matching bookings latest first.

### 21. Admin Get Transactions

`GET /api/admin/transactions`

Headers:

```txt
Authorization: Bearer <adminToken>
```

Optional query filters:

```txt
userId
type
referenceType
```

Example:

```txt
GET /api/admin/transactions?type=REFUND&referenceType=REFUND
```

Returns all matching wallet transactions latest first.

### 22. Admin Cancel Booking

`POST /api/admin/bookings/:bookingId/cancel`

Headers:

```txt
Authorization: Bearer <adminToken>
```

Cancels a confirmed booking in a MongoDB transaction. It marks the booking `CANCELLED`, marks payment `REFUNDED`, releases booked seats back to `AVAILABLE`, creates a `REFUND` wallet transaction, and adds money back to the user's wallet.

Sample response:

```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "booking": {
      "id": "booking_id",
      "status": "CANCELLED",
      "paymentStatus": "REFUNDED"
    },
    "refundTransaction": {
      "id": "transaction_id",
      "type": "REFUND",
      "referenceType": "REFUND"
    }
  }
}
```

### 23. Admin Refund Booking

`POST /api/admin/bookings/:bookingId/refund`

Headers:

```txt
Authorization: Bearer <adminToken>
```

Refunds a booking in a MongoDB transaction. It marks booking status `REFUNDED`, marks payment `REFUNDED`, creates a `REFUND` wallet transaction, and adds money back to the user's wallet. Seats are not released by this endpoint.

Sample response:

```json
{
  "success": true,
  "message": "Booking refunded successfully",
  "data": {
    "booking": {
      "id": "booking_id",
      "status": "REFUNDED",
      "paymentStatus": "REFUNDED"
    },
    "refundTransaction": {
      "id": "transaction_id",
      "type": "REFUND",
      "referenceType": "REFUND"
    }
  }
}
```

## Error Responses

Validation error:

```json
{
  "success": false,
  "message": "Valid email is required"
}
```

Duplicate email:

```json
{
  "success": false,
  "message": "Email already exists"
}
```

Invalid login:

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

Missing token:

```json
{
  "success": false,
  "message": "Authorization token is required"
}
```

Non-admin admin login:

```json
{
  "success": false,
  "message": "Only admin users can login here"
}
```

Invalid wallet amount:

```json
{
  "success": false,
  "message": "amountInPaise must be an integer"
}
```

Duplicate idempotency key:

```json
{
  "success": false,
  "message": "Duplicate idempotencyKey"
}
```

Duplicate seats:

```json
{
  "success": false,
  "message": "Duplicate seats already exist for this event"
}
```

Invalid event date range:

```json
{
  "success": false,
  "message": "endDate must be after startDate"
}
```

Seat no longer available:

```json
{
  "success": false,
  "message": "Some seats are no longer available"
}
```

Duplicate seat ids:

```json
{
  "success": false,
  "message": "seatIds must not contain duplicate ids"
}
```

Insufficient wallet balance:

```json
{
  "success": false,
  "message": "Insufficient wallet balance"
}
```

Expired reservation:

```json
{
  "success": false,
  "message": "Reservation expired"
}
```

Idempotency request still processing:

```json
{
  "success": false,
  "message": "Request already processing"
}
```

Already cancelled booking:

```json
{
  "success": false,
  "message": "Booking already cancelled"
}
```

Already refunded booking:

```json
{
  "success": false,
  "message": "Booking already refunded"
}
```

## Postman Testing Flow

1. Start backend using `npm start`.
2. Test `GET /api/health`.
3. Register user using `POST /api/auth/signup`.
4. Login user using `POST /api/auth/login`.
5. Copy token from login response.
6. Set token in Postman environment variable `{{token}}`.
7. Test protected route `GET /api/auth/me` using Bearer token.
8. Try `GET /api/auth/me` without token and confirm `401` error.
9. Try admin-login with normal `USER` account and confirm `403` error.

## Wallet Testing Flow

1. Start backend using `npm start`.
2. Register user.
3. Login user.
4. Save JWT token in Postman environment variable `{{token}}`.
5. Call `GET /api/wallet/balance`.
6. Confirm initial balance is `0`.
7. Call `POST /api/wallet/add-money` with `amountInPaise` `10000`.
8. Call `GET /api/wallet/balance` again.
9. Confirm balance is `10000`.
10. Call `GET /api/wallet/transactions`.
11. Confirm `CREDIT` transaction exists.
12. Test invalid amount:
    - `amountInPaise: 0`
    - `amountInPaise: -100`
    - `amountInPaise: 10.5`
13. Confirm validation errors are returned.

## Event And Seat Testing Flow

1. Start backend using `npm start`.
2. Login as admin and save `adminToken`.
3. Create event using `POST /api/admin/events`.
4. Save `eventId` in Postman environment.
5. Bulk create seats using `POST /api/admin/events/{{eventId}}/seats/bulk`.
6. Check `GET /api/events`.
7. Check `GET /api/events/{{eventId}}`.
8. Check `GET /api/events/{{eventId}}/seats`.
9. Check `GET /api/admin/events/{{eventId}}/seats` using admin token.
10. Try create event with normal user token and confirm `403`.
11. Try duplicate bulk seat create and confirm `409`.
12. Try invalid price like `10.5` and confirm validation error.
13. Try invalid date where `endDate` is before `startDate` and confirm validation error.

## Reservation Testing Flow

1. Start backend using `npm start`.
2. Login as admin.
3. Create event.
4. Bulk create seats.
5. Login as user.
6. Get event seats.
7. Copy two available seat ids into Postman variables `seatId1` and `seatId2`.
8. Call `POST /api/bookings/reserve`.
9. Confirm reservation status is `ACTIVE`.
10. Confirm `expiresAt` is 5 minutes ahead.
11. Call `GET /api/events/{{eventId}}/seats`.
12. Confirm selected seats are `RESERVED`.
13. Try reserving same seats again with another user immediately.
14. Confirm error: `Some seats are no longer available`.
15. Wait 5 minutes or manually change `reservationExpiresAt` and `expiresAt` in DB to a past time.
16. Call `GET /api/events/{{eventId}}/seats`.
17. Confirm expired reserved seats become `AVAILABLE` again.
18. Reserve same seats again successfully.

## Booking Confirm Testing Flow

1. Start backend using `npm start`.
2. Login as user.
3. Add money to wallet using `POST /api/wallet/add-money`.
4. Confirm wallet balance using `GET /api/wallet/balance`.
5. Get event seats using `GET /api/events/{{eventId}}/seats`.
6. Reserve seats using `POST /api/bookings/reserve`.
7. Save `reservationId`.
8. Confirm booking using `POST /api/bookings/confirm`.
9. Confirm booking status is `CONFIRMED`.
10. Confirm `paymentStatus` is `PAID`.
11. Confirm `walletTransactionId` is returned.
12. Check `GET /api/wallet/balance`.
13. Balance should be reduced.
14. Check `GET /api/wallet/transactions`.
15. A `DEBIT` transaction should exist with `referenceType` `BOOKING`.
16. Check `GET /api/events/{{eventId}}/seats`.
17. Selected seats should be `BOOKED`.
18. Retry same confirm API with the same `idempotencyKey`.
19. It should return the same booking and should not debit wallet again.
20. Try confirm after reservation expiry.
21. It should reject payment and release seats.
22. Try confirm with insufficient wallet balance.
23. It should return insufficient balance and not create booking.

## Booking History And Admin Monitoring Testing Flow

1. Login as user and save `token`.
2. Login as admin and save `adminToken`.
3. Create a confirmed booking using the booking confirm flow.
4. Save the returned `bookingId`.
5. Call `GET /api/bookings/my-bookings` with the user token.
6. Confirm the newest booking appears first.
7. Confirm event and seat details are populated.
8. Call `GET /api/admin/bookings` with the admin token.
9. Test filters like `?eventId={{eventId}}`, `?status=CONFIRMED`, or `?userId=<user_id>`.
10. Call `GET /api/admin/transactions` with the admin token.
11. Test filters like `?type=REFUND` or `?referenceType=REFUND`.
12. Call `POST /api/admin/bookings/{{bookingId}}/cancel` with the admin token.
13. Confirm booking status is `CANCELLED` and payment status is `REFUNDED`.
14. Confirm seats become `AVAILABLE`.
15. Confirm wallet balance increases and a `REFUND` transaction is created.
16. Call the same cancel API again.
17. Confirm it returns `409` with `Booking already cancelled` or `Booking already refunded`.
18. Create another confirmed booking for refund testing.
19. Call `POST /api/admin/bookings/{{bookingId}}/refund` with the admin token.
20. Confirm booking status is `REFUNDED` and payment status is `REFUNDED`.
21. Confirm wallet balance increases and a `REFUND` transaction is created.
22. Call the same refund API again.
23. Confirm it returns `409` with `Booking already refunded`.
