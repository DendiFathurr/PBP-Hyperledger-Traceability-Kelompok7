import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  MapPin, 
  UserCheck, 
  Activity, 
  AlertCircle, 
  CheckCircle,
  Copy,
  ChevronDown
} from 'lucide-react';
import { containerService } from '../services/api';

export default function UpdateStatus() {
  const [containers, setContainers] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    newOwner: '',
    newLocation: '',
    status: 'In Transit'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [copied, setCopied] = useState(false);

  // Status Pilihan Standar Logistik
  const statusOptions = [
    'Registered',
    'In Transit',
    'Customs Clearance',
    'Delivered'
  ];

  // Muat daftar kontainer terdaftar untuk dropdown pemilih
  const loadContainers = async () => {
    try {
      const res = await containerService.getAllContainers();
      setContainers(res.data);
    } catch (err) {
      console.error('Gagal mengambil daftar kontainer', err);
    }
  };

  useEffect(() => {
    loadContainers();
  }, []);

  // Isi otomatis data saat kontainer dipilih dari dropdown
  const handleContainerSelect = (e) => {
    const selectedId = e.target.value;
    const container = containers.find(c => c.id === selectedId);
    
    if (container) {
      setFormData({
        id: selectedId,
        newOwner: container.owner, // Pre-fill dengan owner saat ini
        newLocation: container.destination, // Pre-fill dengan tujuan/lokasi
        status: container.status
      });
    } else {
      setFormData({
        id: selectedId,
        newOwner: '',
        newLocation: '',
        status: 'In Transit'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReceipt(null);

    // Validasi data
    if (!formData.id || !formData.newOwner || !formData.newLocation || !formData.status) {
      setError('Harap lengkapi semua bidang untuk memperbarui status kontainer.');
      setLoading(false);
      return;
    }

    try {
      const res = await containerService.updateStatus(formData);
      setReceipt(res);
      // Reload daftar kontainer untuk mendapatkan status terbaru
      loadContainers();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Gagal mengirim pembaruan status ke Blockchain.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Kolom Form (Kiri) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glassmorphism p-8 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <RefreshCw size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Perbarui Status Kontainer</h3>
              <p className="text-xs text-slate-400">Ubah kepemilikan, lokasi, atau status perjalanan aset di ledger</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pilih Kontainer */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Pilih Kontainer Terdaftar <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  name="id"
                  value={formData.id}
                  onChange={handleContainerSelect}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none font-mono font-semibold"
                >
                  <option value="">-- Pilih ID Kontainer --</option>
                  {containers.map(c => (
                    <option key={c.id} value={c.id} className="font-mono">
                      {c.id} - {c.itemName || 'Tanpa Nama'} ({c.status})
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Pemilik Baru & Lokasi Baru */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UserCheck size={14} className="text-indigo-400" />
                  Pengelola/Aktor Baru (New Owner) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="newOwner"
                  placeholder="Contoh: Bea Cukai / PT Logistik B"
                  value={formData.newOwner}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin size={14} className="text-indigo-400" />
                  Lokasi Baru (New Location) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="newLocation"
                  placeholder="Contoh: Pelabuhan Tokyo, Jepang"
                  value={formData.newLocation}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Status Baru */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Activity size={14} className="text-indigo-400" />
                Status Perjalanan Baru <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {statusOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: option }))}
                    className={`py-3 px-2 text-xs font-bold rounded-xl border transition-all duration-200 ${
                      formData.status === option
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 font-bold shadow-md shadow-indigo-500/5'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Tombol Update */}
            <button
              type="submit"
              disabled={loading || !formData.id}
              className={`w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                loading 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                  : !formData.id 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-850'
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/15 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span>Memperbarui Ledger Blockchain...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  <span>Perbarui Status Kontainer</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Kolom Informasi & Bukti Transaksi (Kanan) */}
      <div className="space-y-6">
        {/* Tanda Terima Transaksi (Receipt) */}
        {receipt && (
          <div className="glassmorphism p-6 rounded-2xl border-emerald-500/30 border bg-gradient-to-b from-slate-900/40 to-emerald-950/10 space-y-5 animate-slideUp">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <CheckCircle size={22} className="shrink-0" />
              <h4 className="font-bold text-white">Status Sukses Diperbarui!</h4>
            </div>

            {receipt.isMock && (
              <span className="inline-block text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded">
                Simulasi Lokal Sukses
              </span>
            )}

            <div className="space-y-4 text-xs font-medium text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <p className="text-slate-400">ID Transaksi (TxID):</p>
                <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-indigo-300 break-all select-all">
                  <span>{receipt.data.txId}</span>
                  <button 
                    onClick={() => handleCopy(receipt.data.txId)}
                    className="p-1.5 hover:bg-slate-800 rounded transition-colors text-slate-400 shrink-0"
                    title="Salin TxID"
                  >
                    <Copy size={12} className={copied ? "text-emerald-400" : ""} />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                  <span className="text-slate-400">Pesan:</span>
                  <span className="text-slate-200 font-semibold">{receipt.data.message}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                  <span className="text-slate-400">Fungsi Smart Contract:</span>
                  <span className="text-indigo-400 font-mono font-bold">
                    TransferAsset()
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informasi Aktor Logistik */}
        <div className="glassmorphism p-6 rounded-2xl border border-slate-800/80 space-y-4 text-xs">
          <h4 className="font-bold text-white text-sm">Hak Akses & Otorisasi</h4>
          <p className="text-slate-400 leading-relaxed">
            Dalam skenario rantai pasok logistik Hyperledger Fabric, perubahan status diatur oleh kepemilikan dan lokasi:
          </p>
          <div className="space-y-3 font-medium text-slate-300">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <div>
                <span className="text-indigo-400 font-semibold">Bea Cukai (Customs)</span>: Bertanggung jawab melakukan pemeriksaan (Customs Clearance) saat masuk pelabuhan negara tujuan.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <div>
                <span className="text-indigo-400 font-semibold">Aktor Logistik / Shipping</span>: Mengambil alih kepemilikan kontainer saat barang berada dalam status pengapalan (In Transit).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
