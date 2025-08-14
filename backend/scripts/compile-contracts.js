// scripts/compile-contracts.js
const solc = require('solc');
const fs = require('fs');
const path = require('path');

function compileContracts() {
    console.log('🔨 Compiling smart contracts...');

    const contractsDir = path.join(__dirname, '../contracts');
    const compiledDir = path.join(__dirname, '../contracts/compiled');

    // Create compiled directory if it doesn't exist
    if (!fs.existsSync(compiledDir)) {
        fs.mkdirSync(compiledDir, { recursive: true });
    }

    // Read the contract source code
    const contractPath = path.join(contractsDir, 'VotingSystem.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    // Prepare input for compiler
    const input = {
        language: 'Solidity',
        sources: {
            'VotingSystem.sol': {
                content: source
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode']
                }
            }
        }
    };

    try {
        // Compile the contract
        const compiled = JSON.parse(solc.compile(JSON.stringify(input)));

        // Check for compilation errors
        if (compiled.errors) {
            compiled.errors.forEach(error => {
                if (error.severity === 'error') {
                    console.error('❌ Compilation error:', error.formattedMessage);
                } else {
                    console.warn('⚠️ Compilation warning:', error.formattedMessage);
                }
            });
        }

        // Extract contract data
        const contractData = compiled.contracts['VotingSystem.sol']['VotingSystem'];

        if (!contractData) {
            throw new Error('Contract compilation failed');
        }

        // Save compiled contract
        const compiledContract = {
            abi: contractData.abi,
            bytecode: contractData.evm.bytecode.object,
            compiledAt: new Date().toISOString()
        };

        fs.writeFileSync(
            path.join(compiledDir, 'VotingSystem.json'),
            JSON.stringify(compiledContract, null, 2)
        );

        console.log('✅ Contract compiled successfully!');
        console.log('📁 Compiled contract saved to contracts/compiled/VotingSystem.json');

        return compiledContract;

    } catch (error) {
        console.error('❌ Compilation failed:', error);
        process.exit(1);
    }
}

// Run compilation if script is executed directly
if (require.main === module) {
    compileContracts();
}

module.exports = compileContracts;