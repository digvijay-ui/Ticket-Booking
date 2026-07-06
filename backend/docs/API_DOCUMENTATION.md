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

More CRUD APIs will be added later for wallet, events, seats, reservations, bookings, refunds, and admin dashboard.
