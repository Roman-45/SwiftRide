# Frontend Prototype Brief — SwiftRide

**Owner:** Product Owner (Agent 7) · **Audience:** teammate(s) building the UI prototype separately
**Backend contract:** locked at `API.md`. Do not invent endpoints.
**Pull this file before you start. Treat it as your contract.**

---

## 1. The 11 pages expected

| Page | Route | Purpose (user voice) | Must-show elements | Backend endpoint(s) |
|---|---|---|---|---|
| **LoginPage** | `/login` | "I sign in and land on my role's home." | email, password, submit, Register link, inline error on bad credentials | `POST /api/auth/login` |
| **RegisterPage** | `/register` | "I create a Passenger or Driver account." | name, email, phone, password, role selector (Passenger/Driver only — no Admin), submit, back-to-login link | `POST /api/auth/register` |
| **PassengerBookingPage** | `/passenger/book` | "I pick pickup + dropoff, see fare, book." | map, "Use my location" button, draggable pickup pin, dropoff search with live results, fare estimate card, suggestion chips (frequent/contextual), "Book ride" CTA | `POST /api/trips/estimate`, `POST /api/trips/book`, `GET /api/suggestions` |
| **PassengerActiveTripPage** | `/passenger/trip/:id` | "I watch my driver come, then pay/rate." | map with driver + pickup + dropoff markers; driver card (name, plate, rating, phone); ETA chip ("X min to pickup/dropoff"); status chip; Cancel (Pending/Accepted only); post-complete rating modal; receipt link | `GET /api/trips/{id}`, `GET /api/trips/{id}/driver-card` (once on Accepted), `GET /api/trips/{id}/driver-location` (5s poll), `DELETE /api/trips/{id}/cancel`, `POST /api/trips/{id}/review` |
| **PassengerTripHistoryPage** | `/passenger/history` | "I browse my past rides." | list with date, pickup → dropoff, fare, status badge; "View receipt" on Completed; empty state | `GET /api/trips` (mine) |
| **PassengerReceiptPage** | `/passenger/trip/:id/receipt` | "I see and print my receipt." | trip id, driver name, route, distance, fare, paid status, timestamps, Print button | `GET /api/trips/{id}/receipt` |
| **DriverDashboard** | `/driver` | "I see requests and my earnings." | availability toggle, pending queue (pickup/dropoff/distance/fare + Accept), earnings card (today/7d/30d/all-time + 7-day bar chart), "awaiting approval" empty state when unapproved | `GET /api/driver/pending-trips`, `POST /api/driver/trips/{id}/accept`, `GET /api/driver/earnings` |
| **DriverActiveTrip** | `/driver/trip/:id` | "I advance my current trip." | passenger name + phone, pickup/dropoff, map, Start/Complete (state-gated), status chip, location-sharing indicator | `GET /api/driver/trips/{id}`, `POST /api/driver/trips/{id}/start`, `POST /api/driver/trips/{id}/complete`, `PUT /api/driver/location` (10s while InProgress) |
| **AdminDashboard** | `/admin` | "I see system health." | stat tiles (passengers, drivers, approved drivers, total/completed/pending trips, revenue); quick links to Users + Trips | `GET /api/admin/stats` |
| **AdminUsersPage** | `/admin/users` | "I approve/suspend drivers and browse users." | tabbed table (Passengers / Drivers); driver rows show rating + Approve/Suspend buttons; status badges | `GET /api/admin/users`, `PUT /api/admin/drivers/{id}/approve`, `PUT /api/admin/drivers/{id}/suspend`, `GET /api/drivers/{id}/rating` |
| **AdminTripsPage** | `/admin/trips` | "I filter and audit every trip." | table (id, passenger, driver, route, fare, status, created, completed); status filter; empty state | `GET /api/admin/trips` |

---

## 2. Per-page Definition of Ready

### LoginPage
- When I submit bad credentials, I see an inline error — not a page crash, not a toast that disappears.
- When I submit valid credentials, I land on my role's home page.
- When I'm already logged in and visit `/login`, I'm redirected to my home.

### RegisterPage
- When I pick a role, only Passenger and Driver are offered.
- When the email is taken, I see a clear message — not a 500.
- When I successfully register, I'm logged in and redirected — not bounced back to login.

### PassengerBookingPage
- When the page loads, I see the map, "Use my location", and the dropoff search.
- When I allow geolocation, my pickup pin snaps to me.
- When I type 3+ characters, dropoff suggestions appear within a second.
- When I have pickup + dropoff set, I see distance + fare before I commit.
- When I've ridden before, I see suggestion chips that prefill dropoff on tap.
- When I already have an active trip, this page redirects me to it instead of letting me double-book.
- When I click "Book ride" I either land on the active-trip page or see a specific error.

### PassengerActiveTripPage
- When the trip is Pending, I see "Looking for a driver" and the Cancel button is enabled.
- When a driver accepts, I see their name, plate, rating, phone, and ETA within 5 seconds.
- When the driver is moving, the driver pin updates without a refresh.
- When the trip becomes InProgress, Cancel is hidden.
- When the trip completes, I see a rating modal and a link to the receipt.

### PassengerTripHistoryPage
- When I have no trips, I see a friendly empty state — not a blank table.
- When a trip is Completed, I see a "View receipt" link; when it's not, I don't.
- When I view a row, the status badge color matches the state.

### PassengerReceiptPage
- When I open the receipt, every field has a real value or a visible dash — no `null`.
- When I click Print, the browser print dialog opens with a clean layout.
- When I try to open someone else's receipt, I'm blocked.

### DriverDashboard
- When I'm unapproved, I see a clear "awaiting approval" message — not an empty queue.
- When the queue is empty, I see an empty state — not a spinner forever.
- When I Accept a trip, I'm routed to the active-trip page for that id.
- When I view earnings, all four totals and the 7-day chart render.

### DriverActiveTrip
- When the status is Accepted, only Start is enabled.
- When the status is InProgress, only Complete is enabled.
- When I tap Complete, I see a success toast and return to the dashboard.
- When the trip is InProgress, I see a visual cue that my location is being shared.

### AdminDashboard
- When the page loads, all stat tiles render with numbers (zero is fine) — never "undefined".
- When I click a tile, I navigate to the relevant list (trips, users).

### AdminUsersPage
- When I filter by Driver, the table only shows drivers.
- When I click Approve, the row's status flips without a full page reload.
- When a driver has ratings, I see their average; when not, I see "—" or "No ratings".

### AdminTripsPage
- When I pick a status filter, the table updates without a full reload.
- When there are many results, pagination works and the current page persists.

---

## 3. Cross-cutting states — every page handles all four

- **Loading.** A skeleton or spinner for any async fetch. Never a blank screen >300 ms.
- **Empty.** A branded illustration or icon plus one sentence of guidance plus (where useful) a CTA. Never a bare "No data".
- **Error.** A toast for transient failures; inline retry affordance for page-level fetch failures. Never a raw JSON dump or a stack trace.
- **Unauthorized.** Missing/expired token → bounce to `/login`. Wrong role for route → bounce to that role's home. Never a 403 page.

---

## 4. Feature traceability map

Every shipped feature must have a home in the prototype. If any is missing, the PO rejects the prototype as a regression.

| Feature | Shipped in | Must appear on |
|---|---|---|
| R1 Reviews & ratings | `aae5de8` | PassengerActiveTripPage (post-complete modal) · AdminUsersPage (driver rating column) |
| R2 Driver earnings | `22e912e` | DriverDashboard (totals + 7-day chart) |
| R3 Trip receipt | `af58822` | PassengerTripHistoryPage (link) · PassengerReceiptPage |
| R4 Suggestion chips | `6681105` | PassengerBookingPage (chips row above fare card) |
| R5 Mobile polish | `c358b4f` | AdminUsersPage (responsive table) · Navbar (all pages) |
| R6 README / docs | `c358b4f` | Prototype's own README mirrors the feature list; no UI home |
| R7 Booking UX (geolocation + place search) | `03e5c63` / `8623966` | PassengerBookingPage |
| R8 Driver info card | current | PassengerActiveTripPage |
| R9 ETA | current | PassengerActiveTripPage (inside driver card or beside status chip) |

---

## 5. Design guardrails — modern SaaS, six rules

1. One accent color against a neutral base. Not three competing brand colors.
2. Every interactive element has a visible hover state and a disabled state. Disabled is never just greyed-out-no-cursor.
3. Status uses both color **and** a text label. Color alone fails accessibility and prints poorly on receipts.
4. Empty states have an icon/illustration plus one sentence plus (where useful) a CTA.
5. Typography hierarchy: max three sizes per screen — big number, section heading, body.
6. Maps and tables get generous whitespace; nothing touches the viewport edge on desktop.

---

## 6. What the prototype must NOT do

- **Do not invent new endpoints.** Backend is locked at R9. If a page needs data that doesn't exist, flag it in your handoff note — do not mock it silently.
- **Do not store the JWT in `localStorage`.** `sessionStorage` only — security rule, not a style choice.
- **Do not swap the map library.** Leaflet + OpenStreetMap stays (cost).
- **Do not add password reset, email verification, or forgot-password flows.** Out of scope for the demo.
- **Do not add a dark mode toggle.** Polish light mode first.

---

## 7. Handoff checklist — the prototype is "done" when…

- [ ] All 11 pages route correctly under the role guards in `frontend/CLAUDE.md`.
- [ ] Every per-page DoR bullet in section 2 passes a manual walkthrough with the PO.
- [ ] The 12-step demo script in `README.md` runs end-to-end without developer narration.
- [ ] Every feature R1–R9 is visible on the page listed in section 4. No regressions.
- [ ] Loading / empty / error / unauthorized states implemented on every page.
- [ ] TypeScript strict mode on. No `any` or `as any`.
- [ ] All data comes from real API calls — no in-component mocks. Anything missing gets flagged, not faked.
- [ ] A 5-minute screen recording walks the demo script with no edits.

---

## Reference files

- `API.md` — locked endpoint contracts. If it's not here, it doesn't exist.
- `README.md` — demo script, test credentials, setup.
- `AGENTS.md` — Agent 5 (Frontend) scope and boundaries.
- `frontend/CLAUDE.md` — TypeScript / Tailwind / Axios / Leaflet rules.
- `SECURITY.md` — JWT storage rules, geolocation privacy.

If something in this brief conflicts with a reference file above, the reference file wins. Flag the conflict in your handoff note.
