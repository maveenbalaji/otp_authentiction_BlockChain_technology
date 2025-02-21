module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id:5777, // Replace with the actual network ID
        },
        // Add other network configurations here if needed
    },
    compilers: {
        solc: {
            version: "0.8.0", // Specify Solidity compiler version
        }
    }
};
