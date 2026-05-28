# REST API Traceability Ekspor-Impor (Hyperledger Fabric)

Repositori ini berisi REST API Server berbasis Node.js dan Express untuk mencatat logistik dan melacak rantai pasok (traceability) ekspor-impor menggunakan Hyperledger Fabric SDK (`fabric-network` v2.2.x).

API ini bertindak sebagai jembatan antara **Client Application (Anggota 4)** dengan **Jaringan Blockchain Fabric (Anggota 1)** dan **Chaincode (Anggota 2)**.

---

## 📁 Struktur Direktori Modular

```
BACKEND/
├── config/
│   └── fabric.js               # Helper koneksi gateway, wallet, dan contract SDK
├── controllers/
│   └── containerController.js   # Logika bisnis transaksi (Create, Transfer, Audit)
├── routes/
│   └── containerRoutes.js       # Mapping endpoint REST API
├── scripts/
│   ├── enrollAdmin.js          # Script CA untuk mendaftarkan identitas Admin
│   └── registerUser.js         # Script CA untuk mendaftarkan identitas appUser
├── .env                        # Konfigurasi environment variables
├── connection.json             # Connection Profile JSON (didapat dari Anggota 1)
├── package.json                # Daftar dependensi Node.js
└── server.js                   # Entry point aplikasi Express
```

---

## 🛠️ Langkah Integrasi & Persiapan

### 1. Dapatkan Connection Profile
Mintalah file `connection.json` kepada **Anggota 1** (Network Administrator) dan letakkan di root folder project (`/BACKEND/connection.json`). File ini mendefinisikan URL Peer, CA, MSP, dan sertifikat TLS.

### 2. Jalankan Instalasi Dependensi
```bash
npm install
```

### 3. Setup Wallet Identitas
Pastikan jaringan Fabric (CA & Peer) dari Anggota 1 sudah menyala. Kemudian jalankan script pendaftaran secara berurutan untuk memasukkan identitas ke folder `wallet/`:

1. **Daftarkan Admin:**
   ```bash
   npm run enrollAdmin
   ```
   *Skrip ini akan mengambil kredensial admin dari CA dan menyimpannya di `/wallet/admin.id`.*

2. **Daftarkan User Aplikasi:**
   ```bash
   npm run registerUser
   ```
   *Skrip ini menggunakan identitas admin untuk mendaftarkan user baru (default: `appUser`) dan menyimpannya di `/wallet/appUser.id`.*

### 4. Jalankan REST API Server
```bash
npm start
```
Secara default, server akan berjalan di port `5000` (http://localhost:5000).

---

## 📡 Panduan REST API (Untuk Anggota 4 - Client Developer)

### 1. Pendaftaran Kontainer Baru (Register Container)
Mendaftarkan aset kontainer baru ke ledger. Nilai **Harga Barang** dikirim melalui **Transient Map** agar bersifat privat dan tidak tercatat pada ledger publik (Private Data Collection).

- **Method:** `POST`
- **Endpoint:** `/api/register-container`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "id": "CONT-IDX-9011",
    "owner": "PT. Eksportir Nusantara",
    "origin": "Tanjung Priok, Jakarta",
    "destination": "Port of Rotterdam, Netherlands",
    "status": "MANIFESTED",
    "hargaBarang": 750000000
  }
  ```
- **Response Sukses (201):**
  ```json
  {
    "success": true,
    "message": "Kontainer dengan ID CONT-IDX-9011 berhasil didaftarkan.",
    "txId": "e70d4d82f76c5b9687...",
    "payload": null
  }
  ```

---

### 2. Pembaruan Status / Kepemilikan (Update Status)
Mengubah pemilik, lokasi, atau status kontainer (misalnya dari eksportir ke kurir/importir).

- **Method:** `PUT`
- **Endpoint:** `/api/update-status`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "id": "CONT-IDX-9011",
    "newOwner": "Logistics Worldwide Inc",
    "newLocation": "Port of Singapore",
    "status": "IN_TRANSIT"
  }
  ```
- **Response Sukses (200):**
  ```json
  {
    "success": true,
    "message": "Status/kepemilikan Kontainer CONT-IDX-9011 berhasil diperbarui.",
    "txId": "4c8fba819cd...",
    "payload": null
  }
  ```

---

### 3. Riwayat Perjalanan Kontainer (Get Container History)
Mengambil riwayat pergerakan dan audit kontainer dari awal didaftarkan hingga status terakhir.

- **Method:** `GET`
- **Endpoint:** `/api/history/:id`
- **Request Parameters:** `id` (ID Kontainer)
- **Response Sukses (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "txId": "e70d4d82f76c5b9687...",
        "value": {
          "id": "CONT-IDX-9011",
          "owner": "PT. Eksportir Nusantara",
          "origin": "Tanjung Priok, Jakarta",
          "destination": "Port of Rotterdam, Netherlands",
          "status": "MANIFESTED"
        },
        "timestamp": "2026-05-28T16:15:30Z",
        "isDelete": false
      },
      {
        "txId": "4c8fba819cd...",
        "value": {
          "id": "CONT-IDX-9011",
          "owner": "Logistics Worldwide Inc",
          "origin": "Port of Singapore",
          "destination": "Port of Rotterdam, Netherlands",
          "status": "IN_TRANSIT"
        },
        "timestamp": "2026-05-28T16:30:45Z",
        "isDelete": false
      }
    ]
  }
  ```

---

## 🔒 Catatan Keamanan & Sinkronisasi Chaincode (Untuk Anggota 2)

1. **Transient Map di Chaincode:**
   Di dalam smart contract (chaincode) yang dibuat oleh **Anggota 2**, pastikan fungsi `CreateAsset` membaca `hargaBarang` menggunakan API stub berikut:
   ```go
   transientMap, err := ctx.GetStub().GetTransient()
   if err != nil {
       return fmt.Errorf("gagal membaca transient map: %v", err)
   }
   hargaBarangBytes, exists := transientMap["hargaBarang"]
   if !exists {
       return fmt.Errorf("hargaBarang tidak ditemukan di transient map")
   }
   // Tulis hargaBarangBytes ke Private Data Collection (misal: collectionDetails)
   err = ctx.GetStub().PutPrivateData("collectionDetails", id, hargaBarangBytes)
   ```
2. **CouchDB Rich Query:**
   CouchDB mendukung query data kompleks (rich query). Bila ingin mencari data berdasarkan field tertentu, gunakan syntax selector CouchDB, contoh:
   ```json
   {
     "selector": {
       "owner": "PT. Eksportir Nusantara"
     }
   }
   ```
