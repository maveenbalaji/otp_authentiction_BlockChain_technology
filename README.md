Got it! Below is the complete `README.md` for your project, including the smart contract code and the `server.js` code, formatted for your GitHub repository.

# Project README

## Table of Contents

1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Installation](#installation)
4. [Smart Contract](#smart-contract)
5. [Server Setup](#server-setup)
6. [Frontend Setup](#frontend-setup)
7. [Running the Application](#running-the-application)
8. [Technical Terms](#technical-terms)

## 1. Introduction

This project demonstrates a complete web application for OTP (One-Time Password) authentication and blockchain interaction using Ethereum. The application includes a frontend built with HTML, CSS, and JavaScript, and a backend built with Node.js and Express. The smart contract for OTP authentication is written in Solidity and deployed on the Ethereum blockchain using Ganache and Truffle.

## 2. Project Structure

The project structure includes the following files and directories:

- `index.html`: The main HTML file that contains the structure and design of the web pages.
- `app.js`: The JavaScript file that handles the client-side logic, including user interactions, API calls, and dynamic content updates.
- `server.js`: The Node.js file that handles the server-side logic, including API endpoints, database interactions, and business logic.
- `OTPAuthentication.json`: The JSON file that contains the ABI (Application Binary Interface) of the smart contract deployed on the blockchain.
- `OTPAuthentication.sol`: The Solidity file that contains the smart contract code for OTP authentication.
- `contracts/`: Directory containing the compiled smart contract JSON file.

## 3. Installation

### Prerequisites

- Node.js and npm installed on your machine.
- Ganache installed for running the Ethereum blockchain locally.
- Truffle installed for developing, compiling, and deploying smart contracts.

### Steps

1. **Install Ganache**:
   - Download and install Ganache from the official website: [Ganache](https://www.trufflesuite.com/ganache).
   - Follow the installation instructions for your operating system.

2. **Install Truffle**:
   - After installing Ganache, install Truffle by following the instructions on the [Truffle website](https://www.trufflesuite.com/).
   - Truffle will provide you with a development environment and tools to compile and deploy smart contracts.

3. **Install Dependencies**:
   - Navigate to your project directory and run the following commands to install the necessary dependencies:
     ```sh
     npm init -y
     npm install express web3 cors
     ```

## 4. Smart Contract

### Writing the Smart Contract

Use Solidity to write your smart contract. Here is a simple example of an OTP authentication smart contract:

```solidity
pragma solidity ^0.8.0;

contract OTPAuthentication {
    uint256 public otp;
    address public owner;
    mapping(address => uint256) public otps;
    event OTPGenerated(uint256 indexed otp);
    event OTPValidated(uint256 indexed otp, bool valid);

    constructor() public {
        owner = msg.sender;
    }

    function generateOTP() public returns (uint256) {
        otp = block.timestamp;
        otps[otp] = true;
        emit OTPGenerated(otp);
        return otp;
    }

    function validateOTP(uint256 _otp) public returns (bool) {
        require(otps[_otp] == true, "OTP has already been used");
        otps[_otp] = false;
        emit OTPValidated(_otp, true);
        return true;
    }
}
```

### Compiling and Deploying the Smart Contract

1. **Compile the Smart Contract**:
   - In Truffle, compile the smart contract using the Solidity compiler.

2. **Deploy the Smart Contract**:
   - Deploy the compiled smart contract to the Ganache blockchain using Truffle's deployment tools.
   - The deployed smart contract will be saved as `OTPAuthentication.json` in the `contracts/` directory.

## 5. Server Setup

### Setting Up the Server

Ensure your `server.js` file includes the correct paths to the `OTPAuthentication.json` file and the necessary Web3.js logic to interact with the smart contract.

### Example `server.js`

```javascript
const express = require('express');
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const web3 = new Web3("http://127.0.0.1:8545");

const contractPath = path.join(__dirname, '..', 'contracts', 'OTPAuthentication.json');
const contractJSON = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const contractAddress = contractJSON.networks['5777'].address;
const contractABI = contractJSON.abi;

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function generateOTP() {
    const accounts = await web3.eth.getAccounts();
    const gas = await contract.methods.generateOTP().estimateGas({ from: accounts[0] });
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = web3.utils.toHex(BigInt(gas) * BigInt(2));
    const result = await contract.methods.generateOTP().send({ from: accounts[0], gas: gasLimit, gasPrice });
    const otpEvent = result.events.OTPGenerated.returnValues.otp;
    console.log(`Generated OTP: ${otpEvent}`);
    return otpEvent;
}

async function validateOTP(userOtp) {
    const accounts = await web3.eth.getAccounts();
    const gas = await contract.methods.validateOTP(userOtp).estimateGas({ from: accounts[0] });
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = web3.utils.toHex(BigInt(gas) * BigInt(2));
    const result = await contract.methods.validateOTP(userOtp).send({ from: accounts[0], gas: gasLimit, gasPrice });
    const isValid = result.events.OTPValidated.returnValues.isValid;
    console.log(`Validation result for OTP "${userOtp}": ${isValid ? 'Valid' : 'Invalid'}`);
    return isValid;
}

async function getLatestBlock() {
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
}

async function getTotalBlocks() {
    const latestBlockNumber = await web3.eth.getBlockNumber();
    return latestBlockNumber;
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
```

## 6. Frontend Setup

### Setting Up the Frontend

The frontend includes the following files:

- `index.html`: The main HTML file that contains the structure and design of the web pages.
- `app.js`: The JavaScript file that handles the client-side logic, including user interactions, API calls, and dynamic content updates.

### Example `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login and OTP Authentication</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
            animation: backgroundAnimation 10s linear infinite;
        }
        @keyframes backgroundAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .container {
            background: #fff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            text-align: center;
            width: 350px;
            animation: fadeIn 1s ease-in-out;
        }
        .container h1, .container h2 {
            margin-bottom: 30px;
            color: #333;
            animation: slideIn 0.5s ease-in-out;
        }
        .container button {
            padding: 12px 24px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
            transition: background-color 0.3s, transform 0.3s;
        }
        .container button:hover {
            background-color: #0056b3;
            transform: scale(1.05);
        }
        .container input {
            padding: 12px;
            margin: 20px 0;
            width: calc(100% - 24px);
            border: 1px solid #ccc;
            border-radius: 6px;
            font-size: 16px;
            animation: fadeIn 0.5s ease-in-out;
        }
        .container .message {
            margin-top: 20px;
            font-size: 1.2em;
            color: #333;
            animation: fadeIn 0.5s ease-in-out;
        }
        .container .validation-message {
            margin-top: 20px;
            font-size: 1.2em;
            color: #333;
        }
        .container .validation-message.success {
            color: #28a745;
        }
        .container .validation-message.error {
            color: #dc3545;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgb(0,0,0);
            background-color: rgba(0,0,0,0.4);
            animation: fadeIn 0.5s;
        }
        .modal-content {
            background-color: #fefefe;
            margin: 15% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            border-radius: 12px;
            text-align: center;
            animation: zoomIn 0.6s;
        }
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }
        .close:hover,
        .close:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }
        .block-details {
            margin-top: 20px;
            font-size: 1.2em;
            color: #333;
        }
        .transfer-container {
            display: none;
            background: #fff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            text-align: center;
            width: 350px;
            animation: fadeIn 1s ease-in-out;
        }
        .transfer-container h2 {
            margin-bottom: 30px;
            color: #333;
            animation: slideIn 0.5s ease-in-out;
        }
        .transfer-container input {
            padding: 12px;
            margin: 20px 0;
            width: calc(100% - 24px);
            border: 1px solid #ccc;
            border-radius: 6px;
            font-size: 16px;
            animation: fadeIn 0.5s ease-in-out;
        }
        .transfer-container select {
            padding: 12px;
            margin: 20px 0;
            width: calc(100% - 24px);
            border: 1px solid #ccc;
            border-radius: 6px;
            font-size: 16px;
            animation: fadeIn 0.5s ease-in-out;
        }
        .transfer-container button {
            padding: 12px 24px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
            transition: background-color 0.3s, transform 0.3s;
        }
        .transfer-container button:hover {
            background-color: #0056b3;
            transform: scale(1.05);
        }
        .currency-symbol {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 18px;
            pointer-events: none;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideIn {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes zoomIn {
            from {
                opacity: 0;
                transform: scale3d(0.1, 0.1, 0.1);
            }
            50% {
                opacity: 1;
            }
        }
    </style>
</head>
<body>
    <div class="container" id="loginContainer">
        <h1>Login</h1>
        <input type="text" id="loginId" placeholder="Login ID">
        <input type="password" id="password" placeholder="Password">
        <button id="loginBtn">Login</button>
        <div class="message" id="loginMessage"></div>
    </div>

    <div class="transfer-container" id="transferContainer" style="display: none;">
        <h2>Transfer Funds</h2>
        <input type="text" id="fromAccount" placeholder="From Account">
        <input type="text" id="toAccount" placeholder="To Account">
        <div style="position: relative;">
            <span class="currency-symbol" id="currencySymbol">₹</span>
            <input type="number" id="amount" placeholder="Amount" style="padding-left: 30px;">
        </div>
        <select id="currency" style="margin-top: 20px;">
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
        </select>
        <button id="transferBtn">Transfer</button>
        <div class="message" id="transferMessage"></div>
    </div>

    <div class="container" id="otpContainer" style="display: none;">
        <h1>OTP Authentication</h1>
        <button id="generateOtpBtn">Generate OTP</button>
        <div class="message" id="otpMessage"></div>
        <div id="otpInputContainer" style="display: none;">
            <input type="text" id="otpInput" placeholder="Enter OTP">
            <button id="validateOtpBtn">Validate OTP</button>
        </div>
        <div class="validation-message" id="validationMessage"></div>
    </div>

    <div class="container" id="blockDetailsContainer" style="display: none;">
        <h1>Block Details</h1>
        <div class="block-details" id="blockDetails"></div>
        <button id="getBlockDetailsBtn">Get Latest Block Details</button>
    </div>

    <!-- The Modal -->
    <div id="otpVerificationModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>OTP Verification</h2>
            <p id="otpVerificationMessage">Please verify the OTP to transfer the amount.</p>
            <button id="confirmOtpBtn">Confirm</button>
        </div>
    </div>

    <!-- Include Chart.js library -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

### Example `app.js`

```javascript
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const loginId = document.getElementById('loginId');
    const password = document.getElementById('password');
    const loginMessage = document.getElementById('loginMessage');
    const loginContainer = document.getElementById('loginContainer');
    const otpContainer = document.getElementById('otpContainer');
    const transferContainer = document.getElementById('transferContainer');
    const blockDetailsContainer = document.getElementById('blockDetailsContainer');
    const generateOtpBtn = document.getElementById('generateOtpBtn');
    const otpInput = document.getElementById('otpInput');
    const validateOtpBtn = document.getElementById('validateOtpBtn');
    const transferBtn = document.getElementById('transferBtn');
    const fromAccount = document.getElementById('fromAccount');
    const toAccount = document.getElementById('toAccount');
    const amount = document.getElementById('amount');
    const currency = document.getElementById('currency');
    const currencySymbol = document.getElementById('currencySymbol');
    const otpMessage = document.getElementById('otpMessage');
    const transferMessage = document.getElementById('transferMessage');
    const validationMessage = document.getElementById('validationMessage');
    const otpVerificationModal = document.getElementById('otpVerificationModal');
    const otpVerificationMessage = document.getElementById('otpVerificationMessage');
    const confirmOtpBtn = document.getElementById('confirmOtpBtn');
    const closeModal = document.getElementsByClassName('close')[0];
    const getBlockDetailsBtn = document.getElementById('getBlockDetailsBtn');

    // Default user credentials
    const defaultUser = {
        loginId: 'Admin',
        password: 'VVIT'
    };

    loginBtn.addEventListener('click', () => {
        const enteredLoginId = loginId.value;
        const enteredPassword = password.value;

        if (enteredLoginId === defaultUser.loginId && enteredPassword === defaultUser.password) {
            loginMessage.textContent = 'Login successful!';
            loginMessage.style.color = 'green';
            setTimeout(() => {
                loginContainer.style.display = 'none';
                transferContainer.style.display = 'block';
            }, 1000);
        } else {
            loginMessage.textContent = 'Invalid login ID or password';
            loginMessage.style.color = 'red';
        }
    });

    currency.addEventListener('change', () => {
        const selectedCurrency = currency.value;
        if (selectedCurrency === 'INR') {
            currencySymbol.textContent = '₹';
        } else if (selectedCurrency === 'USD') {
            currencySymbol.textContent = '$';
        } else if (selectedCurrency === 'EUR') {
            currencySymbol.textContent = '€';
        }
    });

    transferBtn.addEventListener('click', () => {
        const from = fromAccount.value;
        const to = toAccount.value;
        const transferAmount = amount.value;
        const selectedCurrency = currency.value;

        if (from && to && transferAmount && selectedCurrency) {
            const formattedAmount = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: selectedCurrency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(transferAmount);

            transferMessage.textContent = `Transfer of ${formattedAmount} ${selectedCurrency} initiated. Please verify the OTP.`;
            transferMessage.style.color = 'green';
            otpVerificationModal.style.display = 'block'; // Show the modal
        } else {
            transferMessage.textContent = 'Please fill in all fields.';
            transferMessage.style.color = 'red';
        }
    });

    confirmOtpBtn.addEventListener('click', async () => {
        const userOtp = otpInput.value;
        try {
            const response = await fetch('http://localhost:3000/validate-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ otp: userOtp })
            });
            const data = await response.json();
            if (data.message) {
                otpVerificationMessage.textContent = data.message;
                validationMessage.textContent = data.message;
                validationMessage.classList.add('success');
                validationMessage.classList.remove('error');
                setTimeout(() => {
                    otpVerificationModal.style.display = 'none'; // Hide the modal
                    otpContainer.style.display = 'none';
                    blockDetailsContainer.style.display = 'block';
                }, 1000);
            } else {
                otpVerificationMessage.textContent = data.error;
                validationMessage.textContent = data.error;
                validationMessage.classList.add('error');
                validationMessage.classList.remove('success');
            }
        } catch (error) {
            console.error('Error validating OTP:', error);
            otpVerificationMessage.textContent = 'Error validating OTP';
            validationMessage.textContent = 'Error validating OTP';
            validationMessage.classList.add('error');
            validationMessage.classList.remove('success');
        }
    });

    generateOtpBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('http://localhost:3000/otp');
            const data = await response.json();
            if (data.otp) {
                otpMessage.textContent = `Generated OTP: ${data.otp}`;
                document.getElementById('otpInputContainer').style.display = 'block'; // Show the OTP input container
                validationMessage.textContent = ''; // Clear any previous validation messages
                validationMessage.classList.remove('success', 'error'); // Remove any previous classes
                document.getElementById('otpInputContainer').style.animation = 'fadeIn 0.5s ease-in-out'; // Add animation
            } else {
                otpMessage.textContent = data.error || 'Failed to generate OTP';
            }
        } catch (error) {
            console.error('Error generating OTP:', error);
            otpMessage.textContent = 'Error generating OTP';
        }
    });

    getBlockDetailsBtn.addEventListener('click', async () => {
        try {
            const blockResponse = await fetch('http://localhost:3000/latest-block');
            const totalBlocksResponse = await fetch('http://localhost:3000/total-blocks');
            const blockData = await blockResponse.json();
            const totalBlocksData = await totalBlocksResponse.json();

            if (blockData && totalBlocksData) {
                const blockTime = new Date(parseInt(blockData.timestamp) * 1000);
                const blockDetailsPage = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Block Details</title>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                        <style>
                            body {
                                font-family: 'Arial', sans-serif;
                                margin: 0;
                                padding: 20px;
                                background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
                                color: #333;
                            }
                            .container {
                                background: #fff;
                                padding: 20px;
                                border-radius: 12px;
                                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                                text-align: center;
                                width: 80%;
                                margin: 20px auto;
                            }
                            .container h3 {
                                margin-bottom: 20px;
                                color: #333;
                            }
                            .container p {
                                margin: 10px 0;
                                color: #333;
                            }
                            .container ul {
                                list-style-type: none;
                                padding: 0;
                            }
                            .container li {
                                margin: 10px 0;
                                color: #333;
                            }
                            .transaction, .account {
                                margin-top: 20px;
                            }
                            .transaction h4, .account h4 {
                                margin-bottom: 10px;
                                color: #333;
                            }
                            .transaction-item, .account-item {
                                background: #f9f9f9;
                                padding: 10px;
                                border-radius: 8px;
                                margin: 10px 0;
                                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                            }
                            .chart-container {
                                display: flex;
                                justify-content: space-around;
                                width: 100%;
                                max-width: 600px;
                                margin: 20px auto;
                            }
                            .chart-item {
                                width: 45%;
                            }
                            .pie-chart-container {
                                width: 100%;
                                max-width: 400px;
                                margin: 20px auto;
                            }
                            .icon {
                                margin-right: 10px;
                            }
                            .icon-hash {
                                color: #007bff; /* Blue color for hash icon */
                            }
                            .icon-link {
                                color: #28a745; /* Green color for parent hash icon */
                            }
                            .icon-cube {
                                color: #ffc107; /* Yellow color for nonce icon */
                            }
                            .icon-tachometer-alt {
                                color: #dc3545; /* Red color for gas used icon */
                            }
                            .icon-clock {
                                color: #17a2b8; /* Teal color for timestamp icon */
                            }
                            .icon-arrow-right {
                                color: #007bff; /* Blue color for from icon */
                            }
                            .icon-arrow-left {
                                color: #28a745; /* Green color for to icon */
                            }
                            .icon-dollar-sign {
                                color: #ffc107; /* Yellow color for value icon */
                            }
                            .icon-address-card {
                                color: #17a2b8; /* Teal color for address icon */
                            }
                            .icon-wallet {
                                color: #6c757d; /* Gray color for balance icon */
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h3>Details of Block Number: ${blockData.number}</h3>
                            <p><i class="fas fa-hashtag icon icon-hash"></i> Hash: ${blockData.hash}</p>
                            <p><i class="fas fa-link icon icon-link"></i> Parent Hash: ${blockData.parentHash}</p>
                            <p><i class="fas fa-cube icon icon-cube"></i> Nonce: ${blockData.nonce}</p>
                            <p><i class="fas fa-tachometer-alt icon icon-tachometer-alt"></i> Gas Used: ${blockData.gasUsed}</p>
                            <p><i class="fas fa-clock icon icon-clock"></i> Timestamp: ${blockTime.toLocaleString()}</p>
                            <div class="transaction">
                                <h4>Transactions:</h4>
                                ${blockData.transactions.map(tx => `
                                    <div class="transaction-item">
                                        <p><i class="fas fa-hashtag icon icon-hash"></i> Hash: ${tx.hash}</p>
                                        <p><i class="fas fa-arrow-right icon icon-arrow-right"></i> From: ${tx.from}</p>
                                        <p><i class="fas fa-arrow-left icon icon-arrow-left"></i> To: ${tx.to}</p>
                                        <p><i class="fas fa-dollar-sign icon icon-dollar-sign"></i> Value: ${tx.value} ETH</p>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="account">
                                <h4>Account Balances:</h4>
                                <div class="account-item">
                                    <p><i class="fas fa-address-card icon icon-address-card"></i> Address: ${blockData.accounts[0].address}</p>
                                    <p><i class="fas fa-wallet icon icon-wallet"></i> Balance: ${blockData.accounts[0].balance} ETH</p>
                                </div>
                            </div>
                            <div class="chart-container">
                                <div class="chart-item">
                                    <canvas id="gasUsedChart"></canvas>
                                    <p>Gas Used</p>
                                </div>
                                <div class="chart-item">
                                    <canvas id="accountBalancesChart"></canvas>
                                    <p>Account Balance</p>
                                </div>
                            </div>
                            <div class="pie-chart-container">
                                <canvas id="totalBlocksChart"></canvas>
                                <p>Total Blocks Created: ${totalBlocksData.totalBlocks}</p>
                            </div>
                        </div>
                        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                        <script>
                            const gasUsedCtx = document.getElementById('gasUsedChart').getContext('2d');
                            const gasUsedChart = new Chart(gasUsedCtx, {
                                type: 'bar',
                                data: {
                                    labels: ['Gas Used'],
                                    datasets: [{
                                        label: 'Gas Used',
                                        data: [${blockData.gasUsed}],
                                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                        borderColor: 'rgba(54, 162, 235, 1)',
                                        borderWidth: 1
                                    }]
                                },
                                options: {
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }
                            });

                            const accountBalancesCtx = document.getElementById('accountBalancesChart').getContext('2d');
                            const accountBalancesChart = new Chart(accountBalancesCtx, {
                                type: 'bar',
                                data: {
                                    labels: ['${blockData.accounts[0].address}'],
                                    datasets: [{
                                        label: 'Account Balances',
                                        data: [${blockData.accounts[0].balance}],
                                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                        borderColor: 'rgba(75, 192, 192, 1)',
                                        borderWidth: 1
                                    }]
                                },
                                options: {
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }
                            });

                            const totalBlocksCtx = document.getElementById('totalBlocksChart').getContext('2d');
                            const totalBlocksChart = new Chart(totalBlocksCtx, {
                                type: 'pie',
                                data: {
                                    labels: ['Total Blocks'],
                                    datasets: [{
                                        label: 'Total Blocks',
                                        data: [${totalBlocksData.totalBlocks}],
                                        backgroundColor: ['rgba(54, 162, 235, 0.2)'],
                                        borderColor: ['rgba(54, 162, 235, 1)'],
                                        borderWidth: 1
                                    }]
                                },
                                options: {
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: function(tooltipItem) {
                                                    return 'Total Blocks: ' + tooltipItem.raw;
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        </script>
                    </body>
                    </html>
                `;
                const newWindow = window.open();
                newWindow.document.open();
                newWindow.document.write(blockDetailsPage);
                newWindow.document.close();
            } else {
                blockDetails.textContent = 'Failed to get latest block details';
            }
        } catch (error) {
            console.error('Error getting latest block details:', error);
            blockDetails.textContent = 'Error getting latest block details';
        }
    });

    closeModal.addEventListener('click', () => {
        otpVerificationModal.style.display = 'none'; // Hide the modal
    });

    window.addEventListener('click', (event) => {
        if (event.target == otpVerificationModal) {
            otpVerificationModal.style.display = 'none'; // Hide the modal
        }
    });
});
```

## 7. Running the Application

1. **Run the Server**:
   - Start the Node.js server by running the following command in your project directory:
     ```sh
     node server.js
     ```

2. **Serve the Frontend**:
   - Use a static file server like `http-server` to serve the `index.html` and `app.js` files. You can install `http-server` globally using npm:
     ```sh
     npm install -g http-server
     ```
   - Then, navigate to your project directory and run:
     ```sh
     http-server
     ```

3. **Access the Application**:
   - Open your web browser and navigate to `http://localhost:8080` to interact with the UI.

## 8. Technical Terms

- **Ganache**: A virtual machine that runs the Ethereum blockchain for testing and development.
- **Truffle**: A development environment for Ethereum that includes tools for compiling and deploying smart contracts.
- **Solidity**: A programming language for writing smart contracts that run on the Ethereum blockchain.
- **Smart Contracts**: Self-executing contracts with the terms of the agreement directly written into lines of code, deployed on the blockchain, and interacting with the blockchain network.
- **Web3.js**: A JavaScript library for interacting with the Ethereum blockchain, allowing you to send transactions, read data, and interact with smart contracts.
- **Express**: A minimal and flexible Node.js web application framework used to create API endpoints and handle server-side logic.
- **CORS**: Cross-Origin Resource Sharing, a security feature implemented by web browsers to control which resources can be accessed from different origins.
- **ABI (Application Binary Interface)**: A JSON representation of the smart contract's methods and events, allowing interaction with the smart contract.
## 9.User Interface:
**ADMIN PAGE**
![WhatsApp Image 2025-02-21 at 12 02 57_fdd4d5d2](https://github.com/user-attachments/assets/0ec926b2-833d-4c5f-8558-014d14da0bb7)
**Fund Transfer Page**
![WhatsApp Image 2025-02-21 at 12 02 57_13e1e779](https://github.com/user-attachments/assets/5e9680ce-d900-4b4c-b10c-48e902441498)
**OTP Authentication Page**
![WhatsApp Image 2025-02-21 at 12 02 58_7da708fd](https://github.com/user-attachments/assets/bff7d3e5-c87c-4593-8262-6ba74d871738)
**Block deatils**
![WhatsApp Image 2025-02-21 at 12 02 59_b51ea694](https://github.com/user-attachments/assets/2f65f696-d085-4216-88b4-780b0368c289)

This `README.md` provides a comprehensive overview of the project, including the purpose of each file, installation steps, and technical terms. If you encounter any issues or need further assistance, feel free to ask!
