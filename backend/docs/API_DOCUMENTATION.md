# Ticket Booking API Documentation

Base URL:

```txt
http://localhost:5000
```

Protected user routes require:

```txt
Authorization: Bearer <token>
```

Protected admin routes require an admin JWT:

```txt
Authorization: Bearer <adminToken>
```

Amounts are always stored and sent to the backend in paise. Example: INR 500 = `50000`.

Common error response:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

## Health

### Health Check

Method: `GET`

URL: `/api/health`

Auth required: No

Request body: None

Success response:

```json
{
  "success": true,
  "message": "Backend running"
}
```

Error response:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

## Auth

### User Signup

Method: `POST`

URL: `/api/auth/signup`

Auth required: No

Request body:

```json
{
  "name": "Test User",
  "email": "user@example.com",
  "password": "password123"
}
```

Success response:

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

Error response:

```json
{
  "success": false,
  "message": "Valid email is required"
}
```

### User Login

Method: `POST`

URL: `/api/auth/login`

Auth required: No

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Success response:

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

Error response:

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Admin Login

Method: `POST`

URL: `/api/auth/admin-login`

Auth required: No

Request body:

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Success response:

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
    "token": "admin_jwt_token"
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Only admin users can login here"
}
```

### First Admin Signup

Method: `POST`

URL: `/api/auth/admin-signup`

Auth required: No

Request body:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123"
}
```

Success response:

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
    "token": "admin_jwt_token"
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Admin account already exists. Please login as admin."
}
```

### Create Admin User

Method: `POST`

URL: `/api/auth/admin/users/admins`

Auth required: Admin

Request body:

```json
{
  "name": "Second Admin",
  "email": "second-admin@example.com",
  "password": "password123"
}
```

Success response:

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

Error response:

```json
{
  "success": false,
  "message": "Forbidden: Admin access required"
}
```

### Current User

Method: `GET`

URL: `/api/auth/me`

Auth required: User

Request body: None

Success response:

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
      "walletBalanceInPaise": 50000
    }
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

## Wallet

### Add Money

Method: `POST`

URL: `/api/wallet/add-money`

Auth required: User

Request body:

```json
{
  "amountInPaise": 50000
}
```

Success response:

```json
{
  "success": true,
  "message": "Money added to wallet successfully",
  "data": {
    "walletBalanceInPaise": 50000,
    "transaction": {
      "id": "transaction_id",
      "type": "CREDIT",
      "amountInPaise": 50000,
      "balanceAfterInPaise": 50000,
      "description": "Money added to wallet",
      "referenceType": "ADD_MONEY",
      "createdAt": "2026-07-07T10:00:00.000Z"
    }
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "amountInPaise must be greater than 0"
}
```

### Wallet Balance

Method: `GET`

URL: `/api/wallet/balance`

Auth required: User

Request body: None

Success response:

```json
{
  "success": true,
  "message": "Wallet balance fetched successfully",
  "data": {
    "walletBalanceInPaise": 50000
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### Wallet Transactions

Method: `GET`

URL: `/api/wallet/transactions`

Auth required: User

Request body: None

Success response:

```json
{
  "success": true,
  "message": "Wallet transactions fetched successfully",
  "data": {
    "transactions": [
      {
        "id": "transaction_id",
        "type": "CREDIT",
        "amountInPaise": 50000,
        "balanceAfterInPaise": 50000,
        "description": "Money added to wallet",
        "referenceType": "ADD_MONEY",
        "referenceId": "wallet_add_money",
        "createdAt": "2026-07-07T10:00:00.000Z"
      }
    ]
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

## Events

### List Published Events

Method: `GET`

URL: `/api/events`

Auth required: No

Request body: None

Success response:

```json
{
  "success": true,
  "message": "Events fetched successfully",
  "data": {
    "events": [
      {
        "id": "event_id",
        "title": "Coldplay Concert",
        "description": "Live music concert event",
        "location": "Ahmedabad Stadium",
        "startDate": "2026-08-10T18:00:00.000Z",
        "endDate": "2026-08-10T22:00:00.000Z",
        "status": "PUBLISHED",
        "seatPriceInPaise": 50000,
        "totalSeats": 100,
        "availableSeats": 100,
        "reservedSeats": 0,
        "bookedSeats": 0
      }
    ]
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

### Get Event

Method: `GET`

URL: `/api/events/:eventId`

Auth required: No

Request body: None

Success response:

```json
{
  "success": true,
  "message": "Event fetched successfully",
  "data": {
    "event": {
      "id": "event_id",
      "title": "Coldplay Concert",
      "description": "Live music concert event",
      "location": "Ahmedabad Stadium",
      "startDate": "2026-08-10T18:00:00.000Z",
      "endDate": "2026-08-10T22:00:00.000Z",
      "status": "PUBLISHED",
      "seatPriceInPaise": 50000,
      "totalSeats": 100,
      "availableSeats": 100,
      "reservedSeats": 0,
      "bookedSeats": 0
    }
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Event not found"
}
```

### Get Event Seats

Method: `GET`

URL: `/api/events/:eventId/seats`

Auth required: No

Request body: None

Success response:

```json
{
  "success": true,
  "message": "Seats fetched successfully",
  "data": {
    "seats": [
      {
        "id": "seat_id_1",
        "eventId": "event_id",
        "seatNumber": "A1",
        "row": "A",
        "priceInPaise": 50000,
        "status": "AVAILABLE",
        "reservedBy": null,
        "reservationExpiresAt": null,
        "bookedBy": null,
        "bookingId": null
      }
    ]
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Invalid event id"
}
```

## Admin Events

### Create Event

Method: `POST`

URL: `/api/admin/events`

Auth required: Admin

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

Success response:

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "event": {
      "id": "event_id",
      "title": "Coldplay Concert",
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

Error response:

```json
{
  "success": false,
  "message": "endDate must be after startDate"
}
```

### Update Event

Method: `PATCH`

URL: `/api/admin/events/:eventId`

Auth required: Admin

Request body:

```json
{
  "title": "Coldplay Concert Updated",
  "status": "PUBLISHED",
  "seatPriceInPaise": 75000
}
```

Success response:

```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": {
    "event": {
      "id": "event_id",
      "title": "Coldplay Concert Updated",
      "status": "PUBLISHED",
      "seatPriceInPaise": 75000
    }
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Event not found"
}
```

### Cancel Event

Method: `DELETE`

URL: `/api/admin/events/:eventId`

Auth required: Admin

Request body: None

Success response:

```json
{
  "success": true,
  "message": "Event cancelled successfully",
  "data": {
    "event": {
      "id": "event_id",
      "status": "CANCELLED"
    }
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Event not found"
}
```

## Admin Seats

### Get Admin Event Seats

Method: `GET`

URL: `/api/admin/events/:eventId/seats`

Auth required: Admin

Request body: None

Success response:

```json
{
  "success": true,
  "message": "Seats fetched successfully",
  "data": {
    "seats": [
      {
        "id": "seat_id_1",
        "eventId": "event_id",
        "seatNumber": "A1",
        "row": "A",
        "priceInPaise": 50000,
        "status": "AVAILABLE"
      }
    ]
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Invalid event id"
}
```

### Bulk Create Seats

Method: `POST`

URL: `/api/admin/events/:eventId/seats/bulk`

Auth required: Admin

Request body:

```json
{
  "rows": ["A", "B", "C"],
  "seatsPerRow": 10,
  "priceInPaise": 50000
}
```

Success response:

```json
{
  "success": true,
  "message": "Seats created successfully",
  "data": {
    "createdCount": 30
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Duplicate seats already exist for this event"
}
```

## Reservation

### Reserve Seats

Method: `POST`

URL: `/api/bookings/reserve`

Auth required: User

Request body:

```json
{
  "eventId": "event_id",
  "seatIds": ["seat_id_1", "seat_id_2"]
}
```

Success response:

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
      "expiresAt": "2026-07-07T10:15:00.000Z"
    }
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Selected seats are not available"
}
```

## Booking Confirm

### Confirm Booking

Method: `POST`

URL: `/api/bookings/confirm`

Auth required: User

Request body:

```json
{
  "reservationId": "reservation_id",
  "idempotencyKey": "confirm-booking-test-key-001"
}
```

Success response:

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
      "idempotencyKey": "confirm-booking-test-key-001",
      "createdAt": "2026-07-07T10:05:00.000Z"
    }
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Insufficient wallet balance"
}
```

## Booking History

### My Bookings

Method: `GET`

URL: `/api/bookings/my-bookings`

Auth required: User

Request body: None

Success response:

```json
{
  "success": true,
  "message": "Bookings fetched successfully",
  "data": {
    "bookings": [
      {
        "id": "booking_id",
        "userId": "user_id",
        "event": {
          "id": "event_id",
          "title": "Coldplay Concert",
          "location": "Ahmedabad Stadium",
          "startDate": "2026-08-10T18:00:00.000Z"
        },
        "seats": [
          {
            "id": "seat_id_1",
            "seatNumber": "A1",
            "row": "A"
          }
        ],
        "reservationId": "reservation_id",
        "status": "CONFIRMED",
        "paymentStatus": "PAID",
        "totalAmountInPaise": 100000,
        "walletTransactionId": "wallet_transaction_id",
        "createdAt": "2026-07-07T10:05:00.000Z"
      }
    ]
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

## Admin Bookings

### List Admin Bookings

Method: `GET`

URL: `/api/admin/bookings?status=CONFIRMED&eventId=event_id&userId=user_id`

Auth required: Admin

Request body: None

Success response:

```json
{
  "success": true,
  "message": "Admin bookings fetched successfully",
  "data": {
    "bookings": [
      {
        "id": "booking_id",
        "userId": {
          "id": "user_id",
          "name": "Test User",
          "email": "user@example.com",
          "role": "USER"
        },
        "event": {
          "id": "event_id",
          "title": "Coldplay Concert",
          "location": "Ahmedabad Stadium",
          "startDate": "2026-08-10T18:00:00.000Z"
        },
        "seats": [
          {
            "id": "seat_id_1",
            "seatNumber": "A1",
            "row": "A"
          }
        ],
        "status": "CONFIRMED",
        "paymentStatus": "PAID",
        "totalAmountInPaise": 100000
      }
    ]
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Forbidden: Admin access required"
}
```

### Cancel Booking

Method: `POST`

URL: `/api/admin/bookings/:bookingId/cancel`

Auth required: Admin

Request body: None

Success response:

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
      "id": "refund_transaction_id",
      "type": "REFUND",
      "amountInPaise": 100000
    }
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Booking not found"
}
```

### Refund Booking

Method: `POST`

URL: `/api/admin/bookings/:bookingId/refund`

Auth required: Admin

Request body: None

Success response:

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
      "id": "refund_transaction_id",
      "type": "REFUND",
      "amountInPaise": 100000
    }
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Booking already refunded"
}
```

## Admin Transactions

### List Admin Transactions

Method: `GET`

URL: `/api/admin/transactions?type=CREDIT&referenceType=ADD_MONEY&userId=user_id`

Auth required: Admin

Request body: None

Success response:

```json
{
  "success": true,
  "message": "Admin transactions fetched successfully",
  "data": {
    "transactions": [
      {
        "id": "transaction_id",
        "userId": {
          "id": "user_id",
          "name": "Test User",
          "email": "user@example.com"
        },
        "type": "CREDIT",
        "amountInPaise": 50000,
        "balanceAfterInPaise": 50000,
        "description": "Money added to wallet",
        "referenceType": "ADD_MONEY",
        "referenceId": "reference_id",
        "createdAt": "2026-07-07T10:00:00.000Z"
      }
    ]
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Forbidden: Admin access required"
}
```
