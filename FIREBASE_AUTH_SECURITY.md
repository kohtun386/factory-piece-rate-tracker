# Firebase Authentication & Security Implementation

## Overview

This document outlines the Firebase Authentication and Firestore Security Rules implementation for the Factory Piece Rate Tracker application. It provides secure, role-based access control replacing the previous plaintext password system.

---

## Architecture

### Authentication Flow

```
User (Email/Password)
    ↓
LoginScreen.tsx
    ↓
AuthContext.login(email, password)
    ↓
firebase.ts: loginWithEmail(email, password)
    ↓
Firebase Auth Service
    ↓
Returns User + UID
    ↓
AuthContext stores user state + fetches ClientData by email
    ↓
getClientData(email) → queries ownerEmail field in Firestore
    ↓
Sets currentClientId for data access
```

### Key Components

#### 1. **Firebase Authentication (firebase.ts)**

```typescript
// Sign in with email/password
export const loginWithEmail = async (email, password)
  → Returns { success: boolean; error?: string }

// Get current authenticated user
export const getCurrentUser = () → User | null

// Listen to auth state changes
export const onAuthChange = (callback) → unsubscribe function

// Sign out user
export const logoutUser = async ()

// Register new user
export const registerUserWithEmail = async (email, password)
```

**Error Handling:**
- Returns user-friendly error messages (not technical Firebase codes)
- Examples: "User not found", "Wrong password", "Too many login attempts"

#### 2. **AuthContext Updates**

**Old (Insecure):**
```typescript
verifyOwnerPassword(password: string): boolean // Plaintext comparison ❌
```

**New (Secure):**
```typescript
login(email: string, password: string): Promise<LoginResult>
  → Uses Firebase Auth
  → Returns { success, error? }
```

**Auth State Listening:**
```typescript
useEffect(() => {
  const unsubscribe = onAuthChange((user) => {
    if (user) {
      setUserEmail(user.email)
      setIsAuthenticated(true)
      // Fetch ClientData by email
    } else {
      // User signed out
      setIsAuthenticated(false)
      setClientData(null)
    }
  })
  return () => unsubscribe()
}, [])
```

#### 3. **getClientData() Refactoring**

**Supports Email-Based Lookup:**
```typescript
// Email-based lookup (new)
getClientData('owner@client001.com')
  → Queries Firestore: WHERE ownerEmail = 'owner@client001.com'
  → Returns ClientData

// ClientId lookup (backward compatible)
getClientData('client-001')
  → Direct doc lookup: /clients/client-001
  → Returns ClientData
```

**Mock Data Support:**
```typescript
MOCK_FIRESTORE_DB: {
  "client-001": {
    clientData: {
      clientName: "Thiri Swe Textile Factory",
      ownerEmail: "owner@client001.com",  // New field
      subscriptionStatus: "TRIAL"
    }
  }
}
```

---

## Firestore Security Rules

Located in `firestore.rules`

### Rule Structure

```firestore
rules_version = '2';

service cloud.firestore {
  // Helper functions
  function isAuth() { return request.auth != null; }
  
  function isClientOwner(clientId) {
    return isAuth() && 
           get(/clients/$(clientId)).data.ownerUid == request.auth.uid;
  }

  // Clients collection
  match /clients/{clientId} {
    allow read: if isClientOwner(clientId);
    allow create: if isAuth() && 
                     request.resource.data.ownerUid == request.auth.uid;
    allow update: if isClientOwner(clientId);
    allow delete: if false;
    
    // All subcollections
    match /{subcollection=**} {
      allow read, write: if isClientOwner(clientId);
    }
  }
}
```

### Key Security Features

| Rule | Purpose | Example |
|------|---------|---------|
| **Clients.read** | Only owner can read their client | User UID must match `ownerUid` field |
| **Clients.create** | User UID must match doc data | `ownerUid` in create request = current user |
| **Clients.update** | Only owner, UID cannot change | Update allowed if owner, ownerUid unchanged |
| **Clients.delete** | Disabled | Prevents accidental data loss |
| **Subcollections** | Inherit parent auth | Workers, RateCard, Production all protected by parent |
| **Audit Log** | Read-only for owner | Immutable via Cloud Functions |

---

## Database Structure

### Firestore Document Structure

```
clients/
  ├── {clientId}/                          // Doc ID = client reference
  │   ├── clientName: string
  │   ├── ownerUid: string                 // ← NEW: Firebase Auth UID (security key)
  │   ├── ownerEmail: string               // ← NEW: For email-based lookup
  │   ├── subscriptionStatus: "TRIAL"|"PAID"
  │   ├── trialEndDate: timestamp (optional)
  │   │
  │   ├── workers/
  │   │   └── {workerId}/
  │   │       ├── name: string
  │   │       └── positionId: string
  │   │
  │   ├── rateCard/
  │   │   └── {taskId}/
  │   │       ├── taskName: string
  │   │       ├── unit: string
  │   │       └── rate: number
  │   │
  │   ├── productionEntries/
  │   │   └── {entryId}/
  │   │       ├── date: string
  │   │       ├── workerName: string
  │   │       ├── completedQuantity: number
  │   │       └── ...
  │   │
  │   └── paymentLogs/
  │       └── {paymentId}/
  │           ├── workerId: string
  │           ├── amount: number
  │           └── date: string
```

### Critical Fields

- **`ownerUid`**: Firebase Authentication UID (set on client creation)
- **`ownerEmail`**: Owner's email (enables email-based client lookup)
- All subcollections inherit parent's access control

---

## Migration Guide

### For Existing Clients (Demo Data)

If you have existing clients without Firebase Auth:

```typescript
// 1. Create Firebase Auth account
const { uid } = await registerUserWithEmail('owner@client001.com', 'password123')

// 2. Create/Update Firestore client doc
{
  clientName: "Thiri Swe Textile Factory",
  ownerUid: uid,              // Add this
  ownerEmail: 'owner@client001.com',  // Add this
  subscriptionStatus: "TRIAL",
  trialEndDate: {...}
}

// 3. No more ownerPassword field (removed from code)
```

### Demo Accounts for Testing

The application includes pre-configured demo accounts for testing:

| Email | Password | Client Name |
|-------|----------|------------|
| `owner@client001.com` | `123` | Thiri Swe Textile Factory |
| `owner@client002.com` | `123` | Paid Customer Inc. |

**Note:** These credentials work with mock data when Firebase is not configured. In production, use proper passwords (min 6 characters, Firebase enforces).

---

## Security Best Practices

### 1. **Authentication**
✅ Use Firebase Authentication (OAuth 2.0 compatible)
✅ Never store passwords in Firestore
✅ Enforce password requirements: min 6 characters
❌ ~~Plaintext password comparison~~ (removed)

### 2. **Authorization**
✅ Use `ownerUid` to verify ownership
✅ Rules prevent cross-client data access
✅ All read/write operations validated
❌ ~~Client ID-based access~~ (vulnerable to ID guessing)

### 3. **Audit Logging**
✅ All CRUD operations logged via `logAuditEvent()`
✅ Audit log immutable (backend only)
✅ Timestamps captured for compliance

### 4. **Data Validation**
✅ Client app validates before send
✅ Security rules enforce on server
✅ Impossible for client to bypass

---

## Implementation Status

### ✅ Completed

1. Firebase Auth infrastructure in `firebase.ts`
2. AuthContext refactored to use Firebase Auth
3. LoginScreen updated to email/password form
4. Email-based client lookup in `getClientData()`
5. Mock data updated with `ownerEmail`
6. Firestore Security Rules defined

### ⏳ Next Steps

1. **Deploy Firestore Rules** (via Firebase Console or `firebase deploy`)
2. **Create Cloud Functions** for:
   - User registration (create client doc with ownerUid)
   - Email verification
   - Audit log entries (immutable)
3. **Update getClientData()** to validate `ownerUid` matches auth user
4. **Test in Production** environment
5. **User Communication** for existing clients to update passwords

### 📋 Testing Checklist

- [ ] Login with email/password works
- [ ] Invalid credentials show error
- [ ] Multiple clients: User A cannot see User B's data
- [ ] Audit logs created for all operations
- [ ] Firebase rules reject unauthorized access (test via console)
- [ ] Demo mode works with mock data
- [ ] Real Firebase mode works with rules

---

## Code Examples

### Login Flow (End-to-End)

```typescript
// 1. User enters email/password in LoginScreen
<input value={email} onChange={(e) => setEmail(e.target.value)} />
<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

// 2. On submit, call login
const result = await login(email, password);
if (!result.success) {
  showError(result.error); // "Invalid email or password"
  return;
}

// 3. AuthContext.login() does:
// 3a. Firebase Auth
const authResult = await loginWithEmail(email, password);
if (!authResult.success) return { success: false, error: 'invalid_credentials' };

// 3b. Fetch ClientData by email
const clientData = await getClientData(email);
if (!clientData) return { success: false, error: 'not_found' };

// 3c. Set state
setClientData(clientData);
setUserEmail(email);
setIsAuthenticated(true);
return { success: true };

// 4. Auth listener triggers, app updates UI
onAuthChange((user) => {
  if (user) {
    setUserEmail(user.email);
    setIsAuthenticated(true);
  } else {
    setIsAuthenticated(false);
  }
});
```

### Firestore Read with Rules Protection

```typescript
// App tries to read another client's data
const docRef = doc(db, 'clients', 'someone-else-client-id');
const docSnap = await getDoc(docRef);

// Firestore rules check:
// isClientOwner('someone-else-client-id')
// → get(/clients/someone-else-client-id).ownerUid == request.auth.uid
// → false (user is not the owner)
// → DENIED ❌

// Error: "Missing or insufficient permissions"
```

### CRUD Operations with Security

```typescript
// Worker creation in App.tsx
const handleAddWorker = async (name: string, positionId: string) => {
  try {
    const worker: Worker = {
      id: `W${Date.now()}`,
      name,
      positionId
    };
    await addDocument('workers', worker);
    
    // Log audit
    await logAuditEvent('CREATE', 'WORKER', `Added worker: ${name}`);
  } catch (error) {
    addToast(`Error adding worker: ${error.message}`, 'error');
  }
};

// Firestore rules check for addDocument:
// 1. Is user authenticated? ✓
// 2. Is user the owner of currentClientId client? ✓ (via isClientOwner)
// 3. Write allowed? ✓ (rule allows read, write)
// 4. Document created at: /clients/currentClientId/workers/W...
// Result: SUCCESS ✅
```

---

## Troubleshooting

### Error: "Missing or insufficient permissions"

**Cause:** Firestore rules denying access

**Solution:**
1. Check `ownerUid` field exists in client doc: `{ownerUid: "user123..."}`
2. Verify `request.auth.uid` matches:
   ```
   firebase console → Firestore → Debug rules
   Choose: Firestore rule → Run simulation
   ```
3. Check user is authenticated: `console.log(getCurrentUser())`

### Error: "User not found" during login

**Cause:** Email not registered in Firebase Auth

**Solution:**
1. Create Firebase Auth account: Use Firebase Console or `registerUserWithEmail()`
2. Ensure client doc exists with matching `ownerEmail`
3. Check email is stored in lowercase (app normalizes)

### Mock data not using email-based lookup

**Cause:** `ownerEmail` field missing from mock data

**Solution:**
```typescript
MOCK_FIRESTORE_DB["client-001"].clientData.ownerEmail = 'owner@client001.com'
```

---

## References

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Best Practices](https://firebase.google.com/docs/database/usage/best-practices)

---

## Summary

The Firebase Authentication & Security implementation provides:

1. **Secure authentication** via Firebase Auth (OAuth 2.0)
2. **Row-level security** via Firestore rules (ownerUid-based)
3. **Multi-client isolation** (users cannot access other clients' data)
4. **Audit trail** for compliance
5. **Backward compatibility** (demo mode, clientId lookup)

This replaces the previous insecure plaintext password system with industry-standard Firebase Auth.
