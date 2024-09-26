// app.js

// Contract Information
const contractAddress = '0x86935F11C86623deC8a25696E1C19a8659CbF95d'; // Replace with the correct contract address

// Combined ABI: EscrowFacet + AavegotchiFacet
const combinedABI = [
    // EscrowFacet Functions
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
    },
    // AavegotchiFacet Functions
    {
      "inputs": [
        { "internalType": "address", "name": "_owner", "type": "address" }
      ],
      "name": "allAavegotchisOfOwner",
      "outputs": [
        {
          "components": [
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "internalType": "string", "name": "name", "type": "string" },
            { "internalType": "address", "name": "owner", "type": "address" },
            { "internalType": "uint256", "name": "randomNumber", "type": "uint256" },
            { "internalType": "uint256", "name": "status", "type": "uint256" },
            { "internalType": "int16[6]", "name": "numericTraits", "type": "int16[6]" },
            { "internalType": "int16[6]", "name": "modifiedNumericTraits", "type": "int16[6]" },
            { "internalType": "uint16[16]", "name": "equippedWearables", "type": "uint16[16]" },
            { "internalType": "address", "name": "collateral", "type": "address" },
            { "internalType": "address", "name": "escrow", "type": "address" },
            { "internalType": "uint256", "name": "stakedAmount", "type": "uint256" },
            { "internalType": "uint256", "name": "minimumStake", "type": "uint256" },
            { "internalType": "uint256", "name": "kinship", "type": "uint256" },
            { "internalType": "uint256", "name": "lastInteracted", "type": "uint256" },
            { "internalType": "uint256", "name": "experience", "type": "uint256" },
            { "internalType": "uint256", "name": "toNextLevel", "type": "uint256" },
            { "internalType": "uint256", "name": "usedSkillPoints", "type": "uint256" },
            { "internalType": "uint256", "name": "level", "type": "uint256" },
            { "internalType": "uint256", "name": "hauntId", "type": "uint256" },
            { "internalType": "uint256", "name": "baseRarityScore", "type": "uint256" },
            { "internalType": "uint256", "name": "modifiedRarityScore", "type": "uint256" }
          ],
          "internalType": "struct AavegotchiInfo[]",
          "name": "aavegotchis",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
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
const aavegotchiInfoContainer = document.getElementById('aavegotchi-info');

// Event Listeners
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
    walletInfo.innerHTML = `<p>Wallet Address: ${address}</p>`;

    // Get network information
    const network = await provider.getNetwork();
    networkNameDisplay.innerText = `${capitalizeFirstLetter(network.name)} (${network.chainId})`;

    // Initialize contract
    contract = new ethers.Contract(contractAddress, combinedABI, signer);

    // Update button text
    connectWalletButton.innerText = `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;

    // Ensure the Aavegotchi info is only fetched after the wallet is connected
    await fetchAndDisplayAavegotchis(address);

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
    walletInfo.innerHTML = '<p>Wallet Address: Not connected</p>';
    networkNameDisplay.innerText = 'Not Connected';
    connectWalletButton.innerText = 'Connect Wallet';
    contract = null;
    aavegotchiInfoContainer.innerHTML = ''; // Clear Aavegotchi Info
  } else {
    window.location.reload();
  }
}

// Handle Network Changes
function handleChainChanged(_chainId) {
  window.location.reload();
}

// Function to Fetch and Display Aavegotchis
async function fetchAndDisplayAavegotchis(ownerAddress) {
  if (!contract || !signer) {
    console.error("Contract or signer is not initialized");
    return;
  }

  try {
    // Call the allAavegotchisOfOwner function
    const aavegotchis = await contract.allAavegotchisOfOwner(ownerAddress);

    if (aavegotchis.length === 0) {
      aavegotchiInfoContainer.innerHTML = '<p>No Aavegotchis found for this wallet.</p>';
      return;
    }

    // Create a table to display Aavegotchi details
    const table = document.createElement('table');
    table.className = 'aavegotchi-table';

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const headers = ['Token ID', 'Name', 'Escrow Wallet'];
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.innerText = headerText;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    aavegotchis.forEach(aavegotchi => {
      const row = document.createElement('tr');

      const tokenId = aavegotchi.tokenId.toString();
      const name = aavegotchi.name;
      const escrowWallet = aavegotchi.escrow;

      const tokenIdCell = document.createElement('td');
      tokenIdCell.innerText = tokenId;
      row.appendChild(tokenIdCell);

      const nameCell = document.createElement('td');
      nameCell.innerText = name;
      row.appendChild(nameCell);

      const escrowCell = document.createElement('td');
      escrowCell.innerText = escrowWallet;
      row.appendChild(escrowCell);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Populate the Aavegotchi Info Container
    aavegotchiInfoContainer.innerHTML = '<h2>Your Aavegotchis:</h2>';
    aavegotchiInfoContainer.appendChild(table);
  } catch (error) {
    console.error("Error fetching Aavegotchis:", error);
    aavegotchiInfoContainer.innerHTML = '<p>Error fetching Aavegotchis. See console for details.</p>';
  }
}

// Function to Capitalize First Letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
