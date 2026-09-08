# PHASE 11 OBJECTIVE 4 — AUTHENTICATION & SESSION STORAGE AUDIT

**System:** AI-Powered National Unified Material Master Framework  
**Standard:** ADR-007 / Phase 11 Security & Storage Audit  
**Evaluation Date:** 2026-09-09  
**Audit Scope:** `frontend/src/context/AuthContext.tsx`, `frontend/src/services/api.ts`, `backend/app/api/v1/auth.py`, `backend/app/core/security.py`

---

## 1. Storage & Transmission Architecture

| Storage / Transmission Mechanism | Implementation in Codebase | Stored Data / Values | Lifespan & Scope | Security Exposure Boundary |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend In-Memory State** | React `AuthContext` state (`useState<User>`, `useState<string>`) | Active `User` profile, Access Token string | Tab session lifetime (cleared on reload/close) | Inaccessible outside React component tree |
| **Frontend `localStorage`** | Key: `auth_token` via `setAuthToken()` / `getAuthToken()` in `api.ts` | JWT Access Token | Persistent across reloads & browser restarts | Accessible via JavaScript on same origin (`window.localStorage`). Vulnerable to XSS if malicious scripts execute. |
| **HTTP Authorization Header** | `Authorization: Bearer <token>` in `getHeaders()` (`api.ts`) | JWT Access Token | Transmitted on every authenticated REST API request | Protected over TLS/HTTPS in transit |
| **HttpOnly Set-Cookie** | Backend `response.set_cookie(key="access_token", ...)` | JWT Access Token | 15 Minutes (`SameSite=Lax`, `HttpOnly=True`) | Inaccessible to JavaScript (XSS-safe), automatically attached on same-origin requests |
| **Backend Revocation Storage** | In-Memory `_REVOKED_JTIS: set[str]` / Redis Cache | Revoked JWT Unique Identifiers (`jti`) | Token expiration duration | Server-side memory / protected Redis instance |

---

## 2. Five Core Architectural Questions Answered

### Question 1: Why is `localStorage` currently used?
**Answer:**  
In the Single-Page Application (SPA) architecture (built with Vite + React), `localStorage` is used to persist the user's authentication state across browser page refreshes and tab navigations without forcing the user to re-enter credentials on every hard reload. When `AuthProvider` mounts, `checkSession()` reads `getAuthToken()` from `localStorage` and validates it against the backend via `GET /api/v1/auth/me`.

### Question 2: Which authentication tokens are stored there?
**Answer:**  
Only the **short-lived Access Token** (15-minute validity signed with HMAC-SHA256) is stored under the key `auth_token`. Refresh tokens are **never** stored in `localStorage`; they are issued in secure JSON response payloads and invalidated upon use via single-use JTI revocation.

### Question 3: Is `localStorage` necessary for refresh persistence?
**Answer:**  
No, `localStorage` is **not strictly necessary** for refresh persistence. If a reverse proxy (BFF pattern) or same-origin backend architecture is configured, the browser can rely entirely on `HttpOnly`, `Secure`, `SameSite=Strict` cookies for session management. In a pure client-side SPA decoupled from the API origin during development (e.g. `localhost:5173` -> `localhost:8000`), `localStorage` is the standard decoupled client storage mechanism.

### Question 4: Is the access token duplicated between storage mechanisms?
**Answer:**  
Yes. The access token is held in:
1. In-memory React state (`AuthContext`)
2. Browser `localStorage` (`auth_token`)
3. `HttpOnly` Cookie (`access_token` set by the FastAPI backend during `POST /api/v1/auth/login`)

While dual-storage enables both Bearer token header injection and cookie-based transport, it creates token duplication between the browser's JavaScript-accessible storage and protected cookie jars.

### Question 5: Can a safer design be introduced without breaking SPA behavior?
**Answer:**  
Yes. A safer design can be introduced using the **Backend-for-Frontend (BFF)** proxy pattern or same-domain HttpOnly cookie transport:
- **BFF Architecture:** An API Gateway / Reverse Proxy (e.g. Nginx or Vite dev server proxy) forwards API requests while storing tokens strictly in encrypted, `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
- **Frontend SPA Impact:** Zero breaking changes to React component logic or UX. The frontend simply issues `fetch(..., { credentials: 'include' })` without manually reading or writing `localStorage`.

---

## 3. Official Classification

According to the security taxonomy:

```
[X] ACCEPTABLE FOR MVP
[X] RECOMMENDED FOR FUTURE HARDENING
[ ] REQUIRES IMMEDIATE FIX
[ ] SAFE AS IMPLEMENTED
```

### Rationale:
1. **ACCEPTABLE FOR MVP:** The access token is short-lived (15 minutes), signed with strong HMAC-SHA256, strictly validated on all protected endpoints, and backed by server-side JTI revocation and RBAC. For SIH 2026 prototype and demonstration environments, this is acceptable.
2. **RECOMMENDED FOR FUTURE HARDENING:** For sovereign production deployment under Government of India data protection standards, client-side `localStorage` token storage should be replaced with a full Backend-for-Frontend (BFF) HttpOnly cookie architecture to eliminate cross-site scripting (XSS) token exfiltration risks.
3. **NO IMMEDIATE BREAKING CHANGE:** In adherence to Phase 11 safety rules, no authentication changes are made immediately, preserving full SPA stability and passing all 75 automated tests.
