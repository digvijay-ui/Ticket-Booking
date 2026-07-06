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

More CRUD APIs will be added later for reservations, bookings, payments, refunds, idempotency flows, and admin dashboard.
