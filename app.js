// app.js

// Contract Information
const contractAddress = '0x86935F11C86623deC8a25696E1C19a8659CbF95d'; // Replace with your contract address if different

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
const connectWalletButton = document.getElementById('connect-wallet');
const walletInfo = document.getElementById('wallet-info');
const networkNameDisplay = document.getElementById('network-name');
const facetSelect = document.getElementById('facet-select');
const methodFormsContainer = document.getElementById('method-forms');
const contractAddressDisplay = document.getElementById('contract-address');

// Event Listeners
connectWalletButton.addEventListener('click', connectWallet);
facetSelect.addEventListener('change', (e) => {
  selectedFacet = e.target.value;
  generateMethodForms();
});

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
    walletInfo.innerHTML = `<p>Wallet Address: ${address}</p>`;

    // Get network information
    const network = await provider.getNetwork();
    networkNameDisplay.innerText = `${capitalizeFirstLetter(network.name)} (${network.chainId})`;

    // Initialize contract
    contract = new ethers.Contract(contractAddress, escrowFacetABI, signer);

    // Update button text
    connectWalletButton.innerText = `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;

    // Generate method forms
    generateMethodForms();

    // Listen for account changes
    window.ethereum.on('accountsChanged', handleAccountsChanged);

    // Listen for network changes
    window.ethereum.on('chainChanged', handleChainChanged);
  } catch (error) {
    console.error("Error connecting wallet:", error);
    alert('Failed to connect wallet. See console for details.');
  }
}

// Handle Account Changes
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // MetaMask is locked or no accounts connected
    walletInfo.innerHTML = '<p>Wallet Address: Not connected</p>';
    networkNameDisplay.innerText = 'Not Connected';
    connectWalletButton.innerText = 'Connect Wallet';
    contract = null;
    methodFormsContainer.innerHTML = '';
  } else {
    // Reload the page to avoid inconsistent state
    window.location.reload();
  }
}

// Handle Network Changes
function handleChainChanged(_chainId) {
  // Reload the page to avoid inconsistent state
  window.location.reload();
}

// Function to Capitalize First Letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to Generate Method Forms
function generateMethodForms() {
  methodFormsContainer.innerHTML = ''; // Clear existing forms

  if (!contract) {
    methodFormsContainer.innerHTML = '<p>Please connect your wallet to interact with the contract.</p>';
    return;
  }

  const selectedFacet = facetSelect.value;
  const facetMethods = getFacetMethods(selectedFacet);

  if (!facetMethods) {
    methodFormsContainer.innerHTML = '<p>No methods found for the selected facet.</p>';
    return;
  }

  // Iterate over each method and create a form
  for (const methodName in facetMethods) {
    const method = facetMethods[methodName];
    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';

    const formTitle = document.createElement('h3');
    formTitle.innerText = methodName;
    formContainer.appendChild(formTitle);

    const form = document.createElement('form');
    form.setAttribute('data-method', methodName);
    form.addEventListener('submit', handleFormSubmit);

    method.inputs.forEach(input => {
      const formGroup = document.createElement('div');
      formGroup.className = 'form-group';

      const label = document.createElement('label');
      label.setAttribute('for', input.name);
      label.innerText = `${input.name} (${input.type}):`;
      formGroup.appendChild(label);

      let inputElement;
      if (input.type.endsWith('[]')) {
        inputElement = document.createElement('textarea');
        inputElement.className = 'textarea';
        inputElement.placeholder = 'Enter comma-separated values';
      } else {
        inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.className = 'input';
        inputElement.placeholder = input.type.startsWith('address') ? '0x...' : '';
      }

      inputElement.id = input.name;
      inputElement.name = input.name;
      formGroup.appendChild(inputElement);

      form.appendChild(formGroup);
    });

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'button';
    submitButton.innerText = 'Submit';
    form.appendChild(submitButton);

    formContainer.appendChild(form);
    methodFormsContainer.appendChild(formContainer);
  }
}

// Function to Get Methods for a Facet
function getFacetMethods(facet) {
  const facets = {
    'EscrowFacet': {
      'batchDepositERC20': {
        inputs: [
          { name: '_tokenIds', type: 'uint256[]' },
          { name: '_erc20Contracts', type: 'address[]' },
          { name: '_values', type: 'uint256[]' }
        ]
      },
      'batchDepositGHST': {
        inputs: [
          { name: '_tokenIds', type: 'uint256[]' },
          { name: '_values', type: 'uint256[]' }
        ]
      },
      'batchTransferEscrow': {
        inputs: [
          { name: '_tokenIds', type: 'uint256[]' },
          { name: '_erc20Contracts', type: 'address[]' },
          { name: '_recipients', type: 'address[]' },
          { name: '_transferAmounts', type: 'uint256[]' }
        ]
      },
      'depositERC20': {
        inputs: [
          { name: '_tokenId', type: 'uint256' },
          { name: '_erc20Contract', type: 'address' },
          { name: '_value', type: 'uint256' }
        ]
      },
      'transferEscrow': {
        inputs: [
          { name: '_tokenId', type: 'uint256' },
          { name: '_erc20Contract', type: 'address' },
          { name: '_recipient', type: 'address' },
          { name: '_transferAmount', type: 'uint256' }
        ]
      }
    }
    // Add more facets if needed
  };

  return facets[facet];
}

// Function to Handle Form Submission
async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const methodName = form.getAttribute('data-method');
  const selectedFacet = facetSelect.value;
  const facetMethods = getFacetMethods(selectedFacet);
  const method = facetMethods[methodName];
  const formData = new FormData(form);

  // Prepare arguments
  const args = [];
  try {
    for (const input of method.inputs) {
      let value = formData.get(input.name).trim();
      if (input.type.endsWith('[]')) {
        // Split by commas and trim whitespace
        value = value.split(',').map(item => item.trim());
        if (input.type.startsWith('uint')) {
          // Convert each to BigNumber
          value = value.map(item => {
            if (!/^\d+$/.test(item)) {
              throw new Error(`Invalid number in ${input.name}: ${item}`);
            }
            return ethers.BigNumber.from(item);
          });
        } else if (input.type.startsWith('address')) {
          // Validate each address
          value.forEach(address => {
            if (!ethers.utils.isAddress(address)) {
              throw new Error(`Invalid address in ${input.name}: ${address}`);
            }
          });
        }
      } else {
        if (input.type.startsWith('uint')) {
          if (!/^\d+$/.test(value)) {
            throw new Error(`Invalid number for ${input.name}`);
          }
          value = ethers.BigNumber.from(value);
        } else if (input.type.startsWith('address')) {
          if (!ethers.utils.isAddress(value)) {
            throw new Error(`Invalid address for ${input.name}: ${value}`);
          }
        }
      }
      args.push(value);
    }

    // Call the contract method
    const tx = await contract[methodName](...args);
    alert(`Transaction submitted. Hash: ${tx.hash}`);
    await tx.wait();
    alert('Transaction confirmed!');
  } catch (error) {
    console.error(error);
    alert(`Error: ${error.message}`);
  }
}

// Initial call to generate method forms if the wallet is already connected
window.onload = async () => {
  if (window.ethereum && window.ethereum.selectedAddress) {
    await connectWallet();
  }
};
