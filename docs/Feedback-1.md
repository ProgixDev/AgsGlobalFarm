# Feedback-1 — Générateur d'Itinéraire Technique

## Client request (verbatim summary, FR)

Client (خليل, WhatsApp 2026-04-24, 3:02 PM) wants new feature **"Générateur d'itinéraire technique"** inside AGS Global Farm app. Plan to add more itinéraires over time (5 base ones provided now, more later).

### User flow specified by client

1. User opens dedicated page (suggested name: **"Générer votre itinéraire technique"**).
2. User fills 3 inputs:
   - **Type de culture**: tomate, piment, concombre, aubergine, poivron
   - **Superficie**: e.g. 500 m², 1000 m², 10 000 m², etc. (free numeric input, not preset)
   - **Type de culture (mode)**: serre OR plein champ
     - NOTE: client used "type de culture" twice — second one means cultivation mode (greenhouse vs open field). Needs clarification.
3. App takes the **base 1000 m² itinéraire** (provided as PDFs) and applies a **proportional scaling rule** to the surface entered by user.
4. App generates + displays a complete itinéraire technique containing:
   - **Programmes de fertilisation** (engrais, dosages, phases)
   - **Traitements phytosanitaires** (produits, fréquence)
   - **Structure claire par phases** (croissance, production, récolte)

### Calculation rule

> "adapter les doses proportionnellement à la surface saisie par l'utilisateur"
> i.e. `dose_user = dose_base_1000m2 × (surface_user / 1000)`

Linear proportional scaling. No agronomic non-linearity required by client.

### Stated objective

Simple, fast, practical tool. User gets personalized program "in seconds".

---

## Source data (PDFs in `docs/assets/`)

4 PDFs supplied (poivron + piment combined → that's why 5 cultures from 4 files). All for **1000 m²** base, all share **same phyto block** at bottom (7th-day phyto, 1×/week preventive).

### Common phyto block (all crops)

| Catégorie    | Produits                                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| Insecticides | ARSENAL / ABAMEK (tomate, aubergine, concombre); ARSENAL / MALATHION (piment)                                         |
| Nématicides  | VIDAMYL / NEMA B2 (tomate, piment, aubergine); VIDAT NEMA B2 (concombre)                                              |
| Fongicides   | CUIVRE / SOUFRE / ATHLETE; (concombre: CUIVRE SOUFR)                                                                  |
| Acaricides   | ETOILE / DICOFORT (tomate, aubergine); ABAMEK / DICOFORT (piment); — (concombre n'a pas de ligne acaricide explicite) |
| Compléments  | BORE, ACIDE HUMIQUE                                                                                                   |
| Acide aminée | SMARTFOIL (tomate, piment, aubergine); "Acide aminée" générique (concombre)                                           |
| Fréquence    | 1× par semaine (préventif). En cas d'attaque: 2× par semaine.                                                         |

Disclaimer on every PDF: _"Veuillez lire la notice d'emballage et respecter la dose des produits phytosanitaires"_.

### 1. Tomate — `Itinéraire tomate 1000 m2.pdf`

Structure: **par tranche de semaines (MAP)**, dose en **kg/semaine**.

| Semaines | MAP | Nitrate de calcium | Nitrate de potassium | Sulfate de magnésium |
| -------- | --- | ------------------ | -------------------- | -------------------- |
| 1–2      | 5   | 8                  | 5                    | 4                    |
| 3–4      | 3   | 12                 | 10                   | 5                    |
| 5–6      | 2   | 14                 | 15                   | 6                    |
| 7–9      | 1   | 15                 | 22                   | 7                    |
| 10–12    | 0   | 10                 | 25                   | 5                    |

### 2. Piment — `Itinéraire poivron et piment 1000 m2.pdf` (titre PDF: "Programme ferti piment 1000m2", date 27.02.26)

Structure: **par semaine individuelle**, dose en **Kg**. Note: PDF title says "poivron et piment" but contenu seul = piment. Poivron data missing.

| Semaine | MAP | Urée | Magnésium | Nitrate de calcium | NPK | Potassium |
| ------- | --- | ---- | --------- | ------------------ | --- | --------- |
| 1       | 8   | –    | –         | –                  | –   | –         |
| 2       | –   | 8    | –         | –                  | –   | –         |
| 3       | 6   | –    | 6         | –                  | –   | –         |
| 4       | –   | 6    | –         | –                  | 12  | –         |
| 5       | –   | 10   | –         | 12                 | –   | –         |
| 6       | –   | 6    | –         | 12                 | –   | –         |
| 7       | –   | –    | 9         | –                  | 12  | –         |
| 8       | –   | 15   | –         | 12                 | –   | –         |
| 9       | –   | –    | –         | –                  | –   | 12        |
| 10      | –   | –    | –         | –                  | –   | 10        |
| 11      | –   | –    | –         | –                  | –   | 10        |
| 12      | –   | –    | –         | –                  | –   | 10        |

Champ "Date de semis :" vide → user devrait pouvoir le saisir.

### 3. Aubergine — `Itinéraire Aubergine 1000 m2.pdf` (date 27.02.26)

Structure: **par stade phénologique**, dose en **g** (grammes total pour stade, semble-t-il).

| Stade                   | Urée (g) | MAP (g)  | Nitrate de calcium (g) | Nitrate de potassium (g) | Sulfate de magnésium (g) |
| ----------------------- | -------- | -------- | ---------------------- | ------------------------ | ------------------------ |
| Installation (0–4 sem.) | 436,46   | 327,8    | 762,2                  | 1086                     | 312,5                    |
| Croissance (5–8 sem.)   | 995      | 819,67   | 3 846,15               | 6 521,74                 | 1 875                    |
| Floraison (9–12 sem.)   | 1 130,18 | 1 311,47 | 7 692,31               | 8 695,65                 | 3 125                    |
| Production (>12 sem.)   | 2 735,97 | 1 639,34 | 9 615,38               | 11 956,52                | 3 750                    |

### 4. Concombre — `Itinéraire concombre 1000 m2.pdf` (date 28.05.25)

Titre: "SOLUBLES SERRE 1000 6 JR SUR 7" → application **6 jours sur 7** sous serre. Doses en **g**, sauf acide nitrique en **ml**, et "10 10 20" (engrais NPK 10-10-20) en g pour phases 2 & 3.

| Phase                   | S. Magnésium | N. Potassium | M.A.P   | Urée  | N. Calcium | Acide nitrique | 10-10-20 |
| ----------------------- | ------------ | ------------ | ------- | ----- | ---------- | -------------- | -------- |
| 1 (15 jours)            | 520 g        | 600 g        | 250,1 g | 300 g | 1 100 g    | 200 ml         | –        |
| 2 (15 jours)            | 520 g        | 800 g        | 250,1 g | 300 g | 1 100 g    | 200 ml         | 1 333 g  |
| 3 (début récolte → fin) | 520 g        | 1 000 g      | 250,1 g | 200 g | 1 100 g    | 200 ml         | 1 333 g  |

### 5. Poivron — **MANQUANT**

Client liste 5 cultures (tomate, piment, concombre, aubergine, **poivron**) mais le PDF "poivron et piment" ne contient que le piment. **Need to ask client for poivron data** OR confirm poivron uses same program as piment.

---

## Existing app context (relevant pieces)

- Stack: Expo Router, React Native 0.81, Zustand stores, Zod schemas, NativeWind/Tailwind. Bun.
- Tabs (farm_owner): `map`, `jobs`, `shop`, `training`, `profile`. **No "advice" or "itinerary" tab yet.**
- Reusable form atoms ready: `FormInput`, `FormPicker`, `StepIndicator` (perfect for 3-step wizard).
- `src/data/agricultural-data.ts` already has crop catalog including all 5 needed (`tomato`, `pepper`=piment, `sweet-pepper`=poivron, `eggplant`=aubergine, no cucumber → **need to add `cucumber`/`concombre`**).
- `AdviceFormData` interface already exists in `types.d.ts` (region/department/crop/area) — partial overlap, may share form patterns.
- **No PDF generation lib installed.** No `expo-print`, no `react-native-pdf`. Client didn't ask to export PDF — just display. But "Generate" wording could imply downloadable output.
- French is default UI language; no i18n framework, strings inline.
- No backend/Supabase wiring visible — itinéraire data should be static TS module like `agricultural-data.ts`.

---

## Architectural recommendation (for discussion)

1. **Data layer**: new module `src/data/technical-itineraries.ts` — typed TS structure encoding the 5 (4 + poivron TBC) base programs at 1000 m².
2. **Types** (in `types.d.ts`):
   - `CropItineraryId`, `ItineraryStructure` (`'weekly' | 'phase' | 'stage'`), `FertilizerEntry`, `PhytoSchedule`, `ItineraryPhase`.
3. **Scaling util**: `src/utils/itinerary-scaling.ts` — `scaleItinerary(base, surfaceM2): ScaledItinerary` with linear factor.
4. **Screen route**: `src/app/itinerary/index.tsx` (form) + `src/app/itinerary/result.tsx` (output). Or single screen with `StepIndicator` (3 steps).
5. **Tab placement**: add 6th tab? Or surface from existing `map` / `profile`? — **Client didn't specify. Ask.**
6. **Optional**: `expo-print` for PDF export of the generated program (matches "générer" semantics).

---

## Open questions for client (need to ask)

1. **Poivron**: programme manquant. Use piment program for poivron, or fournir un PDF dédié?
2. **"Type de culture (serre/plein champ)"**: la liste des 5 PDFs ne distingue pas serre vs plein champ (sauf concombre explicitement "SERRE"). Les doses changent-elles selon le mode? Si oui, fournir variantes. Sinon, garder la question informative seulement.
3. **Surface libre ou presets?** Texte client liste exemples 500/1000/10 000 — input numérique libre OK?
4. **Hiérarchie d'unités**: tomate en kg/semaine, piment en kg/semaine ponctuel, aubergine en g/stade, concombre en g/phase + ml. Garder unités natives par culture ou tout normaliser? Affichage utilisateur: kg si >1000 g auto?
5. **Date de semis**: champ vide sur PDF piment. Demander à user pour calendrier (semaine 1 = date X)?
6. **Export PDF**: feature voulue ou affichage écran suffisant?
7. **Placement UX**: nouveau tab, sous-page de Profile, ou bouton dans Map/Shop?
8. **Disclaimer phyto**: réafficher textuellement le disclaimer rouge des PDFs ("respecter la dose...")? Probable obligation légale.
9. **Évolutivité**: client dit "rajouter d'autres itinéraires au fur et à mesure" → confirmer que data sera fournie en PDF (à parser manuellement) ou via interface admin (out of scope mobile?).
10. **Multi-stage display**: affichage tableau seul, ou + timeline visuelle (semaines/stades)?

---

## What I need from you (the dev/PM) to proceed

- Decision on **tab placement** (impact `_layout.tsx`).
- Decision on **PDF export** (impact deps + screen design).
- Confirmation on **poivron data source** (block #1 above).
- Confirmation on **serre/plein champ** semantic (block #2).
- Greenlight to add `cucumber` to `crops` catalog in `agricultural-data.ts`.
- Confirmation that data stays static TS (no backend round-trip) for v1.
