# 🏛️ Court Data Fetcher & Mini-Dashboard

A full-stack web application that scrapes **Delhi High Court** data based on user input (Case Type, Number, and Year), handles CAPTCHA, and displays structured metadata and orders in a React dashboard with pagination.

---

## ⚙️ Tech Stack

| Layer      | Tech/Library                         |
|------------|--------------------------------------|
| Frontend   | React, TailwindCSS, react-select     |

| Backend    | Express.js, Playwright (for scraping)|
| Database   | PostgreSQL, Prisma ORM               |
| Scraping   | Playwright (headless Chromium)       |

---

## 🧑‍⚖️ Court Source

- **Court Scraped**: [Delhi High Court](https://delhihighcourt.nic.in)
- **Data Points Extracted**:
  - Petitioner and Respondent
  - Filing Date (calculated as 1 day before the oldest order)
  - Status, Next Hearing Date
  - Case History URL
  - All Order Documents (Title, URL, Date)

---

## 🧪 CAPTCHA Handling Strategy

1. On app load, a headless Chromium instance visits the Delhi High Court site.
2. CAPTCHA is read using the DOM text `#captcha-code` (e.g., `WD52KL`).
3. CAPTCHA is returned to the frontend for user input.
4. CAPTCHA input is verified on the backend before proceeding.
5. If incorrect, error is returned, and a new CAPTCHA is reloaded.

---

## ✅ Features

- 🎯 **Case Input Form** with dropdown selection for case types.
- 🔐 **CAPTCHA Verification** before submitting data.
- 📋 **Structured Metadata Extraction**: Petitioner, Respondent, Filing Date, Status, Hearing, etc.
- 📄 **Order Document Table** with:
  - Download links
  - Order Dates
  - Pagination (`10 orders per page`)
- 🧾 **Data Persistence**:
  - Stored in PostgreSQL using Prisma
  - Metadata, Order Documents, and Case Queries
- 🔄 **Graceful Error Handling** for scraping/CAPTCHA failures
- 🎯 **Pagination Controls** (Next/Previous)
- 🛡️ Browser auto-closes post scraping to free resources

---

## 📂 Project Structure Overview

```
/client
  └── App.jsx (Main React app)
  └── config/config.js (case types list)

 /server
  └── index.js (Express routes)
  └── scraper/scraper.js (Playwright logic)

 prisma/
  └── schema.prisma
.env
```

---

## 📦 Setup Instructions

### 🔧 1. Clone & Install Dependencies

```bash
git clone <your-repo-url>
cd client && npm install
cd ../server && npm install
```

---

### 🧩 2. Set Up `.env` (for server)

```env
DATABASE_URL=postgresql://username:password@localhost:5432/your-db-name
```

> ✅ No environment file needed for the client.

---

### 🔨 3. Prisma Setup (Only Once)

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

---

### ▶️ 4. Run App

#### 🖥 Backend (Port 3000)

```bash
cd server
node index.js
```

#### 🌐 Frontend (Vite - Port 5173)

```bash
cd client
npm run dev
```

---

## 🔁 API Routes

### 1. `GET /api/get-captcha`

- Fetches a fresh CAPTCHA from the court website.
- Returns: `{ captcha: "WZ41L" }`

### 2. `POST /api/fetch-case`

**Payload**:

```json
{
  "caseType": "W.P. (C)",
  "caseNumber": "1234",
  "filingYear": "2022",
  "captchaInput": "WZ41L"
}
```

**Returns**:

```json
{
  "title": "ABC vs XYZ",
  "status": "Pending",
  "metadata": {
    "petitioner": "ABC",
    "respondent": "XYZ",
    "filingDate": "04-01-2023",
    "nextHearing": "10-08-2025"
  },
  "orders": [
    {
      "title": "Order dated 05-01-2023",
      "url": "https://...",
      "date": "05-01-2023"
    }
  ]
}
```

---

## 🧭 Pagination Logic

- Displayed in table under “All Orders”
- Controlled via React state: `currentPage`
- `rowsPerPage = 10`
- Uses slice logic:
  ```js
  caseData.orders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  ```

---

## 🧠 Sample CaseType Config (`config.js`)

```js
const caseTypes = [
  "W.P. (C)", "C.M.", "LPA", "CRL.A.", "CRL.M.C.", "BAIL"
];
export default caseTypes;
```

---

## 🔐 Prisma Schema Summary

```prisma
model CourtQuery {
  id          Int                  @id @default(autoincrement())
  caseType    String
  caseNumber  String
  filingYear  String
  title       String?
  status      String?
  historyLink String?
  metadata    ParsedCaseMetadata? @relation(fields: [metadataId], references: [id])
  orders      OrderDocument[]
}

model ParsedCaseMetadata {
  id          Int      @id @default(autoincrement())
  petitioner  String
  respondent  String
  filingDate  String
  nextHearing String
  courtName   String
}

model OrderDocument {
  id      Int    @id @default(autoincrement())
  title   String
  url     String
  date    String
}
```

---

## 🧹 To Do / Future Enhancements

- 🔄 Add retry mechanism on Playwright CAPTCHA errors
- 🧾 Search history of fetched cases
- 📤 Export case data as PDF or CSV
- ⚖️ Add support for multiple courts (e.g., District/SC)
