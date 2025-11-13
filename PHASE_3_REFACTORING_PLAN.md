# Phase 3: Code Quality Refactoring Plan
## MasterDataContext to Eliminate Prop Drilling

---

## 📋 Executive Summary

**Goal:** Reduce prop drilling by centralizing master data (workers, rateCard, jobPositions) in a new `MasterDataContext`. This improves code maintainability, reduces component complexity, and makes feature additions easier.

**Current State:** 
- App.tsx fetches and manages 3 reference datasets
- Passed down 2-3 levels deep (App → MasterDataTable/ProductionForm → Tables/Selects)
- Callbacks (CRUD handlers) also drilled down through multiple layers

**Proposed State:**
- MasterDataContext wraps reference data + CRUD callbacks
- Components use `useMasterData()` hook instead of props
- Eliminates ~60+ lines of prop drilling code
- No functional changes to user experience

---

## 🏗️ Architecture Overview

### Current Data Flow (Problematic)
```
App.tsx
├── [workers] ──────────────┐
├── [rateCard] ────────────┤
└── [jobPositions] ────────┤
                           ↓
              Passed 2-3 levels deep
                           ↓
         WorkersTable, RateCardTable, JobPositionsTable
         ProductionForm (receives workers + rateCard)
         WorkerSearch (derives workers)
```

### New Data Flow (Proposed)
```
App.tsx (wraps with MasterDataProvider)
         ↓
    MasterDataContext (centralized)
         ↓
    Any component using useMasterData() hook
         ├── WorkersTable
         ├── RateCardTable
         ├── JobPositionsTable
         ├── ProductionForm
         └── WorkerSearch
```

### Context Shape
```typescript
interface MasterDataContextType {
  // Data
  workers: Worker[];
  rateCard: RateCardEntry[];
  jobPositions: JobPosition[];
  
  // Loading states
  isLoading: boolean;
  loadingOperation: string | null;
  
  // Workers CRUD
  handleAddWorker: (worker: Worker) => Promise<void>;
  handleUpdateWorker: (worker: Worker) => Promise<void>;
  handleDeleteWorker: (workerId: string) => Promise<void>;
  
  // Rate Card CRUD
  handleAddRateCardEntry: (task: RateCardEntry) => Promise<void>;
  handleUpdateRateCardEntry: (task: RateCardEntry) => Promise<void>;
  handleDeleteRateCardEntry: (taskId: string) => Promise<void>;
  
  // Job Positions CRUD
  handleAddJobPosition: (position: JobPosition) => Promise<void>;
  handleUpdateJobPosition: (position: JobPosition) => Promise<void>;
  handleDeleteJobPosition: (positionId: string) => Promise<void>;
}
```

---

## 🎯 Detailed Refactoring Steps

### Phase 3.1: Create MasterDataContext
**File:** `contexts/MasterDataContext.tsx`
**Changes:** 
- Create context interface
- Create provider component
- Create `useMasterData()` hook
- Move all CRUD logic from App.tsx

**Benefits:**
- Centralized data management
- Reusable hook pattern
- Easy to test context in isolation
- Clear separation of concerns

**Estimated Effort:** 45 minutes
**Risk Level:** 🟢 Low (no functional changes, purely refactoring)
**Git Commit:** `feat(context): create MasterDataContext for centralized master data management`

---

### Phase 3.2: Refactor ProductionForm
**File:** `components/ProductionForm.tsx`
**Current Props:**
```tsx
interface ProductionFormProps {
  workers: Worker[];
  rateCard: RateCardEntry[];
  onAddEntry: (entry: ProductionEntry) => void;
  onAddTask: (task: RateCardEntry) => void;
}
```

**After Refactor:**
```tsx
interface ProductionFormProps {
  onAddEntry: (entry: ProductionEntry) => void;  // Still needed (parent integration)
}

const ProductionForm: React.FC<ProductionFormProps> = ({ onAddEntry }) => {
  const { workers, rateCard, handleAddRateCardEntry } = useMasterData();
  // ... rest of component
}
```

**Benefits:**
- 2 fewer props to manage
- Simpler component interface
- Can fetch workers/rateCard from context directly

**Estimated Effort:** 10 minutes
**Risk Level:** 🟢 Low (simple hook replacement)
**Git Commit:** `refactor(ProductionForm): use MasterDataContext instead of props`

**Testing:**
- Add task modal still works
- Form submit still triggers parent callback
- Worker/task dropdowns populate correctly

---

### Phase 3.3: Refactor WorkersTable
**File:** `components/WorkersTable.tsx`
**Current Props:**
```tsx
interface WorkersTableProps {
  data: Worker[];
  jobPositions: JobPosition[];
  onAdd: (worker: Worker) => void;
  onUpdate: (worker: Worker) => void;
  onDelete: (workerId: string) => void;
  isLoading?: boolean;
}
```

**After Refactor:**
```tsx
interface WorkersTableProps {
  // No props! Everything from context
}

const WorkersTable: React.FC<WorkersTableProps> = () => {
  const { 
    workers, 
    jobPositions,
    handleAddWorker,
    handleUpdateWorker,
    handleDeleteWorker,
    isLoading 
  } = useMasterData();
  // ... rest of component
}
```

**Benefits:**
- 6 props eliminated → 0 props
- Table becomes true "smart component" (fetches own data)
- Handlers are centralized and consistent across the app

**Estimated Effort:** 20 minutes
**Risk Level:** 🟢 Low (straightforward mapping)
**Git Commit:** `refactor(WorkersTable): use MasterDataContext instead of props`

**Testing:**
- Add worker form still works
- Edit inline still works
- Delete confirmation still works
- Job position dropdown populates correctly

---

### Phase 3.4: Refactor RateCardTable
**File:** `components/RateCardTable.tsx`
**Current Props:**
```tsx
interface RateCardTableProps {
  data: RateCardEntry[];
  onAdd: (task: RateCardEntry) => void;
  onUpdate: (task: RateCardEntry) => void;
  onDelete: (taskId: string) => void;
}
```

**After Refactor:**
```tsx
interface RateCardTableProps {
  // No props!
}

const RateCardTable: React.FC<RateCardTableProps> = () => {
  const { 
    rateCard,
    handleAddRateCardEntry,
    handleUpdateRateCardEntry,
    handleDeleteRateCardEntry
  } = useMasterData();
  // ... rest of component
}
```

**Benefits:**
- 4 props eliminated
- Matches pattern established in WorkersTable

**Estimated Effort:** 15 minutes
**Risk Level:** 🟢 Low
**Git Commit:** `refactor(RateCardTable): use MasterDataContext instead of props`

**Testing:**
- Add task form still works
- Edit inline still works
- Delete still works

---

### Phase 3.5: Refactor JobPositionsTable
**File:** `components/JobPositionsTable.tsx`
**Current Props:**
```tsx
interface JobPositionsTableProps {
  data: JobPosition[];
  onAdd: (position: JobPosition) => void;
  onUpdate: (position: JobPosition) => void;
  onDelete: (positionId: string) => void;
}
```

**After Refactor:**
```tsx
interface JobPositionsTableProps {
  // No props!
}

const JobPositionsTable: React.FC<JobPositionsTableProps> = () => {
  const {
    jobPositions,
    handleAddJobPosition,
    handleUpdateJobPosition,
    handleDeleteJobPosition
  } = useMasterData();
  // ... rest of component
}
```

**Estimated Effort:** 15 minutes
**Risk Level:** 🟢 Low
**Git Commit:** `refactor(JobPositionsTable): use MasterDataContext instead of props`

---

### Phase 3.6: Update App.tsx to Use MasterDataProvider
**File:** `App.tsx`
**Changes:**
1. Remove `workers`, `rateCard`, `jobPositions`, `loadingOperation` state (move to context)
2. Remove all CRUD handlers (move to context)
3. Wrap AppContent with `<MasterDataProvider>`
4. Simplify component rendering (no props passed to tables)

**Before:**
```tsx
<WorkersTable 
  data={workers} 
  jobPositions={jobPositions}
  onAdd={handleAddWorker}
  onUpdate={handleUpdateWorker}
  onDelete={handleDeleteWorker}
  isLoading={loadingOperation === 'addWorker' || ...}
/>
```

**After:**
```tsx
<WorkersTable />
```

**Benefits:**
- App.tsx reduces from ~366 lines to ~290 lines
- ~76 lines of state + handlers removed
- Much clearer separation of concerns
- ProductionForm still receives `onAddEntry` callback (parent integration)

**Estimated Effort:** 30 minutes
**Risk Level:** 🟡 Medium (core refactoring, needs testing)
**Git Commit:** `refactor(App): use MasterDataProvider, eliminate prop drilling`

---

### Phase 3.7: Update WorkerSearch (Optional)
**File:** `components/WorkerSearch.tsx`
**Current:** Uses `workers` prop (from parent chain)
**After:** Uses `useMasterData()` hook

**Estimated Effort:** 5 minutes
**Priority:** Low (optional, not causing major prop drilling)

---

## 🧪 Comprehensive Testing Plan

### Unit Tests per Component

#### ProductionForm
- [ ] Worker dropdown populated from context
- [ ] Task dropdown populated from context
- [ ] Form submit still calls parent `onAddEntry` callback
- [ ] Add task button opens modal with task creation

#### WorkersTable
- [ ] Table displays workers from context
- [ ] Job position dropdown shows all positions
- [ ] Add worker form works and calls context handler
- [ ] Edit inline triggers context update
- [ ] Delete shows confirmation and calls context handler
- [ ] Loading state displays spinner

#### RateCardTable
- [ ] Table displays rate cards from context
- [ ] Add task form works and calls context handler
- [ ] Edit inline triggers context update
- [ ] Delete calls context handler

#### JobPositionsTable
- [ ] Table displays positions from context
- [ ] Add position form works
- [ ] Edit inline works
- [ ] Delete works

### Integration Tests

#### App.tsx with MasterDataProvider
- [ ] Provider wraps all components correctly
- [ ] All CRUD operations flow through context
- [ ] Loading states work across all tables
- [ ] Audit logging still functions
- [ ] Master Data view renders all three tables
- [ ] No console errors or warnings

#### ProductionForm Integration
- [ ] Supervisor can add entry
- [ ] Entry added notification appears
- [ ] ProductionData table refreshes (via callback)
- [ ] Add task from form works

#### Full E2E Flow
- [ ] Login as owner
- [ ] Navigate to Master Data
- [ ] Add worker → appears in table
- [ ] Add rate card → appears in form dropdown
- [ ] Add job position → appears in worker form
- [ ] Edit any master data item
- [ ] Delete any master data item
- [ ] Audit log records all operations
- [ ] Switch to supervisor view → form shows all data

---

## ⚡ Optimization Opportunities (Post-Phase 3)

### Optional Enhancements
1. **Memoization:** Wrap context value with `useMemo()` to prevent unnecessary re-renders
   ```tsx
   const value = useMemo(() => ({
     workers, rateCard, jobPositions,
     handleAddWorker, handleUpdateWorker, ...
   }), [workers, rateCard, jobPositions, ...]);
   ```

2. **Selective Re-renders:** Split context into separate contexts if needed
   - `WorkersContext` (workers + CRUD)
   - `RateCardContext` (rateCard + CRUD)
   - `JobPositionsContext` (jobPositions + CRUD)
   - Benefit: RateCardTable doesn't re-render when workers change

3. **Error Boundary:** Wrap provider with error boundary for resilience
   - Catch Firebase errors gracefully
   - Display user-friendly error messages

4. **Loading States:** Add per-operation loading (not just generic flag)
   ```typescript
   interface OperationStatus {
     [key: string]: { isLoading: boolean; error?: string };
   }
   ```

---

## 📊 Impact Summary

### Code Reduction
- **App.tsx:** ~366 lines → ~290 lines (saves ~76 lines)
- **Props Eliminated:**
  - WorkersTable: 6 props → 0 props
  - RateCardTable: 4 props → 0 props
  - JobPositionsTable: 4 props → 0 props
  - ProductionForm: 2 props → 0 props (workers, rateCard)
  - **Total: 16 props eliminated**

### Maintainability
- ✅ Easier to add new master data type (e.g., `departments`)
- ✅ Easier to add new CRUD operations globally
- ✅ Testing individual components becomes easier
- ✅ New developers understand prop flow immediately

### Performance
- ⚪ No functional performance change (same data flow)
- ⚪ Potential optimization with memoization (optional)
- ⚠️ Risk: If context value changes frequently, could cause unnecessary re-renders (mitigated by useMemo)

### Risk Assessment
- 🟢 **Low Overall Risk**
  - Purely refactoring (no feature changes)
  - Each step can be tested independently
  - Easy to revert if needed
  - Firebase layer untouched

---

## 🔄 Implementation Schedule

### Recommended Order (by dependency)

| Step | Task | Time | Dependencies |
|------|------|------|--------------|
| 1 | Create MasterDataContext | 45 min | None |
| 2 | Update App.tsx to use provider | 30 min | Step 1 |
| 3 | Refactor ProductionForm | 10 min | Step 2 |
| 4 | Refactor WorkersTable | 20 min | Step 2 |
| 5 | Refactor RateCardTable | 15 min | Step 2 |
| 6 | Refactor JobPositionsTable | 15 min | Step 2 |
| 7 | Optional: WorkerSearch | 5 min | Step 2 |
| 8 | Testing + Fix Bugs | 30-60 min | Steps 1-7 |

**Total Time:** ~3-4 hours

**Recommended Approach:** 
- Do 1-2 steps per session
- Run full test suite after each major refactor
- Commit after each successful component refactor
- Final integration test at the end

---

## 📝 Git Commit Messages (Suggested)

```
feat(context): create MasterDataContext for centralized master data management
refactor(App): use MasterDataProvider, eliminate prop drilling
refactor(ProductionForm): use MasterDataContext instead of props
refactor(WorkersTable): use MasterDataContext instead of props
refactor(RateCardTable): use MasterDataContext instead of props
refactor(JobPositionsTable): use MasterDataContext instead of props
test(Phase3): comprehensive testing of context refactoring
docs(Phase3): update architecture documentation post-refactoring
```

---

## 🎓 Key Learnings & Principles

### Prop Drilling Pattern
**Problem:** Props passed through 2-3 levels of components that don't use them
```
App → MasterDataTable → WorkersTable
       └─ need props, don't use them
```

**Solution:** Context API moves data "closer" to consumer
```
App → MasterDataProvider
       ↓
WorkersTable (hook directly into context)
```

### When to Use Context
✅ **Good Use Cases:**
- Frequently accessed reference data
- CRUD operations shared across multiple components
- Theme/Language settings
- User authentication

❌ **Bad Use Cases:**
- Frequently changing data (performance hits)
- Component-level temporary state
- Props that make component API clear

### Component Architecture Pattern
**Smart Components** (use hooks, manage state)
- WorkersTable (gets workers from context)
- ProductionForm (gets workers, rateCard from context)

**Dumb Components** (pure presentational)
- StatCard
- PrintableLog
- ToastContainer

---

## 🚀 Next Steps (Ready to Start?)

1. **Confirm Plan:** Review this document with stakeholder
2. **Create Backup:** Ensure all work is committed
3. **Start Phase 3.1:** Create MasterDataContext
4. **Iterative Approach:** Complete one refactor step at a time
5. **Test Thoroughly:** Run smoke tests after each step
6. **Document Changes:** Update this file as you go

---

## 📚 Reference Files

**New File to Create:**
- `contexts/MasterDataContext.tsx`

**Files to Modify:**
- `App.tsx` (remove state, add provider)
- `components/ProductionForm.tsx` (use hook)
- `components/WorkersTable.tsx` (use hook)
- `components/RateCardTable.tsx` (use hook)
- `components/JobPositionsTable.tsx` (use hook)
- `components/WorkerSearch.tsx` (optional, use hook)

**Files NOT Changing:**
- `types.ts` (no type changes needed)
- `lib/firebase.ts` (no Firebase changes)
- `contexts/AuthContext.tsx` (separate concern)
- `contexts/LanguageContext.tsx` (separate concern)

---

**Status:** Ready for Implementation ✅
**Last Updated:** Phase 3 Planning Complete
**Next Action:** Wait for user confirmation, then start Phase 3.1
