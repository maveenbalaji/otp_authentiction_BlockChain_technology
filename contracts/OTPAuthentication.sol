// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OTPAuthentication {
    string public currentOtp; // Ensure this is declared only once
    address public otpOwner;
    bool public otpGenerated;

    event OTPGenerated(address indexed user, string otp);
    event OTPValidated(address indexed user, bool isValid);

    function generateOTP() public returns (string memory) {
        require(!otpGenerated, "An OTP has already been generated and not used.");

        // Separate character sets for alphabets and numbers
        string memory alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        string memory numbers = "0123456789";
        uint256 length = 6; // Length of the OTP
        bytes memory otpBytes = new bytes(length);

        // Generate a random seed using block data and sender address
        bytes32 randomSeed = keccak256(abi.encodePacked(block.timestamp, msg.sender));

        // Ensure at least one character from each set
        otpBytes[0] = bytes(alphabets)[uint8(randomSeed[0]) % bytes(alphabets).length];
        otpBytes[1] = bytes(numbers)[uint8(randomSeed[1]) % bytes(numbers).length];

        // Fill the remaining characters randomly from both sets
        for (uint256 i = 2; i < length; i++) {
            if (uint8(randomSeed[i]) % 2 == 0) {
                otpBytes[i] = bytes(alphabets)[uint8(randomSeed[i]) % bytes(alphabets).length];
            } else {
                otpBytes[i] = bytes(numbers)[uint8(randomSeed[i]) % bytes(numbers).length];
            }
        }

        currentOtp = string(otpBytes);
        otpOwner = msg.sender;
        otpGenerated = true;

        emit OTPGenerated(msg.sender, currentOtp);
        return currentOtp;
    }

    function validateOTP(string memory userOtp) public {
        require(otpGenerated, "No OTP has been generated.");
        bool isValid = (keccak256(abi.encodePacked(userOtp)) == keccak256(abi.encodePacked(currentOtp)));

        emit OTPValidated(msg.sender, isValid);

        // Resetting state after validation
        otpGenerated = false; // Allow generating a new OTP
    }
}
