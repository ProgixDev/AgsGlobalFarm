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
- [x] Avatar upload
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
