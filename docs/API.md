# TaskFlow Pro API Documentation

Base URL:

```text
http://localhost:5000
```

Authenticated endpoints require:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

All responses use:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

Errors use:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "A valid email is required" }]
}
```

## Health

### GET `/health`

Returns service and database status.

## Authentication

### POST `/api/auth/register`

Creates a user, hashes the password with bcrypt, sends an email verification link, and returns a JWT.

Request:

```json
{
  "name": "Rishav",
  "email": "rishav@example.com",
  "phone": "9876543210",
  "password": "Password123"
}
```

Response `201`:

```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "accessToken": "jwt",
    "token": "jwt",
    "user": {
      "id": "mongo-id",
      "uid": "mongo-id",
      "name": "Rishav",
      "email": "rishav@example.com",
      "phone": "9876543210",
      "role": "user",
      "emailVerified": false,
      "createdAt": 1760000000000
    }
  }
}
```

### POST `/api/auth/login`

Request:

```json
{
  "email": "rishav@example.com",
  "password": "Password123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt",
    "token": "jwt",
    "user": {}
  }
}
```

### GET `/api/auth/me`

Returns the authenticated user profile.

### POST `/api/auth/logout`

Stateless JWT logout. The client should discard its stored token.

### POST `/api/auth/verify-email`

Request:

```json
{
  "token": "email-verification-token"
}
```

### GET `/api/auth/verify-email/:token`

Browser/deep-link-friendly email verification endpoint.

### POST `/api/auth/resend-verification`

Authenticated. Sends a new verification email when the current user is not verified.

### POST `/api/auth/forgot-password`

Always returns a generic success response to avoid account enumeration.

Request:

```json
{
  "email": "rishav@example.com"
}
```

### POST `/api/auth/reset-password`

Request:

```json
{
  "token": "password-reset-token",
  "password": "NewPassword123"
}
```

## User

### GET `/api/users/profile`

Returns the authenticated user profile.

### PATCH `/api/users/profile`

Request:

```json
{
  "name": "Rishav Kumar",
  "phone": "9876543210"
}
```

### GET `/api/users/preferences`

Response:

```json
{
  "success": true,
  "data": {
    "preferences": {
      "theme": "system",
      "language": "en",
      "timezone": "UTC",
      "weekStartsOn": "monday"
    }
  }
}
```

### PATCH `/api/users/preferences`

Allowed fields:

```json
{
  "theme": "dark",
  "language": "en",
  "timezone": "Asia/Kolkata",
  "weekStartsOn": "monday"
}
```

### GET `/api/users/notification-preferences`

### PATCH `/api/users/notification-preferences`

Matches the Android settings keys and frontend settings service concepts:

```json
{
  "pushEnabled": true,
  "taskReminders": true,
  "taskCompletedAlerts": true,
  "highPriorityAlerts": true,
  "dailySummary": false,
  "emailUpdates": false
}
```

## Tasks

Task dates use millisecond timestamps in responses for compatibility with Android and `frontend-web`.

### GET `/api/tasks`

Query parameters:

- `completed=true|false`
- `priority=low|medium|high`
- `page=1`
- `limit=50`

Response:

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task-id",
        "title": "Complete Project Submission",
        "description": "Prepare final deliverables",
        "dueDate": 1760000000000,
        "priority": "high",
        "completed": false,
        "completedAt": null,
        "userId": "user-id",
        "createdAt": 1760000000000,
        "updatedAt": 1760000000000
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "pages": 1
    }
  }
}
```

### GET `/api/tasks/:id`

Returns one task owned by the authenticated user.

### POST `/api/tasks`

Request:

```json
{
  "title": "Complete Project Submission",
  "description": "Prepare final deliverables",
  "priority": "high",
  "dueDate": 1760000000000
}
```

Creates a task and stores a notification.

### PATCH `/api/tasks/:id`

Request:

```json
{
  "title": "Updated title",
  "completed": true
}
```

Updates a task and stores an update or completion notification.

### PATCH `/api/tasks/:id/complete`

Marks a task as complete and stores a completion notification.

### DELETE `/api/tasks/:id`

Deletes a task and stores a deletion notification.

### GET `/api/tasks/stats`

Response:

```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 10,
      "completed": 4,
      "active": 6,
      "overdue": 1,
      "dueToday": 2,
      "completionRate": 40,
      "byPriority": {
        "low": 2,
        "medium": 5,
        "high": 3
      }
    }
  }
}
```

## Notifications

### GET `/api/notifications`

Query parameters:

- `read=true|false`
- `page=1`
- `limit=50`

### POST `/api/notifications`

Stores a custom notification for the authenticated user.

Request:

```json
{
  "title": "Reminder",
  "message": "Daily summary is ready",
  "type": "system",
  "metadata": {
    "source": "scheduler"
  }
}
```

### PATCH `/api/notifications/:id/read`

Marks one notification as read.

### PATCH `/api/notifications/read-all`

Marks all unread notifications as read.

## Security Notes

- Passwords are stored only as bcrypt hashes.
- JWTs contain the user id in `sub`.
- Email verification and password reset tokens are stored as SHA-256 hashes.
- Auth routes have a stricter rate limit than general API routes.
- CORS origins are controlled by `CORS_ORIGIN`.
- Secrets and connection strings must come from environment variables.
