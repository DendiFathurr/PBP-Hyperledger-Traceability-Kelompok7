const { connectToNetwork } = require('../config/fabric');

/**
 * Controller untuk mengelola transaksi Kontainer pada Blockchain
 */
class ContainerController {
  
  /**
   * POST /api/register-container
   * Mendaftarkan kontainer baru.
   * Data sensitif 'hargaBarang' dilewatkan melalui Transient Map agar tidak masuk ke public state.
   */
  async registerContainer(req, res) {
    const { id, owner, origin, destination, status, hargaBarang } = req.body;

    // Validasi input
    if (!id || !owner || !origin || !destination || !status) {
      return res.status(400).json({
        success: false,
        message: 'Parameter id, owner, origin, destination, dan status wajib diisi.'
      });
    }

    let gateway;
    try {
      // 1. Hubungkan ke Jaringan Fabric
      const networkConnection = await connectToNetwork();
      gateway = networkConnection.gateway;
      const contract = networkConnection.contract;

      // 2. Buat objek transaksi
      // Catatan: Pastikan nama fungsi 'CreateAsset' sama dengan yang didefinisikan oleh Anggota 2 di Chaincode
      const transaction = contract.createTransaction('CreateAsset');

      // 3. Tangani Private Data jika ada 'hargaBarang'
      if (hargaBarang !== undefined && hargaBarang !== null) {
        console.log(`Mengirim data sensitif (hargaBarang: ${hargaBarang}) menggunakan Transient Map...`);
        
        // Transient Map memerlukan data dalam format key: Buffer
        const transientData = {
          hargaBarang: Buffer.from(hargaBarang.toString())
        };
        transaction.setTransient(transientData);
      }

      // 4. Kirim transaksi ke Peer
      // Argumen non-sensitif dikirim sebagai parameter transaksi normal
      console.log(`Mendaftarkan container ${id} ke blockchain...`);
      const response = await transaction.submit(id, owner, origin, destination, status);

      res.status(201).json({
        success: true,
        message: `Kontainer dengan ID ${id} berhasil didaftarkan.`,
        txId: transaction.getTransactionId(),
        payload: response.toString() ? JSON.parse(response.toString()) : null
      });

    } catch (error) {
      console.error(`Error pada registerContainer: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Gagal mendaftarkan kontainer.',
        error: error.message
      });
    } finally {
      // Pastikan Gateway diputus setelah transaksi selesai
      if (gateway) {
        await gateway.disconnect();
        console.log('Koneksi Gateway diputuskan.');
      }
    }
  }

  /**
   * PUT /api/update-status
   * Mengubah kepemilikan, lokasi, atau status kontainer.
   */
  async updateStatus(req, res) {
    const { id, newOwner, newLocation, status } = req.body;

    // Validasi input
    if (!id || !newOwner || !newLocation || !status) {
      return res.status(400).json({
        success: false,
        message: 'Parameter id, newOwner, newLocation, dan status wajib diisi.'
      });
    }

    let gateway;
    try {
      // 1. Hubungkan ke Jaringan Fabric
      const networkConnection = await connectToNetwork();
      gateway = networkConnection.gateway;
      const contract = networkConnection.contract;

      // 2. Buat objek transaksi
      // Catatan: Pastikan nama fungsi 'TransferAsset' sama dengan yang didefinisikan oleh Anggota 2 di Chaincode
      const transaction = contract.createTransaction('TransferAsset');

      // 3. Kirim transaksi ke Peer
      console.log(`Mengubah status/kepemilikan container ${id}...`);
      const response = await transaction.submit(id, newOwner, newLocation, status);

      res.status(200).json({
        success: true,
        message: `Status/kepemilikan Kontainer ${id} berhasil diperbarui.`,
        txId: transaction.getTransactionId(),
        payload: response.toString() ? JSON.parse(response.toString()) : null
      });

    } catch (error) {
      console.error(`Error pada updateStatus: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Gagal mengubah status/kepemilikan kontainer.',
        error: error.message
      });
    } finally {
      if (gateway) {
        await gateway.disconnect();
        console.log('Koneksi Gateway diputuskan.');
      }
    }
  }

  /**
   * GET /api/history/:id
   * Menarik riwayat audit (history) kontainer berdasarkan ID.
   */
  async getHistory(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID kontainer wajib disertakan pada path parameter.'
      });
    }

    let gateway;
    try {
      // 1. Hubungkan ke Jaringan Fabric
      const networkConnection = await connectToNetwork();
      gateway = networkConnection.gateway;
      const contract = networkConnection.contract;

      // 2. Evaluasi transaksi (karena ini query read-only, gunakan evaluateTransaction, bukan submit)
      // Catatan: Pastikan nama fungsi 'GetAssetHistory' sama dengan yang didefinisikan oleh Anggota 2 di Chaincode
      console.log(`Mengambil riwayat transaksi untuk container ${id}...`);
      const response = await contract.evaluateTransaction('GetAssetHistory', id);

      const historyData = JSON.parse(response.toString());

      res.status(200).json({
        success: true,
        data: historyData
      });

    } catch (error) {
      console.error(`Error pada getHistory: ${error.message}`);
      res.status(500).json({
        success: false,
        message: `Gagal mengambil riwayat audit untuk kontainer ${id}.`,
        error: error.message
      });
    } finally {
      if (gateway) {
        await gateway.disconnect();
        console.log('Koneksi Gateway diputuskan.');
      }
    }
  }
}

module.exports = new ContainerController();
