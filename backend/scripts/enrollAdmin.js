const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

// Mengatur konfigurasi default
const connectionProfilePath = process.env.CONNECTION_PROFILE_PATH || path.join(__dirname, '..', 'connection.json');
const walletPath = process.env.WALLET_PATH || path.join(__dirname, '..', 'wallet');
const mspId = process.env.MSPID || 'Org1MSP';
const caNameKey = process.env.CA_NAME_KEY || 'ca.org1.example.com';

async function main() {
  try {
    // 1. Periksa ketersediaan Connection Profile
    if (!fs.existsSync(connectionProfilePath)) {
      console.error(`Error: Connection profile tidak ditemukan di: ${connectionProfilePath}`);
      console.log('Harap letakkan connection.json yang valid dari Anggota 1 di root backend.');
      process.exit(1);
    }

    const ccp = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

    // 2. Ambil informasi CA dari connection profile
    const caInfo = ccp.certificateAuthorities[caNameKey];
    if (!caInfo) {
      console.error(`Error: CA dengan key '${caNameKey}' tidak ditemukan di connection profile.`);
      console.log(`Pilihan CA yang ada di connection.json:`, Object.keys(ccp.certificateAuthorities || {}));
      process.exit(1);
    }

    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

    // 3. Inisialisasi Wallet
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Menggunakan wallet di path: ${walletPath}`);

    // 4. Periksa apakah admin sudah terdaftar
    const adminIdentity = await wallet.get('admin');
    if (adminIdentity) {
      console.log('Identitas "admin" sudah ada di wallet.');
      return;
    }

    // 5. Enroll admin menggunakan kredensial CA (default: admin / adminpw)
    console.log('Menghubungi CA untuk melakukan enrollment admin...');
    const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
    
    // 6. Buat objek identitas X.509
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: mspId,
      type: 'X.509',
    };

    // 7. Simpan identitas admin ke wallet
    await wallet.put('admin', x509Identity);
    console.log('Berhasil melakukan enrollment "admin" dan menyimpannya di wallet.');

  } catch (error) {
    console.error(`Gagal melakukan enrollment admin: ${error.message}`);
    process.exit(1);
  }
}

main();
