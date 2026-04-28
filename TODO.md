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
- [ ] Email verification
- [ ] OAuth providers (Google, Facebook)

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
- [ ] Order detail endpoint
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
- [ ] Formation detail endpoint
- [ ] Admin: create / update / delete formation

### Formations (Presential)
- [x] PresentialFormation model
- [x] Sessions with participants
- [x] Available spots tracking
- [x] List public presential formations
- [x] List owned presential
- [x] Auto-enroll on payment
- [ ] Session detail endpoint
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
- [ ] Job model
- [ ] Create job
- [ ] List jobs (filter by region/department/type)
- [ ] Job detail
- [ ] Update job
- [ ] Delete job
- [ ] Close / reopen job

### Job Applications
- [ ] JobApplication model
- [ ] Apply to job
- [ ] List applications by job
- [ ] List applications by user
- [ ] Accept / reject application
- [ ] Notify applicant on status change

### Incidents
- [ ] Incident model
- [ ] Report incident
- [ ] List incidents
- [ ] Incident categories endpoint
- [ ] Photo upload

### Itineraries
- [ ] Decide: static or DB
- [ ] Itinerary model (if DB)
- [ ] Generator endpoint

### Map / Regions
- [ ] Senegal regions endpoint (or keep static)
- [ ] Departments endpoint

### File Upload
- [x] Storage provider chosen (Cloudinary)
- [x] Upload signature endpoint (POST /api/upload/signature)
- [ ] Avatar upload
- [ ] Job photo upload
- [ ] Incident photo upload
- [ ] Product image upload (admin)

### Admin
- [ ] Admin role + middleware
- [ ] Dashboard endpoints (stats)
- [ ] User management
- [ ] Product / formation CRUD endpoints

### Infra
- [x] MongoDB Atlas
- [x] Env vars configured
- [x] Live PayDunya keys
- [ ] middleware.ts (auth + CORS)
- [ ] Rate limiting
- [ ] Sandbox / staging deploy
- [ ] Sentry / error tracking
- [ ] API documentation

### Mobile-callable REST wrappers (server actions → routes)
- [x] GET /api/products
- [x] GET /api/products/:id
- [x] GET /api/products/categories
- [ ] GET /api/orders
- [ ] GET /api/formations/online
- [ ] GET /api/formations/presential
- [ ] GET /api/formations/owned
- [ ] GET /api/formations/:id
- [ ] GET/PUT /api/formations/:id/progress
- [ ] GET /api/formations/:id/quiz
- [ ] POST /api/formations/:id/quiz/submit
- [ ] GET /api/formations/:id/quiz/result
- [ ] GET /api/formations/:id/quiz/attempts
- [ ] POST /api/formations/:id/certificate/resend
- [ ] POST /api/contact

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
- [ ] POST /api/payment/initiate
- [ ] Handle return / cancel URLs

### Orders
- [ ] History (API)
- [ ] Detail (API)

### Training
- [ ] Courses from API
- [ ] Owned formations (API)
- [ ] Progress sync (API)
- [ ] Quiz fetch (API)
- [ ] Quiz submit (API)
- [ ] Quiz attempts counter (API)
- [ ] Certificate resend (API)
- [ ] Access expiration data (3-month window)
- [ ] Presential session selection on purchase

### Jobs (Farm Owner)
- [ ] List from API
- [ ] Create (API)
- [ ] Update (API)
- [ ] Delete (API)

### Applications (Farm Owner)
- [ ] List (API)
- [ ] Accept / reject (API)

### Jobs (Job Seeker)
- [ ] List from API
- [ ] Apply (API)
- [ ] My applications (API)

### Profile
- [ ] Personal info sync (API)
- [ ] Avatar upload

### Notifications
- [ ] Register push token (API)

### Map
- [ ] Markers from API (jobs / incidents)

### Itinéraire
- [ ] Data source decision

### Incidents
- [ ] Submit (API)
- [ ] Photo upload
- [ ] My incidents list (API)

### Support
- [ ] Contact form → API

### Cleanup
- [ ] Remove all mock data files when unused
