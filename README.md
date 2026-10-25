# 🌾 Farmer's Online Granary (ರೈತರ ಆನ್‌ಲೈನ್ ಗ್ರಾನರಿ)

> **Karnataka's Direct Agricultural Marketplace** connecting farmers across 31 districts directly with households, retail grocery merchants, and wholesale mandi traders without middleman cuts.

---

## 📌 Demonstration & Pilot Notice
This application is a **fully functional, verified demonstration and pilot environment**. Demonstration accounts, farm listings, price adjustments, and market statistics are recorded in the local MySQL database for testing and verification purposes. In accordance with Karnataka agricultural standards, seller-declared farming methods (e.g., Organic, Natural / ZBNF) are transparently disclosed and never falsely presented as third-party government certifications.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite 8 | Ultra-fast client build, responsive mobile & desktop UX |
| **Routing** | React Router v7 | Client-side routing with role-protected dashboards |
| **Styling** | Vanilla CSS Design System | Forest green & cream palette, modern cards, glassmorphic header |
| **Icons** | Lucide React | Clean, scalable agricultural and interface iconography |
| **Backend** | Node.js + Express.js | Modular REST API with structured controllers and validators |
| **Database** | MySQL Server 8.0 | Normalized relational schema with foreign keys, indexes & transactions |
| **Driver** | `mysql2/promise` | Parameterized SQL queries, connection pooling, and atomic locks |
| **Security** | `bcryptjs` + `jsonwebtoken` | Salted password hashing, JWT stateless authentication, role checks |
| **Language** | Bilingual (English & Kannada) | Maintainable translation engine (`en.js` & `kn.js`) |

---

## 📂 Project Structure

```
farmer/
├── frontend/                     # React + Vite application
│   ├── src/
│   │   ├── components/           # Navbar, Footer, ProductCard, VerificationBadge, ProtectedRoute
│   │   ├── context/              # AuthContext, CartContext, LanguageContext
│   │   ├── pages/                # Home, Marketplace, ProductDetails, FarmerPublicPage,
│   │   │                         # About, Contact, Login, Register, Cart,
│   │   │                         # FarmerDashboard, BuyerDashboard, AdminDashboard
│   │   ├── services/             # api.js (Frontend REST client)
│   │   ├── translations/         # en.js, kn.js (Full Kannada & English dictionaries)
│   │   ├── index.css             # Rich agricultural CSS design system
│   │   ├── App.jsx               # React Router layout & routes
│   │   └── main.jsx              # React entrypoint
│   ├── package.json
│   └── vite.config.js
├── backend/                      # Node.js + Express REST API
│   ├── controllers/              # Auth, Category, Product, Farmer, Order, Review, Address, Complaint, Admin
│   ├── middleware/               # authenticateToken, requireRole, optionalAuth
│   ├── routes/                   # Modular route files for all resources
│   ├── validators/               # Input validation for auth, products, and orders
│   ├── scripts/
│   │   ├── init-db.js            # Automated schema & seed loader
│   │   └── test-e2e.js           # 25-point comprehensive E2E test suite
│   ├── db.js                     # MySQL connection pool & health test
│   ├── server.js                 # Express app, CORS, error handling & routes
│   ├── .env                      # Local MySQL credentials (git-ignored)
│   ├── .env.example              # Template environment file
│   └── package.json
├── database/
│   ├── schema.sql                # 13 relational tables with foreign keys and indexes
│   └── seed.sql                  # Pilot Karnataka demonstration data & categories
├── package.json                  # Root runner scripts
├── .gitignore                    # Git exclusions
└── README.md                     # Documentation
```

---

## 🔑 Demonstration Accounts

All demonstration accounts use the password: `Password@123`

| Role | Name & Region | Email / Identifier | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Granary Admin | `admin@farmersgranary.test` | `Password@123` | Real MySQL stats, review Bhoomi RTC verifications, moderate produce, resolve complaints |
| **Farmer** | Kempe Gowda (Mandya) | `ramesh.farmer@farmersgranary.test` | `Password@123` | Sona Masoori Rice & Jaggery, manage produce listings, fulfill orders |
| **Farmer** | Basavaraj Patil (Dharwad) | `basavaraj.farmer@farmersgranary.test` | `Password@123` | Foxtail Millet (Navane) & Byadgi Chillies, price updates |
| **Farmer** | Suresh Hegde (Sirsi) | `manjunath.farmer@farmersgranary.test` | `Password@123` | Western Ghats Black Pepper & Green Cardamom |
| **Buyer** | Anand Rao (Bengaluru) | `anand.buyer@farmersgranary.test` | `Password@123` | Household consumer, saved delivery address, cart checkout, product reviews |
| **Buyer** | Kaveri Wholesale (Mysuru) | `mysore.traders@farmersgranary.test` | `Password@123` | Mandi wholesaler, bulk orders, APMC delivery bay |

> **Pro-Tip:** The login page features **1-Click Quick Demo Login Buttons** to switch between Admin, Farmer, and Buyer roles instantly.

---

## 🚀 Windows PowerShell Quick Start

### 1. Database Configuration
In `backend/.env`, configure your MySQL credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YourMySQLPassword
DB_NAME=farmers_granary
JWT_SECRET=farmers_granary_jwt_secure_secret_karnataka_agro_2026_xyz
CLIENT_URL=http://localhost:5173
```

### 2. Initialize Database & Seed Pilot Data
Run the automated initialization script from PowerShell:
```powershell
cd c:\Users\Admin\OneDrive\Desktop\farmer\backend
node scripts/init-db.js
```

### 3. Run the Automated E2E Test Suite
Validate all 25 integration tests (MySQL connectivity, auth, order transaction, atomic decrement, reviews, and admin approval):
```powershell
cd c:\Users\Admin\OneDrive\Desktop\farmer\backend
node scripts/test-e2e.js
```

### 4. Start the Application

**Terminal 1 — Backend API (Port 5000):**
```powershell
cd c:\Users\Admin\OneDrive\Desktop\farmer\backend
npm start
# Server runs on: http://localhost:5000
# Health check: http://localhost:5000/api/health
```

**Terminal 2 — React Frontend (Port 5173):**
```powershell
cd c:\Users\Admin\OneDrive\Desktop\farmer\frontend
npm run dev
# App runs on: http://localhost:5173 or http://127.0.0.1:5173
```

---

## 📊 Database Schema (13 Relational Tables)

1. **`users`**: User identity, hashed passwords (`bcrypt`), role (`farmer`, `buyer`, `admin`), preferred language (`en`/`kn`).
2. **`farmer_profiles`**: Farm holding name, experience, district, taluk, village, land acreage, Bhoomi RTC verification status.
3. **`buyer_profiles`**: Business name, GST number, trade license for retailers and wholesale traders.
4. **`addresses`**: Saved delivery locations across Karnataka districts with default flags.
5. **`categories`**: 7 agricultural categories with bilingual English & Kannada names (ಧಾನ್ಯಗಳು, ಸಿರಿಧಾನ್ಯಗಳು, ಬೇಳೆಕಾಳುಗಳು, etc.).
6. **`product_listings`**: Harvest listings with units, prices, available stock, minimum order quantity, quality grade, harvest date, district.
7. **`price_history`**: Recorded timeline of price revisions with timestamps and adjustment reasons.
8. **`orders`**: Order codes (`FOG-YYYYMMDD-XXXX`), buyer ID, farmer ID, total amount, payment method (`cash_on_delivery`), order status.
9. **`order_items`**: Atomic items snapshot with unit price, ordered quantity, and line subtotal.
10. **`reviews`**: Ratings (1 to 5) and feedback restricted to buyers with verified delivered purchases.
11. **`verification_records`**: Farmer landholding survey/RTC submissions reviewed by administrators.
12. **`complaints`**: Grievance tickets (`CMP-YYYYMMDD-XXXX`) tracking quality, weight, or delivery disputes.
13. **`notifications`**: Bilingual push alerts for order updates and verification outcomes.

---

## 📡 REST API Reference

### Public Endpoints
- `GET /api/health` — System status and MySQL connectivity check
- `GET /api/categories` — Active agricultural categories with listing counts
- `GET /api/products` — Marketplace produce with search, category, district, grade, and method filters
- `GET /api/products/districts` — Karnataka district breakdown with produce availability counts
- `GET /api/products/:id` — Produce details, farmer origin, price history timeline, and approved reviews
- `GET /api/farmers/public/:id` — Public grower profile, Bhoomi RTC verification badge, and active harvest listings
- `POST /api/auth/register` — Register as Farmer or Buyer (individual, retailer, wholesaler)
- `POST /api/auth/login` — Authenticate and receive signed JWT token

### Authenticated Endpoints (Bearer Token)
- `GET /api/auth/me` — Current user profile and linked farm/buyer details
- `PUT /api/auth/profile` — Update account profile details
- `POST /api/orders` — **Atomic checkout:** locks inventory rows (`FOR UPDATE`), validates prices, groups by farmer, creates order, decrements stock
- `GET /api/orders/my-orders` — Buyer order tracking with delivery status
- `PATCH /api/orders/:id/status` — Lifecycle transitions (`placed` ➔ `confirmed` ➔ `harvesting_packed` ➔ `in_transit` ➔ `delivered` / `cancelled`)
- `POST /api/reviews` — Submit purchase review (enforces delivered purchase verification)
- `GET /api/addresses` & `POST /api/addresses` — Manage saved Karnataka delivery addresses
- `POST /api/complaints` — Submit grievance ticket to granary support

### Farmer Endpoints (`role: farmer`)
- `GET /api/farmers/my-listings` — Farmer's produce inventory
- `POST /api/products` — Create new harvest listing
- `PUT /api/products/:id` — Update listing (automatically logs price revisions to `price_history`)
- `GET /api/farmers/my-orders` — Orders received by farmer with delivery destination snapshots
- `GET /api/farmers/stats` — Farmer metrics (revenue, orders count, stock warnings)
- `POST /api/farmers/verification` — Submit Bhoomi RTC / Pahani document proof for admin review

### Admin Endpoints (`role: admin`)
- `GET /api/admin/stats` — **Live MySQL metrics:** real counts of users, verified farmers, active listings, gross trade volume, open complaints
- `GET /api/admin/users` & `PATCH /api/admin/users/:id/status` — Manage user accounts (active/suspended)
- `GET /api/admin/verifications` — List submitted landholding records
- `PATCH /api/admin/verifications/:id/review` — Approve or reject farmer verification (updates profile status & sends alert)
- `GET /api/admin/complaints` & `PATCH /api/admin/complaints/:id/resolve` — Investigate and resolve dispute tickets
- `PATCH /api/admin/products/:id/moderate` — Moderate marketplace produce listings

---

## 🔒 Security & Data Integrity Highlights

1. **SQL Injection Defense:** All queries use parameterized statements (`?`) with `mysql2/promise`.
2. **Atomic Order Transactions:** Checkout runs within `connection.beginTransaction()` using `FOR UPDATE` row locks to guarantee zero stock overselling.
3. **Restock on Cancellation:** Cancelling a placed order atomically returns items back into available inventory.
4. **Server-Side Authorization:** Role checks (`farmer`, `buyer`, `admin`) are enforced in middleware, preventing unauthorized access even if requested from client code.
5. **No Self-Admin Privilege Escalation:** Registration strictly rejects admin role assignments.
6. **Historical Data Snapshots:** Orders snapshot recipient addresses and product titles at the time of purchase, preventing historical tampering.
7. **Verified Review Gate:** Customers can only review products from orders that have been officially marked as `delivered`.

---

## 🌾 Verified Local Demo Access

- **Web Application URL:** [http://localhost:5173](http://localhost:5173) (or [http://127.0.0.1:5173](http://127.0.0.1:5173))
- **Backend API URL:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
