// app.js

// Contract Information
const contractAddress = '0x86935F11C86623deC8a25696E1C19a8659CbF95d'; // Ensure this is correct

// GHST Token Information
const ghstContractAddress = '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7';
const ghstABI = [
  // balanceOf
  {
    "constant": true,
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  },
  // decimals
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "type": "function"
  },
  // Optional: symbol
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function"
  }
];

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

// Predefined ERC20 Tokens
const predefinedTokens = [
  {
    name: 'GHST',
    address: '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7'
  },
  // Add more predefined tokens here if needed
];

// Initialize Ethers.js variables
let provider;
let signer;
let contract;
let ghstContract;
let userAddress; // To store the connected wallet address

// DOM Elements
const connectWalletButton = document.getElementById('connect-wallet');
const walletInfo = document.getElementById('wallet-info');
const networkNameDisplay = document.getElementById('network-name');
const facetSelect = document.getElementById('facet-select'); // We'll repurpose this for "Extra Tools"
const methodFormsContainer = document.getElementById('method-forms');
const contractAddressDisplay = document.getElementById('contract-address');
const aavegotchiInfoContainer = document.getElementById('aavegotchi-info'); // New Element

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
    userAddress = address; // Assign to global variable
    walletInfo.innerHTML = `<p>Wallet Address: ${address}</p>`;

    // Get network information
    const network = await provider.getNetwork();
    networkNameDisplay.innerText = `${capitalizeFirstLetter(network.name)} (${network.chainId})`;

    // Initialize contracts
    contract = new ethers.Contract(contractAddress, combinedABI, signer);
    ghstContract = new ethers.Contract(ghstContractAddress, ghstABI, provider);

    // Update button text
    connectWalletButton.innerText = `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;

    // Generate method forms
    generateMethodForms();

    // Fetch and display Aavegotchi info
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
    // MetaMask is locked or no accounts connected
    walletInfo.innerHTML = '<p>Wallet Address: Not connected</p>';
    networkNameDisplay.innerText = 'Not Connected';
    connectWalletButton.innerText = 'Connect Wallet';
    contract = null;
    ghstContract = null;
    methodFormsContainer.innerHTML = '';
    aavegotchiInfoContainer.innerHTML = ''; // Clear Aavegotchi Info
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

  // Always generate TransferEscrow (Withdraw) form
  generateTransferEscrowForm();

  // Generate Extra Tools Dropdown
  generateExtraToolsDropdown();
}

// Function to Generate TransferEscrow (Withdraw) Form
function generateTransferEscrowForm() {
  const methodName = 'transferEscrow';
  const method = getFacetMethods('EscrowFacet')[methodName];

  if (!method) {
    console.error(`Method ${methodName} not found in EscrowFacet.`);
    return;
  }

  const formContainer = document.createElement('div');
  formContainer.className = 'form-container';

  // Create the header (no need to toggle since it's always expanded)
  const formHeader = document.createElement('div');
  formHeader.className = 'form-header';

  const formTitle = document.createElement('h3');
  formTitle.innerText = 'TransferEscrow (Withdraw)';

  formHeader.appendChild(formTitle);
  formContainer.appendChild(formHeader);

  // Create the content div (always expanded)
  const contentDiv = document.createElement('div');
  contentDiv.className = 'collapsible-content expanded';

  const form = document.createElement('form');
  form.setAttribute('data-method', methodName);
  form.addEventListener('submit', handleFormSubmit);

  method.inputs.forEach(input => {
    // Skip '_recipient' and '_tokenId' fields as _tokenId is hardcoded
    if (input.name === '_recipient' || input.name === '_tokenId') {
      return;
    }

    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    const label = document.createElement('label');
    label.setAttribute('for', input.name);

    // Update labels based on requirements
    if (input.name === '_erc20Contract') {
      label.innerText = 'ERC20 Contract Address:';
    } else if (input.name === '_transferAmount') {
      label.innerText = 'Withdraw Amount:';
    } else {
      label.innerText = `${input.name} (${input.type}):`;
    }

    formGroup.appendChild(label);

    let inputElement;
    if (input.name === '_erc20Contract') {
      // Create a dropdown for ERC20 Contract Address
      inputElement = document.createElement('select');
      inputElement.className = 'select';
      inputElement.id = input.name;
      inputElement.name = input.name;

      // Add predefined tokens
      predefinedTokens.forEach(token => {
        const option = document.createElement('option');
        option.value = token.address;
        option.innerText = token.name;
        inputElement.appendChild(option);
      });

      // Add "Add Your Own Token" option
      const customOption = document.createElement('option');
      customOption.value = 'custom';
      customOption.innerText = 'Add Your Own Token';
      inputElement.appendChild(customOption);

      formGroup.appendChild(inputElement);

      // Create a hidden input for custom ERC20 address
      const customInput = document.createElement('input');
      customInput.type = 'text';
      customInput.className = 'input';
      customInput.id = 'custom-erc20-address';
      customInput.name = 'custom-erc20-address';
      customInput.placeholder = '0x...';
      customInput.style.display = 'none'; // Hidden by default
      formGroup.appendChild(customInput);

      // Event listener to show/hide custom ERC20 address input
      inputElement.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
          customInput.style.display = 'block';
        } else {
          customInput.style.display = 'none';
        }
      });
    } else {
      if (input.type.endsWith('[]')) {
        inputElement = document.createElement('textarea');
        inputElement.className = 'textarea';
        inputElement.placeholder = 'Enter comma-separated values';
      } else {
        inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.className = 'input';
        if (input.type.startsWith('address')) {
          inputElement.placeholder = '0x...';
        }
      }

      inputElement.id = input.name;
      inputElement.name = input.name;
      formGroup.appendChild(inputElement);
    }

    form.appendChild(formGroup);
  });

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'button';
  submitButton.innerText = 'Submit';
  form.appendChild(submitButton);

  contentDiv.appendChild(form);
  formContainer.appendChild(contentDiv);
  methodFormsContainer.appendChild(formContainer);
}

// Function to Generate Extra Tools Dropdown
function generateExtraToolsDropdown() {
  const extraToolsContainer = document.createElement('div');
  extraToolsContainer.className = 'extra-tools-container';

  const extraToolsHeader = document.createElement('div');
  extraToolsHeader.className = 'extra-tools-header';

  const extraToolsTitle = document.createElement('h3');
  extraToolsTitle.innerText = 'Extra Tools';

  const toggleIcon = document.createElement('span');
  toggleIcon.className = 'extra-tools-toggle-icon collapsed';
  toggleIcon.innerHTML = '&#9660;'; // Downward triangle

  extraToolsHeader.appendChild(extraToolsTitle);
  extraToolsHeader.appendChild(toggleIcon);
  extraToolsContainer.appendChild(extraToolsHeader);

  // Create the collapsible content div
  const collapsibleContent = document.createElement('div');
  collapsibleContent.className = 'extra-tools-collapsible-content';

  // Get all methods except 'transferEscrow'
  const allFacets = ['EscrowFacet', 'AavegotchiFacet']; // Add more facets if needed
  const excludedMethods = ['transferEscrow'];

  allFacets.forEach(facet => {
    const facetMethods = getFacetMethods(facet);
    for (const methodName in facetMethods) {
      if (excludedMethods.includes(methodName)) continue;

      const method = facetMethods[methodName];
      const formContainer = document.createElement('div');
      formContainer.className = 'form-container';

      // Create the header that will be clickable
      const formHeader = document.createElement('div');
      formHeader.className = 'form-header';

      const formTitle = document.createElement('h3');
      formTitle.innerText = methodName;

      // Create the toggle icon
      const methodToggleIcon = document.createElement('span');
      methodToggleIcon.className = 'toggle-icon collapsed';
      methodToggleIcon.innerHTML = '&#9660;'; // Downward triangle

      formHeader.appendChild(formTitle);
      formHeader.appendChild(methodToggleIcon);
      formContainer.appendChild(formHeader);

      // Create the collapsible content div
      const methodCollapsibleContent = document.createElement('div');
      methodCollapsibleContent.className = 'collapsible-content';

      const form = document.createElement('form');
      form.setAttribute('data-method', methodName);
      form.addEventListener('submit', handleFormSubmit);

      method.inputs.forEach(input => {
        // Skip '_recipient' field if present
        if (input.name === '_recipient') {
          return;
        }

        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const label = document.createElement('label');
        label.setAttribute('for', input.name);

        // Update labels based on method
        if (methodName === 'transferEscrow') {
          // Not applicable here as it's excluded
          label.innerText = `${input.name} (${input.type}):`;
        } else {
          label.innerText = `${input.name} (${input.type}):`;
        }

        formGroup.appendChild(label);

        let inputElement;
        if (methodName === 'transferEscrow' && input.name === '_erc20Contract') {
          // Not applicable here as 'transferEscrow' is excluded
        } else {
          if (input.type.endsWith('[]')) {
            inputElement = document.createElement('textarea');
            inputElement.className = 'textarea';
            inputElement.placeholder = 'Enter comma-separated values';
          } else {
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.className = 'input';
            if (input.type.startsWith('address')) {
              inputElement.placeholder = '0x...';
            }
          }

          inputElement.id = input.name;
          inputElement.name = input.name;
          formGroup.appendChild(inputElement);
        }

        form.appendChild(formGroup);
      });

      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.className = 'button';
      submitButton.innerText = 'Submit';
      form.appendChild(submitButton);

      methodCollapsibleContent.appendChild(form);
      formContainer.appendChild(methodCollapsibleContent);
      collapsibleContent.appendChild(formContainer);

      // Add click event listener to the header to toggle collapse
      formHeader.addEventListener('click', () => {
        const isExpanded = methodCollapsibleContent.classList.contains('expanded');
        toggleCollapse(methodCollapsibleContent, methodToggleIcon, !isExpanded);
      });
    }
  });

  extraToolsContainer.appendChild(collapsibleContent);
  methodFormsContainer.appendChild(extraToolsContainer);

  // Add click event listener to the Extra Tools header to toggle collapse
  extraToolsHeader.addEventListener('click', () => {
    const isExpanded = collapsibleContent.classList.contains('expanded');
    toggleCollapse(collapsibleContent, toggleIcon, !isExpanded);
  });
}

// Function to Get Methods for a Facet
function getFacetMethods(facet) {
  const facets = {
    'EscrowFacet': {
      'transferEscrow': { // Modified inputs
        inputs: [
          { name: '_tokenId', type: 'uint256' },
          { name: '_erc20Contract', type: 'address' },
          // Removed '_recipient'
          { name: '_transferAmount', type: 'uint256' }
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
      'depositERC20': {
        inputs: [
          { name: '_tokenId', type: 'uint256' },
          { name: '_erc20Contract', type: 'address' },
          { name: '_value', type: 'uint256' }
        ]
      }
    },
    'AavegotchiFacet': {
      'allAavegotchisOfOwner': {
        inputs: [
          { name: '_owner', type: 'address' }
        ],
        outputs: [
          {
            components: [
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
  let method;
  
  // Determine which facet the method belongs to
  if (methodName === 'transferEscrow' || methodName === 'batchTransferEscrow' || methodName === 'batchDepositERC20' || methodName === 'batchDepositGHST' || methodName === 'depositERC20') {
    method = getFacetMethods('EscrowFacet')[methodName];
  } else if (methodName === 'allAavegotchisOfOwner') {
    method = getFacetMethods('AavegotchiFacet')[methodName];
  }
  // Add more conditions if there are more facets

  if (!method) {
    alert(`Method ${methodName} not found.`);
    return;
  }

  const formData = new FormData(form);

  // Prepare arguments
  const args = [];
  try {
    for (const input of method.inputs) {
      let value = formData.get(input.name)?.trim() || '';

      // Check if the input is _transferAmount or _values (for batchTransferEscrow and batchDepositERC20)
      const isAmountField = ['_transferAmount', '_transferAmounts', '_value', '_values'].includes(input.name);

      if (input.type.endsWith('[]')) {
        // Split by commas and trim whitespace
        value = value.split(',').map(item => item.trim()).filter(item => item !== '');
        if (isAmountField) {
          // Convert each to BigNumber with 18 decimals
          value = value.map(item => {
            if (!/^\d+(\.\d+)?$/.test(item)) {
              throw new Error(`Invalid number in ${input.name}: ${item}`);
            }
            return ethers.utils.parseUnits(item, 18);
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
        if (methodName === 'transferEscrow' && input.name === '_erc20Contract') {
          if (value === 'custom') {
            // Get custom ERC20 address
            const customAddress = formData.get('custom-erc20-address')?.trim();
            if (!customAddress || !ethers.utils.isAddress(customAddress)) {
              throw new Error('Please provide a valid custom ERC20 contract address.');
            }
            value = customAddress;
          } else {
            // Predefined ERC20 address selected
            // 'value' already contains the selected address
          }
        }

        if (isAmountField) {
          if (!/^\d+(\.\d+)?$/.test(value)) {
            throw new Error(`Invalid number for ${input.name}`);
          }
          value = ethers.utils.parseUnits(value, 18);
        } else {
          if (input.type.startsWith('uint')) {
            if (!/^\d+$/.test(value)) {
              throw new Error(`Invalid number for ${input.name}`);
            }
            // Handle hardcoded _tokenId for transferEscrow
            if (methodName === 'transferEscrow' && input.name === '_tokenId') {
              value = ethers.BigNumber.from('15615');
            } else {
              value = ethers.BigNumber.from(value);
            }
          } else if (input.type.startsWith('address')) {
            if (!ethers.utils.isAddress(value)) {
              throw new Error(`Invalid address for ${input.name}: ${value}`);
            }
          }
        }
      }
      args.push(value);
    }

    // Special handling for transferEscrow
    if (methodName === 'transferEscrow') {
      // The original 'transferEscrow' expects: _tokenId, _erc20Contract, _recipient, _transferAmount
      // Since _tokenId is hardcoded to 15615, we ensure it's the first argument
      if (args.length !== 3) { // _erc20Contract and _transferAmount
        throw new Error('Unexpected number of arguments for transferEscrow.');
      }
      const hardcodedTokenId = ethers.BigNumber.from('15615');
      args.unshift(hardcodedTokenId); // Insert at the beginning
      args.splice(3, 0, userAddress); // Insert userAddress as _recipient
    }

    // Call the contract method
    let tx;
    if (methodName === 'allAavegotchisOfOwner') {
      // This is a view function, handle differently
      const aavegotchis = await contract[methodName](...args);
      displayAavegotchis(aavegotchis);
      return;
    } else {
      tx = await contract[methodName](...args);
    }

    alert(`Transaction submitted. Hash: ${tx.hash}`);
    await tx.wait();
    alert('Transaction confirmed!');
  } catch (error) {
    console.error(error);
    alert(`Error: ${error.message}`);
  }
}

// Function to Toggle Collapse
function toggleCollapse(contentElement, iconElement, expand) {
  if (expand) {
    contentElement.classList.add('expanded');
    iconElement.classList.remove('collapsed');
    iconElement.classList.add('expanded');
    iconElement.innerHTML = '&#9650;'; // Upward triangle
  } else {
    contentElement.classList.remove('expanded');
    iconElement.classList.remove('expanded');
    iconElement.classList.add('collapsed');
    iconElement.innerHTML = '&#9660;'; // Downward triangle
  }
}

// Function to Fetch and Display Aavegotchis
async function fetchAndDisplayAavegotchis(ownerAddress) {
  try {
    // Call the allAavegotchisOfOwner function
    const aavegotchis = await contract.allAavegotchisOfOwner(ownerAddress);

    if (aavegotchis.length === 0) {
      aavegotchiInfoContainer.innerHTML = '<p>No Aavegotchis found for this wallet.</p>';
      return;
    }

    // Fetch GHST decimals and symbol
    const ghstDecimals = await ghstContract.decimals();
    const ghstSymbol = await ghstContract.symbol();

    // Create a table to display Aavegotchi details
    const table = document.createElement('table');
    table.className = 'aavegotchi-table';

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const headers = ['Token ID', 'Name', 'Escrow Wallet', `GHST Balance (${ghstSymbol})`];
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.innerText = headerText;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    // Prepare an array of promises to fetch GHST balances
    const balancePromises = aavegotchis.map(aavegotchi => {
      return ghstContract.balanceOf(aavegotchi.escrow);
    });

    // Fetch all balances in parallel
    const balances = await Promise.all(balancePromises);

    aavegotchis.forEach((aavegotchi, index) => {
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

      const ghstBalanceRaw = balances[index];
      const ghstBalance = ethers.utils.formatUnits(ghstBalanceRaw, ghstDecimals);
      const ghstBalanceCell = document.createElement('td');
      ghstBalanceCell.innerText = ghstBalance;
      row.appendChild(ghstBalanceCell);

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

// Function to Display Aavegotchis (Used for non-transactional methods)
function displayAavegotchis(aavegotchis) {
  if (aavegotchis.length === 0) {
    aavegotchiInfoContainer.innerHTML = '<p>No Aavegotchis found for this wallet.</p>';
    return;
  }

  // Fetch GHST decimals and symbol
  ghstContract.decimals().then(ghstDecimals => {
    ghstContract.symbol().then(ghstSymbol => {
      // Create a table to display Aavegotchi details
      const table = document.createElement('table');
      table.className = 'aavegotchi-table';

      // Create table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');

      const headers = ['Token ID', 'Name', 'Escrow Wallet', `GHST Balance (${ghstSymbol})`];
      headers.forEach(headerText => {
        const th = document.createElement('th');
        th.innerText = headerText;
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Create table body
      const tbody = document.createElement('tbody');

      // Prepare an array of promises to fetch GHST balances
      const balancePromises = aavegotchis.map(aavegotchi => {
        return ghstContract.balanceOf(aavegotchi.escrow);
      });

      // Fetch all balances in parallel
      Promise.all(balancePromises).then(balances => {
        aavegotchis.forEach((aavegotchi, index) => {
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

          const ghstBalanceRaw = balances[index];
          const ghstBalance = ethers.utils.formatUnits(ghstBalanceRaw, ghstDecimals);
          const ghstBalanceCell = document.createElement('td');
          ghstBalanceCell.innerText = ghstBalance;
          row.appendChild(ghstBalanceCell);

          tbody.appendChild(row);
        });

        table.appendChild(tbody);

        // Populate the Aavegotchi Info Container
        aavegotchiInfoContainer.innerHTML = '<h2>Your Aavegotchis:</h2>';
        aavegotchiInfoContainer.appendChild(table);
      }).catch(error => {
        console.error("Error fetching GHST balances:", error);
        aavegotchiInfoContainer.innerHTML = '<p>Error fetching GHST balances. See console for details.</p>';
      });
    }).catch(error => {
      console.error("Error fetching GHST symbol:", error);
      aavegotchiInfoContainer.innerHTML = '<p>Error fetching GHST symbol. See console for details.</p>';
    });
  }).catch(error => {
    console.error("Error fetching GHST decimals:", error);
    aavegotchiInfoContainer.innerHTML = '<p>Error fetching GHST decimals. See console for details.</p>';
  });
}

// Function to Generate Extra Tools Dropdown
function generateExtraToolsDropdown() {
  const extraToolsContainer = document.createElement('div');
  extraToolsContainer.className = 'extra-tools-container';

  const extraToolsHeader = document.createElement('div');
  extraToolsHeader.className = 'extra-tools-header';

  const extraToolsTitle = document.createElement('h3');
  extraToolsTitle.innerText = 'Extra Tools';

  const toggleIcon = document.createElement('span');
  toggleIcon.className = 'extra-tools-toggle-icon collapsed';
  toggleIcon.innerHTML = '&#9660;'; // Downward triangle

  extraToolsHeader.appendChild(extraToolsTitle);
  extraToolsHeader.appendChild(toggleIcon);
  extraToolsContainer.appendChild(extraToolsHeader);

  // Create the collapsible content div
  const collapsibleContent = document.createElement('div');
  collapsibleContent.className = 'extra-tools-collapsible-content';

  // Get all methods except 'transferEscrow'
  const allFacets = ['EscrowFacet', 'AavegotchiFacet']; // Add more facets if needed
  const excludedMethods = ['transferEscrow'];

  allFacets.forEach(facet => {
    const facetMethods = getFacetMethods(facet);
    for (const methodName in facetMethods) {
      if (excludedMethods.includes(methodName)) continue;

      const method = facetMethods[methodName];
      const formContainer = document.createElement('div');
      formContainer.className = 'form-container';

      // Create the header that will be clickable
      const formHeader = document.createElement('div');
      formHeader.className = 'form-header';

      const formTitle = document.createElement('h3');
      formTitle.innerText = methodName;

      // Create the toggle icon
      const methodToggleIcon = document.createElement('span');
      methodToggleIcon.className = 'toggle-icon collapsed';
      methodToggleIcon.innerHTML = '&#9660;'; // Downward triangle

      formHeader.appendChild(formTitle);
      formHeader.appendChild(methodToggleIcon);
      formContainer.appendChild(formHeader);

      // Create the collapsible content div
      const methodCollapsibleContent = document.createElement('div');
      methodCollapsibleContent.className = 'collapsible-content';

      const form = document.createElement('form');
      form.setAttribute('data-method', methodName);
      form.addEventListener('submit', handleFormSubmit);

      method.inputs.forEach(input => {
        // Skip '_recipient' field if present
        if (input.name === '_recipient') {
          return;
        }

        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const label = document.createElement('label');
        label.setAttribute('for', input.name);

        // Update labels based on method
        if (methodName === 'transferEscrow') {
          // Not applicable here as it's excluded
          label.innerText = `${input.name} (${input.type}):`;
        } else {
          label.innerText = `${input.name} (${input.type}):`;
        }

        formGroup.appendChild(label);

        let inputElement;
        if (methodName === 'transferEscrow' && input.name === '_erc20Contract') {
          // Not applicable here as 'transferEscrow' is excluded
        } else {
          if (input.type.endsWith('[]')) {
            inputElement = document.createElement('textarea');
            inputElement.className = 'textarea';
            inputElement.placeholder = 'Enter comma-separated values';
          } else {
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.className = 'input';
            if (input.type.startsWith('address')) {
              inputElement.placeholder = '0x...';
            }
          }

          inputElement.id = input.name;
          inputElement.name = input.name;
          formGroup.appendChild(inputElement);
        }

        form.appendChild(formGroup);
      });

      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.className = 'button';
      submitButton.innerText = 'Submit';
      form.appendChild(submitButton);

      methodCollapsibleContent.appendChild(form);
      formContainer.appendChild(methodCollapsibleContent);
      collapsibleContent.appendChild(formContainer);

      // Add click event listener to the method header to toggle collapse
      formHeader.addEventListener('click', () => {
        const isExpanded = methodCollapsibleContent.classList.contains('expanded');
        toggleCollapse(methodCollapsibleContent, methodToggleIcon, !isExpanded);
      });
    }
  });

  extraToolsContainer.appendChild(collapsibleContent);
  methodFormsContainer.appendChild(extraToolsContainer);

  // Add click event listener to the Extra Tools header to toggle collapse
  extraToolsHeader.addEventListener('click', () => {
    const isExpanded = collapsibleContent.classList.contains('expanded');
    toggleCollapse(collapsibleContent, toggleIcon, !isExpanded);
  });
}