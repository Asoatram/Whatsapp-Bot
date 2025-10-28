# 💰 WhatsApp Finance Bot

> Smart financial assistant powered by AI that helps you track expenses through WhatsApp with natural language processing and OCR receipt scanning.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🤖 **AI-Powered Natural Language Processing**
- Understand natural language expense commands
- Smart categorization of expenses (food, transport, shopping, bills, health, housing, etc.)
- Context-aware conversation memory (powered by Redis)
- Multi-language support (English & Indonesian)

### 📸 **OCR Receipt Scanning**
- Automatic receipt text extraction using Tesseract.js
- AI-powered receipt parsing with Groq LLM (Llama 3.3 70B)
- Automatic transaction creation from scanned receipts
- Support for Indonesian and English receipts

### 📊 **Expense Tracking & Analytics**
- Real-time expense tracking
- Category-based spending breakdown
- Period-based summaries (today, week, month, year, all-time)
- Visual spending statistics with emojis

### 📤 **Data Export**
- Export transactions to CSV format
- Easy data portability for external analysis
- File delivery directly through WhatsApp

### 🔒 **Security & Privacy**
- Secure Redis password authentication
- Docker container isolation
- Environment-based configuration
- No data sharing with third parties

---

## 🎬 Demo

### Text-based Expense Tracking
![Demo percakapan](picture/ss1.png)

*Contoh screenshot: percakapan menambahkan pengeluaran melalui teks.*
```
You: I spent 50000 on lunch
Bot: ✅ Added 50,000 for food.

You: Taxi to office 25k
Bot: ✅ Added 25,000 for transport.

You: How much did I spend this month?
Bot: 💰 Total spending: 75,000
     📊 Breakdown:
     🍔 food: 50,000 (66.7%)
     🚗 transport: 25,000 (33.3%)
     🧾 2 transactions recorded
```

### OCR Receipt Scanning
![Hasil OCR dan parsing struk](picture/ss2.png)

*Contoh screenshot: hasil pemindaian OCR dan perekaman transaksi otomatis dari struk.*
```
You: [Sends receipt image]
Bot: 📸 Receipt image received! Processing with OCR...
     This may take 10-30 seconds.

Bot: ✅ Receipt processed successfully!
     📋 Extracted 3 transaction(s)
     💰 Total: 125,000
     
     Your expenses have been recorded automatically.
     Type "summary" to see your spending breakdown.
```

---

## 🛠 Tech Stack

### **Backend**
- **Node.js** - JavaScript runtime
- **whatsapp-web.js** - WhatsApp Web API wrapper
- **Prisma** - Modern database ORM
- **PostgreSQL** - Relational database
- **Redis** - In-memory cache for conversation context

### **AI & ML**
- **LangChain** - LLM framework
- **Groq** - LLM API (Llama 3.3 70B Versatile)
- **Tesseract.js** - OCR engine
- **Zod** - Schema validation

### **DevOps**
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Jest** - Testing framework

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **PostgreSQL** 15+
- **Redis** 7+
- **Git**

### System Requirements
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 2GB free space

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/whatsapp-finance-bot.git
cd whatsapp-finance-bot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your credentials
nano .env
```

### 4. Start Database Services (Docker)
```bash
# Option A: Using Docker Compose (Recommended)
docker-compose up -d

# Option B: Manual Docker setup
docker run -d \
  --name postgres-finance \
  -p 127.0.0.1:5432:5432 \
  -e POSTGRES_USER=whatsapp_user \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=whatsapp_finance \
  postgres:15-alpine

docker run -d \
  --name redis-finance \
  -p 127.0.0.1:6379:6379 \
  redis:7-alpine \
  redis-server --requirepass your_redis_password
```

### 5. Run Database Migrations
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database
npx prisma db seed
```

### 6. Start the Bot
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 7. Scan QR Code
When you first run the bot, a QR code will appear in the terminal. Scan it with your WhatsApp mobile app:
1. Open WhatsApp on your phone
2. Tap Menu (⋮) > Linked Devices
3. Tap "Link a Device"
4. Scan the QR code in your terminal

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://whatsapp_user:password@localhost:5432/whatsapp_finance?schema=public

# Redis
REDIS_URL=redis://:your_redis_password@127.0.0.1:6379/0
REDIS_PASSWORD=your_redis_password

# Groq API
GROQ_API_KEY=your_groq_api_key_here

# Application
NODE_ENV=development
PORT=3000
OCR_MEDIA_PATH=./exports/ocr_media
```

### Get API Keys

#### Groq API Key (Free)
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste into `.env`

### Docker Compose Configuration

Edit `docker-compose.yml` to customize:
- Resource limits (memory, CPU)
- Port bindings
- Volume mounts
- Network settings

---

## 📖 Usage

### Basic Commands

#### Adding Expenses
```
"I spent 20000 on lunch"
"Paid 50k for groceries"
"Transportation 15000"
"Rent payment 2000000"
```

#### Getting Summaries
```
"How much did I spend?"
"Total expenses this week"
"Show my spending this month"
"Summary"
```

#### Exporting Data
```
"Export my transactions"
"Send CSV"
"Download expenses"
```

#### OCR Receipt Scanning
```
1. Take a photo of your receipt
2. Send the image to the bot
3. Wait 10-30 seconds for processing
4. Transactions are automatically recorded
```

### Supported Categories

| Category | Icon | Examples |
|----------|------|----------|
| Food | 🍔 | lunch, dinner, groceries, snacks |
| Transport | 🚗 | taxi, bus, gas, parking |
| Shopping | 🛍 | clothes, electronics, gadgets |
| Bills | 💡 | electricity, water, internet, phone |
| Health | 💊 | medicine, doctor, hospital |
| Housing | 🏠 | rent, mortgage, furniture, repairs |
| Misc/Other | 💰 | uncategorized expenses |

### Advanced Features

#### Context-Aware Conversations
The bot remembers your conversation context for 6 hours:
```
You: I spent 50k
Bot: On what category?
You: Food
Bot: ✅ Added 50,000 for food.
```

#### Flexible Amount Formats
```
"20k" → 20,000
"2.5k" → 2,500
"1m" → 1,000,000
"50000" → 50,000
```

---

## 📁 Project Structure

```
whatsapp-finance-bot/
├── src/
│   ├── ai/
│   │   ├── handler.js          # Main AI message handler
│   │   ├── langchain.js        # Legacy LangChain handler
│   │   ├── llm.js              # Groq LLM configuration
│   │   ├── memory.js           # Redis-based conversation memory
│   │   └── parser.js           # Structured output parser
│   ├── config/
│   │   ├── db.js               # Prisma database connection
│   │   └── redis.js            # Redis configuration
│   ├── handlers/
│   │   ├── messageHandler.js   # WhatsApp message handler
│   │   └── mediaHandler.js     # Image/media processing handler
│   ├── services/
│   │   ├── transactionService.js  # Transaction CRUD operations
│   │   ├── exportService.js       # CSV export functionality
│   │   └── ocrService.js          # OCR processing service
│   ├── utils/
│   │   ├── exportCsv.js        # CSV generation utility
│   │   ├── ocrProcessor.js     # Tesseract OCR wrapper
│   │   └── phone.js            # Phone number normalization
│   └── generated/
│       └── prisma/             # Generated Prisma client
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── tests/
│   ├── handlers/
│   │   └── messageHandler.test.js
│   ├── services/
│   │   └── transactionService.test.js
│   └── jest.env.mjs            # Jest environment setup
├── exports/
│   ├── ocr_media/              # Uploaded receipt images
│   └── *.csv                   # Exported transaction files
├── .wwebjs_auth/               # WhatsApp session data (gitignored)
├── docker-compose.yml          # Docker services configuration
├── jest.config.mjs             # Jest testing configuration
├── index.js                    # Application entry point
├── package.json                # Dependencies and scripts
├── .env                        # Environment variables (gitignored)
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

---

## 📚 API Documentation

### Transaction Service

#### `addTransaction(phoneNumber, amount, category, description)`
Add a new transaction for a user.

**Parameters:**
- `phoneNumber` (string): User's phone number
- `amount` (number): Transaction amount
- `category` (string): Expense category
- `description` (string): Transaction description

**Returns:** Transaction object

#### `getTotalSpending(phoneNumber, period)`
Get total spending for a specific period.

**Parameters:**
- `phoneNumber` (string): User's phone number
- `period` (string): "today", "week", "month", "year", or "all"

**Returns:** Total amount (number)

#### `getDetailedSummary(phoneNumber, period)`
Get detailed spending breakdown by category.

**Parameters:**
- `phoneNumber` (string): User's phone number
- `period` (string): Time period

**Returns:** Object with total, breakdown array, and count

### OCR Service

#### `createOcrLog(phoneNumber, imagePath)`
Create an OCR processing log entry.

#### `processOcrAndCreateTransactions(ocrLogId)`
Process OCR and create transactions from extracted data.

### Export Service

#### `generateTransactionExport(phoneNumber)`
Generate CSV export of user's transactions.

**Returns:** File path to generated CSV

## 🚢 Deployment

### Docker Deployment

#### Build Image
```bash
# Build the image
docker build -t whatsapp-finance-bot .

# Run container
docker run -d \
  --name whatsapp-bot \
  --env-file .env \
  -v $(pwd)/.wwebjs_auth:/app/.wwebjs_auth \
  -p 3000:3000 \
  whatsapp-finance-bot
```

#### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart
```