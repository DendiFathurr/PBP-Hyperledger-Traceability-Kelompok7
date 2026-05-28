import axios from 'axios';

// Gunakan port 3000 sesuai permintaan, atau fallback ke 5000 (sesuai backend .env)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout 10 detik
});

// Database Lokal (Simulasi) untuk fallback jika API backend offline
const LOCAL_STORAGE_KEY = 'fabric_containers_db';
const SEARCH_HISTORY_KEY = 'fabric_search_history';

// Inisialisasi data simulasi jika belum ada
const initMockDB = () => {
  const db = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!db) {
    const initialData = {
      'CONT-2026-001': {
        id: 'CONT-2026-001',
        owner: 'PT Kopi Ekspor Indonesia',
        origin: 'Pelabuhan Belawan, Medan, Indonesia',
        destination: 'Port of Tokyo, Jepang',
        status: 'Delivered',
        itemName: 'Biji Kopi Gayo Arabika Premium',
        weight: '18000 kg',
        hargaBarang: 'Rp 1.250.000.000',
        registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        history: [
          {
            txId: 'tx-8a7e9d0b1c2f3e4a5b6c7d8e9f0a1b2c3d4e5f6g7h8i9j',
            value: {
              id: 'CONT-2026-001',
              owner: 'PT Kopi Ekspor Indonesia',
              origin: 'Pelabuhan Belawan, Medan, Indonesia',
              destination: 'Port of Tokyo, Jepang',
              status: 'Registered',
              itemName: 'Biji Kopi Gayo Arabika Premium',
              weight: '18000 kg',
              hargaBarang: 'Rp 1.250.000.000 (Terenskripsi)',
            },
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            isDelete: false,
          },
          {
            txId: 'tx-2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w',
            value: {
              id: 'CONT-2026-001',
              owner: 'PT Logistik Samudera Indonesia',
              origin: 'Pelabuhan Belawan, Medan, Indonesia',
              destination: 'Port of Tokyo, Jepang',
              status: 'In Transit',
              itemName: 'Biji Kopi Gayo Arabika Premium',
              weight: '18000 kg',
              hargaBarang: 'Rp 1.250.000.000 (Terenskripsi)',
            },
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            isDelete: false,
          },
          {
            txId: 'tx-9u8i7o6p5q4r3s2t1u0v9w8x7y6z5a4b3c2d1e0f9g8h',
            value: {
              id: 'CONT-2026-001',
              owner: 'Bea Cukai Jepang (Customs)',
              origin: 'Pelabuhan Belawan, Medan, Indonesia',
              destination: 'Port of Tokyo, Jepang',
              status: 'Customs Clearance',
              itemName: 'Biji Kopi Gayo Arabika Premium',
              weight: '18000 kg',
              hargaBarang: 'Rp 1.250.000.000 (Terenskripsi)',
            },
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            isDelete: false,
          },
          {
            txId: 'tx-3a5f7d9e1b2c4e6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c',
            value: {
              id: 'CONT-2026-001',
              owner: 'Tokyo Coffee Importers Ltd',
              origin: 'Pelabuhan Belawan, Medan, Indonesia',
              destination: 'Port of Tokyo, Jepang',
              status: 'Delivered',
              itemName: 'Biji Kopi Gayo Arabika Premium',
              weight: '18000 kg',
              hargaBarang: 'Rp 1.250.000.000 (Terenskripsi)',
            },
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            isDelete: false,
          }
        ]
      },
      'CONT-2026-002': {
        id: 'CONT-2026-002',
        owner: 'PT Tekstil Nusantara',
        origin: 'Tanjung Priok, Jakarta, Indonesia',
        destination: 'Port of Los Angeles, AS',
        status: 'In Transit',
        itemName: 'Kain Katun Organik Indonesia',
        weight: '25000 kg',
        hargaBarang: 'Rp 2.800.000.000',
        registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        history: [
          {
            txId: 'tx-1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v',
            value: {
              id: 'CONT-2026-002',
              owner: 'PT Tekstil Nusantara',
              origin: 'Tanjung Priok, Jakarta, Indonesia',
              destination: 'Port of Los Angeles, AS',
              status: 'Registered',
              itemName: 'Kain Katun Organik Indonesia',
              weight: '25000 kg',
              hargaBarang: 'Rp 2.800.000.000 (Terenskripsi)',
            },
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            isDelete: false,
          },
          {
            txId: 'tx-7x8y9z0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s',
            value: {
              id: 'CONT-2026-002',
              owner: 'Global Shipping Line Corp',
              origin: 'Tanjung Priok, Jakarta, Indonesia',
              destination: 'Port of Los Angeles, AS',
              status: 'In Transit',
              itemName: 'Kain Katun Organik Indonesia',
              weight: '25000 kg',
              hargaBarang: 'Rp 2.800.000.000 (Terenskripsi)',
            },
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            isDelete: false,
          }
        ]
      }
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialData));
  }
};

initMockDB();

const getMockData = () => JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
const saveMockData = (data) => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

// Fungsi API pembungkus
export const containerService = {
  // Cek Status Koneksi Backend
  checkHealth: async () => {
    try {
      const response = await api.get('/api/health');
      return { success: true, isMock: false, data: response.data };
    } catch (error) {
      console.warn("REST API Offline. Menggunakan Simulasi.");
      return { 
        success: true, 
        isMock: true, 
        message: 'Berjalan dalam Mode Simulasi (Backend Offline)' 
      };
    }
  },

  // GET ALL (Menggabungkan mock + data real)
  // Untuk kepentingan tampilan dasbor
  getAllContainers: async () => {
    try {
      // Karena backend bawaan tidak memiliki endpoint GET /api/containers, kita kelola daftarnya di localStorage
      // Tapi kita sinkronkan jika ada data dari backend.
      const mockDb = getMockData();
      return { success: true, isMock: true, data: Object.values(mockDb) };
    } catch (error) {
      const mockDb = getMockData();
      return { success: true, isMock: true, data: Object.values(mockDb) };
    }
  },

  // POST /api/register-container
  registerContainer: async (containerData) => {
    const payload = {
      id: containerData.id,
      owner: containerData.owner || 'PT Eksportir Utama',
      origin: containerData.origin,
      destination: containerData.destination,
      status: containerData.status || 'Registered',
      hargaBarang: containerData.hargaBarang,
      // Field tambahan untuk form
      itemName: containerData.itemName,
      weight: containerData.weight,
    };

    try {
      const response = await api.post('/api/register-container', payload);
      
      // Jika berhasil di backend, tambahkan juga ke DB lokal agar muncul di Dashboard
      const mockDb = getMockData();
      const randomTxId = 'tx-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      mockDb[payload.id] = {
        ...payload,
        registeredAt: new Date().toISOString(),
        history: [
          {
            txId: response.data.txId || randomTxId,
            value: { ...payload, hargaBarang: `Rp ${Number(payload.hargaBarang).toLocaleString('id-ID')} (Terenskripsi)` },
            timestamp: new Date().toISOString(),
            isDelete: false,
          }
        ]
      };
      saveMockData(mockDb);

      return { success: true, isMock: false, data: response.data };
    } catch (error) {
      console.warn("Gagal menghubungi backend untuk registrasi. Melakukan simulasi transaksi lokal...", error);
      
      // Simulasi pendaftaran lokal
      const mockDb = getMockData();
      if (mockDb[payload.id]) {
        throw new Error(`Kontainer dengan ID ${payload.id} sudah terdaftar di sistem.`);
      }

      const txId = 'sim-tx-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const newContainer = {
        ...payload,
        registeredAt: new Date().toISOString(),
        history: [
          {
            txId: txId,
            value: { ...payload, hargaBarang: `Rp ${Number(payload.hargaBarang).toLocaleString('id-ID')} (Terenskripsi)` },
            timestamp: new Date().toISOString(),
            isDelete: false,
          }
        ]
      };

      mockDb[payload.id] = newContainer;
      saveMockData(mockDb);

      // Simulasi delay jaringan
      await new Promise(resolve => setTimeout(resolve, 800));

      return {
        success: true,
        isMock: true,
        data: {
          success: true,
          message: `(Simulasi) Kontainer dengan ID ${payload.id} berhasil didaftarkan ke Blockchain.`,
          txId: txId,
          payload: newContainer
        }
      };
    }
  },

  // PUT /api/update-status
  updateStatus: async (updateData) => {
    const payload = {
      id: updateData.id,
      newOwner: updateData.newOwner,
      newLocation: updateData.newLocation,
      status: updateData.status
    };

    try {
      const response = await api.put('/api/update-status', payload);

      // Sinkronkan ke DB lokal
      const mockDb = getMockData();
      if (mockDb[payload.id]) {
        const txId = response.data.txId || 'tx-' + Math.random().toString(36).substring(2, 15);
        const currentContainer = mockDb[payload.id];
        
        currentContainer.owner = payload.newOwner;
        currentContainer.status = payload.status;
        
        // Pisahkan data history agar tidak terjadi circular reference saat serialization
        const { history: _, ...containerDataWithoutHistory } = currentContainer;
        
        currentContainer.history.push({
          txId: txId,
          value: {
            ...containerDataWithoutHistory,
            owner: payload.newOwner,
            status: payload.status,
            origin: currentContainer.origin,
            destination: currentContainer.destination,
            hargaBarang: `${currentContainer.hargaBarang} (Terenskripsi)`
          },
          timestamp: new Date().toISOString(),
          isDelete: false
        });

        saveMockData(mockDb);
      }

      return { success: true, isMock: false, data: response.data };
    } catch (error) {
      console.warn("Gagal menghubungi backend untuk update status. Melakukan simulasi transaksi lokal...", error);
      
      const mockDb = getMockData();
      if (!mockDb[payload.id]) {
        throw new Error(`Kontainer dengan ID ${payload.id} tidak ditemukan.`);
      }

      const txId = 'sim-tx-' + Math.random().toString(36).substring(2, 15);
      const currentContainer = mockDb[payload.id];
      
      // Update nilai
      currentContainer.owner = payload.newOwner;
      currentContainer.status = payload.status;
      
      // Pisahkan data history agar tidak terjadi circular reference saat serialization
      const { history: _, ...containerDataWithoutHistory } = currentContainer;
      
      // Tambahkan history baru
      currentContainer.history.push({
        txId: txId,
        value: {
          ...containerDataWithoutHistory,
          owner: payload.newOwner,
          status: payload.status,
          origin: currentContainer.origin,
          destination: currentContainer.destination,
          hargaBarang: currentContainer.hargaBarang.includes('(Terenskripsi)') 
            ? currentContainer.hargaBarang 
            : `${currentContainer.hargaBarang} (Terenskripsi)`
        },
        timestamp: new Date().toISOString(),
        isDelete: false
      });

      saveMockData(mockDb);

      await new Promise(resolve => setTimeout(resolve, 800));

      return {
        success: true,
        isMock: true,
        data: {
          success: true,
          message: `(Simulasi) Status Kontainer ${payload.id} berhasil diperbarui di Blockchain.`,
          txId: txId,
          payload: currentContainer
        }
      };
    }
  },

  // GET /api/history/:id
  getHistory: async (id) => {
    try {
      const response = await api.get(`/api/history/${id}`);
      return { success: true, isMock: false, data: response.data.data };
    } catch (error) {
      console.warn(`Gagal menghubungi backend untuk history ${id}. Melakukan simulasi lokal...`, error);
      
      const mockDb = getMockData();
      const container = mockDb[id];
      
      if (!container) {
        throw new Error(`Kontainer dengan ID ${id} tidak ditemukan.`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Kembalikan riwayat
      return {
        success: true,
        isMock: true,
        data: container.history
      };
    }
  },

  // Manajemen Riwayat Pencarian Lokal (Utilitas UI)
  getSearchHistory: () => {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
  },

  addSearchHistory: (id) => {
    const history = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
    const filtered = history.filter(item => item !== id);
    filtered.unshift(id); // Tambah di awal
    const trimmed = filtered.slice(0, 5); // Simpan 5 pencarian terakhir
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmed));
  }
};
