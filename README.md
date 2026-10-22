# SmartValue Traffic Routing & Affiliate Tracking Backend

Dedicated Node.js backend for parameter validation, anti-bot/macro rule targeting, dynamic multi-channel traffic routing (Facebook, TikTok, Newsbreak), and serving the `/us/search` landing page with dynamic Routeclk / Rutorbit click links.

---

## 🎯 Features

- **Landing Page Route (`GET /us/search` or `GET /`)**:
  - **Missing / Empty / Macro Parameters** $\rightarrow$ Automatically 302 redirects to Openvista fallback.
  - **Valid Parameters** $\rightarrow$ Stays on the landing page, rendering the age buttons (`18-24`, `25-34`, `35-44`, etc.) wired directly with the dynamic tracking link.
- **Multi-Channel Routing & Targeting Rules**:
  - **Facebook**: Valid `fbclid` + `p2` & `sub7` starting with `US-hs-Bv` + `fb=1` $\rightarrow$ Routes to `https://nav.rutorbit.com/t/NDkwNV82NDA1/` with `p11=1253687`.
  - **TikTok**: Valid `ttclid` + `p2` & `sub7` starting with `US-TIK-HI-RV` + `tk=1` $\rightarrow$ Routes to `https://nav.rutorbit.com/t/NDk5OV82NDA1/` with `p11=2876212`.
  - **Newsbreak**: Valid `nbclid` + `p2` & `sub7` starting with `Nw-Rev-Hi` + `nb=1` $\rightarrow$ Routes to `https://nav.rutorbit.com/t/NDk0NF82NDA1/` with `p11=3278115`.
- **Advanced Targeting Rules**:
  - Denies if click ID (`fbclid`, `ttclid`, or `nbclid`) is missing or empty.
  - Denies if parameters start with `{` (unresolved macro).
  - Denies unreplaced macros (`%7B%7Bcampaign.id%7D%7D`, `{campaign.id}`, `{{sub7}}`, etc.).
  - Enforces mandatory channel flags (`fb=1`, `tk=1`, or `nb=1`).
- **Direct 302 Redirect Support** (`GET /click` or `GET /r`).
- **REST API Support** (`GET /api/v1/tracking/resolve`).
- **Environment Configurable**: All base URLs, fallback links, channel IDs, and prefixes are configurable via `.env`.

---

## 📁 Repository Structure

```
smart-value.us-search/
├── src/
│   ├── config/
│   │   └── config.js              # Environment configuration
│   ├── controllers/
│   │   └── trackingController.js  # Handles landing page, redirects, and API
│   ├── rules/
│   │   └── ruleEngine.js          # Multi-condition targeting & macro rules
│   ├── routes/
│   │   └── trackingRoutes.js      # Express route definitions
│   ├── services/
│   │   └── trackingService.js     # URL builder & destination resolver
│   ├── views/
│   │   └── landingPage.js         # Landing page HTML renderer
│   └── app.js                     # Express application setup
├── tests/
│   ├── ruleEngine.test.js         # Unit tests
│   └── e2e.test.js                # End-to-End integration tests
├── .env.example                   # Environment configuration template
├── .env                           # Local environment configuration
├── .gitignore
├── package.json
├── README.md
└── server.js                      # Application entry point
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Server
- **Production mode**:
  ```bash
  npm start
  ```
- **Development mode**:
  ```bash
  npm run dev
  ```

### 3. Run Automated Tests
```bash
npm test
```

---

## 📡 Routes Reference

### 1. Landing Page (`GET /us/search` or `GET /`)
- **Newsbreak Traffic**:
  ```bash
  curl -i "http://localhost:3001/us/search/?nbclid=test_nb&p2=Nw-Rev-Hi-camp1&sub7=Nw-Rev-Hi-sub1&nb=1"
  ```
  $\rightarrow$ Returns HTML (200 OK) with buttons wired to:
  `https://nav.rutorbit.com/t/NDk0NF82NDA1/?nbclid=test_nb&p2=Nw-Rev-Hi-camp1&p11=3278115&sub7=Nw-Rev-Hi-sub1`

- **Facebook Traffic**:
  ```bash
  curl -i "http://localhost:3001/us/search/?fbclid=test_fb&p2=US-hs-Bv-camp1&sub7=US-hs-Bv-sub1&fb=1"
  ```
  $\rightarrow$ Returns HTML (200 OK) with buttons wired to:
  `https://nav.rutorbit.com/t/NDkwNV82NDA1/?fbclid=test_fb&p2=US-hs-Bv-camp1&p11=1253687&sub7=US-hs-Bv-sub1`

- **TikTok Traffic**:
  ```bash
  curl -i "http://localhost:3001/us/search/?ttclid=test_tk&p2=US-TIK-HI-RV-camp1&sub7=US-TIK-HI-RV-sub1&tk=1"
  ```
  $\rightarrow$ Returns HTML (200 OK) with buttons wired to:
  `https://nav.rutorbit.com/t/NDk5OV82NDA1/?ttclid=test_tk&p2=US-TIK-HI-RV-camp1&p11=2876212&sub7=US-TIK-HI-RV-sub1`

- **When any condition fails (unresolved macro, wrong prefix, missing channel flag)**:
  $\rightarrow$ Redirects (302) to Openvista:
  `https://openvista.live/?clk=...&zid=9482163&src=...`

### 2. Direct Redirect (`GET /click` or `GET /r`)
- **Valid Request**: Redirects 302 to appropriate Rutorbit tracker.
- **Invalid Request**: Redirects 302 to Openvista fallback.

### 3. JSON API (`GET /api/v1/tracking/resolve`)
Returns `{ status, destinationUrl, isFallback, targetPlatform, denyReason }`.

### 4. Health Check (`GET /health`)
Returns `{ status: "ok", timestamp, uptime }`.
