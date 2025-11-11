# Firebase Authentication - Deployment Checklist

## Pre-Deployment Review (Phase 1: Code Review)

### Code Review Checklist
- [ ] Review all code changes in commits:
  - [ ] `a8c2a5e` - firebase/auth CDN import
  - [ ] `456a9c2` - Auth infrastructure functions
  - [ ] `e3f02f3` - AuthContext + LoginScreen refactor
  - [ ] `3b99f31` - Email-based data access
  - [ ] `3e42cf7` - Firestore security rules
  - [ ] `319ea22` - UID validation
  - [ ] `c8d5573` - Documentation

- [ ] Verify all tests pass (if applicable)
- [ ] Check for lint/TypeScript errors
- [ ] Review security implications with team
- [ ] Approve Firestore rules configuration

### Security Review Checklist
- [ ] Firestore rules validate `ownerUid == request.auth.uid`
- [ ] No hardcoded passwords anywhere
- [ ] UID validation in `getClientData()` present
- [ ] Mock data includes `ownerEmail` and `ownerUid` (for testing)
- [ ] Error messages don't leak user info
- [ ] No plaintext passwords in logs

### Documentation Review Checklist
- [ ] Read `FIREBASE_AUTH_SECURITY.md`
- [ ] Read `FIREBASE_IMPLEMENTATION_SUMMARY.md`
- [ ] Understand auth flow and security layers
- [ ] Confirm Cloud Functions plan (Phase 2)

---

## Pre-Deployment Preparation (Phase 2: Environment Setup)

### Firebase Project Configuration

#### Step 1: Create Firebase Project (if not exists)
```bash
# Via Firebase Console (https://console.firebase.google.com)
1. Create new project (or use existing)
2. Name: "factory-piece-rate-tracker" (or similar)
3. Enable Google Analytics (optional)
4. Create project
```

#### Step 2: Enable Firebase Services
```
Firebase Console → Project Settings:
✅ Authentication (Email/Password)
✅ Firestore Database
✅ Cloud Functions (for Phase 2)
```

#### Step 3: Configure Authentication
```
Firebase Console → Authentication → Sign-in Method:
1. Enable "Email/Password"
   - ✅ Email/Password auth
   - ✅ Email enumeration protection
   - ❌ Disable "Link multiple accounts" for now
2. Advanced settings:
   - ✅ Enable account lockout after failed attempts
   - ✅ Set password requirements: min 6 characters
```

#### Step 4: Create Firestore Database
```
Firebase Console → Firestore Database:
1. Create database
2. Location: Closest to your region (e.g., Singapore)
3. Start in "Production mode" (rules enforced)
4. (NOT test mode - test mode allows all access)
```

#### Step 5: Deploy Firestore Security Rules
```bash
# Install Firebase CLI if needed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

**Verify Deployment:**
```
Firebase Console → Firestore → Rules tab
Should show your rules from firestore.rules file
Timestamp: [current time]
```

#### Step 6: Update Firebase Configuration
```typescript
// lib/firebaseConfig.ts
export const defaultConfig: FirebaseConfig = {
  apiKey: "AIzaSyD...",           // From Firebase Console
  authDomain: "project.firebaseapp.com",
  projectId: "project-id"
};
```

Get values from: **Firebase Console → Project Settings → Your apps**

### Application Configuration

#### Step 1: Configure App for Production
```bash
# Update environment variables (if using .env)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...

# Or configure in index.html importmap (already done)
```

#### Step 2: Build and Test
```bash
npm run build
npm run preview  # Test production build locally
```

#### Step 3: Test Login Flow
```
URL: http://localhost:4173 (or preview URL)
Email: owner@client001.com
Password: 123
Expected: Login succeeds, shows dashboard
```

---

## Staging Deployment (Phase 3: Pre-Production Testing)

### Deploy to Staging Environment

#### Option A: Firebase Hosting
```bash
# Initialize Firebase Hosting
firebase init hosting

# Deploy
npm run build
firebase deploy --only hosting:staging
```

#### Option B: Your Own Server
```bash
# Build
npm run build

# Copy dist/ to staging server
# Configure web server (nginx, apache, etc.)
# Update Firebase Console → Authorized domains list
```

### Staging Testing Checklist

#### Functional Tests
- [ ] Login screen loads
- [ ] Email validation works (invalid emails rejected)
- [ ] Password required (can't login without)
- [ ] Invalid credentials show error
- [ ] Valid credentials → successful login
- [ ] Demo accounts work (owner@client001.com / 123)
- [ ] Dashboard loads after login
- [ ] Logout clears auth state
- [ ] Page refresh maintains auth (via onAuthChange)

#### Security Tests (Firebase Console → Firestore → Debug Rules)

**Test 1: User can read own client**
```
Simulate: GET /clients/client-001
Auth UID: user-abc-123
Document ownerUid: user-abc-123
Expected: ✅ ALLOW
```

**Test 2: User cannot read other's client**
```
Simulate: GET /clients/client-002
Auth UID: user-abc-123
Document ownerUid: user-xyz-789
Expected: ❌ DENY (Permission denied)
```

**Test 3: Unauthenticated users blocked**
```
Simulate: GET /clients/client-001
Auth UID: null (unauthenticated)
Expected: ❌ DENY
```

**Test 4: Subcollections protected**
```
Simulate: GET /clients/client-001/workers/W001
Auth UID: user-abc-123
Document parent ownerUid: user-abc-123
Expected: ✅ ALLOW

Simulate: GET /clients/client-001/workers/W001
Auth UID: user-xyz-789
Document parent ownerUid: user-abc-123
Expected: ❌ DENY
```

#### Performance Tests
- [ ] Login completes < 2 seconds
- [ ] Page loads < 3 seconds
- [ ] No console errors
- [ ] Network tab shows reasonable payload sizes
- [ ] Memory usage stable (no leaks)

#### Cross-Browser Tests
- [ ] Chrome / Chromium ✅
- [ ] Firefox ✅
- [ ] Safari ✅
- [ ] Edge ✅
- [ ] Mobile Safari (iOS) ✅
- [ ] Chrome Mobile (Android) ✅

---

## Production Deployment (Phase 4: Go Live)

### Pre-Production Checklist

#### 24 Hours Before
- [ ] Notify users: "System update tomorrow 2-3pm"
- [ ] Post in support channel
- [ ] Prepare rollback plan
- [ ] Ensure Firebase CLI installed and tested
- [ ] Backup current Firestore data (export)

#### Final Validation
```bash
# 1. Pull latest code
git pull origin main

# 2. Run tests
npm test

# 3. Build production
npm run build

# 4. Verify no errors
npm run build 2>&1 | tee build.log

# 5. Check bundle size
ls -lh dist/index.js
```

### Production Deployment Steps

#### Step 1: Deploy Firestore Rules (if not done)
```bash
firebase deploy --only firestore:rules
```

**Verify:**
- [ ] Rules deployed successfully
- [ ] Rules page shows updated timestamp

#### Step 2: Deploy Application Code
```bash
# Option A: Firebase Hosting
npm run build
firebase deploy --only hosting

# Option B: Traditional Server
npm run build
# Copy dist/ to /var/www/app/ (or your location)
# Restart web server
systemctl restart nginx
```

**Verify:**
- [ ] Deployment completed without errors
- [ ] No console errors on staging/prod
- [ ] Application loads

#### Step 3: Verify Production
```
1. Open https://your-app.com
2. Try login with demo account (owner@client001.com / 123)
3. Verify dashboard loads
4. Check browser console for errors
5. Check Firebase Console → Firestore → Usage
6. Check Firebase Console → Authentication → Users
```

#### Step 4: Monitor for Issues
```bash
# Watch Firestore activity
firebase emulators:start  # Or monitor via console

# Check logs
firebase functions:log  # If deployed functions
```

---

## Post-Deployment (Phase 5: Monitoring & Support)

### Immediate Post-Deployment (First Hour)
- [ ] Monitor error logs
- [ ] Check Firebase usage (Firestore reads/writes)
- [ ] Verify no spike in errors
- [ ] Test login flow multiple times
- [ ] Check with 2-3 team members

### First Day Monitoring
- [ ] Monitor Firestore read/write counts
- [ ] Check for any permission denied errors
- [ ] Monitor authentication errors
- [ ] Test all major features
- [ ] Respond to user issues immediately

### First Week Monitoring
- [ ] Review error logs daily
- [ ] Monitor Firebase quotas/usage
- [ ] Gather user feedback
- [ ] Track login success rate
- [ ] Monitor performance metrics

### Ongoing Monitoring (Weekly)
```bash
# Firebase Console → Analytics
- Daily active users
- Authentication success rate
- Error rate by feature
- Top errors

# Firebase Console → Firestore → Usage
- Storage growth
- Read/write distribution
- Cost estimate
```

---

## Rollback Plan

### If Critical Issues Found

#### Option 1: Immediate Rollback (< 15 minutes)
```bash
# Revert to previous version
git reset --hard <previous-commit>
git push origin main --force-with-lease

# Rebuild and redeploy
npm run build
firebase deploy --only hosting
firebase deploy --only firestore:rules
```

#### Option 2: Disable New Auth (Keep Old System Temporarily)
```typescript
// In AuthContext, temporarily disable Firebase Auth
if (process.env.VITE_USE_LEGACY_AUTH === 'true') {
  // Use old password verification
} else {
  // Use Firebase Auth
}
```

#### Step-by-Step Rollback
1. Notify users: "System under maintenance, reverting to previous version"
2. Git reset to pre-auth commit
3. Rebuild application
4. Redeploy (Firebase or own server)
5. Verify old login flow works
6. Notify users: "Service restored"
7. Post-mortem analysis

---

## User Communication Template

### Email to Existing Clients

**Subject: Important: Your Account Login Update**

```
Dear Factory Owner,

We've upgraded your Factory Piece Rate Tracker to use industry-standard 
Firebase Authentication for improved security.

NEW LOGIN PROCESS:
- Email: your-email@example.com
- Password: Your secure password

OLD PROCESS (No longer available):
- Client ID: Removed for security

IMPORTANT: Your old Client ID password will not work.
Please use your email and password going forward.

DEMO ACCOUNTS (For testing):
- Email: owner@client001.com
- Password: 123

Questions? Contact support@example.com

Best regards,
Textile Factory Team
```

---

## Success Criteria

### ✅ Deployment Successful If:

1. **Functionality**
   - Users can login with email/password
   - Dashboard loads after login
   - All CRUD operations work
   - Logout clears auth state

2. **Security**
   - No password plaintext in logs
   - Firestore rules enforced
   - User A cannot see User B's data
   - Error messages don't leak info

3. **Performance**
   - Login < 2 seconds
   - Page load < 3 seconds
   - No memory leaks
   - Handles concurrent logins

4. **Reliability**
   - 99.9% uptime
   - Zero unhandled errors in production
   - All audit logs created
   - Graceful error handling

---

## Appendix: Troubleshooting During Deployment

### Error: "PERMISSION_DENIED" after login
**Cause**: Firestore rules not deployed or incorrect  
**Fix**: 
```bash
firebase deploy --only firestore:rules
# Verify rules in Firebase Console
```

### Error: "Too many requests" on login attempts
**Cause**: Account lockout due to failed attempts  
**Fix**: 
```
Firebase Console → Authentication → Sign-in Method
→ Advanced → Reduce "Lockout duration"
```

### Error: "Invalid API key" when loading app
**Cause**: Wrong Firebase config  
**Fix**: 
```typescript
// Verify in lib/firebaseConfig.ts
// Get correct values from Firebase Console → Project Settings
```

### Demo accounts don't login
**Cause**: Demo data missing `ownerEmail` field  
**Fix**: 
```typescript
// Ensure MOCK_FIRESTORE_DB has:
clientData: { ownerEmail: 'owner@client001.com' }
```

### Rules deployment fails
**Cause**: Invalid rule syntax  
**Fix**: 
```bash
# Validate rules locally
firebase deploy --only firestore:rules --dry-run
# Check error message
# Fix firestore.rules
# Retry deploy
```

---

## Sign-Off and Approval

### Deployment Team Review
- [ ] Code Reviewer: _________________ Date: _______
- [ ] Security Reviewer: _____________ Date: _______
- [ ] DevOps: ______________________ Date: _______
- [ ] Product Owner: _______________ Date: _______

### Ready for Production Deployment
- [ ] All checklist items completed
- [ ] All team members approved
- [ ] Rollback plan understood
- [ ] Communication sent to users

**Date Approved for Production**: ___________

---

**Next Action**: Deploy to production following the steps above.  
**Expected Completion**: [Deployment window]  
**Support Availability**: 24/7 during first week
