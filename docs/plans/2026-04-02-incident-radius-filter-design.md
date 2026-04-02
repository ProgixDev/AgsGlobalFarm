# Incident Radius Filter Design

## Goal

Show only incidents that are within a user-defined radius from farm centers in the incidents tab, with a configurable scope:

- all farms
- selected farm

When the user has no farms, show all incidents.

## Chosen Approach

Approach 1 (client-side filtering in incidents sheet + markers).

Why:

- no backend or API change needed
- fits current local Zustand store architecture
- fast to ship and easy to iterate

## UX Design (French UI)

In the incidents sheet, add a filter block above the incidents list:

- title: `Rayon de visibilité`
- radius slider: 5 km to 100 km
- mode selector:
  - `Toutes mes fermes`
  - `Ferme sélectionnée`

No-farm behavior:

- message: `Aucune ferme enregistrée, tous les incidents sont affichés.`
- disable farm-based filtering logic

## Filtering Rules

Given:

- radius in kilometers
- filtering mode
- farm locations

Visibility decision:

1. If no farm exists, incident is visible.
2. In all-farms mode, incident is visible if distance to at least one farm center <= radius.
3. In selected-farm mode, use selected farm center if available; otherwise fallback to all-farms mode.

Farm center definition:

- point farm: point coordinates
- polygon farm: polygon centroid (mean coordinates)

## Map + List Consistency

The same filtered incident list must feed:

- incident markers on map
- incidents list in sheet

So markers and list always match.

## Technical Changes

- `src/app/(tabs)/map.tsx`
  - compute filtered incidents with shared helper functions
  - pass filtered incidents to sheet and marker components
  - pass selected farm id and farm locations to incidents sheet

- `src/components/map/IncidentManagerSheet.tsx`
  - add radius slider and filtering mode controls
  - expose filter changes to parent map screen
  - render only filtered incidents

- `src/components/map/IncidentMarkers.tsx`
  - accept incidents as props instead of reading all active incidents from store internally

## Edge Cases

- selected farm removed: fallback to all-farms behavior
- farm without usable center: ignored for distance comparison
- radius out of range: clamp to [5, 100]

## Validation Plan

- no farms -> all incidents visible
- all-farms mode, small radius -> fewer incidents visible
- increase radius -> more incidents visible
- selected-farm mode -> only incidents near selected farm
- selected farm cleared/deleted -> fallback works
- markers count matches list count
