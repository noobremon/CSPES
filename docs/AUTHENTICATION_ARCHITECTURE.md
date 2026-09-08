# AUTHENTICATION & IDENTITY ARCHITECTURE

**System:** AI-Powered National Unified Material Master Framework  
**Standard:** ADR-007 (Secure Multi-Tenant Authentication & RBAC)  
**Status:** IMPLEMENTED & AUTOMATED TEST VERIFIED  

---

## 1. Authentication Architecture Overview

The system uses standard JSON Web Tokens (JWT) signed with HMAC-SHA256 (`HS256`) and native salted `bcrypt` password hashing (12 rounds).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION FLOW (PHASE 10)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [Client (React SPA)] ──( POST /auth/login {email, password} )──►       │
│                                                                         │
│  [FastAPI Backend]                                                      │
│    1. Verify password via native bcrypt.checkpw                         │
│    2. Generate Access Token (exp: 15m, sub: user_id, role, jti)         │
│    3. Generate Refresh Token (exp: 7d, sub: user_id, type: refresh, jti) │
│    4. Set HttpOnly Cookie (SameSite=Lax)                                │
│    5. Return JSON payload {access_token, refresh_token, user}           │
│    6. Write sanitized audit log (action: LOGIN_SUCCESS)                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Token Storage & Lifecycle (Actual Implementation)

| Token Type | Lifespan | Client Storage Mechanism | Server Validation | Security Boundary |
| :--- | :--- | :--- | :--- | :--- |
| **Access Token** | 15 Minutes | In-Memory (`AuthContext`) + `localStorage` for SPA refresh | JWT signature + expiration check + JTI revocation check | Bearer header / HttpOnly cookie |
| **Refresh Token** | 7 Days | Memory / JSON body (Processed on `/auth/refresh`) | JWT signature + JTI rotation check in revocation cache | Revoked on rotation & logout |

### XSS & Storage Disclosure Notice
- **Actual Implementation:** The single-page frontend stores the Bearer access token in `localStorage` to persist active sessions across page reloads without requiring external reverse proxy configuration.
- **Production Boundary:** If an XSS vulnerability exists on the frontend domain, `localStorage` is accessible by JavaScript. For high-security sovereign production environments, a Backend-for-Frontend (BFF) proxy pattern is recommended to manage tokens exclusively in encrypted HttpOnly/Secure cookies.

---

## 3. Refresh Token Rotation & Invalidation

1. When a client calls `POST /api/v1/auth/refresh` with an active refresh token, the server:
   - Verifies the token's signature and expiration.
   - Checks the token's unique `jti` against the revocation cache.
   - If the `jti` is already revoked, the request is **rejected with HTTP 401 Unauthorized**.
   - If valid, the old `jti` is immediately **added to the revocation cache**.
   - A new access token and a fresh refresh token (with a new `jti`) are returned to the client.
2. When a user logs out (`POST /api/v1/auth/logout`):
   - The active token `jti` is added to the revocation cache.
   - HttpOnly cookies are deleted.
   - Any subsequent attempt to use the logged-out token returns `HTTP 401 Unauthorized`.

---

## 4. Development vs. Production Seeding Guard

- `POST /api/v1/auth/seed-demo-users` is an idempotent setup utility for SIH development and evaluation.
- **Production Guard:** When `ENVIRONMENT=production`, the endpoint is **permanently disabled and returns 403 Forbidden**.
