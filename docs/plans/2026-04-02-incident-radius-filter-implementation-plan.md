# Incident Radius Filter Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a configurable farm-radius filter in the incidents tab so users only see incidents within a selected radius from either all farms or the selected farm.

**Architecture:** Keep filtering client-side in `map.tsx` as the single source of truth, then pass the filtered incident array to both markers and the incidents sheet to guarantee map/list consistency. Extend the incidents sheet with French filter controls (mode + slider) and propagate filter state back to the map screen. Reuse farm geometry center logic (point center or polygon centroid) and a single distance helper to avoid duplicated behavior.

**Tech Stack:** Expo Router, React Native, TypeScript, Zustand store, @rnmapbox/maps, bun scripts (`typecheck`, `lint`).

---

### Task 1: Centralize Incident Radius Filter Logic In Map Screen

**Files:**

- Modify: `src/app/(tabs)/map.tsx`
- Reuse: `src/utils/farm-geometry.ts`

**Step 1: Write the failing check (type-level integration checkpoint)**

Add temporary props in `map.tsx` for `IncidentManagerSheet` and `IncidentMarkers` that do not exist yet (`filteredIncidents`, `radiusKm`, `radiusMode`).

Expected compile failure examples:

- Property does not exist on type `IncidentManagerSheetProps`
- Property does not exist on type `IncidentMarkersProps`

**Step 2: Run verification to confirm RED state**

Run: `bun run typecheck`

Expected: FAIL with prop typing errors for incidents components.

**Step 3: Implement minimal filter computation in `map.tsx`**

Add in-map state:

```ts
const [incidentRadiusKm, setIncidentRadiusKm] = useState(25);
const [incidentRadiusMode, setIncidentRadiusMode] = useState<
  "all_farms" | "selected_farm"
>("all_farms");
```

Add helper flow:

- derive farm centers from `farmLocations`
- choose active centers by mode
- filter active incidents by distance <= radius
- fallback to all incidents when no farms

**Step 4: Run verification to confirm GREEN state for this task**

Run: `bun run typecheck`

Expected: PASS once component props are implemented in later tasks.

**Step 5: Commit**

```bash
git add src/app/(tabs)/map.tsx
git commit -m "feat: add map-level incident radius filtering state"
```

### Task 2: Update Incident Markers To Render Filtered Incidents

**Files:**

- Modify: `src/components/map/IncidentMarkers.tsx`
- Modify: `src/app/(tabs)/map.tsx`

**Step 1: Write the failing check**

Update `map.tsx` to pass explicit `incidents={filteredIncidents}` into `IncidentMarkers` before component prop update.

Expected compile error:

- `Property 'incidents' does not exist on type 'IncidentMarkersProps'`

**Step 2: Run verification to confirm RED state**

Run: `bun run typecheck`

Expected: FAIL on `IncidentMarkers` prop typing.

**Step 3: Write minimal implementation**

Change `IncidentMarkers` signature to:

```ts
interface IncidentMarkersProps {
  incidents: IncidentReport[];
  onMarkerPress: (incident: IncidentReport) => void;
  selectedIncidentId?: string;
}
```

Remove internal `getActiveIncidents()` read so markers always follow parent-provided filtering.

**Step 4: Run verification to confirm GREEN state**

Run: `bun run typecheck`

Expected: PASS for marker prop integration.

**Step 5: Commit**

```bash
git add src/components/map/IncidentMarkers.tsx src/app/(tabs)/map.tsx
git commit -m "refactor: drive incident markers from filtered list props"
```

### Task 3: Add Radius Controls To Incident Manager Sheet

**Files:**

- Modify: `src/components/map/IncidentManagerSheet.tsx`
- Modify: `src/app/(tabs)/map.tsx`

**Step 1: Write the failing check**

Pass these new props from `map.tsx` before defining them:

```ts
radiusKm={incidentRadiusKm}
onChangeRadiusKm={setIncidentRadiusKm}
radiusMode={incidentRadiusMode}
onChangeRadiusMode={setIncidentRadiusMode}
filteredIncidents={filteredIncidents}
hasFarms={farmLocations.length > 0}
```

Expected compile errors for missing props on `IncidentManagerSheetProps`.

**Step 2: Run verification to confirm RED state**

Run: `bun run typecheck`

Expected: FAIL with `IncidentManagerSheet` prop mismatches.

**Step 3: Write minimal implementation**

In `IncidentManagerSheet.tsx`:

- extend props with the new filter controls and `filteredIncidents`
- render French controls above list:
  - title `Rayon de visibilité`
  - slider label e.g. `25 km`
  - mode buttons:
    - `Toutes mes fermes`
    - `Ferme sélectionnée`
- show no-farm helper text:
  - `Aucune ferme enregistrée, tous les incidents sont affichés.`
- render list from `filteredIncidents` instead of store `getActiveIncidents()`

**Step 4: Run verification to confirm GREEN state**

Run: `bun run typecheck`

Expected: PASS with new sheet props wired.

**Step 5: Commit**

```bash
git add src/components/map/IncidentManagerSheet.tsx src/app/(tabs)/map.tsx
git commit -m "feat: add incidents radius controls and filtered incident list"
```

### Task 4: Ensure Filtering Edge Cases And Fallbacks

**Files:**

- Modify: `src/app/(tabs)/map.tsx`

**Step 1: Write the failing check**

Temporarily force `incidentRadiusMode="selected_farm"` with `selectedFarmId=null` and assert (via logging/temporary inline counters) that the filtered list is unexpectedly empty.

Expected behavior to enforce:

- selected-farm mode with no selected farm must fallback to all-farms centers.

**Step 2: Run verification to confirm RED state**

Run: `bun run typecheck`

Expected: PASS compile; manual behavior check shows incorrect empty filtering prior to fallback patch.

**Step 3: Write minimal implementation**

In filter selector logic:

- if mode is `selected_farm` and selected farm is unavailable, use all farm centers.
- if no farms exist, bypass filter and keep all incidents visible.
- clamp radius into `[5, 100]` before distance tests.

**Step 4: Run verification to confirm GREEN state**

Run:

- `bun run typecheck`
- `bun run lint`

Expected:

- typecheck PASS
- lint: no new errors; only existing pre-existing warnings are acceptable.

**Step 5: Commit**

```bash
git add src/app/(tabs)/map.tsx
git commit -m "fix: harden incident radius filtering fallback behavior"
```

### Task 5: Manual Verification Matrix (Required)

**Files:**

- Verify runtime behavior in app screens:
  - `src/app/(tabs)/map.tsx`
  - `src/components/map/IncidentManagerSheet.tsx`
  - `src/components/map/IncidentMarkers.tsx`

**Step 1: No farms scenario**

Expected:

- incidents list and markers show all active incidents
- helper text displayed in French

**Step 2: All-farms mode + small radius**

Expected:

- fewer incidents in list
- marker count matches list count

**Step 3: Increase radius**

Expected:

- list and marker count increase consistently

**Step 4: Selected-farm mode**

Expected:

- only incidents near selected farm are visible
- switching selected farm changes visible incidents

**Step 5: Selected farm removed/unset**

Expected:

- fallback to all-farms behavior
- incidents do not disappear unexpectedly

**Step 6: Final verification commands**

Run:

```bash
bun run typecheck && bun run lint
```

Expected:

- typecheck PASS
- lint with no new errors
