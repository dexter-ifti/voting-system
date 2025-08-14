# 🚀 Quick Start Guide - Voting System Backend

## 📋 Summary

Your backend is **COMPLETE** and ready to run! Here's everything you need to know:

## ✅ What's Working

- ✅ **Express.js Server** - Fully configured with security middleware
- ✅ **MongoDB Integration** - Models and database configuration ready
- ✅ **Smart Contracts** - BasicVoting contract compiled and deployed
- ✅ **Authentication** - JWT-based auth system
- ✅ **API Routes** - Complete REST API for all functionality
- ✅ **Blockchain Service** - Ethereum integration working
- ✅ **Validation** - Input validation and security measures

## 🏃‍♂️ Quick Start (3 Steps)

### 1. **Automated Setup** (Recommended)
```bash
cd /home/ifti_taha/Code/Projects/Final_Project-2/backend
./setup.sh
```

### 2. **Manual Setup**
```bash
# Install dependencies
npm install

# Start MongoDB (if not running)
sudo systemctl start mongodb

# Start Ganache blockchain
npx ganache --host 127.0.0.1 --port 7545 --gasLimit 10000000 --gasPrice 20000000000 --accounts 10 --deterministic

# Compile and deploy contracts
node scripts/compile-basic-voting.js
node scripts/deploy-contract.js

# Start the server
npm run dev
```

### 3. **Environment Variables**
Copy `.env.example` to `.env` - **the defaults work perfectly for development!**

## 📡 Available Endpoints

Once running on `http://localhost:3000`:

### 🔐 Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### 🗳️ Voting System
- `POST /api/elections` - Create election
- `GET /api/elections` - List elections
- `POST /api/candidates` - Add candidates
- `POST /api/vote` - Cast votes
- `GET /api/results/:id` - Get results

### ⛓️ Blockchain
- `GET /api/blockchain/status` - Check blockchain connection
- `POST /api/blockchain/deploy` - Deploy new contracts

## 🛠️ Smart Contract Features

The **BasicVoting** contract is deployed and includes:

- ✅ **Add Candidates** - Owner can add candidates
- ✅ **Start/End Voting** - Control voting phases
- ✅ **Cast Votes** - Users can vote securely
- ✅ **Get Results** - Real-time vote counting
- ✅ **Security** - Prevent double voting, unauthorized access

## 📊 Environment Variables to Add

The system comes with working defaults, but you should customize:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/voting_system

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Blockchain (defaults work for development)
BLOCKCHAIN_RPC_URL=http://127.0.0.1:7545
ADMIN_PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d

# Server
PORT=3000
FRONTEND_URL=http://localhost:3001
```

## 🔧 How to Get Environment Variables

### 1. **MongoDB URI**
- **Local**: `mongodb://localhost:27017/voting_system` (default)
- **Atlas**: Sign up at [MongoDB Atlas](https://cloud.mongodb.com) and get connection string

### 2. **JWT Secret**
```bash
# Generate a secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. **Blockchain Credentials**
- **Development**: Use provided Ganache defaults (already set)
- **Production**: Use your own wallet private key and network URL

### 4. **Ganache Default Accounts** (for development)
```
Account 0: 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
Private Key: 0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
Balance: 1000 ETH
```

## 🚀 Running Everything

### Development Mode
```bash
# Terminal 1: Start Ganache
npx ganache --host 127.0.0.1 --port 7545 --gasLimit 10000000

# Terminal 2: Start Backend
npm run dev

# Backend runs on: http://localhost:3000
```

### Production Mode
```bash
npm start
```

## 📝 Package.json Scripts

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "compile-contracts": "node scripts/compile-basic-voting.js",
    "deploy-contracts": "node scripts/deploy-contract.js",
    "setup-db": "node scripts/setup-database.js"
  }
}
```

## 🧪 Testing the System

### 1. **Test Smart Contract Deployment**
```bash
node scripts/deploy-basic-voting.js
```
This runs a complete test including voting simulation.

### 2. **Test API Endpoints**
```bash
# Check server health
curl http://localhost:3000/api/health

# Check blockchain connection
curl http://localhost:3000/api/blockchain/status
```

## 🐛 Troubleshooting

### Common Issues & Solutions

1. **MongoDB Connection Error**
   ```bash
   sudo systemctl start mongodb
   ```

2. **Ganache Not Running**
   ```bash
   npx ganache --host 127.0.0.1 --port 7545 --gasLimit 10000000
   ```

3. **Contract Deployment Failed**
   - Restart Ganache with higher gas limit
   - Check if port 7545 is available

4. **Port Already in Use**
   ```bash
   # Kill processes on port 3000
   sudo lsof -t -i tcp:3000 | xargs kill
   ```

## 📁 Project Structure

```
backend/
├── contracts/           # Smart contracts (✅ Working)
├── models/             # MongoDB models (✅ Complete)
├── routes/             # API routes (✅ Complete)
├── middleware/         # Auth & validation (✅ Working)
├── services/           # Blockchain service (✅ Working)
├── scripts/            # Deployment scripts (✅ Working)
├── config/             # Configuration (✅ Complete)
├── index.js            # Main server (✅ Working)
└── package.json        # Dependencies (✅ Complete)
```

## 🎯 Next Steps

1. **Start the backend** using the quick start guide
2. **Test the endpoints** with Postman or curl
3. **Connect your frontend** to the API
4. **Deploy to production** when ready

## 🏆 Success Indicators

When everything is working, you'll see:

```
✅ MongoDB connected successfully
✅ Smart contracts deployed to: 0x...
✅ Server running on port 3000
✅ Blockchain connected: http://127.0.0.1:7545
```

---

**Your backend is 100% complete and ready to use!** 🎉

The smart contracts are working, the API is complete, and everything is tested. Just run the setup script or follow the manual steps, and you'll have a fully functional blockchain voting system backend.

**Need help?** Check the main README.md for detailed documentation.
