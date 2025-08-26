// scripts/deploy-contract.js
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
async function deployContract() {
    try {
        console.log('🚀 Starting contract deployment...');

        // Read compiled contract
        const contractPath = path.join(__dirname, '../contracts/compiled/VotingSystem.json');
        if (!fs.existsSync(contractPath)) {
            console.log('❌ Compiled VotingSystem.json not found. Run: node scripts/compile-contracts.js');
            return;
        }        const contractArtifacts = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        const { abi, bytecode } = contractArtifacts;

        console.log("Bytecode length:", bytecode.length);
        console.log("ABI length:", abi.length);


        // Setup provider and wallet
        console.log('🌐 Connecting to blockchain at: http://127.0.0.1:8545');
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        
        // Get accounts from Ganache
        const accounts = await provider.listAccounts();
        if (accounts.length === 0) {
            throw new Error('No accounts available');
        }
        
        const wallet = accounts[0];
        console.log('📝 Deploying from address:', wallet.address);
        
        // Check balance
        const balance = await provider.getBalance(wallet.address);
        console.log('💰 Account balance:', ethers.formatEther(balance), 'ETH');

        if (balance === 0n) {
            throw new Error('❌ Insufficient funds for deployment');
        }

        console.log("Bytecode string starts with:", bytecode.slice(0, 20));
        console.log("Bytecode length:", bytecode.length);


        // Deploy contract
        const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
        
        console.log('⏳ Deploying VotingSystem contract...');
        const contract = await contractFactory.deploy(
            'This is a simplified voting system',
            'In this system, voters can create and vote on proposals.',
            {gasLimit: 6000000,  // Reduced gas limit for simplified contract
            gasPrice: ethers.parseUnits('20', 'gwei')
        });

        console.log('⏳ Waiting for deployment confirmation...');
        await contract.waitForDeployment();

        const contractAddress = await contract.getAddress();
        const deploymentTx = contract.deploymentTransaction();

        console.log('✅ Contract deployed successfully!');
        console.log('📍 Contract Address:', contractAddress);
        console.log('🔗 Transaction Hash:', deploymentTx.hash);
        console.log('⛽ Gas Used:', deploymentTx.gasLimit?.toString());

        // Save deployment info
        const deploymentInfo = {
            contractAddress,
            transactionHash: deploymentTx.hash,
            deployedAt: new Date().toISOString(),
            network: 'anvil-local',
            deployer: wallet.address,
            contractName: 'VotingSystem'
        };

        // Create deployments directory
        const deploymentsDir = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir, { recursive: true });
        }

        fs.writeFileSync(
            path.join(deploymentsDir, 'latest.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log('📝 Deployment info saved to deployments/latest.json');

    } catch (error) {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    }
}

// Run deployment if script is executed directly
if (require.main === module) {
    deployContract();
}

module.exports = deployContract;
