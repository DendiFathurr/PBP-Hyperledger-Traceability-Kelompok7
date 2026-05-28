const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

// Mengatur konfigurasi default
const connectionProfilePath = process.env.CONNECTION_PROFILE_PATH || path.join(__dirname, '..', 'connection.json');
const walletPath = process.env.WALLET_PATH || path.join(__dirname, '..', 'wallet');
const mspId = process.env.MSPID || 'Org1MSP';
const caNameKey = process.env.CA_NAME_KEY || 'ca.org1.example.com';
const userName = process.env.IDENTITY_NAME || 'appUser';

async function main() {
  try {
    // 1. Periksa ketersediaan Connection Profile
    if (!fs.existsSync(connectionProfilePath)) {
      console.error(`Error: Connection profile tidak ditemukan di: ${connectionProfilePath}`);
      process.exit(1);
    }

    const ccp = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

    // 2. Ambil informasi CA dari connection profile
    const caInfo = ccp.certificateAuthorities[caNameKey];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

    // 3. Inisialisasi Wallet
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Menggunakan wallet di path: ${walletPath}`);

    // 4. Periksa apakah user biasa (appUser) sudah terdaftar
    const userIdentity = await wallet.get(userName);
    if (userIdentity) {
      console.log(`Identitas "${userName}" sudah ada di wallet.`);
      return;
    }

    // 5. Periksa apakah admin terdaftar di wallet (diperlukan untuk mendaftarkan user baru)
    const adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
      console.log('Kredensial "admin" tidak ditemukan di wallet.');
      console.log('Silakan jalankan "npm run enrollAdmin" terlebih dahulu.');
      return;
    }

    // 6. Buat user provider dan dapatkan representasi objek admin
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    // 7. Register user baru (appUser)
    console.log(`Mendaftarkan user baru "${userName}" menggunakan admin CA...`);
    const secret = await ca.register({
      affiliation: 'org1.department1',
      enrollmentID: userName,
      role: 'client'
    }, adminUser);

    // 8. Enroll user baru menggunakan secret yang didapatkan
    console.log(`Melakukan enrollment user "${userName}"...`);
    const enrollment = await ca.enroll({
      enrollmentID: userName,
      enrollmentSecret: secret
    });

    // 9. Simpan identitas user baru ke wallet
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: mspId,
      type: 'X.509',
    };
    await wallet.put(userName, x509Identity);
    console.log(`Berhasil mendaftarkan dan menyimpan user "${userName}" ke wallet.`);

  } catch (error) {
    console.error(`Gagal mendaftarkan user "${userName}": ${error.message}`);
    process.exit(1);
  }
}

main();
