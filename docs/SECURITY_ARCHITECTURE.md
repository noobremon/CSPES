# Security, Identity & Data Access Architecture (ADR-007 Approved)

**System:** AI-Powered National Unified Material Master Framework  
**Document Classification:** System Architecture (Phase 3)  
**Security Standard:** Government Public Sector Enterprise Baseline  
**Status:** `APPROVED`

---

## 1. Decision Record (ADR-007 Finalization)

### Selected Auth Strategy: Stateless JWT in HttpOnly SameSite Cookies + Anti-CSRF Defense
- **Selected Option:** Cryptographically signed JSON Web Tokens (JWT) stored in `HttpOnly`, `Secure`, `SameSite=Lax/Strict` cookies combined with a **Double Submit Anti-CSRF Token** header defense.
- **Security Posture Clarification:** *HttpOnly cookies significantly reduce direct JavaScript access to authentication credentials, mitigating token exfiltration via basic XSS. However, HttpOnly cookies do not eliminate all XSS-related attack vectors (such as unauthorized client-side request dispatch or UI redressing). A defense-in-depth model incorporating Content Security Policy (CSP), Pydantic input sanitization, React JSX contextual output encoding, and Anti-CSRF headers is strictly enforced.*

---

## 2. Multi-Layer Defense Architecture

```mermaid
flowchart TD
    subgraph L1["Layer 1: Perimeter & Transport Security"]
        TLS["TLS 1.3 Transport Encryption"]
        CORS["Strict CORS Allowlist (Specific CPSE Domains)"]
        RateLimit["Rate Limiting (Redis Token Bucket)"]
        CSP["Content Security Policy Headers (CSP)"]
    end

    subgraph L2["Layer 2: Authentication & Anti-CSRF Defense"]
        CookieAuth["HttpOnly + Secure + SameSite JWT Cookie"]
        CSRF["Anti-CSRF Header Token (X-CSRF-Token) Verification"]
        TokenBlacklist["Redis Token Blacklist (Instant Logout Invalidation)"]
        PasswordHash["Argon2id Password Hashing (12+ Rounds)"]
    end

    subgraph L3["Layer 3: Cross-CPSE Data Access & Tenant Isolation"]
        RLS["PostgreSQL Row-Level Security (Layer 1 Private Isolation)"]
        SanitizedLayer["Layer 2 Sanitized Intelligence (Masked Vendor & Pricing)"]
        InputVal["Pydantic v2 Schema Sanitization"]
    end

    subgraph L4["Layer 4: Audit Integrity & Non-Repudiation"]
        AuditLock["Append-Only Immutable Audit Log (Trigger-Enforced)"]
        AuditDossier["Certified Audit Trail Verification"]
    end

    L1 --> L2 --> L3 --> L4
```

---

## 3. Anti-CSRF Defense & Cookie Security Specifications

1. **CSRF Mitigation Architecture:**
   - Cookie-based authentication introduces vulnerability to Cross-Site Request Forgery (CSRF). To completely eliminate this risk, the backend implements the **Double Submit Anti-CSRF Pattern**:
     - Upon login, the server issues a cryptographically random, unguessable CSRF token in a non-HttpOnly cookie (`csrf_token`).
     - Every state-mutating HTTP request (`POST`, `PUT`, `PATCH`, `DELETE`) from the React client must read this token and attach it as a custom request header: `X-CSRF-Token`.
     - The FastAPI API gateway validates that the header matches the cookie token before processing the request.
2. **Session Lifespan & Token Invalidation:**
   - **Access Token TTL:** 15 minutes (short-lived).
   - **Refresh Token TTL:** 7 days (stored in a separate HttpOnly cookie with single-use rotation).
   - **Logout Invalidation:** When a user logs out, the access token signature is immediately written to Redis with a TTL matching the remaining token lifespan, blocking any subsequent reuse.

---

## 4. Cross-CPSE Data Protection & Tenant Isolation

As specified in [CROSS_CPSE_DATA_ACCESS_MODEL.md](file:///c:/Users/User/Desktop/CSPES/docs/CROSS_CPSE_DATA_ACCESS_MODEL.md):
- **Layer 1 (Private Operational Data):** Raw ERP records and negotiated purchase order prices are isolated per CPSE via database-level Row-Level Security (RLS).
- **Layer 2 (Sanitized Intelligence):** AI deduplication processes only normalized technical specifications (dimensions, metallurgy, standards); proprietary vendor identities and contract prices are stripped prior to similarity matching.
- **Layer 3 (National Governed Master):** Public national CNMC catalog and anonymized statistical price distributions.
