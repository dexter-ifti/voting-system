// config/blockchain.js
const { ethers } = require('ethers');

class BlockchainConfig {
    constructor() {
        this.networks = {
            anvil: {
                name: 'Anvil Local',
                rpcUrl: 'http://127.0.0.1:8545',
                chainId: 31337,
                blockTime: 1 // seconds
            },
            ganache: {
                name: 'Ganache Local',
                rpcUrl: 'http://127.0.0.1:7545',
                chainId: 1337,
                blockTime: 1 // seconds
            },
            sepolia: {
                name: 'Sepolia Testnet',
                rpcUrl: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
                chainId: 11155111,
                blockTime: 12
            },
            mainnet: {
                name: 'Ethereum Mainnet',
                rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
                chainId: 1,
                blockTime: 12
            }
        };

        this.currentNetwork = process.env.BLOCKCHAIN_NETWORK || 'anvil';
    }

    getNetworkConfig() {
        return this.networks[this.currentNetwork];
    }

    getProvider() {
        const config = this.getNetworkConfig();
        return new ethers.JsonRpcProvider(config.rpcUrl);
    }

    getWallet(privateKey) {
        const provider = this.getProvider();
        return new ethers.Wallet(privateKey, provider);
    }

    isValidPrivateKey(privateKey) {
        try {
            new ethers.Wallet(privateKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    isValidAddress(address) {
        return ethers.isAddress(address);
    }
}

module.exports = new BlockchainConfig();