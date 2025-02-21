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
    const otpMessage = document.getElementById('otpMessage');
    const transferMessage = document.getElementById('transferMessage');
    const validationMessage = document.getElementById('validationMessage');
    const validationModal = document.getElementById('validationModal');
    const modalMessage = document.getElementById('modalMessage');
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

    transferBtn.addEventListener('click', () => {
        const from = fromAccount.value;
        const to = toAccount.value;
        const transferAmount = amount.value;
        const selectedCurrency = currency.value;

        if (from && to && transferAmount && selectedCurrency) {
            transferMessage.textContent = `Transfer of ${transferAmount} ${selectedCurrency} initiated. Please generate and validate OTP.`;
            transferMessage.style.color = 'green';
            setTimeout(() => {
                transferContainer.style.display = 'none';
                otpContainer.style.display = 'block';
            }, 1000);
        } else {
            transferMessage.textContent = 'Please fill in all fields.';
            transferMessage.style.color = 'red';
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

    validateOtpBtn.addEventListener('click', async () => {
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
                modalMessage.textContent = data.message;
                validationModal.style.display = 'block'; // Show the modal
                validationMessage.textContent = data.message;
                validationMessage.classList.add('success');
                validationMessage.classList.remove('error');
                setTimeout(() => {
                    otpContainer.style.display = 'none';
                    blockDetailsContainer.style.display = 'block';
                }, 1000);
            } else {
                modalMessage.textContent = data.error;
                validationModal.style.display = 'block'; // Show the modal
                validationMessage.textContent = data.error;
                validationMessage.classList.add('error');
                validationMessage.classList.remove('success');
            }
        } catch (error) {
            console.error('Error validating OTP:', error);
            modalMessage.textContent = 'Error validating OTP';
            validationModal.style.display = 'block'; // Show the modal
            validationMessage.textContent = 'Error validating OTP';
            validationMessage.classList.add('error');
            validationMessage.classList.remove('success');
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
        validationModal.style.display = 'none'; // Hide the modal
    });

    window.addEventListener('click', (event) => {
        if (event.target == validationModal) {
            validationModal.style.display = 'none'; // Hide the modal
        }
    });
});
