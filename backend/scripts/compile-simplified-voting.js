// scripts/compile-simplified-voting.js
const solc = require('solc');
const fs = require('fs');
const path = require('path');

function compileSimplifiedVoting() {
    console.log('🔨 Compiling SimplifiedVotingSystem contract...');

    const contractsDir = path.join(__dirname, '../contracts');
    const compiledDir = path.join(__dirname, '../contracts/compiled');

    // Create compiled directory if it doesn't exist
    if (!fs.existsSync(compiledDir)) {
        fs.mkdirSync(compiledDir, { recursive: true });
    }

    // Read the contract source code
    const contractPath = path.join(contractsDir, 'SimplifiedVotingSystem.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    // Prepare input for compiler
    const input = {
        language: 'Solidity',
        sources: {
            'SimplifiedVotingSystem.sol': {
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
        const contractData = compiled.contracts['SimplifiedVotingSystem.sol']['SimplifiedVotingSystem'];

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
            path.join(compiledDir, 'SimplifiedVotingSystem.json'),
            JSON.stringify(compiledContract, null, 2)
        );

        console.log('✅ SimplifiedVotingSystem compiled successfully!');
        console.log('📁 Compiled contract saved to contracts/compiled/SimplifiedVotingSystem.json');
        console.log(`📊 Bytecode length: ${compiledContract.bytecode.length} characters`);

        return compiledContract;

    } catch (error) {
        console.error('❌ Compilation failed:', error);
        process.exit(1);
    }
}

// Run compilation if script is executed directly
if (require.main === module) {
    compileSimplifiedVoting();
}

module.exports = compileSimplifiedVoting;
