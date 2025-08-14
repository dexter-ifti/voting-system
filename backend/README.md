# Voting System Backend

A blockchain-based voting system backend built with Node.js, Express, MongoDB, and Ethereum smart contracts.

## Features

- 🔐 JWT Authentication & Authorization
- 🗳️ Smart Contract-based Voting System
- 📊 MongoDB Database for User Management
- 🔒 Security Middleware (CORS, Helmet, Rate Limiting)
- ⛓️ Ethereum Blockchain Integration
- 🧪 Comprehensive Testing & Deployment Scripts

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Blockchain**: Ethereum (Ganache for development)
- **Smart Contracts**: Solidity 0.8.30
- **Authentication**: JWT with bcryptjs
- **Security**: Helmet, CORS, Express Rate Limit
- **Development**: Nodemon, Ganache CLI

## Project Structure

```
backend/
├── config/
│   ├── blockchain.js      # Blockchain connection config
│   └── db.js             # MongoDB connection config
├── contracts/
│   ├── BasicVoting.sol   # Main voting smart contract
│   ├── VerySimple.sol    # Simple test contract
│   ├── compiled/         # Compiled contract artifacts
│   └── deployments/      # Deployment information
├── middleware/
│   ├── auth.js          # JWT authentication middleware
│   └── validation.js    # Input validation middleware
├── models/
│   ├── Admin.js         # Admin user model
│   ├── Candidate.js     # Candidate model
│   ├── Election.js      # Election model
│   └── Voter.js         # Voter model
├── routes/
│   ├── admin.js         # Admin management routes
│   ├── blockchain.js    # Blockchain interaction routes
│   ├── candidate.js     # Candidate management routes
│   ├── election.js      # Election management routes
│   └── voter.js         # Voter management routes
├── scripts/
│   ├── compile-basic-voting.js  # Compile main contract
│   ├── deploy-basic-voting.js   # Deploy with testing
│   ├── deploy-contract.js       # Main deployment script
│   └── setup-database.js       # Database initialization
├── services/
│   └── blockchainService.js    # Blockchain service layer
├── index.js             # Main server file
└── package.json         # Dependencies and scripts
```

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   # Check version
   node --version
   npm --version
   ```

2. **MongoDB** (v6 or higher)
   ```bash
   # Install on Ubuntu/Debian
   sudo apt update
   sudo apt install mongodb
   
   # Start MongoDB service
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

3. **Ganache CLI** (for local blockchain)
   ```bash
   # Install globally
   npm install -g ganache
   ```

### Environment Setup

1. **Clone and Navigate to Backend**
   ```bash
   cd /path/to/your/project/backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env with your values (the defaults work for development)
   nano .env
   ```

## Environment Variables

### Required Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/voting_system` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-jwt-key-change-in-production` |
| `BLOCKCHAIN_RPC_URL` | Blockchain RPC endpoint | `http://127.0.0.1:7545` |
| `ADMIN_PRIVATE_KEY` | Private key for contract deployment | Ganache default key |

### Optional Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3001` |
| `JWT_EXPIRES_IN` | JWT token expiration | `24h` |

### Ganache Default Accounts

The `.env.example` includes default Ganache accounts for development:

- **Admin Account**: `0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1`
- **Private Key**: `0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d`

> ⚠️ **Security Warning**: Never use these keys in production!

## Running the Application

### 1. Start Required Services

**Start MongoDB:**
```bash
# Ubuntu/Debian
sudo systemctl start mongodb

# macOS (with Homebrew)
brew services start mongodb-community

# Windows
net start MongoDB
```

**Start Ganache Blockchain:**
```bash
# Option 1: Using recommended settings
npx ganache --host 127.0.0.1 --port 7545 --gasLimit 10000000 --gasPrice 20000000000 --accounts 10 --deterministic

# Option 2: Using npm script (if available)
npm run ganache
```

### 2. Setup Database

```bash
# Initialize database with default data
npm run setup-db

# Alternative: run setup script directly
node scripts/setup-database.js
```

### 3. Compile Smart Contracts

```bash
# Compile the BasicVoting contract
npm run compile-contracts

# Alternative: run compilation script directly
node scripts/compile-basic-voting.js
```

### 4. Deploy Smart Contracts

```bash
# Deploy contracts to Ganache
npm run deploy-contracts

# Alternative: run deployment script directly
node scripts/deploy-contract.js
```

### 5. Start the Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Alternative: run directly
node index.js
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start server in production mode |
| `npm run dev` | Start server in development mode with nodemon |
| `npm run setup-db` | Initialize database with default data |
| `npm run compile-contracts` | Compile smart contracts |
| `npm run deploy-contracts` | Deploy contracts to blockchain |
| `npm run ganache` | Start Ganache with optimal settings |
| `npm test` | Run test suite (if implemented) |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Admin Management
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `GET /api/admin/elections` - List all elections

### Election Management
- `POST /api/elections` - Create new election
- `GET /api/elections` - List elections
- `GET /api/elections/:id` - Get election details
- `PUT /api/elections/:id` - Update election
- `DELETE /api/elections/:id` - Delete election

### Candidate Management
- `POST /api/candidates` - Add candidate
- `GET /api/candidates` - List candidates
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Remove candidate

### Voting
- `POST /api/vote` - Cast vote
- `GET /api/results/:electionId` - Get election results

### Blockchain
- `GET /api/blockchain/status` - Get blockchain status
- `POST /api/blockchain/deploy` - Deploy new contract
- `GET /api/blockchain/contract-info` - Get contract information

## Smart Contract Functions

### BasicVoting Contract

**Owner Functions:**
- `addCandidate()` - Add a new candidate
- `startVoting()` - Start the voting process
- `endVoting()` - End the voting process

**Voter Functions:**
- `vote(candidateId)` - Cast a vote for candidate

**View Functions:**
- `getCandidateCount()` - Get total number of candidates
- `getCandidateVotes(candidateId)` - Get votes for specific candidate
- `getResults()` - Get election results (winner)
- `isVotingActive()` - Check if voting is active
- `getTotalVotes()` - Get total votes cast

## Development Workflow

### 1. Making Contract Changes

```bash
# 1. Edit contract file
nano contracts/BasicVoting.sol

# 2. Recompile
npm run compile-contracts

# 3. Redeploy
npm run deploy-contracts

# 4. Restart backend server
npm run dev
```

### 2. Database Changes

```bash
# 1. Update models in models/ directory
# 2. Update routes in routes/ directory
# 3. Restart server
npm run dev
```

### 3. Adding New Routes

```bash
# 1. Create/update route files in routes/
# 2. Update index.js to include new routes
# 3. Test endpoints
```

## Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Start MongoDB if not running
sudo systemctl start mongodb
```

**2. Ganache Connection Error**
```bash
# Check if Ganache is running on correct port
netstat -tulpn | grep 7545

# Restart Ganache with correct settings
npx ganache --host 127.0.0.1 --port 7545 --gasLimit 10000000
```

**3. Contract Deployment Failed**
```bash
# Check Ganache gas settings
# Ensure gasLimit is high enough (10,000,000+)
# Verify bytecode is not too large

# Restart Ganache with higher limits
npx ganache --gasLimit 10000000 --gasPrice 20000000000
```

**4. JWT Token Errors**
```bash
# Verify JWT_SECRET is set in .env
# Check token expiration settings
# Ensure frontend sends token in Authorization header
```

### Logging

The application logs to console. For production, consider using:
- Winston for structured logging
- Morgan for HTTP request logging
- Log files for persistent logging

### Performance Tips

1. **Database Indexing**: Ensure proper indexes on frequently queried fields
2. **Connection Pooling**: MongoDB connection pooling is handled by Mongoose
3. **Caching**: Consider Redis for session storage and caching
4. **Rate Limiting**: Adjust rate limits based on expected traffic

## Production Deployment

### Security Checklist

- [ ] Change all default secrets and keys
- [ ] Use environment-specific MongoDB instance
- [ ] Configure proper CORS origins
- [ ] Set up HTTPS/TLS
- [ ] Use production blockchain network
- [ ] Configure proper logging
- [ ] Set up monitoring and alerts
- [ ] Regular security updates

### Environment Variables for Production

```bash
# Production .env example
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-production-db:27017/voting_system
JWT_SECRET=your-super-secure-production-secret
BLOCKCHAIN_RPC_URL=https://mainnet.infura.io/v3/your-project-id
ADMIN_PRIVATE_KEY=your-secure-production-private-key
FRONTEND_URL=https://your-production-frontend.com
```

## License

This project is part of a Final Project implementation for educational purposes.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review logs for error messages
3. Verify all prerequisites are installed
4. Ensure all services are running

---

**Last Updated**: 2024-12-19
