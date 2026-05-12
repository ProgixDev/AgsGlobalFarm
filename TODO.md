# TODO

## Web (Backend)

### Auth
- [x] Sign up (email + password)
- [x] Sign in
- [x] Sign out
- [x] Session management
- [x] Password reset (email link)
- [x] Password reset (email OTP for mobile)
- [x] Password reset cooldown (60s)
- [x] Custom user fields (firstName, lastName, gender, phone, role)
- [x] User role (farm_owner / job_seeker / admin)
- [x] Bearer token auth (for mobile)
- [x] CORS middleware
- [x] 30-day session expiry
- [x] Expo plugin trustedOrigins
- [x] Email verification (OTP, required for sign-in)

### Shop
- [x] Product model
- [x] List products
- [x] Product detail endpoint
- [x] Product search / filter
- [x] Product categories endpoint
- [ ] Admin: create / update / delete product
- [ ] Stock decrement on order
- [ ] Product reviews

### Orders
- [x] Order model
- [x] List user orders
- [x] Order created on payment success
- [x] Order created on payment failure
- [x] Order detail endpoint
- [ ] Order status tracking (shipped, delivered)
- [ ] Cancel order
- [ ] Admin: list all orders

### Payment
- [x] PayDunya invoice creation
- [x] PayDunya IPN callback
- [x] HMAC-SHA512 signature verification
- [x] Failed payments collection
- [x] Order confirmation email
- [x] Admin order notification email

### Formations (Online)
- [x] OnlineFormation model
- [x] List public online formations
- [x] List owned online formations
- [x] 3-month access window
- [x] Formation stats (sections, lessons)
- [x] Formation detail endpoint
- [ ] Admin: create / update / delete formation

### Formations (Presential)
- [x] PresentialFormation model
- [x] Sessions with participants
- [x] Available spots tracking
- [x] List public presential formations
- [x] List owned presential
- [x] Auto-enroll on payment
- [x] Session detail endpoint
- [ ] Admin: create / update sessions

### Progress
- [x] FormationProgress model
- [x] Get progress
- [x] Update progress (completed lessons)
- [x] Ownership check before update
- [x] Last accessed timestamp

### Quiz
- [x] QuizResult model
- [x] Get quiz (without answers)
- [x] Submit quiz
- [x] 70% passing threshold
- [x] 3 attempts/day limit
- [x] Lesson completion gate
- [x] Best result fetch

### Certificate
- [x] PDF generation (pdf-lib)
- [x] Auto-send on quiz pass
- [x] Resend certificate
- [x] Certificate template (CERTIFICAT.jpg)
- [x] Mark certificate sent flag

### Email
- [x] Nodemailer + Gmail SMTP
- [x] PasswordResetEmail
- [x] OrderConfirmationEmail
- [x] NewOrderNotificationEmail
- [x] CertificateEmail (with PDF)
- [x] ContactEmail
- [x] EmailLayout

### Contact
- [x] Send contact email

### Jobs
- [x] Job model
- [x] Create job
- [x] List jobs (filter by region/department/type)
- [x] Job detail
- [x] Update job
- [x] Delete job
- [x] Close / reopen job

### Job Applications
- [x] JobApplication model
- [x] Apply to job
- [x] List applications by job
- [x] List applications by user
- [x] Accept / reject application
- [x] Notify applicant on status change

### Incidents
- [x] Incident model
- [x] Report incident (POST /api/incidents)
- [x] List incidents (GET /api/incidents)
- [x] List my incidents (GET /api/incidents/mine)
- [x] Update / resolve (PATCH /api/incidents/:id)
- [x] Delete (DELETE /api/incidents/:id)
- [x] Photo upload (Cloudinary, ags/incidents folder)
- [x] Seed script (scripts/seed-incidents.ts)
- [x] Incident categories — kept static client-side (no API needed)

### Map / Regions
- [x] Senegal regions — kept static (GeoJSON in mobile src/data/senegal-regions.ts)
- [x] Departments — kept static (mobile src/data/senegalData.ts)

### File Upload
- [x] Storage provider chosen (Cloudinary)
- [x] Upload signature endpoint (POST /api/upload/signature)
- [x] Avatar upload
- [ ] Job photo upload
- [x] Incident photo upload
- [x] Product image upload (admin) — signature route accepts ags/products with admin role check

### Admin
- [ ] Admin role + middleware (partial — role check in upload signature only, no global middleware)
- [ ] Dashboard endpoints (stats)
- [ ] User management
- [ ] Product / formation CRUD endpoints


### Mobile-callable REST wrappers (server actions → routes)
- [x] GET /api/products
- [x] GET /api/products/:id
- [x] GET /api/products/categories
- [x] GET /api/orders
- [x] GET /api/orders/:id
- [x] POST /api/auth/onetime-token (one-time token bridge)
- [x] GET /api/formations/online
- [x] GET /api/formations/presential
- [x] GET /api/formations/owned
- [x] GET /api/formations/online/:id
- [x] GET /api/formations/presential/:id
- [x] GET/PUT /api/formations/:id/progress
- [x] GET /api/formations/:id/quiz
- [x] POST /api/formations/:id/quiz/submit
- [x] GET /api/formations/:id/quiz/result
- [x] GET /api/formations/:id/quiz/attempts
- [x] POST /api/formations/:id/certificate/resend

---

## Mobile (Backend Integration)

### Auth
- [x] Signup (API)
- [x] Login (API)
- [x] Signout (API)
- [x] Session restore on launch
- [x] Forgot password (OTP code flow)
- [x] Change password (API)
- [x] 30-day session, force re-login on expiry
- [x] Dev-login wired to real API (seeded test accounts)
- [x] Role on signup (farm_owner / job_seeker)
- [x] Token in expo-secure-store

### Shop
- [x] Products from API
- [x] Search / filter (API)
- [x] Categories from API

### Checkout / Payment
- [x] POST /api/payment/initiate (reused, mobile redirects to web checkout)
- [x] Handle return / cancel URLs (deep link agsmobile://payment/return)
- [x] One-time token bridge (mobile → web checkout)

### Orders
- [x] History (API)
- [x] Detail (API)

### Training
- [x] Courses from API
- [x] Owned formations (API)
- [x] Progress sync (API)
- [x] Quiz fetch (API)
- [x] Quiz submit (API)
- [x] Quiz attempts counter (API)
- [x] Certificate resend (API)
- [x] Access expiration data (3-month window)
- [x] Presential session selection on purchase

### Jobs (Farm Owner)
- [x] List from API
- [x] Create (API)
- [x] Update (API)
- [x] Delete (API)

### Applications (Farm Owner)
- [x] List (API)
- [x] Accept / reject (API)

### Jobs (Job Seeker)
- [x] List from API
- [x] Apply (API)
- [x] My applications (API)

### Profile
- [x] Personal info sync (API)
- [x] Avatar upload

### Map
- [x] Markers from API (incidents)

### Incidents
- [x] List from API (loadIncidentsFromBackend)
- [x] Submit (API) — optimistic + retry on error
- [x] Photo upload (Cloudinary)
- [x] My incidents list (API) — /incidents screen + profile link
- [x] Resolve / delete (API)
- [x] Form-discard bug fix (sheet stays mounted during pin mode)

### Support
- [x] Contact support → mailto (opens device email with prefilled subject + user info)

---

## New Updates (Client Feedback — 2026-05-12)

- [ ] **Ma Ferme** — GPS point not visible after adding; map cursor/marker not showing
- [ ] **Explorer** — bottom nav bar shows only colors, no text labels (boutique / emploi / etc.)
- [ ] **Incident** — no cursor/marker to place incident position on map
- [ ] **Incident** — all pictograms missing (client sent replacement icons, nothing shows now)
- [ ] **Partout (Back button)** — back button has no "retour" text; entire app shows only colored dots with no button labels
- [ ] **Formations** — all courses should be free, no payment required; revert to previous behavior
- [x] **Itinéraire PDF** — add AGS logo + full-page logo watermark (embedded base64, opacity 0.10)

