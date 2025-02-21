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
### Compiling and Deploying the Smart Contract

1. **Compile the Smart Contract**:
   - In Truffle, compile the smart contract using the Solidity compiler.

2. **Deploy the Smart Contract**:
   - Deploy the compiled smart contract to the Ganache blockchain using Truffle's deployment tools.
   - The deployed smart contract will be saved as `OTPAuthentication.json` in the `contracts/` directory.

## 5. Server Setup

### Setting Up the Server

Ensure your `server.js` file includes the correct paths to the `OTPAuthentication.json` file and the necessary Web3.js logic to interact with the smart contract.
## 6. Frontend Setup

### Setting Up the Frontend

The frontend includes the following files:

- `index.html`: The main HTML file that contains the structure and design of the web pages.
- `app.js`: The JavaScript file that handles the client-side logic, including user interactions, API calls, and dynamic content updates.


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


**ADMIN PAGE**:


![WhatsApp Image 2025-02-21 at 12 02 57_fdd4d5d2](https://github.com/user-attachments/assets/0ec926b2-833d-4c5f-8558-014d14da0bb7)

**Fund Transfer Page**:

![WhatsApp Image 2025-02-21 at 12 02 57_13e1e779](https://github.com/user-attachments/assets/5e9680ce-d900-4b4c-b10c-48e902441498)


**OTP Authentication Page**

![WhatsApp Image 2025-02-21 at 12 02 58_7da708fd](https://github.com/user-attachments/assets/bff7d3e5-c87c-4593-8262-6ba74d871738)

**Block deatils**

![WhatsApp Image 2025-02-21 at 12 02 59_b51ea694](https://github.com/user-attachments/assets/2f65f696-d085-4216-88b4-780b0368c289)


This `README.md` provides a comprehensive overview of the project, including the purpose of each file, installation steps, and technical terms. If you encounter any issues or need further assistance, feel free to ask!
