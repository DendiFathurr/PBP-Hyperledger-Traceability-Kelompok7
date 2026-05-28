import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  User, 
  Calendar, 
  Copy, 
  History, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Anchor, 
  Info,
  Layers,
  ArrowDown
} from 'lucide-react';
import { containerService } from '../services/api';

export default function Traceability({ selectedContainerId, setSelectedContainerId }) {
  const [searchId, setSearchId] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistoryList, setSearchHistoryList] = useState([]);
  const [copiedTx, setCopiedTx] = useState(null);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    // Ambil riwayat pencarian lokal
    setSearchHistoryList(containerService.getSearchHistory());

    // Jika ada ID yang dipilih dari Dashboard, langsung lakukan pencarian
    if (selectedContainerId) {
      setSearchId(selectedContainerId);
      handleSearch(selectedContainerId);
      // Reset parameter setelah pencarian agar tidak berulang
      setSelectedContainerId(null);
    }
  }, [selectedContainerId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      handleSearch(searchId.trim());
    }
  };

  const handleSearch = async (id) => {
    setLoading(true);
    setError(null);
    setHistory([]);

    try {
      const res = await containerService.getHistory(id);
      
      // Simpan riwayat pencarian ke local
      containerService.addSearchHistory(id);
      setSearchHistoryList(containerService.getSearchHistory());

      // Urutkan riwayat dari yang paling lama ke yang terbaru (kronologis)
      const sortedHistory = [...res.data].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      setHistory(sortedHistory);
      setIsMock(res.isMock);
    } catch (err) {
      console.error(err);
      setError(err.message || `Kontainer dengan ID ${id} tidak ditemukan.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(text);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  const formatIndoDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' WIB';
  };

  return (
    <div className="space-y-8">
      {/* Bagian Pencarian */}
      <div className="glassmorphism p-8 rounded-2xl border border-slate-800/80">
        <div className="max-w-2xl mx-auto space-y-4 text-center">
          <h3 className="text-2xl font-bold text-white tracking-tight">Audit Trail & Traceability</h3>
          <p className="text-sm text-slate-400">
            Masukkan ID Kontainer untuk memverifikasi riwayat audit perjalanan, perpindahan kepemilikan, dan konsensus blockchain.
          </p>

          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Masukkan ID Kontainer (misal: CONT-2026-001)"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-32 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-colors"
              />
              <Search className="absolute left-4 text-slate-500" size={18} />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all duration-200"
              >
                {loading ? 'Mencari...' : 'Lacak Aset'}
              </button>
            </div>
          </form>

          {/* Riwayat Pencarian Terakhir */}
          {searchHistoryList.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <History size={12} />
                Pencarian Terakhir:
              </span>
              {searchHistoryList.map((histId, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchId(histId);
                    handleSearch(histId);
                  }}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg font-mono text-[10px] transition-colors"
                >
                  {histId}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tampilan Loading */}
      {loading && (
        <div className="glassmorphism p-16 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Mengevaluasi Kunci Riwayat Ledger dari Node Peer...</p>
        </div>
      )}

      {/* Tampilan Error */}
      {error && !loading && (
        <div className="glassmorphism p-12 rounded-2xl text-center border-red-500/20 max-w-xl mx-auto space-y-4">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-full w-fit mx-auto border border-red-500/20">
            <Info size={28} />
          </div>
          <div className="space-y-1">
            <h4 className="text-white font-bold">Aset Tidak Ditemukan</h4>
            <p className="text-xs text-slate-400">{error}</p>
          </div>
          <p className="text-[11px] text-slate-500">
            Pastikan format ID benar dan kontainer tersebut sudah terdaftar melalui formulir registrasi ekspor.
          </p>
        </div>
      )}

      {/* Tampilan Timeline Riwayat */}
      {history.length > 0 && !loading && (
        <div className="space-y-6">
          {/* Metadata Ringkasan */}
          <div className="glassmorphism p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Laporan Lacak Kontainer:</span>
                <span className="font-mono font-bold text-indigo-400 text-sm">{history[0].value.id}</span>
              </div>
              <h4 className="text-lg font-bold text-white mt-1">
                {history[history.length - 1].value.itemName || 'Muatan Kontainer'}
              </h4>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl font-medium">
                Total Transaksi Blok: <span className="font-mono text-indigo-400 font-bold">{history.length}</span>
              </span>
              {isMock && (
                <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl font-medium">
                  Ledger Simulasi
                </span>
              )}
            </div>
          </div>

          {/* Visualisasi Rute Perjalanan */}
          <div className="glassmorphism p-6 rounded-2xl border border-slate-800/80">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex-1 p-4 rounded-xl bg-slate-950/60 border border-slate-900 flex items-center gap-3">
                <Anchor className="text-indigo-400" size={20} />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Pelabuhan Asal</p>
                  <p className="text-xs font-bold text-slate-300">{history[0].value.origin}</p>
                </div>
              </div>
              <div className="hidden sm:block text-slate-600 font-extrabold text-lg">&rarr;</div>
              <div className="flex-1 p-4 rounded-xl bg-slate-950/60 border border-slate-900 flex items-center gap-3">
                <MapPin className="text-indigo-400" size={20} />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Pelabuhan Tujuan</p>
                  <p className="text-xs font-bold text-slate-300">{history[0].value.destination}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Nodes */}
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[17px] sm:before:left-[21px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
            {history.map((record, index) => {
              const status = record.value.status.toLowerCase();
              const isLast = index === history.length - 1;

              // Tentukan ikon dan warna node
              let nodeIcon = Clock;
              let nodeBg = 'bg-slate-900 border-slate-800 text-slate-400';
              let badgeStyle = 'bg-slate-500/10 text-slate-400 border-slate-500/20';

              if (status === 'registered') {
                nodeIcon = Layers;
                nodeBg = 'bg-indigo-950 border-indigo-500/50 text-indigo-400 ring-4 ring-indigo-500/10';
                badgeStyle = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
              } else if (status === 'in transit') {
                nodeIcon = Anchor;
                nodeBg = 'bg-blue-950 border-blue-500/50 text-blue-400 ring-4 ring-blue-500/10';
                badgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
              } else if (status === 'customs clearance' || status === 'customs check') {
                nodeIcon = ShieldCheck;
                nodeBg = 'bg-amber-950 border-amber-500/50 text-amber-400 ring-4 ring-amber-500/10';
                badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
              } else if (status === 'delivered') {
                nodeIcon = CheckCircle2;
                nodeBg = 'bg-emerald-950 border-emerald-500/60 text-emerald-400 ring-4 ring-emerald-500/10';
                badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
              }

              const NodeIconComponent = nodeIcon;

              return (
                <div key={index} className="relative group animate-slideUp">
                  {/* Penanda Bullet Node */}
                  <div className={`absolute -left-[27px] sm:-left-[33px] top-1 w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center z-10 transition-transform duration-200 group-hover:scale-105 ${nodeBg}`}>
                    <NodeIconComponent size={18} />
                  </div>

                  {/* Kartu Informasi Transaksi */}
                  <div className={`glassmorphism p-6 rounded-2xl border transition-all duration-200 hover:border-slate-700/80 ${
                    isLast ? 'border-indigo-500/20 bg-indigo-500/[0.02]' : 'border-slate-800/80'
                  }`}>
                    {/* Baris Atas: Status & Waktu */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
                          {record.value.status}
                        </span>
                        {isLast && (
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20 uppercase tracking-wider">
                            Status Terbaru
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Calendar size={14} className="text-slate-500" />
                        <span>{formatIndoDate(record.timestamp)}</span>
                      </div>
                    </div>

                    {/* Baris Tengah: Pemilik & Lokasi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y border-slate-800/50 text-sm">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 bg-slate-900 rounded-lg text-slate-400">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-semibold">Pengelola Aset</p>
                          <p className="font-semibold text-slate-200 mt-0.5">{record.value.owner}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 bg-slate-900 rounded-lg text-slate-400">
                          <MapPin size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-semibold">Lokasi Terkini</p>
                          <p className="font-semibold text-slate-200 mt-0.5">
                            {status === 'registered' ? record.value.origin : record.value.newLocation || record.value.destination}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Baris Bawah: Bukti Audit Ledger (TxID) */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Info size={14} />
                        <span>Status Blockchain:</span>
                        <span className="text-emerald-400 font-semibold">Committed Ledger</span>
                      </div>

                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950/60 border border-slate-900 font-mono text-[10px] text-slate-400 max-w-[320px] sm:max-w-none">
                        <span className="truncate">TxID: {record.txId}</span>
                        <button
                          onClick={() => handleCopy(record.txId)}
                          className="hover:text-white p-1 hover:bg-slate-800 rounded transition-colors shrink-0"
                          title="Salin TxID"
                        >
                          <Copy size={10} className={copiedTx === record.txId ? "text-emerald-400" : ""} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Panah Alur ke Bawah */}
                  {!isLast && (
                    <div className="flex justify-center -my-3 pr-6 sm:pr-8">
                      <div className="p-1 bg-slate-900 border border-slate-800 rounded-full text-slate-500">
                        <ArrowDown size={12} className="animate-bounce" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
