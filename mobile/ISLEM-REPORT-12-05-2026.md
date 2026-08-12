# Development Report

**Date:** 12 May 2026  
**Prepared by:** Islem

---

## Work Completed

### 1. AGS Mobile — Formations (Enrollment)

- Implemented enrollment flow for online and presential formations
- Updated UI to surface free-access formations
- Mobile implementation complete — awaiting backend `.env` from Khalil (promised 21:00) to wire and validate end-to-end

---

### 2. AGS Web — Formations (Enrollment)

- Implemented enrollment functionality for online and presential formations with user authentication
- Mirrors the mobile flow; pending same `.env` to go live

---

### 3. AGS Mobile — Carte / Map

- Added line drawing on the map
- Added point markers on the map
- Added DEV LOGIN button on profile screen for faster testing

---

### 4. AGS Mobile — Authentification

- Refactored signup form — improved layout and error handling
- `mapStore.clearLocalData()` now invoked on signout to reset local state and prevent leakage between sessions

---

### 5. AGS Mobile — Navigation

- Introduced reusable `BackButton` component
- Replaced ad-hoc back navigation across 13 screens (jobs, orders, incidents, itineraire, training, shop, auth)

---

### 6. AGS Mobile — PDF / Itinéraire

- Refactored logo asset handling in `pdf-assets.ts` to use base64 embedding
- Removed dependency on `expo-file-system` and `Image.resolveAssetSource` for logo retrieval
- Ensures reliable logo rendering in production builds

---

## Blockers

- **Khalil `.env`** — required to finalize formations enrollment (mobile + web). ETA 21:00 today.

---
