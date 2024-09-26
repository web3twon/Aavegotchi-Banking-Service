// app.js

// Contract Information
const diamondAddress = "0x86935F11C86623deC8a25696E1C19a8659CbF95d";
const escrowFacetABI = [
    // Add the ABI definitions for EscrowFacet functions you intend to use
    // Example for depositERC20
    {
        "inputs": [
            { "internalType": "uint256", "name": "_tokenId", "type": "uint256" },
            { "internalType": "address", "name": "_erc20Contract", "type": "address" },
            { "internalType": "uint256", "name": "_value", "type": "uint256" }
        ],
        "name": "depositERC20",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // Repeat for other functions: batchDepositERC20, batchDepositGHST, batchTransferEscrow, transferEscrow
    // ...
];

// Initialize Ethers
let provider;
let signer;
let contract;

// Connect Wallet
const connectWalletButton = document.getElementById('connectWallet');
const walletAddressDisplay = document.getElementById('walletAddress');

connectWalletButton.addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            const address = await signer.getAddress();
            walletAddressDisplay.textContent = `Connected: ${address}`;
            initializeContract();
            loadFunctionForms();
        } catch (error) {
            console.error("User rejected the request.");
        }
    } else {
        alert('MetaMask is not installed. Please install it to use this DApp.');
    }
});

// Initialize Contract with EscrowFacet ABI
function initializeContract() {
    contract = new ethers.Contract(diamondAddress, escrowFacetABI, signer);
}

// Load Function Forms
function loadFunctionForms() {
    const functionsContainer = document.getElementById('functionsContainer');
    functionsContainer.innerHTML = ''; // Clear previous content

    // Define the functions and their parameters
    const functions = [
        {
            name: 'batchDepositERC20',
            params: [
                { name: '_tokenIds', type: 'uint256[]' },
                { name: '_erc20Contracts', type: 'address[]' },
                { name: '_values', type: 'uint256[]' }
            ]
        },
        {
            name: 'batchDepositGHST',
            params: [
                { name: '_tokenIds', type: 'uint256[]' },
                { name: '_values', type: 'uint256[]' }
            ]
        },
        {
            name: 'batchTransferEscrow',
            params: [
                { name: '_tokenIds', type: 'uint256[]' },
                { name: '_erc20Contracts', type: 'address[]' },
                { name: '_recipients', type: 'address[]' },
                { name: '_transferAmounts', type: 'uint256[]' }
            ]
        },
        {
            name: 'depositERC20',
            params: [
                { name: '_tokenId', type: 'uint256' },
                { name: '_erc20Contract', type: 'address' },
                { name: '_value', type: 'uint256' }
            ]
        },
        {
            name: 'transferEscrow',
            params: [
                { name: '_tokenId', type: 'uint256' },
                { name: '_erc20Contract', type: 'address' },
                { name: '_recipient', type: 'address' },
                { name: '_transferAmount', type: 'uint256' }
            ]
        }
    ];

    // Create forms for each function
    functions.forEach(func => {
        const form = document.createElement('form');
        form.id = func.name;

        const title = document.createElement('h3');
        title.textContent = func.name;
        form.appendChild(title);

        func.params.forEach(param => {
            const label = document.createElement('label');
            label.for = param.name;
            label.textContent = `${param.name} (${param.type})`;
            form.appendChild(label);

            const input = document.createElement('input');
            input.type = 'text';
            input.id = param.name;
            input.name = param.name;
            input.placeholder = `Enter ${param.name}`;
            form.appendChild(input);
        });

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Write';
        submitButton.className = 'submit-btn';
        form.appendChild(submitButton);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleFormSubmit(func.name, func.params);
        });

        functionsContainer.appendChild(form);
    });
}

// Handle Form Submission
async function handleFormSubmit(functionName, params) {
    if (!contract) {
        alert('Please connect your wallet first.');
        return;
    }

    try {
        // Gather inputs
        const args = params.map(param => {
            const input = document.getElementById(param.name);
            let value = input.value.trim();

            if (param.type.endsWith("[]")) {
                // Convert comma-separated values to array
                value = value.split(',').map(item => item.trim());
                if (param.type.startsWith("uint")) {
                    value = value.map(item => ethers.BigNumber.from(item));
                }
            } else if (param.type.startsWith("uint")) {
                value = ethers.BigNumber.from(value);
            }

            return value;
        });

        // Send transaction
        const tx = await contract[functionName](...args);
        alert(`Transaction submitted: ${tx.hash}`);
        await tx.wait();
        alert('Transaction confirmed!');
    } catch (error) {
        console.error(error);
        alert(`Error: ${error.message || error}`);
    }
}
