# Authentication API Endpoints

Base URL: `http://localhost:3000/api`

## 📝 Register
**POST** `/auth/register`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "institutionName": "MIT University",
  "role": "INSTITUTION"
}
```

**Roles:** `INSTITUTION` | `EMPLOYER` | `GUEST`

---

## 🔐 Login
**POST** `/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "INSTITUTION",
    "isEmailVerified": false,
    "createdAt": "2025-12-14T..."
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer"
}
```

---

## ✉️ Verify Email
**POST** `/auth/verify-email`

```json
{
  "token": "verification_token_from_email"
}
```

---

## 🔑 Forgot Password
**POST** `/auth/forgot-password`

```json
{
  "email": "user@example.com"
}
```

---

## 🔄 Reset Password
**POST** `/auth/reset-password`

```json
{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}
```

---

## 👤 Get Profile (Protected)
**GET** `/auth/profile`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "institutionName": "MIT University",
  "role": "INSTITUTION",
  "isEmailVerified": false,
  "createdAt": "2025-12-14T...",
  "updatedAt": "2025-12-14T..."
}
```

---

## 🛡️ Using Protected Routes

For any protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚀 Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "role": "GUEST"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile (with token)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be longer than or equal to 8 characters"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Email already registered",
  "error": "Conflict"
}
```
