import React, { useState } from 'react';
import { 
  PlusCircle, 
  HelpCircle, 
  EyeOff, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Copy,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { containerService } from '../services/api';

export default function RegisterExport() {
  const [formData, setFormData] = useState({
    id: '',
    owner: '',
    origin: '',
    destination: '',
    status: 'Registered',
    hargaBarang: '',
    itemName: '',
    weight: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [copied, setCopied] = useState(false);

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

    // Validasi input wajib
    if (!formData.id || !formData.owner || !formData.origin || !formData.destination || !formData.hargaBarang) {
      setError('Harap lengkapi semua parameter wajib (ID Kontainer, Eksportir, Asal, Tujuan, dan Harga Barang).');
      setLoading(false);
      return;
    }

    try {
      const res = await containerService.registerContainer(formData);
      setReceipt(res);
      // Reset form
      setFormData({
        id: '',
        owner: '',
        origin: '',
        destination: '',
        status: 'Registered',
        hargaBarang: '',
        itemName: '',
        weight: '',
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Gagal mendaftarkan kontainer ke Ledger.');
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
              <PlusCircle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Registrasi Kontainer Baru</h3>
              <p className="text-xs text-slate-400">Daftarkan muatan kontainer ke dalam Blockchain Hyperledger Fabric</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ID & Eksportir */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  ID Kontainer (AssetID) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="id"
                  placeholder="Contoh: CONT-2026-99"
                  value={formData.id}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Eksportir / Owner Awal <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="owner"
                  placeholder="Contoh: PT Kopi Ekspor Utama"
                  value={formData.owner}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Nama Barang & Berat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Nama Barang / Komoditas
                </label>
                <input
                  type="text"
                  name="itemName"
                  placeholder="Contoh: Biji Kopi Gayo Premium"
                  value={formData.itemName}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Berat Barang (kg/ton)
                </label>
                <input
                  type="text"
                  name="weight"
                  placeholder="Contoh: 18000 kg"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Rute Ekspor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Pelabuhan Asal (Origin) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="origin"
                  placeholder="Contoh: Pelabuhan Belawan, Medan, ID"
                  value={formData.origin}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Pelabuhan Tujuan (Destination) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="destination"
                  placeholder="Contoh: Port of Rotterdam, Belanda"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Data Privat: Harga Barang */}
            <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/15 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <EyeOff size={14} />
                    Harga Barang (Data Privat) <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[10px] bg-purple-500/10 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/20">
                    Transient Map Encrypted
                  </span>
                </div>
                <input
                  type="number"
                  name="hargaBarang"
                  placeholder="Masukkan angka. Contoh: 1250000000"
                  value={formData.hargaBarang}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 border border-purple-500/20 rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-purple-400 leading-relaxed">
                Nilai ini dikirim sebagai Transient Data di backend. Blockchain Hyperledger Fabric tidak akan menyimpan nilai ini dalam basis data status publik (World State) melainkan langsung dienkripsi dalam Private Data Collection milik organisasi terotorisasi.
              </p>
            </div>

            {/* Tombol Kirim */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                loading 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/15 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span>Mengirim Transaksi ke Peer...</span>
                </>
              ) : (
                <>
                  <PlusCircle size={18} />
                  <span>Kirim & Daftarkan Kontainer</span>
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
              <h4 className="font-bold text-white">Transaksi Berhasil Disubmit!</h4>
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
                  <span className="text-slate-400">Status Konsensus:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    Committed (Org1MSP)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edukasi Blockchain */}
        <div className="glassmorphism p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <ShieldAlert size={18} className="shrink-0" />
            <h4 className="font-bold text-white text-sm">Alur Konsensus Fabric</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Setiap pendaftaran aset logistik akan melalui 3 langkah konsensus Hyperledger Fabric:
          </p>
          <ol className="text-xs text-slate-300 space-y-3 font-medium list-decimal list-inside pl-1">
            <li className="leading-relaxed">
              <span className="text-indigo-400 font-semibold">Endorsement (Dukungan)</span>: Transaksi divalidasi oleh peer organisasi.
            </li>
            <li className="leading-relaxed">
              <span className="text-indigo-400 font-semibold">Ordering (Pengurutan)</span>: Transaksi dimasukkan ke blok oleh Orderer.
            </li>
            <li className="leading-relaxed">
              <span className="text-indigo-400 font-semibold">Validation & Commit</span>: Blok disinkronkan ke ledger publik.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
