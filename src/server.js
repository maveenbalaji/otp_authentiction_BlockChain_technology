const express = require('express');
const { default: Web3 } = require('web3');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const web3 = new Web3("http://127.0.0.1:8545");

const contractPath = path.join(__dirname, '..', 'build', 'contracts', 'OTPAuthentication.json');
const contractJSON = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const contractAddress = contractJSON.networks['5777'].address;
const contractABI = contractJSON.abi;

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function generateOTP() {
    try {
        const accounts = await web3.eth.getAccounts();
        const gas = await contract.methods.generateOTP().estimateGas({ from: accounts[0] });
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = web3.utils.toHex(BigInt(gas) * BigInt(2));
        const result = await contract.methods.generateOTP().send({ from: accounts[0], gas: gasLimit, gasPrice });
        const otpEvent = result.events.OTPGenerated.returnValues.otp;
        console.log(`Generated OTP: ${otpEvent}`);
        return otpEvent;
    } catch (error) {
        console.error('Error generating OTP:', error);
        return null;
    }
}

async function validateOTP(userOtp) {
    try {
        const accounts = await web3.eth.getAccounts();
        const gas = await contract.methods.validateOTP(userOtp).estimateGas({ from: accounts[0] });
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = web3.utils.toHex(BigInt(gas) * BigInt(2));
        const result = await contract.methods.validateOTP(userOtp).send({ from: accounts[0], gas: gasLimit, gasPrice });
        const isValid = result.events.OTPValidated.returnValues.isValid;
        console.log(`Validation result for OTP "${userOtp}": ${isValid ? 'Valid' : 'Invalid'}`);
        return isValid;
    } catch (error) {
        console.error('Error validating OTP:', error);
        return false;
    }
}

async function getLatestBlock() {
    try {
        const latestBlockNumber = await web3.eth.getBlockNumber();
        const latestBlock = await web3.eth.getBlock(latestBlockNumber, true);
        const accounts = await web3.eth.getAccounts();
        const accountBalances = await Promise.all(accounts.map(account => web3.eth.getBalance(account)));
        return {
            number: latestBlockNumber.toString(),
            hash: latestBlock.hash,
            parentHash: latestBlock.parentHash,
            nonce: latestBlock.nonce.toString(),
            gasUsed: latestBlock.gasUsed.toString(),
            timestamp: latestBlock.timestamp.toString(),
            transactions: latestBlock.transactions.map(tx => ({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: web3.utils.fromWei(tx.value, 'ether')
            })),
            accounts: accounts.map((account, index) => ({
                address: account,
                balance: web3.utils.fromWei(accountBalances[index], 'ether')
            }))
        };
    } catch (error) {
        console.error('Error getting latest block:', error);
        return null;
    }
}

async function getTotalBlocks() {
    try {
        const latestBlockNumber = await web3.eth.getBlockNumber();
        return latestBlockNumber;
    } catch (error) {
        console.error('Error getting total number of blocks:', error);
        return null;
    }
}

app.get('/otp', async (req, res) => {
    try {
        const otp = await generateOTP();
        if (otp) {
            res.json({ otp });
        } else {
            res.status(500).json({ error: 'Failed to generate OTP' });
        }
    } catch (error) {
        console.error('Error handling /otp request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/validate-otp', async (req, res) => {
    try {
        const userOtp = req.body.otp;
        const isValid = await validateOTP(userOtp);
        if (isValid) {
            res.json({ message: 'OTP validated successfully' });
        } else {
            res.status(400).json({ error: 'Invalid OTP' });
        }
    } catch (error) {
        console.error('Error handling /validate-otp request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/latest-block', async (req, res) => {
    try {
        const latestBlock = await getLatestBlock();
        if (latestBlock) {
            res.json(latestBlock);
        } else {
            res.status(500).json({ error: 'Failed to get latest block' });
        }
    } catch (error) {
        console.error('Error handling /latest-block request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/total-blocks', async (req, res) => {
    try {
        const totalBlocks = await getTotalBlocks();
        if (totalBlocks) {
            res.json({ totalBlocks });
        } else {
            res.status(500).json({ error: 'Failed to get total number of blocks' });
        }
    } catch (error) {
        console.error('Error handling /total-blocks request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
