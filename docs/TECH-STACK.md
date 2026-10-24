# Tech stack

## The demo in this repository

| Part | Technology |
|---|---|
| Pages | Plain HTML, CSS and JavaScript. No framework, no build step |
| Layout | Responsive CSS (grid, flexbox, container queries). Works on phone, tablet and laptop |
| Fonts | Young Serif (headings, tokens) and Figtree (text), from Google Fonts |
| Data | Sample data generated in the browser and saved in `localStorage` |
| Logins | Demo-only username and password checks in the browser |
| Charts | Hand-drawn SVG bar charts |
| Hosting | GitHub Pages (static files) |

The demo shows the screens and flows. Nothing is sent to a server, so each phone or laptop has its own copy of the data.

### Files

```
index.html        Page shell
css/app.css       All styles
js/app.js         App logic: data, customer shop, staff screens, owner dashboard
assets/logo.png   Shree Balaji logo
docs/             Project details and tech stack
```

## Proposed stack for the live system (Phase 1)

| Layer | Choice | Why |
|---|---|---|
| Customer app | **Progressive Web App (PWA)** built with Next.js (React) | Opens from a link or WhatsApp, can be added to the home screen, no Play Store or App Store step |
| Staff and owner app | Same Next.js codebase, role-based screens | One codebase for phone, tablet and laptop |
| Backend and database | **Supabase**: PostgreSQL database, authentication, row-level security, storage for product photos | Managed, secure, scales from three stores to many |
| Live updates | Supabase Realtime (Postgres changes over WebSockets) | New orders and status changes appear on every screen instantly |
| Customer login | Phone number with OTP | No passwords for customers |
| Staff and owner login | Email or username with password, role-based access (owner, staff, counter) | Each person sees only what their role allows |
| Ready messages | **WhatsApp Business Platform** (Meta Cloud API), with SMS fallback (for example MSG91) | Customers already use WhatsApp; templates for "order ready" and "approve new bill" |
| Payments | UPI QR and cash at the counter, recorded in the app. Online UPI (for example Razorpay) as an option later | Matches how customers pay today |
| Reports | SQL views for daily sales, store split, payments; export to Excel or PDF | Owner can share figures with an accountant |
| Hosting | Vercel (app) and Supabase (database), India region where available | Low running effort, automatic HTTPS, backups |
| Monitoring | Error tracking (for example Sentry) and daily database backups | Problems are caught before staff report them |

### Main data tables

| Table | Holds |
|---|---|
| `stores` | Vegetable Store, Fruit Store, Juice Junction, status |
| `products` | Name, store, unit, sold by weight or piece, photo |
| `daily_rates` | Product, date, rate, published by, in stock |
| `customers` | Name, phone number |
| `orders` | Token, customer, status, pickup counter, created and ready times |
| `order_items` | Product, ordered quantity, weighed quantity, estimated and final price |
| `store_tasks` | Order, store, status (queued, weighing, needs approval, packed) |
| `payments` | Order, method (UPI or cash), amount, collected by, time |
| `users` | Staff and owner accounts with roles |
| `activity_log` | Who did what and when (audit trail) |

### Security

- Row-level security so staff only see their store's tasks and customers only see their own orders.
- Owner-only access to sales, revenue and payment reports.
- Every price change, weight change, approval and payment is logged with the user and time.
