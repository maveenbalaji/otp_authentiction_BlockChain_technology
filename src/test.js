const { default: Web3 } = require('web3'); // Import Web3 library
const fs = require('fs'); // File system module to read files
const path = require('path'); // Module to handle file paths
const readline = require('readline'); // Module for reading user input

// Connect to the local Ganache blockchain
const web3 = new Web3("http://127.0.0.1:8545");

// Path to your contract's JSON file
const contractPath = path.join(__dirname, '..', 'build', 'contracts', 'OTPAuthentication.json');

// Read and parse the contract ABI and address
const contractJSON = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const contractAddress = contractJSON.networks['5777'].address; // Update to match your Ganache network ID
const contractABI = contractJSON.abi;

// Readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to check blockchain status
async function checkBlockchain() {
    try {
        // Get the current block number
        const blockNumber = await web3.eth.getBlockNumber();
        console.log(`Current Block Number: ${blockNumber}`);

        // Fetch and display accounts
        const accounts = await web3.eth.getAccounts();
        console.log('Available Accounts:');
        accounts.forEach((account, index) => console.log(`${index}: ${account}`));

        // Display the balance of the first account
        const balance = await web3.eth.getBalance(accounts[0]);
        console.log(`Balance of ${accounts[0]}: ${web3.utils.fromWei(balance, 'ether')} ETH`);
    } catch (error) {
        console.error('Error checking blockchain status:', error);
    }
}

// Function to generate an OTP
async function generateOTP() {
    try {
        const accounts = await web3.eth.getAccounts();
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // Estimate gas for OTP generation
        const gas = await contract.methods.generateOTP().estimateGas({ from: accounts[0] });
        const gasPrice = await web3.eth.getGasPrice();

        // Increase the gas limit manually
        const gasLimit = web3.utils.toHex(BigInt(gas) * BigInt(2)); // Double the estimated gas

        // Call the contract's `generateOTP` method with explicit gas and gasPrice
        const result = await contract.methods.generateOTP().send({ from: accounts[0], gas: gasLimit, gasPrice });
        const otpEvent = result.events.OTPGenerated.returnValues.otp;

        console.log(`Generated OTP for ${accounts[0]}: ${otpEvent}`);
        return otpEvent;
    } catch (error) {
        console.error('Error generating OTP:', error);
    }
}

// Function to validate a user-provided OTP
async function validateOTP(userOtp) {
    try {
        const accounts = await web3.eth.getAccounts();
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // Estimate gas for OTP validation
        const gas = await contract.methods.validateOTP(userOtp).estimateGas({ from: accounts[0] });
        const gasPrice = await web3.eth.getGasPrice();

        // Increase the gas limit manually
        const gasLimit = web3.utils.toHex(BigInt(gas) * BigInt(2)); // Double the estimated gas

        // Call the contract's `validateOTP` method with explicit gas and gasPrice
        const result = await contract.methods.validateOTP(userOtp).send({ from: accounts[0], gas: gasLimit, gasPrice });
        const isValid = result.events.OTPValidated.returnValues.isValid;

        console.log(`Validation result for OTP "${userOtp}": ${isValid ? 'Valid' : 'Invalid'}`);
    } catch (error) {
        console.error('Error validating OTP:', error);
    }
}

// Function to display block details
async function displayBlockDetails(blockNumber) {
    try {
        const block = await web3.eth.getBlock(blockNumber, true);

        console.log(`\nDetails of Block Number: ${blockNumber}`);
        console.log(`Hash: ${block.hash}`);
        console.log(`Parent Hash: ${block.parentHash}`);
        console.log(`Nonce: ${block.nonce}`);
        console.log('Transactions:');

        if (block.transactions.length > 0) {
            block.transactions.forEach(tx => {
                console.log(`  - Hash: ${tx.hash}, From: ${tx.from}, To: ${tx.to}, Value: ${web3.utils.fromWei(tx.value, 'ether')} ETH`);
            });
        } else {
            console.log('  No transactions in this block.');
        }
    } catch (error) {
        console.error('Error fetching block details:', error);
    }
}

// Main function to orchestrate operations
async function main() {
    await checkBlockchain(); // Check blockchain status

    const generatedOtp = await generateOTP(); // Generate and display OTP
    if (generatedOtp) {
        rl.question('Please enter the OTP to validate: ', async (inputOtp) => {
            await validateOTP(inputOtp); // Validate user-provided OTP
            rl.close(); // Close readline interface

            // Display details of the latest block after validation
            const latestBlockNumber = await web3.eth.getBlockNumber();
            await displayBlockDetails(latestBlockNumber);
        });
    }
}

// Execute the main function
main();
