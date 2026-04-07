# Book Store Backend API

Backend hoan chinh cho website ban sach su dung Node.js, Express, MongoDB, JWT.

## 1) Cong nghe

- Node.js (JavaScript)
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- dotenv, cors
- Joi validation

## 2) Cau truc thu muc

```
.
|-- src
|   |-- config
|   |   `-- db.js
|   |-- controllers
|   |-- middlewares
|   |-- models
|   |-- routes
|   |-- services
|   `-- validators
|-- app.js
|-- server.js
|-- package.json
`-- .env.example
```

## 3) Cai dat va chay

### Buoc 1: Cai dependencies

```bash
npm install
```

### Buoc 2: Tao file env

```bash
cp .env.example .env
```

Neu dung Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

### Buoc 3: Chay server

```bash
npm run dev
```

Hoac production:

```bash
npm start
```

## 4) API Base URL

Tat ca API deu co version:

`/api/v1`

Vi du:

- `/api/v1/auth/login`
- `/api/v1/books`
- `/api/v1/orders`

## 5) Danh sach API

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/profile`

### User (admin)

- `GET /api/v1/users`
- `DELETE /api/v1/users/:id`

### Category

- `GET /api/v1/categories`
- `POST /api/v1/categories`
- `PUT /api/v1/categories/:id`
- `DELETE /api/v1/categories/:id`

### Book

- `GET /api/v1/books`
- `GET /api/v1/books/:id`
- `POST /api/v1/books`
- `PUT /api/v1/books/:id`
- `DELETE /api/v1/books/:id`
- `GET /api/v1/books?keyword=&page=&limit=`

### Review

- `POST /api/v1/reviews`
- `GET /api/v1/books/:id/reviews`

### Cart

- `GET /api/v1/cart`
- `POST /api/v1/cart/add`
- `PUT /api/v1/cart/update`
- `DELETE /api/v1/cart/remove`

### Order

- `POST /api/v1/orders`
- `GET /api/v1/orders/my`
- `GET /api/v1/orders`
- `PUT /api/v1/orders/:id/status`

### Admin

- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/orders?page=&limit=&status=`
- `PUT /api/v1/admin/users/:id/role`
- `GET /api/v1/admin/reviews?page=&limit=`
- `DELETE /api/v1/admin/reviews/:id`
- `GET /api/v1/admin/authors`
- `POST /api/v1/admin/authors`
- `PUT /api/v1/admin/authors/:id`
- `DELETE /api/v1/admin/authors/:id`
- `GET /api/v1/admin/payments?page=&limit=&status=&method=`
- `PUT /api/v1/admin/payments/:id/status`

## 6) Vi du JSON request

### Register

`POST /api/v1/auth/register`

```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "password": "123456"
}
```

### Login

`POST /api/v1/auth/login`

```json
{
  "email": "a@example.com",
  "password": "123456"
}
```

### Create Category (admin)

`POST /api/v1/categories`

```json
{
  "name": "Khoa hoc vien tuong",
  "description": "Sach ve khoa hoc va vien tuong"
}
```

### Create Book (admin)

`POST /api/v1/books`

```json
{
  "title": "The Pragmatic Programmer",
  "author": "Andrew Hunt",
  "price": 19.99,
  "stock": 30,
  "description": "A practical software development guide",
  "image": "https://example.com/book.jpg",
  "category": "66f123456789012345678901"
}
```

### Add Review

`POST /api/v1/reviews`

```json
{
  "bookId": "66f123456789012345678901",
  "rating": 5,
  "comment": "Noi dung rat hay"
}
```

### Add To Cart

`POST /api/v1/cart/add`

```json
{
  "bookId": "66f123456789012345678901",
  "quantity": 2
}
```

### Create Order

`POST /api/v1/orders`

```json
{
  "shippingAddress": "123 Nguyen Trai, Quan 1, TP.HCM",
  "paymentMethod": "COD"
}
```

### Update Order Status (admin)

`PUT /api/v1/orders/:id/status`

```json
{
  "status": "shipping"
}
```

## 7) Ghi chu bao mat va production

- Password duoc hash bang bcryptjs.
- API xac thuc bang JWT Bearer token.
- Route admin duoc bao ve boi `authMiddleware` + `adminMiddleware`.
- Su dung Joi de validate request body.
- Da co `errorHandler` va `notFoundHandler`.

## 8) Header can gui cho route can login

```http
Authorization: Bearer <your_jwt_token>
```

## 9) AI Agent sinh backend

Da bo sung module `agent/` ho tro sinh code backend theo yeu cau tu nhien:

```
agent
|-- config
|   |-- default.js
|   `-- index.js
|-- core
|   `-- AgentEngine.js
|-- rules
|   |-- codingRule.js
|   |-- apiRule.js
|   |-- securityRule.js
|   |-- namingRule.js
|   `-- index.js
|-- skills
|   |-- generateModel.js
|   |-- generateAPI.js
|   |-- generateController.js
|   |-- authHandler.js
|   |-- databaseConnector.js
|   |-- validationHandler.js
|   `-- index.js
|-- examples
|   `-- usage.js
`-- index.js
```

### Rules duoc ap dung toan he thong

- `codingRule`: code controller/api phai co `try-catch`
- `apiRule`: API phai dung prefix `/api/v1`
- `securityRule`: password phai co `minlength >= 6`
- `namingRule`: Model name phai la PascalCase

### Chay demo agent

```bash
npm run agent:demo
```

### Vi du su dung

- Input: `Tao model Book` -> goi `generateModel` + `namingRule`
- Input: `Tao API Book` -> goi `generateAPI` + `apiRule`
- Input: `tao backend ban sach day du` -> sinh model + controller + api