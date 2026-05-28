const fs = require('fs');
const path = require('path');
const { Gateway, Wallets } = require('fabric-network');

// Load environment variables (defaults if not set)
const walletPath = process.env.WALLET_PATH || path.join(__dirname, '..', 'wallet');
const connectionProfilePath = process.env.CONNECTION_PROFILE_PATH || path.join(__dirname, '..', 'connection.json');
const channelName = process.env.CHANNEL_NAME || 'mychannel';
const chaincodeName = process.env.CHAINCODE_NAME || 'traceability';
const userName = process.env.IDENTITY_NAME || 'appUser';

/**
 * Connect to the Hyperledger Fabric Network.
 * @returns {Promise<{gateway: Gateway, contract: any, network: any}>} The connection object
 */
async function connectToNetwork() {
  try {
    // 1. Check if connection profile exists
    if (!fs.existsSync(connectionProfilePath)) {
      throw new Error(`Connection profile tidak ditemukan di path: ${connectionProfilePath}`);
    }

    // 2. Load connection profile JSON
    const ccp = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

    // 3. Load wallet containing user credentials
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet dimuat dari: ${walletPath}`);

    // 4. Verify identity exists in wallet
    const identityExists = await wallet.get(userName);
    if (!identityExists) {
      throw new Error(`Identitas '${userName}' tidak ditemukan di wallet. Silakan jalankan script pendaftaran user terlebih dahulu.`);
    }

    // 5. Create a new gateway instance for connecting to peer node
    const gateway = new Gateway();

    // 6. Connect to gateway using connection profile and wallet identity
    await gateway.connect(ccp, {
      wallet,
      identity: userName,
      discovery: { enabled: true, asLocalhost: true } // Sesuaikan asLocalhost dengan setup environment
    });

    // 7. Get network channel
    const network = await gateway.getNetwork(channelName);
    console.log(`Terhubung ke channel: ${channelName}`);

    // 8. Get contract
    const contract = network.getContract(chaincodeName);
    console.log(`Terhubung ke chaincode: ${chaincodeName}`);

    return { gateway, contract, network };
  } catch (error) {
    console.error(`Gagal menghubungkan ke jaringan Fabric: ${error.message}`);
    throw error;
  }
}

module.exports = {
  connectToNetwork,
  walletPath,
  connectionProfilePath,
  channelName,
  chaincodeName,
  userName
};
