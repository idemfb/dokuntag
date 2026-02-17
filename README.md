# 🏆 Dokuntag 2.0+ - Loyalty & Reward System

Türkçe destekli, production-ready loyalty ve reward management sistemi. Next.js 14+ ile kurulu, Prisma ORM + SQLite kullanan, concurrency-safe ve idempotent transaction işlemleri.

## 🚀 Hızlı Başlangıç

### 1. Tek Komutla Setup
```bash
npm install && npx prisma migrate dev --name init && npx ts-node prisma/seed.ts && npm run dev
```

### 2. Veya Adım Adım
```bash
npm install              # Bağımlılıkları yükle
npx prisma migrate dev   # DB migrasyonu
npx ts-node prisma/seed.ts  # Test verilerini ekle
npm run dev              # Dev sunucusu
```

Tarayıcıda açın: **http://localhost:3000**

---

## 📋 Proje Yapısı

```
dokuntag/
├── app/
│   ├── api/
│   │   ├── user/       # User CRUD
│   │   ├── scan/       # Tag Scanner
│   │   ├── claim/      # Reward Claims (Idempotent)
│   │   └── loyalty/    # Core Operations
│   ├── components/
│   │   ├── Dashboard.tsx      # User Info + Rewards
│   │   ├── Scanner.tsx        # NFC/QR UI
│   │   └── Settings.tsx       # Theme + Language
│   └── page.tsx          # Main Page
├── prisma/
│   ├── schema.prisma     # DB Model
│   ├── seed.ts          # Test Data
│   └── migrations/      # DB Changes
├── lib/
│   ├── prisma.ts        # DB Client
│   └── logger.ts        # Logging
├── tests/
│   ├── loyalty.test.ts
│   ├── concurrency-loyalty-test.ts
│   └── concurrency-claim-test.ts
└── package.json
```

---

## 🗄️ Database Schema

### User
- `id` (PK) | `email` (unique) | `name` | `createdAt` | `updatedAt`
- Relations: `loyaltyPoint` (1:1), `rewardClaims` (1:∞)

### Reward
- `id` (CUID) | `title` | `costPoints` | `active` (bool)
- Relations: `claims` (1:∞)

### RewardClaim
- `id` (CUID) | `userId` (FK) | `rewardId` (FK)
- `idempotencyKey` (unique) | `status` | `createdAt`
- Ensures: No duplicate claims, transaction-safe

### LoyaltyPoint
- `userId` (PK, FK) | `points` | `createdAt` | `updatedAt`

### AuditLog
- Full compliance trail | Indexed by userId, action, createdAt

---

## 📡 API Endpoints

### Users
```bash
GET  /api/user?id=user-1           # Get user info
POST /api/user                     # Create user
PUT  /api/user                     # Update user
```

### Scanning
```bash
POST /api/scan                     # Scan NFC/QR tag
GET  /api/scan?userId=user-1       # Get scan history
```

### Claims (Idempotent)
```bash
POST /api/claim                    # Claim reward (safe for retries)
GET  /api/claim?userId=user-1      # Get claim history
```

### Loyalty (Core)
```bash
POST /api/loyalty/addPoints        # Add points
GET  /api/loyalty/points           # Get balance
GET  /api/loyalty/rewards          # List rewards
POST /api/loyalty/claimReward      # Claim reward
```

---

## 🧪 Tests

```bash
npm run test:loyalty                    # Basic flow
npm run test:concurrency-loyalty        # 10 concurrent claims
npm run test:concurrency-claim          # 100 HTTP requests
npm run test                           # All tests
```

**Expected Results:**
- ✅ Idempotency: Same claim 2x = same result
- ✅ Concurrency: No race conditions
- ✅ Points: Correctly deducted
- ✅ Transactions: Atomic operations

---

## 🛠️ Development

```bash
npm run build                      # TypeScript compile check
npx prisma studio                 # GUI DB Manager
rm prisma/dev.db && npx prisma migrate dev && npx ts-node prisma/seed.ts  # Fresh DB
```

---

## 🎛️ Frontend Features

### 📊 Dashboard
- User profile with points balance
- Active rewards in grid layout
- Claim history

### 📱 Scanner
- NFC/QR tag input
- Real-time scan logging
- Metadata tracking

### ⚙️ Settings
- Theme switcher (light/dark)
- Language selector (TR/EN)
- LocalStorage persistence

---

## 🔒 Key Guarantees

✅ **Idempotency**: Failed requests can be safely retried  
✅ **Atomicity**: Point deductions are all-or-nothing  
✅ **Concurrency**: No race conditions under load (tested 100+ concurrent)  
✅ **Audit Trail**: Every operation logged for compliance  
✅ **Type Safety**: Full TypeScript, no `any` types

---

## 🌱 Seed Data

```
3 Users:
  • Alice Johnson (1000 points)
  • Bob Smith (500 points)
  • Charlie Brown (250 points)

4 Rewards:
  • Small Coffee (50 pts)
  • Large Coffee (100 pts)
  • 10% Discount (150 pts)
  • Free Item (300 pts)
```

---

## 📚 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14.2.5 |
| Language | TypeScript |
| ORM | Prisma |
| Database | SQLite |
| UI | Tailwind CSS |
| Testing | ts-node |
| Logging | Pino |

---

## 🚀 Production Readiness

- [x] Database with migrations
- [x] API with error handling
- [x] Frontend components
- [x] Test suite (concurrency)
- [x] Idempotent transactions
- [x] Audit logging
- [x] Turkish support
- [ ] JWT authentication
- [ ] Rate limiting
- [ ] Redis caching
- [ ] Email notifications

---

## ❓ Troubleshooting

**Dev server error?**
```bash
rm -rf .next && npm run dev
```

**Seed failed?**
```bash
rm prisma/dev.db
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
```

**Prisma issues?**
```bash
npx prisma generate
```

---

**Dokuntag 2.0+ | Built with ❤️ using Next.js + TypeScript**