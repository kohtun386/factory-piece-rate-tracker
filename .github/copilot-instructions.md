# Copilot Instructions - Factory Piece Rate Tracker

## Project Overview
A React + TypeScript + Tailwind CSS web application for managing textile factory production, worker compensation, and audit tracking. Built with Vite, it supports Firebase (Firestore) with fallback mock data, multi-language (English/Myanmar), and role-based access (Owner/Supervisor).

**Key Commands:**
- `npm run dev` - Start dev server on port 5174
- `npm run build` - Production build
- `npm run preview` - Preview production build

---

## Architecture & Data Flow

### Core Structure
```
App.tsx (main entry point)
├── AuthProvider + LanguageProvider (context wrappers)
├── AppContent (main logic)
│   ├── Dashboard (owner overview only)
│   ├── ProductionForm (supervisor form entry)
│   └── Data/Master/Audit/WorkerLogs views (owner only)
```

### State Management Pattern
- **Global Context**: `AuthContext` (authentication, roles) + `LanguageContext` (i18n)
- **Local Component State**: Fetched in `App.tsx` via `useEffect`, passed as props down the tree
- **Collections**: `workers`, `rateCard`, `jobPositions`, `productionEntries`, `auditLog`, `paymentLogs`
- **Data Persistence**: Firebase Firestore (real) or mock DB fallback in `MOCK_FIRESTORE_DB` (testing)

### Key Data Flow Example
```
ProductionForm (supervisor) → addProductionEntry()
→ addDocument<ProductionEntry>('productionEntries', entry)
→ Firebase or MockDB
→ Updates App.tsx state via setEntries()
→ Re-renders ProductionData component
→ Audit log created via logAuditEvent()
```

---

## Critical Conventions & Patterns

### 1. **ID Generation & Firebase Document Structure**
- **Firestore Path**: `clients/{clientId}/collectionName/docId`
- **ID Format**: Timestamps preferred (`${type}${Date.now()}`) or random Firestore IDs
- **Important**: `addDocument()` extracts the `id` field before storing; only `id` goes in doc path, rest as data
  - Example in `firebase.ts`: `const { id, ...rest } = data; setDoc(docRef, rest)`
- **Recent Fixes**: JobPosition now uses dedicated `id` field (was incorrectly using `englishName`)

### 2. **Worker-Position Relationship**
- `Worker.positionId` (string) → references `JobPosition.id`
- NOT: `Worker.position` (was old pattern, DO NOT USE)
- Always use `positionId` for new code; search components for stale "position" fields if refactoring

### 3. **Audit Logging Pattern**
Located in `App.tsx`, called before/after every CRUD operation:
```typescript
await logAuditEvent(action, target, details)
// action: 'CREATE' | 'UPDATE' | 'DELETE'
// target: 'PRODUCTION_ENTRY' | 'WORKER' | 'RATE_CARD' | 'JOB_POSITION' | 'PAYMENT_LOG'
// Example: logAuditEvent('CREATE', 'WORKER', `Added worker ${worker.id}: ${worker.name}`)
```

### 4. **Role-Based Views**
```typescript
role === 'owner'
  → Dashboard, Data, Master Data, Audit Log, Worker Logs
role === 'supervisor'
  → ProductionForm ONLY (no view navigation)
```
Set after login via `AuthContext.setRole()`.

### 5. **Localization Pattern**
- Hook: `const { t } = useLanguage()`
- Translations in `lib/translations.ts` (nested by language: `translations.en`, `translations.my`)
- Lookup: `t('key')` returns translated string or the key itself as fallback
- Always use translation keys for UI text; never hardcode strings

### 6. **Client Isolation & Login Flow**
1. User enters Client ID → `AuthContext.login(clientId)` fetches `getClientData(clientId)`
2. Sets `currentClientId` in `firebase.ts` (used by all subsequent `getCollection` calls)
3. `ClientData` includes `subscriptionStatus` → checked in `SubscriptionGate` component
4. Owner unlock requires password verification: `verifyOwnerPassword()`

---

## Component Patterns

### Form Components
- **ProductionForm**: Supervisor entry, dynamic task/worker selects, auto-calculates pay/deductions
- **Modal Components**: AddTaskModal, OwnerPasswordModal follow controlled-component pattern
- **Edit-in-Place**: Tables (WorkersTable, RateCardTable) use inline editing with Edit/Save buttons

### Table Components
- Pass data + handlers (onAdd, onUpdate, onDelete) as props
- CRUD operations propagate back to `App.tsx` state
- All deletions first fetch the name for audit logging (example: `rateCard.find(t => t.id === taskId)?.taskName`)

### Display Components
- **ProductionData**: Read-only table with sorting/filtering
- **WorkerLogsPage**: Worker selection → shows earnings/paid/balance + log payment
- **PrintableLog/Report**: Classes with `noprint` CSS for print-friendly export

---

## Firebase & Mock Data Strategy

### Real Firebase
- Requires valid `FirebaseConfig` (apiKey, authDomain, projectId) in `firebaseConfig.ts` or user input
- Firestore rules must allow: `clients/{clientId}/{collectionName}/{docId}` reads/writes
- Enable **offline persistence** via `initializeFirestore()` (modern API)
- Long polling enabled for restricted environments: `experimentalForceLongPolling: true`

### Mock Fallback
- Defined in `MOCK_FIRESTORE_DB` (`firebase.ts`), keyed by clientId (e.g., "client-001")
- Auto-used if `db` is null (Firebase not initialized)
- Supports demo logins: "client-001", "client-002", "client-expired"
- Password for demo: "123" (set in `ownerPassword` field)

### Current Client Tracking
- `currentClientId` variable in `firebase.ts` set only after successful login
- `getCollection()` returns `[]` if no client logged in; all CRUD ops throw "No client logged in"

---

## UI Framework & Styling

### Tailwind CSS
- Config: `tailwind.config.js` (minimal, no custom theme)
- Dark mode: Uses `dark:` prefix for dark theme classes
- Grid layout common: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Shadow standard: `shadow-2xl` for cards, `shadow` for smaller elements

### Print & Export
- CSS class `noprint` hides elements during print (`@media print { .noprint { display: none; } }`)
- CSV export: Built-in to `App.tsx`, generates blob + downloads
- Print button: `window.print()` + `<PrintableLog>` component in hidden section

---

## Common Gotchas & Recent Fixes

1. **JobPosition.id vs englishName**: Code has comments marking the fix (search `ပြင်ဆင်မှု ၂`). Always use `id` for document operations, not `englishName`.
2. **Worker.position vs positionId**: Marked as `ပြင်ဆင်မှု ၁`. New code must use `positionId`; refactor old refs.
3. **Firebase Re-initialization**: Hot-reload may trigger re-init; catch with try/catch and use existing instance (`getFirestore(app)`)
4. **Mock Data Mutations**: `getCollection()` returns a copy to prevent direct mutation; `addDocument()` pushes directly (intentional for immediacy)
5. **Type Casting in `addDocument()`**: Generic cast `as unknown as T[]` needed due to dynamic collection keys; safe if called with correct collection name.

---

## How to Add a New Feature

1. **Add Type**: Update `types.ts` with new interface
2. **Firebase Collection**: Run `getCollection<YourType>('collectionName')` in `App.tsx` useEffect
3. **CRUD Handlers**: Implement in `App.tsx` (add/update/delete), call `logAuditEvent()` after each
4. **Component**: Create or extend table component with handler callbacks
5. **Translations**: Add keys to `lib/translations.ts` (both `en` and `my`)
6. **Audit Logging**: Ensure all operations log with descriptive `details` string

---

## Testing & Debugging

- **Demo Mode**: Use "client-001" ID to access mock data (no Firebase needed)
- **Firestore Rules Check**: Test permission errors with invalid project ID
- **DevTools**: React DevTools for context inspection; check `currentClientId` in Firebase module
- **Mock Data**: Edit `MOCK_FIRESTORE_DB` directly for quick iteration
- **Build**: `npm run build` outputs to `dist/` (Vite default)

---

## File Reference Summary

| File | Purpose |
|------|---------|
| `App.tsx` | Main logic: state, CRUD handlers, audit logging, view routing |
| `contexts/AuthContext.tsx` | Login, role management, password verification |
| `contexts/LanguageContext.tsx` | i18n setup (en/my) |
| `lib/firebase.ts` | Firestore operations + mock DB fallback |
| `lib/firebaseConfig.ts` | Default Firebase config |
| `lib/translations.ts` | Translation strings (2 languages) |
| `types.ts` | All TypeScript interfaces |
| `components/` | React components (forms, tables, views) |
| `tailwind.config.js` | CSS configuration |
| `vite.config.ts` | Vite bundler config (port 5174, React plugin) |
