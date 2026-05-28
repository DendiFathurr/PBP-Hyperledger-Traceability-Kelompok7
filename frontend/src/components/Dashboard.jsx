import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Truck, 
  ShieldCheck, 
  CheckCircle, 
  ArrowRight, 
  Search, 
  AlertCircle, 
  Database,
  Lock
} from 'lucide-react';
import { containerService } from '../services/api';

export default function Dashboard({ setCurrentTab, setSelectedContainerId }) {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMockWarning, setIsMockWarning] = useState(false);

  const fetchContainers = async () => {
    try {
      setLoading(true);
      const res = await containerService.getAllContainers();
      setContainers(res.data);
      setIsMockWarning(res.isMock);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data kontainer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  // Filter kontainer berdasarkan kata kunci pencarian
  const filteredContainers = containers.filter(c => 
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.itemName && c.itemName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.owner && c.owner.toLowerCase().includes(searchTerm.toLowerCase())) ||
    c.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Metrik Statistik
  const stats = {
    total: containers.length,
    inTransit: containers.filter(c => c.status.toLowerCase() === 'in transit').length,
    customs: containers.filter(c => c.status.toLowerCase() === 'customs clearance' || c.status.toLowerCase() === 'customs check').length,
    delivered: containers.filter(c => c.status.toLowerCase() === 'delivered').length,
  };

  const handleTraceClick = (id) => {
    setSelectedContainerId(id);
    setCurrentTab('trace');
  };

  return (
    <div className="space-y-6">
      {/* Simulation Banner */}
      {isMockWarning && (
        <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0 text-amber-400" />
            <div>
              <span className="font-semibold">Mode Simulasi Aktif:</span> Server REST API backend (`localhost:3000`) offline. Transaksi saat ini tersimpan sementara di database browser lokal (LocalStorage) agar demo alur traceability tetap berjalan penuh.
            </div>
          </div>
          <button 
            onClick={fetchContainers}
            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-xs font-semibold transition-colors duration-150 shrink-0"
          >
            Hubungkan Ulang
          </button>
        </div>
      )}

      {/* Grid Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Kontainer */}
        <div className="glassmorphism p-6 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Kontainer</span>
            <h3 className="text-3xl font-extrabold text-white">{stats.total}</h3>
            <span className="text-[10px] text-indigo-400 font-mono">Tercatat di Ledger</span>
          </div>
          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Box size={24} />
          </div>
        </div>

        {/* Sedang Transit */}
        <div className="glassmorphism p-6 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Dalam Transit</span>
            <h3 className="text-3xl font-extrabold text-white">{stats.inTransit}</h3>
            <span className="text-[10px] text-blue-400 font-mono">Sedang Dikirim</span>
          </div>
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-xl">
            <Truck size={24} />
          </div>
        </div>

        {/* Bea Cukai / Customs */}
        <div className="glassmorphism p-6 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pemeriksaan Bea Cukai</span>
            <h3 className="text-3xl font-extrabold text-white">{stats.customs}</h3>
            <span className="text-[10px] text-amber-400 font-mono">Customs Clearance</span>
          </div>
          <div className="p-4 bg-amber-500/10 text-amber-400 rounded-xl">
            <ShieldCheck size={24} />
          </div>
        </div>

        {/* Selesai / Delivered */}
        <div className="glassmorphism p-6 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Diterima (Delivered)</span>
            <h3 className="text-3xl font-extrabold text-white">{stats.delivered}</h3>
            <span className="text-[10px] text-emerald-400 font-mono">Tiba di Tujuan</span>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Tabel Utama Kontainer */}
      <div className="glassmorphism rounded-2xl border border-slate-800/80 overflow-hidden">
        {/* Header Tabel & Pencarian */}
        <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Database size={18} className="text-indigo-400" />
              Kontainer Aktif dalam Pelacakan
            </h3>
            <p className="text-xs text-slate-400">Daftar kontainer ekspor-impor yang terdaftar di jaringan blockchain</p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Cari ID, barang, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Memuat daftar kontainer dari Blockchain Ledger...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">
              <AlertCircle size={28} className="mx-auto mb-2 text-red-500" />
              <p className="text-sm font-semibold">{error}</p>
              <button 
                onClick={fetchContainers}
                className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-semibold border border-red-500/20 transition-all duration-150"
              >
                Coba Lagi
              </button>
            </div>
          ) : filteredContainers.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
              <Box size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Tidak ada kontainer yang cocok dengan pencarian.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/30 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
                  <th className="py-4 px-6">ID Kontainer</th>
                  <th className="py-4 px-6">Detail Barang</th>
                  <th className="py-4 px-6">Rute (Asal &rarr; Tujuan)</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Pengelola Saat Ini</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredContainers.map((container) => {
                  const status = container.status.toLowerCase();
                  let statusColor = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                  if (status === 'registered') statusColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                  else if (status === 'in transit') statusColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                  else if (status === 'customs clearance' || status === 'customs check') statusColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                  else if (status === 'delivered') statusColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

                  return (
                    <tr key={container.id} className="hover:bg-slate-900/10 transition-colors duration-150">
                      {/* Asset ID */}
                      <td className="py-4 px-6 font-mono font-bold text-indigo-300">
                        {container.id}
                      </td>

                      {/* Item Details */}
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-semibold text-white">
                            {container.itemName || 'N/A'}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>Berat: {container.weight || 'N/A'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <Lock size={10} className="text-purple-400" />
                            <span className="text-purple-400 text-[10px] font-mono">Privat</span>
                          </div>
                        </div>
                      </td>

                      {/* Routes */}
                      <td className="py-4 px-6">
                        <div className="max-w-[200px] truncate text-slate-300 text-xs">
                          <span className="font-medium text-white">{container.origin.split(',')[0]}</span>
                          <span className="text-slate-500 mx-1.5">&rarr;</span>
                          <span className="font-medium text-slate-300">{container.destination.split(',')[0]}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                          {container.status}
                        </span>
                      </td>

                      {/* Current Owner */}
                      <td className="py-4 px-6 font-medium text-slate-300">
                        {container.owner}
                      </td>

                      {/* Trace Action */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleTraceClick(container.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors py-1 px-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10"
                        >
                          Lacak Rute
                          <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
