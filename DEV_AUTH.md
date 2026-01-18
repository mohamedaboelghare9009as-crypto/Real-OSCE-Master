# DEV MODE: Authentication Bypass

## Quick Start (No Login Required)

### 1. Get a Test Token

```bash
POST http://localhost:3001/api/dev-auth/dev-login
Content-Type: application/json

{}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "dev-test-user-001",
    "email": "test@osce.dev",
    "fullName": "Test Student",
    "role": "student",
    "plan": "premium"
  },
  "message": "DEV MODE: Authentication bypassed"
}
```

### 2. Use the Token in Requests

Add the token to your requests:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### 3. Test Voice Interaction

```bash
POST http://localhost:3001/api/voice/interact
Content-Type: application/json

{
  "sessionId": "YOUR_SESSION_ID",
  "text": "I have chest pain"
}
```

### 4. Create a Test Session

```bash
POST http://localhost:3001/api/sessions
Content-Type: application/json

{
  "userId": "dev-test-user-001",
  "caseId": "YOUR_CASE_ID",
  "currentStage": "History"
}
```

## Available Dev Endpoints

- `POST /api/dev-auth/dev-login` - Get test token (no credentials needed)
- `GET /api/dev-auth/dev-me` - Get test user info

## Frontend Integration

In your frontend, you can automatically login in dev mode:

```javascript
// Auto-login in dev mode
const devLogin = async () => {
  const response = await fetch('http://localhost:3001/api/dev-auth/dev-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  const { token, user } = await response.json();
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  return { token, user };
};
```

## Note

⚠️ **This is for development only!** Remove `/api/dev-auth` routes before production deployment.
