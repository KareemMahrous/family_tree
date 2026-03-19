# Qawasem Auth API

Node.js backend for:

- Register user with `name`, `phone`, and `password`
- Login with `phone` and `password`
- Return JWT token on login
- Forgot password with OTP
- Reset password using OTP
- Store users in PostgreSQL
- Prepare for family-tree style relationships

## Requirements

- Node.js
- PostgreSQL running locally

## Setup

```bash
npm install
```

## Environment variables

```bash
PORT=3000
JWT_SECRET=super-secret-jwt-key
DATABASE_URL=postgresql://mahrous@localhost:5432/qawasem
```

Create a `.env` file in the project root and add the values above.

If your local PostgreSQL user is different, update `DATABASE_URL` to match it.

## Create the Database

If PostgreSQL is installed locally, create the database with:

```bash
createdb qawasem
```

If the database already exists, you can skip this step.

## Run the Project

Start the API with:

```bash
npm start
```

Server runs by default on `http://localhost:3000`.

On startup, the app creates these tables automatically:

- `users`
- `family_members`
- `family_relations`

Users use UUIDs as their primary IDs.

`family_members` stores the people in the family tree, whether they are app users or not.
`family_relations` stores the relationship edges between those family members.

## Docker

Docker is optional.

The project may include a `docker-compose.yml` file only as a convenience for people who want to run PostgreSQL with Docker. You do not need Docker if you already have PostgreSQL installed locally.

## Why PostgreSQL

PostgreSQL fits this app well because it handles large user datasets, strong indexing, and recursive family-tree style queries better than a JSON file.

## API Endpoints

## Localization

The API supports localized messages using the `Accept-Language` header.

Examples:

```bash
Accept-Language: en
Accept-Language: ar
Accept-Language: ar-EG
```

If the header starts with `ar`, responses are returned in Arabic. Otherwise, the API uses English.

### Register

`POST /api/auth/register`

```json
{
  "name": "Mahrous",
  "phone": "01012345678",
  "password": "123456"
}
```

### Login

`POST /api/auth/login`

```json
{
  "phone": "01012345678",
  "password": "123456"
}
```

### Current User

`GET /api/auth/me`

Headers:

```bash
Authorization: Bearer <jwt-token>
```

This route requires a valid JWT token returned from login.

### Family Members

`GET /api/family-members`

This route is public and does not require a token.

Query params:

- `page`
- `pageSize`

Example:

```bash
GET /api/family-members?page=1&pageSize=10
```

### Family Member Details

`GET /api/family-members/:id`

This route is public and returns a family member in a shape compatible with your Flutter model, including:

- `relations`
- `parent`
- `childs`

### Forgot Password

`POST /api/auth/forgot-password`

```json
{
  "phone": "01012345678"
}
```

This generates OTP `0000` by default for demo purposes.

### Reset Password

`POST /api/auth/reset-password`

```json
{
  "phone": "01012345678",
  "otp": "0000",
  "newPassword": "654321"
}
```
