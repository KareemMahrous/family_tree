# Qawasem Auth API

Node.js backend for:

- Register user with `name`, `phone`, and `password`
- Login with `phone` and `password`
- Return JWT token on login
- Forgot password with OTP
- Reset password using OTP
- Store users in PostgreSQL
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
DATABASE_URL=postgresql://user@localhost:5432/qawasem
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

Family member records use the numeric `id` coming from the remote source.

`family_members` stores only these fields:

- `id`
- `title`
- `fullName`
- `mobile`
- `bod`
- `gender`
- `jobTitle`
- `branch`
- `education`
- `isStillLive`
- `motherName`
- `wifeName`
- `photoUrl`

## Why PostgreSQL

PostgreSQL fits this app well because it handles large user datasets, strong indexing, and recursive family-tree style queries better than a JSON file.

## API Endpoints

## Localization

The API supports localized messages using the `Accept-Language` header.

Examples:

```bash
Accept-Language: en
Accept-Language: ar
Accept-Language: ar-AE
```

If the header starts with `ar`, responses are returned in Arabic. Otherwise, the API uses English.

### Register

`POST /api/auth/register`

```json
{
  "name": "Name",
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

- `pageNumber`
- `pageSize`
- `search`

Example:

```bash
GET /api/family-members?pageNumber=1&pageSize=10
```

### Family Member Details

`GET /api/family-members/:id`

This route is public and returns the same flat member shape used in the paginated list.

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
