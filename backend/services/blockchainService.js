// services/blockchainService.js
const { ethers } = require('ethers');
const {Web3} = require('web3');
const dotenv = require('dotenv');
dotenv.config();

// Contract ABI - This should match your compiled contract
const CONTRACT_ABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "_title", "type": "string" },
            { "internalType": "string", "name": "_description", "type": "string" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "candidateId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "candidateAddress", "type": "address" },
            { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
            { "indexed": false, "internalType": "string", "name": "party", "type": "string" }
        ],
        "name": "CandidateRegistered",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": false, "internalType": "string", "name": "title", "type": "string" },
            { "indexed": false, "internalType": "uint256", "name": "startTime", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "endTime", "type": "uint256" }
        ],
        "name": "ElectionCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "EmergencyStop",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "voterId", "type": "uint256" },
            { "indexed": true, "internalType": "uint256", "name": "candidateId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "voterAddress", "type": "address" }
        ],
        "name": "VoteCast",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "voterId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "voterAddress", "type": "address" },
            { "indexed": false, "internalType": "string", "name": "name", "type": "string" }
        ],
        "name": "VoterRegistered",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "winner", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "votes", "type": "uint256" }
        ],
        "name": "VotingResultAnnounced",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "announceResults",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_candidateId", "type": "uint256" }],
        "name": "castVote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "name": "candidateDetails",
        "outputs": [
            { "internalType": "string", "name": "name", "type": "string" },
            { "internalType": "string", "name": "party", "type": "string" },
            { "internalType": "string", "name": "manifesto", "type": "string" },
            { "internalType": "uint256", "name": "age", "type": "uint256" },
            { "internalType": "enum VotingSystem.Gender", "name": "gender", "type": "uint8" },
            { "internalType": "uint256", "name": "candidateId", "type": "uint256" },
            { "internalType": "address", "name": "candidateAddress", "type": "address" },
            { "internalType": "uint256", "name": "votes", "type": "uint256" },
            { "internalType": "bool", "name": "isActive", "type": "bool" },
            { "internalType": "uint256", "name": "registrationTime", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "electionCommission",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "electionDetails",
        "outputs": [
            { "internalType": "string", "name": "title", "type": "string" },
            { "internalType": "string", "name": "description", "type": "string" },
            { "internalType": "uint256", "name": "startTime", "type": "uint256" },
            { "internalType": "uint256", "name": "endTime", "type": "uint256" },
            { "internalType": "bool", "name": "isActive", "type": "bool" },
            { "internalType": "uint256", "name": "totalVotes", "type": "uint256" },
            { "internalType": "bool", "name": "resultsAnnounced", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "emergencyStopVoting",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCandidateList",
        "outputs": [
            {
                "components": [
                    { "internalType": "string", "name": "name", "type": "string" },
                    { "internalType": "string", "name": "party", "type": "string" },
                    { "internalType": "string", "name": "manifesto", "type": "string" },
                    { "internalType": "uint256", "name": "age", "type": "uint256" },
                    { "internalType": "enum VotingSystem.Gender", "name": "gender", "type": "uint8" },
                    { "internalType": "uint256", "name": "candidateId", "type": "uint256" },
                    { "internalType": "address", "name": "candidateAddress", "type": "address" },
                    { "internalType": "uint256", "name": "votes", "type": "uint256" },
                    { "internalType": "bool", "name": "isActive", "type": "bool" },
                    { "internalType": "uint256", "name": "registrationTime", "type": "uint256" }
                ],
                "internalType": "struct VotingSystem.Candidate[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getResults",
        "outputs": [
            { "internalType": "address", "name": "winnerAddress", "type": "address" },
            { "internalType": "uint256", "name": "winnerVotes", "type": "uint256" },
            { "internalType": "uint256", "name": "totalVotes", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getVotingStatus",
        "outputs": [{ "internalType": "enum VotingSystem.VotingStatus", "name": "", "type": "uint8" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "_name", "type": "string" },
            { "internalType": "string", "name": "_party", "type": "string" },
            { "internalType": "string", "name": "_manifesto", "type": "string" },
            { "internalType": "uint256", "name": "_age", "type": "uint256" },
            { "internalType": "enum VotingSystem.Gender", "name": "_gender", "type": "uint8" }
        ],
        "name": "registerCandidate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "_name", "type": "string" },
            { "internalType": "uint256", "name": "_age", "type": "uint256" },
            { "internalType": "enum VotingSystem.Gender", "name": "_gender", "type": "uint8" }
        ],
        "name": "registerVoter",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "_title", "type": "string" },
            { "internalType": "string", "name": "_description", "type": "string" },
            { "internalType": "uint256", "name": "_startTimeFromNow", "type": "uint256" },
            { "internalType": "uint256", "name": "_durationInSeconds", "type": "uint256" }
        ],
        "name": "setElectionDetails",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

class BlockchainService {
    constructor() {
        this.provider = null;
        this.web3 = null;
        this.signer = null;
        this.initialize();
    }

    async initialize() {
        try {
            // Connect to Ganache or other Ethereum node
            const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';

            // Initialize ethers provider
            this.provider = new ethers.JsonRpcProvider(rpcUrl);

            // Initialize Web3
            this.web3 = new Web3(rpcUrl);

            // Set up signer (for admin operations)
            if (process.env.ADMIN_PRIVATE_KEY) {
                this.signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, this.provider);
            }

            console.log('✅ Blockchain service initialized');
        } catch (error) {
            console.error('❌ Blockchain service initialization failed:', error);
        }
    }

    // Deploy new election contract
    async deployElectionContract(title, description, adminPrivateKey) {
        try {
            const wallet = new ethers.Wallet(adminPrivateKey || process.env.ADMIN_PRIVATE_KEY, this.provider);

            // Contract bytecode - try env first, then compiled artifact fallback
            let contractBytecode = process.env.CONTRACT_BYTECODE;
            if (!contractBytecode) {
                try {
                    const fs = require('fs');
                    const path = require('path');
                    const artifactPath = path.join(__dirname, '../contracts/compiled/VotingSystem.json');
                    if (fs.existsSync(artifactPath)) {
                        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
                        if (artifact.bytecode) {
                            contractBytecode = artifact.bytecode.startsWith('0x') ? artifact.bytecode : `0x${artifact.bytecode}`;
                            console.log('ℹ️ Loaded contract bytecode from compiled artifact');
                        }
                    }
                } catch (innerErr) {
                    console.error('⚠️ Fallback artifact load failed:', innerErr.message);
                }
            }

            if (!contractBytecode) {
                throw new Error('Contract bytecode not found (missing CONTRACT_BYTECODE env and compiled artifact fallback)');
            }

            // Ensure 0x prefix
            if (!contractBytecode.startsWith('0x')) {
                contractBytecode = '0x' + contractBytecode;
            }

            const contractFactory = new ethers.ContractFactory(
                CONTRACT_ABI,
                contractBytecode,
                wallet
            );

            const contract = await contractFactory.deploy(title, description, {
                gasLimit: 3000000
            });

            await contract.waitForDeployment();
            const contractAddress = await contract.getAddress();

            console.log(`✅ Contract deployed at: ${contractAddress}`);

            return {
                contractAddress,
                transactionHash: contract.deploymentTransaction().hash,
                contract
            };
        } catch (error) {
            console.error('❌ Contract deployment failed:', error);
            throw error;
        }
    }

    // Get contract instance
    getContract(contractAddress, privateKey = null) {
        try {
            if (privateKey) {
                const wallet = new ethers.Wallet(privateKey, this.provider);
                return new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);
            } else {
                return new ethers.Contract(contractAddress, CONTRACT_ABI, this.provider);
            }
        } catch (error) {
            console.error('❌ Failed to get contract instance:', error);
            throw error;
        }
    }

    // Election Management Functions
    async setElectionDetails(contractAddress, title, description, startTimeFromNow, duration, adminPrivateKey) {
        try {
            const contract = this.getContract(contractAddress, adminPrivateKey);

            const tx = await contract.setElectionDetails(
                title,
                description,
                startTimeFromNow,
                duration,
                { gasLimit: 300000 }
            );

            await tx.wait();
            return tx.hash;
        } catch (error) {
            console.error('❌ Failed to set election details:', error);
            throw error;
        }
    }

    // Voter Registration
    async registerVoter(contractAddress, name, age, gender, voterPrivateKey) {
        try {
            const contract = this.getContract(contractAddress, voterPrivateKey);

            const tx = await contract.registerVoter(name, age, gender, {
                gasLimit: 300000
            });

            const receipt = await tx.wait();

            // Extract voter ID from event logs
            const voterRegisteredEvent = receipt.logs.find(log => {
                try {
                    const parsedLog = contract.interface.parseLog(log);
                    return parsedLog.name === 'VoterRegistered';
                } catch (e) {
                    return false;
                }
            });

            let voterId = null;
            if (voterRegisteredEvent) {
                const parsedLog = contract.interface.parseLog(voterRegisteredEvent);
                voterId = parsedLog.args.voterId.toString();
            }

            return {
                transactionHash: tx.hash,
                voterId,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            console.error('❌ Failed to register voter:', error);
            throw error;
        }
    }

    // Candidate Registration
    async registerCandidate(contractAddress, name, party, manifesto, age, gender, candidatePrivateKey) {
        try {
            const contract = this.getContract(contractAddress, candidatePrivateKey);

            const tx = await contract.registerCandidate(
                name,
                party,
                manifesto,
                age,
                gender,
                { gasLimit: 400000 }
            );

            const receipt = await tx.wait();

            // Extract candidate ID from event logs
            const candidateRegisteredEvent = receipt.logs.find(log => {
                try {
                    const parsedLog = contract.interface.parseLog(log);
                    return parsedLog.name === 'CandidateRegistered';
                } catch (e) {
                    return false;
                }
            });

            let candidateId = null;
            if (candidateRegisteredEvent) {
                const parsedLog = contract.interface.parseLog(candidateRegisteredEvent);
                candidateId = parsedLog.args.candidateId.toString();
            }

            return {
                transactionHash: tx.hash,
                candidateId,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            console.error('❌ Failed to register candidate:', error);
            throw error;
        }
    }

    // Cast Vote
    async castVote(contractAddress, candidateId, voterPrivateKey) {
        try {
            const contract = this.getContract(contractAddress, voterPrivateKey);

            const tx = await contract.castVote(candidateId, {
                gasLimit: 200000
            });

            const receipt = await tx.wait();

            return {
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            console.error('❌ Failed to cast vote:', error);
            throw error;
        }
    }

    // Get Election Status
    async getVotingStatus(contractAddress) {
        try {
            const contract = this.getContract(contractAddress);
            const status = await contract.getVotingStatus();

            const statusMap = {
                0: 'NotStarted',
                1: 'InProgress',
                2: 'Ended'
            };

            return statusMap[status] || 'Unknown';
        } catch (error) {
            console.error('❌ Failed to get voting status:', error);
            throw error;
        }
    }

    // Get Election Details
    async getElectionInfo(contractAddress) {
        try {
            const contract = this.getContract(contractAddress);
            const details = await contract.electionDetails();

            return {
                title: details.title,
                description: details.description,
                startTime: details.startTime.toString(),
                endTime: details.endTime.toString(),
                isActive: details.isActive,
                totalVotes: details.totalVotes.toString(),
                resultsAnnounced: details.resultsAnnounced
            };
        } catch (error) {
            console.error('❌ Failed to get election info:', error);
            throw error;
        }
    }

    // Get Candidates
    async getCandidateList(contractAddress) {
        try {
            const contract = this.getContract(contractAddress);
            const candidates = await contract.getCandidateList();

            return candidates.map(candidate => ({
                name: candidate.name,
                party: candidate.party,
                manifesto: candidate.manifesto,
                age: candidate.age.toString(),
                gender: candidate.gender,
                candidateId: candidate.candidateId.toString(),
                candidateAddress: candidate.candidateAddress,
                votes: candidate.votes.toString(),
                isActive: candidate.isActive,
                registrationTime: candidate.registrationTime.toString()
            }));
        } catch (error) {
            console.error('❌ Failed to get candidate list:', error);
            throw error;
        }
    }

    // Announce Results
    async announceResults(contractAddress, adminPrivateKey) {
        try {
            const contract = this.getContract(contractAddress, adminPrivateKey);

            const tx = await contract.announceResults({
                gasLimit: 300000
            });

            const receipt = await tx.wait();

            return {
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            console.error('❌ Failed to announce results:', error);
            throw error;
        }
    }

    // Get Results
    async getResults(contractAddress) {
        try {
            const contract = this.getContract(contractAddress);
            const results = await contract.getResults();

            return {
                winnerAddress: results.winnerAddress,
                winnerVotes: results.winnerVotes.toString(),
                totalVotes: results.totalVotes.toString()
            };
        } catch (error) {
            console.error('❌ Failed to get results:', error);
            throw error;
        }
    }

    // Emergency Stop
    async emergencyStopVoting(contractAddress, adminPrivateKey) {
        try {
            const contract = this.getContract(contractAddress, adminPrivateKey);

            const tx = await contract.emergencyStopVoting({
                gasLimit: 100000
            });

            const receipt = await tx.wait();

            return {
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            console.error('❌ Failed to emergency stop voting:', error);
            throw error;
        }
    }

    // Utility Functions
    async getTransactionReceipt(txHash) {
        try {
            return await this.provider.getTransactionReceipt(txHash);
        } catch (error) {
            console.error('❌ Failed to get transaction receipt:', error);
            throw error;
        }
    }

    async getCurrentBlockNumber() {
        try {
            return await this.provider.getBlockNumber();
        } catch (error) {
            console.error('❌ Failed to get block number:', error);
            throw error;
        }
    }

    // Validate Ethereum address
    isValidAddress(address) {
        return ethers.isAddress(address);
    }

    // Get account balance
    async getBalance(address) {
        try {
            const balance = await this.provider.getBalance(address);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('❌ Failed to get balance:', error);
            throw error;
        }
    }
}

module.exports = new BlockchainService();