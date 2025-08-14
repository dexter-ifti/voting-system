// routes/blockchain.js
const express = require('express');
const { param, validationResult } = require('express-validator');
const blockchainService = require('../services/blockchainService');
const router = express.Router();

// Get blockchain network info
router.get('/network-info', async (req, res) => {
    try {
        const blockNumber = await blockchainService.getCurrentBlockNumber();

        res.json({
            success: true,
            data: {
                currentBlockNumber: blockNumber,
                network: process.env.BLOCKCHAIN_NETWORK || 'ganache',
                rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:7545'
            }
        });

    } catch (error) {
        console.error('Network info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get network info',
            error: error.message
        });
    }
});

// Get transaction receipt
router.get('/transaction/:txHash', [
    param('txHash').matches(/^0x[a-fA-F0-9]{64}$/).withMessage('Invalid transaction hash')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { txHash } = req.params;
        const receipt = await blockchainService.getTransactionReceipt(txHash);

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        res.json({
            success: true,
            data: { receipt }
        });

    } catch (error) {
        console.error('Transaction receipt error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get transaction receipt',
            error: error.message
        });
    }
});

// Check wallet balance
router.get('/balance/:address', [
    param('address').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid wallet address')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { address } = req.params;
        const balance = await blockchainService.getBalance(address);

        res.json({
            success: true,
            data: {
                address,
                balance: `${balance} ETH`
            }
        });

    } catch (error) {
        console.error('Balance check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check balance',
            error: error.message
        });
    }
});

// Get contract info
router.get('/contract/:contractAddress', [
    param('contractAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid contract address')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { contractAddress } = req.params;

        const [electionInfo, votingStatus, candidates] = await Promise.all([
            blockchainService.getElectionInfo(contractAddress),
            blockchainService.getVotingStatus(contractAddress),
            blockchainService.getCandidateList(contractAddress)
        ]);

        res.json({
            success: true,
            data: {
                contractAddress,
                electionInfo,
                votingStatus,
                candidateCount: candidates.length,
                candidates
            }
        });

    } catch (error) {
        console.error('Contract info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get contract info',
            error: error.message
        });
    }
});

module.exports = router;