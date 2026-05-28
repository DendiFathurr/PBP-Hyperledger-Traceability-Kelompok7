'use strict';

const { Contract } = require('fabric-contract-api');

class EksporBarangContract extends Contract {

    // =========================================================================
    // Fungsi 1: CreateAsset (Registrasi Barang Ekspor oleh Eksportir)
    // =========================================================================
    async CreateAsset(ctx, id, namaBarang, eksportir, negaraTujuan, kuantitas) {
        // Validasi input kosong
       // Validasi input kosong
    if (!id || !namaBarang || !eksportir || !negaraTujuan || !kuantitas) {
    throw new Error('Semua parameter (id, namaBarang, eksportir, negaraTujuan, kuantitas) wajib diisi.');
    }

        // Cek apakah aset dengan ID ini sudah pernah didaftarkan
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`Aset dengan ID ${id} sudah terdaftar di ledger.`);
        }

        // Susun objek data barang ekspor 
        const barangEkspor = {
            id: id,
            namaBarang: namaBarang,
            eksportir: eksportir,
            pemilikKini: eksportir,      // Awalnya dimiliki oleh pihak Eksportir
            negaraTujuan: negaraTujuan,
            kuantitas: kuantitas,
            lokasi: 'Gudang Asal Eksportir',
            status: 'Siap Diekspor'      // Status awal barang 
        };

        // Simpan ke State Database (CouchDB) [cite: 17, 29]
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(barangEkspor)));
        console.info(`Barang ekspor dengan ID ${id} berhasil didaftarkan.`);
    }

    // =========================================================================
    // Fungsi 2: TransferAsset (Mutasi Perjalanan / Perubahan Status Logistik)
    // =========================================================================
    async TransferAsset(ctx, id, pemilikBaru, lokasiBaru, statusBaru) {
        // Validasi input kosong
        // Validasi input kosong
    if (!id || !pemilikBaru || !lokasiBaru || !statusBaru) {
    throw new Error('Semua parameter (id, pemilikBaru, lokasiBaru, statusBaru) wajib diisi.');
    }

        // Ambil data aset saat ini dari blockchain
        const barangBytes = await ctx.stub.getState(id);
        if (!barangBytes || barangBytes.length === 0) {
            throw new Error(`Barang dengan ID ${id} tidak ditemukan.`);
        }

        // Parsing dari Buffer ke objek JavaScript
        const barangEkspor = JSON.parse(barangBytes.toString());

        // Update data mutasi logistik barang ekspor 
        barangEkspor.pemilikKini = pemilikBaru;
        barangEkspor.lokasi = lokasiBaru;
        barangEkspor.status = statusBaru;

        // Tulis kembali data terbaru ke ledger [cite: 18, 30]
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(barangEkspor)));
        console.info(`Barang ${id} berhasil di-update mutasinya.`);
    }

    // =========================================================================
    // Fungsi 3: GetAssetHistory (Menarik Riwayat Audit Trail / Traceability)
    // =========================================================================
    async GetAssetHistory(ctx, id) {
        // Menggunakan fungsi bawaan Fabric untuk melacak histori sebuah key 
        const iterator = await ctx.stub.getHistoryForKey(id);
        const allResults = [];

        let res = await iterator.next();
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                const jsonRes = {};
                
                // Ambil ID Transaksi unik pembuat perubahan ini [cite: 41]
                jsonRes.TxId = res.value.txId;
                
                // Ambil waktu kapan transaksi dimasukkan ke dalam block [cite: 15]
                jsonRes.Timestamp = res.value.timestamp;
                
                // Ambil data isi aset pada versi transaksi tersebut [cite: 42]
                try {
                    jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Value = res.value.value.toString('utf8');
                }
                
                allResults.push(jsonRes);
            }
            res = await iterator.next();
        }
        await iterator.close();
        
        return JSON.stringify(allResults);
    }

    // =========================================================================
    // Fungsi 4: Rich Query CouchDB (Mencari Barang Berdasarkan Status)
    // =========================================================================
    async QueryAssetsByStatus(ctx, status) {
        // Membuat query JSON parametrik khas CouchDB [cite: 29]
        const queryString = {
            selector: {
                status: status
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allResults = [];

        let res = await iterator.next();
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                try {
                    const jsonRecord = JSON.parse(res.value.value.toString('utf8'));
                    allResults.push(jsonRecord);
                } catch (err) {
                    console.log(err);
                }
            }
            res = await iterator.next();
        }
        await iterator.close();

        return JSON.stringify(allResults);
    }

    // Fungsi Pembantu: Cek apakah aset ada di ledger
    async AssetExists(ctx, id) {
        const assetBytes = await ctx.stub.getState(id);
        return assetBytes && assetBytes.length > 0;
    }
}

module.exports = EksporBarangContract;