<p align="center">
  <img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" />
  <img src="https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

<h1 align="center">🗳️ Blockchain-Based Voting System</h1>

<p align="center">
  <strong>A secure, transparent, and tamper-proof electronic voting platform built on Ethereum smart contracts.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-smart-contracts">Smart Contracts</a> •
  <a href="#-project-structure">Project Structure</a>
</p>

---

## 📖 Overview

This project implements a **full-stack decentralized voting system** that combines the transparency and immutability of blockchain technology with modern web development practices. The system uses Ethereum smart contracts to record votes on an immutable ledger, a Node.js backend for orchestration and identity verification, and a React frontend providing role-based dashboards for **Admins**, **Voters**, and **Candidates**.

The hybrid architecture keeps personally identifiable information (PII) off-chain in MongoDB while storing only vote transactions on the blockchain — striking a balance between **privacy** and **transparency**.

---

## ✨ Features

### 🔐 Security & Authentication
- **JWT-based authentication** with bcrypt password hashing
- **Role-based access control** — Admin, Voter, Candidate
- **Student ID + OTP verification** for identity validation
- **Rate limiting**, **Helmet** security headers, and **CORS** protection
- **Double-vote prevention** enforced at the smart contract level

### 🗳️ Election Management
- **Create & configure elections** with customizable timelines
- **Smart contract deployment** per election — each election lives on-chain
- **Registration phases** for both voters and candidates
- **Real-time status tracking** — created → registration → voting → results
- **Emergency stop** capability for administrators

### ⛓️ Blockchain Integration
- **Tamper-proof vote recording** on Ethereum-compatible blockchain
- **On-chain result computation** — results derived directly from contract state
- **Transaction hash tracking** for every vote cast
- **Event-driven architecture** with Solidity events for auditability

### 🖥️ Role-Based Dashboards

| Role | Capabilities |
|------|-------------|
| **Admin** | Create elections, deploy contracts, manage voters/candidates, approve registrations, announce results, monitor system status |
| **Voter** | Register with Student ID + OTP, browse elections, view candidate manifestos, cast votes, view election results & personal voting history |
| **Candidate** | Register for elections, track votes received, view analytics, monitor election standings |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                FRONTEND  (React + TypeScript + Vite)  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │   Admin      │  │    Voter     │  │  Candidate  │  │
│  │   Portal     │  │  Dashboard   │  │  Dashboard  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘  │
└─────────┼─────────────────┼─────────────────┼─────────┘
          │    REST API     │                 │
          ▼                 ▼                 ▼
┌──────────────────────────────────────────────────────┐
│               BACKEND  (Node.js + Express)            │
│                                                       │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  API Routes │  │ Auth (JWT +  │  │  Middleware    │  │
│  │  (REST)     │  │  bcrypt)     │  │  (Validation) │  │
│  └──────┬──────┘  └──────────────┘  └───────────────┘  │
│         │                                              │
│  ┌──────▼────────────┐     ┌────────────────────────┐  │
│  │ Blockchain Service │     │  Student ID Validation │  │
│  │ (ethers.js / web3) │     │  (OTP Verification)    │  │
│  └──────┬─────────────┘     └────────────────────────┘  │
└─────────┼──────────────────────────────────────────────┘
          │                              │
     ┌────▼───────────┐          ┌───────▼────────┐
     │   Ethereum      │          │    MongoDB     │
     │   Blockchain    │          │    Database    │
     │  (Anvil/Ganache)│          │  (User Data,  │
     │                 │          │   Elections)   │
     └─────────────────┘          └────────────────┘
```

> **Design Philosophy:** Off-chain identity verification + On-chain ballot recording = Privacy + Transparency

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, TypeScript, Vite | SPA with role-based routing |
| **Styling** | TailwindCSS | Responsive, utility-first CSS |
| **State Management** | Zustand | Lightweight global state |
| **Forms & Validation** | React Hook Form, Zod | Type-safe form handling |
| **HTTP Client** | Axios | API communication |
| **Backend** | Node.js, Express.js | REST API server |
| **Database** | MongoDB, Mongoose ODM | User profiles, election metadata |
| **Blockchain** | Ethereum, Solidity ^0.8.0 | Smart contract voting logic |
| **Blockchain Client** | ethers.js, web3.js | Contract interaction |
| **Authentication** | JWT, bcryptjs | Token-based auth |
| **Security** | Helmet, CORS, express-rate-limit | API hardening |
| **Contract Compiler** | solc 0.8.x | Solidity compilation |
| **Dev Blockchain** | Anvil / Ganache | Local Ethereum network |
| **Dev Tools** | Nodemon, ESLint, Docker | DX & deployment |

---

## 🚀 Getting Started

### Prerequisites

| Software | Minimum Version |
|----------|----------------|
| [Node.js](https://nodejs.org/) | v18+ |
| [MongoDB](https://www.mongodb.com/) | v6+ |
| [Anvil](https://book.getfoundry.sh/reference/anvil/) (Foundry) or [Ganache](https://trufflesuite.com/ganache/) | Latest |
| [Git](https://git-scm.com/) | Latest |

### 1. Clone the Repository

```bash
git clone https://github.com/dexter-ifti/voting-system.git
cd voting-system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values (defaults work for local development)
```

### 3. Start Required Services

```bash
# Terminal 1 — Start MongoDB
sudo systemctl start mongodb

# Terminal 2 — Start local blockchain
anvil
# or: npx ganache --port 8545 --gasLimit 10000000
```

### 4. Compile & Deploy Smart Contracts

```bash
# From /backend
npm run compile-contracts
npm run deploy-contracts
```

### 5. Start the Backend Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

The API server starts at **`http://localhost:5000`**

### 6. Frontend Setup

```bash
# Open a new terminal
cd co-frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend starts at **`http://localhost:5173`** (Vite default)

### 7. Default Admin Credentials

After running the database setup, you can log in with:

| Field | Value |
|-------|-------|
| Email | `admin@voting.com` |
| Password | `password123` |

> ⚠️ **Change these credentials immediately for any non-local deployment.**

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/login` | Admin login |
| `POST` | `/api/admin/register` | Admin registration |
| `POST` | `/api/voter/login` | Voter login |
| `POST` | `/api/voter/register` | Voter registration |
| `POST` | `/api/candidate/login` | Candidate login |
| `POST` | `/api/candidate/register` | Candidate registration |

### Election Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/election` | Create new election |
| `GET` | `/api/election` | List all elections |
| `GET` | `/api/election/:id` | Get election details |
| `PUT` | `/api/election/:id` | Update election |
| `DELETE` | `/api/election/:id` | Delete election |

### Voting

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/election/:id/vote` | Cast a vote |
| `GET` | `/api/election/:id/results` | Get election results |
| `GET` | `/api/election/:id/candidates` | List election candidates |

### Blockchain

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/blockchain/status` | Blockchain connection status |
| `POST` | `/api/blockchain/deploy` | Deploy new contract |
| `GET` | `/api/blockchain/contract-info` | Get contract metadata |

### Identity Verification

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/student/validate` | Validate Student ID |
| `POST` | `/api/student/verify-otp` | Verify OTP code |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health status |

---

## 📜 Smart Contracts

### VotingSystem.sol

The primary smart contract that manages the entire election lifecycle on-chain.

#### Data Structures

```solidity
struct Voter {
    string name;
    uint age;
    uint voterId;
    Gender gender;
    uint voteCandidateId;
    address voterAddress;
    bool isRegistered;
    uint registrationTime;
}

struct Candidate {
    string name;
    string party;
    string manifesto;
    uint age;
    Gender gender;
    uint candidateId;
    address candidateAddress;
    uint votes;
    bool isActive;
    uint registrationTime;
}

struct Election {
    string title;
    string description;
    uint startTime;
    uint endTime;
    bool isActive;
    uint totalVotes;
    bool resultsAnnounced;
}
```

#### Key Functions

| Function | Access | Description |
|----------|--------|-------------|
| `registerCandidate()` | Public | Register as a candidate (age ≥ 18, before voting starts) |
| `registerVoter()` | Public | Register as a voter (age ≥ 18, before voting starts) |
| `castVote(candidateId)` | Registered Voter | Cast a vote during active voting period |
| `announceResults()` | Commissioner | Compute and announce election results |
| `emergencyStopVoting()` | Commissioner | Emergency halt of voting |
| `getResults()` | Public | View results (after announcement) |
| `getCandidateList()` | Public | Get all registered candidates |
| `getVotingStatus()` | Public | Check current election state |

#### Security Modifiers

| Modifier | Enforces |
|----------|----------|
| `onlyCommissioner` | Restricts to election commission address |
| `isValidAge(18)` | Minimum age requirement |
| `votingActive` | Function only callable during active voting |
| `votingNotStarted` | Function only callable before voting begins |

#### On-Chain Constraints

- ✅ A user **cannot** be both voter and candidate
- ✅ Each voter can **only vote once** (double-vote prevention)
- ✅ Election commission **cannot** register as a candidate
- ✅ Candidates can only register **before** voting starts
- ✅ Results can only be announced **after** voting ends

---

## 📁 Project Structure

```
voting-system/
│
├── backend/                          # Node.js API server
│   ├── config/
│   │   ├── blockchain.js             # Blockchain connection config
│   │   └── db.js                     # MongoDB connection config
│   ├── contracts/
│   │   ├── VotingSystem.sol          # Main voting smart contract
│   │   ├── SimplifiedVotingSystem.sol# Lightweight contract variant
│   │   ├── compiled/                 # Compiled contract artifacts (ABI + bytecode)
│   │   └── deployments/              # Deployment metadata
│   ├── middleware/
│   │   ├── auth.js                   # JWT authentication middleware
│   │   ├── studentValidation.js      # Student ID verification
│   │   └── validation.js            # Input validation
│   ├── models/
│   │   ├── Admin.js                  # Admin schema
│   │   ├── Candidate.js              # Candidate schema
│   │   ├── Election.js               # Election schema
│   │   └── Voter.js                  # Voter schema
│   ├── routes/
│   │   ├── admin.js                  # Admin endpoints
│   │   ├── blockchain.js             # Blockchain endpoints
│   │   ├── candidate.js              # Candidate endpoints
│   │   ├── election.js               # Election endpoints
│   │   ├── studentValidation.js      # Student verification endpoints
│   │   └── voter.js                  # Voter endpoints
│   ├── services/
│   │   └── blockchainService.js      # Blockchain interaction layer
│   ├── scripts/
│   │   ├── compile-basic-voting.js   # Contract compilation
│   │   ├── deploy-contract.js        # Contract deployment
│   │   └── setup-database.js         # Database initialization
│   ├── index.js                      # Express server entry point
│   ├── package.json
│   └── .env.example                  # Environment template
│
├── co-frontend/                      # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ElectionRegistrationForm.tsx
│   │   │   ├── ElectionResults.tsx
│   │   │   ├── VotingInterface.tsx
│   │   │   ├── RegistrationStatus.tsx
│   │   │   ├── StudentOTPVerification.tsx
│   │   │   └── DemoOTPDisplay.tsx
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── admin/                # Admin dashboard & management
│   │   │   ├── voter/                # Voter dashboard & registration
│   │   │   ├── candidate/            # Candidate dashboard & registration
│   │   │   └── elections/            # Election views
│   │   ├── stores/
│   │   │   └── authStore.ts          # Zustand auth state
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx   # Shared dashboard layout
│   │   ├── lib/                      # Utilities & helpers
│   │   ├── theme/                    # Design tokens
│   │   ├── App.tsx                   # Root component with routing
│   │   └── main.tsx                  # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```

---

## 🔧 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/voting_system

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Blockchain
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
ADMIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
ADMIN_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Frontend
FRONTEND_URL=http://localhost:5173

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

> ⚠️ **Never commit `.env` files. Never use development keys in production.**

---

## 🔒 Security Considerations

| Area | Implementation |
|------|---------------|
| **Authentication** | JWT tokens with configurable expiry + bcrypt (12 rounds) |
| **Authorization** | Role-based route guards on both frontend and backend |
| **API Protection** | Helmet headers, CORS whitelist, rate limiting (100 req/15 min) |
| **Identity Verification** | Student ID validation + OTP verification before registration |
| **Smart Contract** | Access-control modifiers, state-machine constraints, age validation |
| **Data Separation** | PII stored off-chain (MongoDB); only votes stored on-chain |
| **Input Validation** | express-validator on all API inputs; Zod on frontend forms |

---

## 🗄️ Database Schema

The system uses four primary MongoDB collections:

| Collection | Purpose | Key Relations |
|------------|---------|--------------|
| **Admin** | System administrators | Deploys & manages elections, approves candidates |
| **Election** | Election configuration & state | References Admin (deployer), embeds candidates & voters |
| **Voter** | Registered voters | Links to elections via voting history |
| **Candidate** | Registered candidates | Links to elections via participation history |

Each election embeds:
- `candidates[]` — with on-chain IDs and vote counts
- `registeredVoters[]` — with voting status tracking
- `results[]` — computed post-election
- `winner` — final result reference
- `emergencyStop` — admin override capability

---

## 🧪 Available Scripts

### Backend (`/backend`)

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start dev server with hot reload |
| `npm run compile-contracts` | Compile Solidity contracts |
| `npm run deploy-contracts` | Deploy contracts to blockchain |
| `npm test` | Run test suite |

### Frontend (`/co-frontend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🐳 Docker Support

A `Dockerfile` and `docker-compose.yml` are available for containerized deployment:

```bash
# Build and run all services
docker-compose up --build

# Run in detached mode
docker-compose up -d
```

---

## 🗺️ Roadmap

- [ ] **Zero-Knowledge Proofs** — Prove voter eligibility without revealing identity
- [ ] **Formal Verification** — Mathematical proofs of smart contract correctness
- [ ] **Layer-2 Deployment** — Deploy on Polygon/Optimism for lower gas fees
- [ ] **Mobile Application** — Native Android/iOS app
- [ ] **Public Testnet** — Deploy on Sepolia for real-world testing
- [ ] **Advanced Voting Schemes** — Ranked-choice, quadratic, delegated voting
- [ ] **CI/CD Pipeline** — Automated testing and deployment

---

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Ethereum Foundation](https://ethereum.org/) — Smart contract platform
- [OpenZeppelin](https://openzeppelin.com/) — Smart contract security patterns
- [Foundry / Anvil](https://book.getfoundry.sh/) — Local blockchain development
- [Vite](https://vitejs.dev/) — Next-generation frontend tooling
- [Zustand](https://github.com/pmndrs/zustand) — Lightweight state management

---

<p align="center">
  Made with ❤️ for transparent and secure elections
</p>
