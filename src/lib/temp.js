const Web3 = require('web3');
const abi = require('./contractABIs/abi');
// Infura endpoint (replace with your project ID and network)
const infuraUrl = `https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`;
const web3 = new Web3(new Web3.providers.HttpProvider(infuraUrl));

// Contract details
const contractAddress = '0xb502c5856F7244DccDd0264A541Cc25675353D39'; // Your contract address

// Create contract instance
const contract = new web3.eth.Contract(abi, contractAddress);

// Example: Reading a public function/variable
async function readContractData() {
    try {
        // Call a specific contract function
        const result = await contract.methods.bountyCounter().call();
        console.log(result);
    } catch (error) {
        console.error('Error reading contract data:', error);
    }
}

// Run the function
readContractData();