// app.js

// Contract Information
const contractAddress = '0x86935F11C86623deC8a25696E1C19a8659CbF95d';

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
       
