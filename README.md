# Book Store Backend API

Backend cho website ban sach (Node.js + Express + MongoDB + JWT + Socket.IO).

## 1) Cong nghe

- Node.js (JavaScript)
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- Joi Validation
- Socket.IO (chat realtime)
- Multer (upload avatar)
- Nodemailer (forgot/reset password qua email)

## 2) Cai dat va chay

```bash
npm install
cp .env.example .env
npm run dev
```

PowerShell:

```powershell
Copy-Item .env.example .env
npm run dev
```

Base URL: `http://localhost:5000/api/v1`

JWT header:

```http
Authorization: Bearer <your_jwt_token>
```

## 3) Danh sach API DAY DU

### 3.1 Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/profile`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

Register:

```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "password": "123456"
}
```

Login:

```json
{
  "email": "a@example.com",
  "password": "123456"
}
```

Forgot password:

```json
{
  "email": "a@example.com"
}
```

Reset password:

```json
{
  "token": "reset_token_tu_email",
  "password": "newpassword123"
}
```

### 3.2 User Profile (can JWT)

- `GET /users/me`
- `PATCH /users/me` (hoac `PUT /users/me`)
- `PUT /users/me/password`
- `PUT /users/me/avatar` (multipart/form-data)

Update profile:

```json
{
  "name": "Nguyen Van B",
  "email": "b@example.com",
  "phone": "0909123456",
  "city": "Ho Chi Minh",
  "district": "Quan 1",
  "ward": "Ben Nghe",
  "streetAddress": "12 Le Loi"
}
```

Change password:

```json
{
  "currentPassword": "123456",
  "newPassword": "12345678"
}
```

Upload avatar:
- Method: `PUT /users/me/avatar`
- Body: `form-data`
- Key file: `avatar`
- Max size: 2MB

### 3.3 User Admin

- `GET /users`
- `DELETE /users/:id`

### 3.4 Category

- `GET /categories`
- `POST /categories` (admin)
- `PUT /categories/:id` (admin)
- `DELETE /categories/:id` (admin)

Create category:

```json
{
  "name": "Khoa hoc vien tuong",
  "description": "Sach ve khoa hoc va vien tuong"
}
```

### 3.5 Book

- `GET /books`
- `GET /books/:id`
- `POST /books` (admin)
- `PUT /books/:id` (admin)
- `DELETE /books/:id` (admin)
- `GET /books?keyword=&page=&limit=`
- `GET /books/:id/reviews`

Create/Update book:

```json
{
  "title": "The Pragmatic Programmer",
  "author": "Andrew Hunt",
  "price": 199000,
  "stock": 30,
  "description": "A practical software development guide",
  "image": "https://example.com/book.jpg",
  "category": "66f123456789012345678901"
}
```

### 3.6 Review

- `POST /reviews` (can JWT)
- `GET /books/:id/reviews`

Create review:

```json
{
  "bookId": "66f123456789012345678901",
  "rating": 5,
  "comment": "Noi dung rat hay"
}
```

### 3.7 Cart

- `GET /cart`
- `POST /cart/add`
- `PUT /cart/update`
- `DELETE /cart/remove`

Add to cart:

```json
{
  "bookId": "66f123456789012345678901",
  "quantity": 2
}
```

Update cart item:

```json
{
  "bookId": "66f123456789012345678901",
  "quantity": 1
}
```

Remove cart item:

```json
{
  "bookId": "66f123456789012345678901"
}
```

### 3.8 Order

- `POST /orders`
- `GET /orders/my`
- `GET /orders` (admin)
- `PUT /orders/:id/status` (admin)

Create order:

```json
{
  "shippingAddress": "123 Nguyen Trai, Quan 1, TP.HCM",
  "paymentMethod": "cod"
}
```

Update status:

```json
{
  "status": "shipping"
}
```

### 3.9 Payment

- `GET /payments/my`
- `GET /payments/order/:orderId`
- `POST /payments/webhook`

Webhook payload:

```json
{
  "orderId": "66f123456789012345678901",
  "status": "paid",
  "transactionId": "TXN_001",
  "metadata": {
    "gateway": "vnpay"
  }
}
```

### 3.10 Admin Module

- `GET /admin/dashboard`
- `GET /admin/orders?page=&limit=&status=`
- `PUT /admin/users/:id/role`
- `GET /admin/reviews?page=&limit=`
- `DELETE /admin/reviews/:id`
- `GET /admin/authors`
- `POST /admin/authors`
- `PUT /admin/authors/:id`
- `DELETE /admin/authors/:id`
- `GET /admin/payments?page=&limit=&status=&method=`
- `PUT /admin/payments/:id/status`

Update user role:

```json
{
  "role": "admin"
}
```

Update payment status:

```json
{
  "status": "paid",
  "transactionId": "TXN_002"
}
```

### 3.11 Chat (REST + Socket)

REST:
- `POST /chat/send` (alias: `/chats/send`)
- `POST /chat/delete` (alias: `/chats/delete`)
- `GET /chats/my`
- `GET /chats/admin/conversations` (admin)
- `GET /chats/admin/conversations/:userId` (admin)

Send chat user -> admin:

```json
{
  "message": "Xin chao admin"
}
```

Send chat admin -> user:

```json
{
  "toUserId": "66f123456789012345678901",
  "message": "Chao ban"
}
```

Delete conversation (admin):

```json
{
  "toUserId": "66f123456789012345678901"
}
```

Delete conversation (user):

```json
{}
```

Socket:
- Endpoint: `ws://localhost:5000` (cung port backend)
- Connect auth:
  - `auth: { token: "Bearer <jwt>" }` hoac raw token
- Emit:
  - `chat:send`
  - `chat:markRead`
- Receive:
  - `chat:message`

## 4) Demo test toan bo chuc nang

> Goi theo thu tu de test end-to-end tren Postman/Frontend.

1. Register user (`/auth/register`)
2. Login user (`/auth/login`) -> luu token user
3. Login admin (`/auth/login`) -> luu token admin
4. Admin tao category (`/categories`)
5. Admin tao book (`/books`)
6. User xem books (`/books`)
7. User add cart (`/cart/add`)
8. User xem cart (`/cart`)
9. User tao order (`/orders`)
10. Admin xem orders (`/orders`)
11. Admin update order status (`/orders/:id/status`)
12. User update profile (`/users/me`)
13. User upload avatar (`/users/me/avatar`)
14. User doi mat khau (`/users/me/password`)
15. User forgot password (`/auth/forgot-password`) -> lay token tu mail
16. User reset password (`/auth/reset-password`)
17. User tao review (`/reviews`)
18. Admin dashboard (`/admin/dashboard`)
19. Chat:
    - User send (`/chat/send`)
    - Admin xem conversations (`/chats/admin/conversations`)
    - Admin reply (`/chat/send` voi `toUserId`)
    - Admin/User delete conversation (`/chat/delete`)

## 5) Response schema quan trong

Chat module dung schema:

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "..."
}
```

Module khac co the tra schema cu (`message`, `errors`, `stack` trong dev).

## 6) Bien moi truong quan trong

Xem mau day du trong `.env.example`.
Can luu y nhat:

- `PORT`, `MONGO_URI`, `JWT_SECRET`
- SMTP reset password:
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- CORS:
  - `CORS_ORIGINS`
  - `SOCKET_CORS_ORIGIN`
- Socket timeout:
  - `SOCKET_PING_INTERVAL_MS`
  - `SOCKET_PING_TIMEOUT_MS`
  - `SOCKET_CONNECT_TIMEOUT_MS`
- Debug logs:
  - `LOG_CHAT_REQUESTS`
  - `LOG_SOCKET_EVENTS`
  - `LOG_ABORTED_CHAT_REQUESTS`