// app.js

// Contract Information
const diamondAddress = "0x86935F11C86623deC8a25696E1C19a8659CbF95d";

// EscrowFacet ABI with all required functions
const escrowFacetABI = [
    // batchDepositERC20
    {
        "inputs": [
            { "internalType": "uint256[]", "name": "_tokenIds", "type": "uint256[]" },
            { "internalType": "address[]", "name": "_erc20Contracts", "type": "address[]" },
            { "internalType": "uint256[]", "name": "_values", "type": "uint256[]" }
        ],
        "name": "batchDepositERC20",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // batchDepositGHST
    {
        "inputs": [
            { "internalType": "uint256[]", "name": "_tokenIds", "type": "uint256[]" },
            { "internalType": "uint256[]", "name": "_values", "type": "uint256[]" }
        ],
        "name": "batchDepositGHST",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // batchTransferEscrow
    {
        "inputs": [
            { "internalType": "uint256[]", "name": "_tokenIds", "type": "uint256[]" },
            { "internalType": "address[]", "name": "_erc20Contracts", "type": "address[]" },
            { "internalType": "address[]", "name": "_recipients", "type": "address[]" },
            { "internalType": "uint256[]", "name": "_transferAmounts", "type": "uint256[]" }
        ],
        "name": "batchTransferEscrow",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // depositERC20
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
    // transferEscrow
    {
        "inputs": [
            { "internalType": "uint256", "name": "_tokenId", "type": "uint256" },
            { "internalType": "address", "name": "_erc20Contract", "type": "address" },
            { "internalType": "address", "name": "_recipient", "type": "address" },
            { "internalType": "uint256", "name": "_transferAmount", "type": "uint256" }
        ],
        "name": "transferEscrow",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Initialize Ethers.js variables
let provider;
let signer;
let contract;

// DOM Elements
const connectWalletButton = document.getElementById('connectWallet');
const walletAddressDisplay = document.getElementById('walletAddress');
const networkDisplay = document.getElementById('network');
const facetSelect = document.getElementById('facetSelect');
const functionsContainer = document.getElementById('functionsContainer');
const contractAddressDisplay = document.getElementById('contractAddress');

// Event Listener: Connect Wallet
connectWalletButton.addEventListener('click', connectWallet);

// Function to Connect Wallet
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        alert('MetaMask is not installed. Please install MetaMask to use this DApp.');
        return;
    }

    try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Initialize provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();

        // Get wallet address
        const address = await signer.getAddress();
        walletAddressDisplay.textContent = `Connected: ${address}`;

        // Get network information
        const network = await provider.getNetwork();
        networkDisplay.textContent = `${network.name} (${network.chainId})`;

        // Initialize contract
        initializeContract();

        // Load function forms
        loadFunctionForms();

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);

        // Listen for network changes
        window.ethereum.on('chainChanged', handleChainChanged);
    } catch (error) {
        console.error("Error connecting wallet:", error);
        alert('Failed to connect wallet. See console for details.');
    }
}

// Function to Handle Account Changes
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // MetaMask is locked or no accounts connected
        walletAddressDisplay.textContent = 'Not connected';
        networkDisplay.textContent = 'Not Connected';
        contract = null;
        functionsContainer.innerHTML = '';
    } else {
        walletAddressDisplay.textContent = `Connected: ${accounts[0]}`;
        initializeContract();
        loadFunctionForms();
    }
}

// Function to Handle Network Changes
async function handleChainChanged(_chainId) {
    // Reload the page to avoid any inconsistencies
    window.location.reload();
}

// Function to Initialize Contract
function initializeContract() {
    contract = new ethers.Contract(diamondAddress, escrowFacetABI, signer);
}

// Function to Load Function Forms
function loadFunctionForms() {
    functionsContainer.innerHTML = ''; // Clear existing forms

    // Define the functions and their parameters
    const functions = [
        {
            name: 'batchDepositERC20',
            selector: '0x467ab5cf',
            params: [
                { name: '_tokenIds', type: 'uint256[]', description: 'Comma-separated token IDs' },
                { name: '_erc20Contracts', type: 'address[]', description: 'Comma-separated ERC20 contract addresses' },
                { name: '_values', type: 'uint256[]', description: 'Comma-separated values' }
            ]
        },
        {
            name: 'batchDepositGHST',
            selector: '0xea20c3c6',
            params: [
                { name: '_tokenIds', type: 'uint256[]', description: 'Comma-separated token IDs' },
                { name: '_values', type: 'uint256[]', description: 'Comma-separated values' }
            ]
        },
        {
            name: 'batchTransferEscrow',
            selector: '0x2a206f11',
            params: [
                { name: '_tokenIds', type: 'uint256[]', description: 'Comma-separated token IDs' },
                { name: '_erc20Contracts', type: 'address[]', description: 'Comma-separated ERC20 contract addresses' },
                { name: '_recipients', type: 'address[]', description: 'Comma-separated recipient addresses' },
                { name: '_transferAmounts', type: 'uint256[]', description: 'Comma-separated transfer amounts' }
            ]
        },
        {
            name: 'depositERC20',
            selector: '0xb0facab3',
            params: [
                { name: '_tokenId', type: 'uint256', description: 'Token ID' },
                { name: '_erc20Contract', type: 'address', description: 'ERC20 contract address' },
                { name: '_value', type: 'uint256', description: 'Value to deposit' }
            ]
        },
        {
            name: 'transferEscrow',
            selector: '0xab0fcabf',
            params: [
                { name: '_tokenId', type: 'uint256', description: 'Token ID' },
                { name: '_erc20Contract', type: 'address', description: 'ERC20 contract address' },
                { name: '_recipient', type: 'address', description: 'Recipient address' },
                { name: '_transferAmount', type: 'uint256', description: 'Amount to transfer' }
            ]
        }
    ];

    // Generate a form for each function
    functions.forEach(func => {
        const form = document.createElement('form');
        form.id = func.name;

        const title = document.createElement('h3');
        title.textContent = `${func.name} (${func.selector})`;
        form.appendChild(title);

        func.params.forEach(param => {
            const label = document.createElement('label');
            label.htmlFor = param.name;
            label.textContent = `${param.name} (${param.type})`;
            form.appendChild(label);

            const input = document.createElement('textarea');
            input.id = param.name;
            input.name = param.name;
            input.placeholder = param.description;
            form.appendChild(input);
        });

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Write';
        submitButton.className = 'submit-btn';
        form.appendChild(submitButton);

        // Add event listener for form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleFormSubmit(func.name, func.params);
        });

        functionsContainer.appendChild(form);
    });
}

// Function to Handle Form Submission
async function handleFormSubmit(functionName, params) {
    if (!contract) {
        alert('Please connect your wallet first.');
        return;
    }

    try {
        // Gather and process input values
        const args = params.map(param => {
            const input = document.getElementById(param.name);
            let value = input.value.trim();

            if (param.type.endsWith("[]")) {
                // Convert comma-separated values to array
                value = value.split(',').map(item => item.trim());

                if (param.type.startsWith("uint")) {
                    // Convert string numbers to BigNumber
                    value = value.map(item => {
                        if (!/^\d+$/.test(item)) {
                            throw new Error(`Invalid number in ${param.name}: ${item}`);
                        }
                        return ethers.BigNumber.from(item);
                    });
                } else if (param.type === "address[]") {
                    // Validate Ethereum addresses
                    value.forEach(address => {
                        if (!ethers.utils.isAddress(address)) {
                            throw new Error(`Invalid address in ${param.name}: ${address}`);
                        }
                    });
                }
            } else {
                if (param.type.startsWith("uint")) {
                    if (!/^\d+$/.test(value)) {
                        throw new Error(`Invalid number for ${param.name}`);
                    }
                    value = ethers.BigNumber.from(value);
                } else if (param.type === "address") {
                    if (!ethers.utils.isAddress(value)) {
                        throw new Error(`Invalid address for ${param.name}: ${value}`);
                    }
                }
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
