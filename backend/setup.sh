#!/bin/bash

# Voting System Backend Quick Setup Script
# This script helps you set up and run the entire backend system

set -e  # Exit on any error

echo "🚀 Voting System Backend Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the backend directory."
    exit 1
fi

print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
else
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
else
    NPM_VERSION=$(npm --version)
    print_success "npm found: $NPM_VERSION"
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    print_warning "MongoDB doesn't appear to be running."
    print_status "Attempting to start MongoDB..."
    
    # Try different ways to start MongoDB
    if command -v systemctl &> /dev/null; then
        sudo systemctl start mongodb || sudo systemctl start mongod || print_warning "Could not start MongoDB with systemctl"
    elif command -v brew &> /dev/null; then
        brew services start mongodb-community || print_warning "Could not start MongoDB with brew"
    else
        print_warning "Please start MongoDB manually"
    fi
    
    sleep 2
    
    if pgrep -x "mongod" > /dev/null; then
        print_success "MongoDB is now running"
    else
        print_error "Failed to start MongoDB. Please start it manually."
    fi
else
    print_success "MongoDB is running"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing npm dependencies..."
    npm install
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

# Setup environment file
if [ ! -f ".env" ]; then
    print_status "Creating .env file from .env.example..."
    cp .env.example .env
    print_success ".env file created"
    print_warning "Please review and update .env file with your specific configuration"
else
    print_success ".env file already exists"
fi

# Check if Ganache is installed
if ! command -v ganache &> /dev/null && ! npm list -g ganache &> /dev/null; then
    print_warning "Ganache CLI not found globally. Installing..."
    npm install -g ganache
    print_success "Ganache CLI installed"
else
    print_success "Ganache CLI is available"
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Check if Ganache is running
if check_port 7545; then
    print_success "Ganache is running on port 7545"
else
    print_warning "Ganache is not running on port 7545"
    read -p "Do you want to start Ganache now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Starting Ganache..."
        
        # Start Ganache in background
        nohup npx ganache --host 127.0.0.1 --port 7545 --gasLimit 10000000 --gasPrice 20000000000 --accounts 10 --deterministic > ganache.log 2>&1 &
        GANACHE_PID=$!
        
        # Wait a bit for Ganache to start
        sleep 5
        
        if check_port 7545; then
            print_success "Ganache started successfully (PID: $GANACHE_PID)"
            print_status "Ganache logs are being written to ganache.log"
        else
            print_error "Failed to start Ganache"
            exit 1
        fi
    fi
fi

# Compile contracts
if [ ! -d "contracts/compiled" ] || [ ! -f "contracts/compiled/BasicVoting.json" ]; then
    print_status "Compiling smart contracts..."
    node scripts/compile-basic-voting.js
    print_success "Smart contracts compiled"
else
    print_success "Smart contracts already compiled"
fi

# Deploy contracts
print_status "Deploying smart contracts..."
if node scripts/deploy-contract.js; then
    print_success "Smart contracts deployed successfully"
else
    print_error "Failed to deploy smart contracts"
    exit 1
fi

# Setup database
print_status "Setting up database..."
if [ -f "scripts/setup-database.js" ]; then
    node scripts/setup-database.js || print_warning "Database setup script completed with warnings"
    print_success "Database setup completed"
else
    print_warning "Database setup script not found, skipping..."
fi

echo ""
print_success "🎉 Backend setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Review the .env file and adjust settings as needed"
echo "2. Start the backend server with: npm run dev"
echo "3. Backend will be available at: http://localhost:3000"
echo ""
echo "📊 Service Status:"
echo "- MongoDB: $(if pgrep -x 'mongod' > /dev/null; then echo '✅ Running'; else echo '❌ Not running'; fi)"
echo "- Ganache: $(if check_port 7545; then echo '✅ Running on port 7545'; else echo '❌ Not running'; fi)"
echo "- Smart Contracts: ✅ Deployed"
echo ""
echo "📝 Useful Commands:"
echo "- Start server: npm run dev"
echo "- View logs: tail -f ganache.log"
echo "- Restart Ganache: pkill -f ganache && npx ganache --host 127.0.0.1 --port 7545 --gasLimit 10000000"
echo ""

# Ask if user wants to start the server
read -p "Do you want to start the backend server now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting backend server..."
    npm run dev
fi
