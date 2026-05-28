import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  RefreshCw, 
  Search, 
  Ship, 
  Activity, 
  Wifi, 
  WifiOff, 
  Layers
} from 'lucide-react';
import { containerService } from '../services/api';

export default function Layout({ children, currentTab, setCurrentTab }) {
  const [connectionStatus, setConnectionStatus] = useState({ checked: false, isMock: true });

  useEffect(() => {
    const checkConnection = async () => {
      const status = await containerService.checkHealth();
      setConnectionStatus({ checked: true, isMock: status.isMock });
    };
    checkConnection();
    // Cek koneksi setiap 30 detik
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'register', label: 'Registrasi Ekspor', icon: PlusCircle },
    { id: 'update', label: 'Update Status', icon: RefreshCw },
    { id: 'trace', label: 'Traceability Timeline', icon: Search },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
              <Ship size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">HyperTrace</h1>
              <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Kelompok 7 Ledger</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon 
                    size={20} 
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`} 
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-6 bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Info Aktor & Platform */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="text-indigo-400" size={16} />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Aktor: Anggota 4</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              DApp Web Panel Frontend - Simulasi Alur Traceability Kontainer Ekspor-Impor.
            </p>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Hyperledger Fabric v2.x</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">SDK Node</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-slate-900/40 border-b border-slate-800/60 flex items-center justify-between px-8 backdrop-blur-md z-10 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white capitalize leading-tight">
              {menuItems.find(item => item.id === currentTab)?.label}
            </h2>
            <p className="text-xs text-slate-400">
              Sistem Penjaminan Mutu & Audit Trail Blockchain Logistik
            </p>
          </div>

          {/* Connection Status & Profile */}
          <div className="flex items-center gap-4">
            {/* Connection Status Badge */}
            <div className="flex items-center">
              {!connectionStatus.checked ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 text-xs border border-slate-700 animate-pulse">
                  <Activity size={14} className="animate-spin" />
                  <span>Mengecek Ledger...</span>
                </div>
              ) : connectionStatus.isMock ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20 font-medium">
                  <WifiOff size={14} />
                  <span className="flex items-center gap-1.5">
                    Mode Simulasi <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 font-medium">
                  <Wifi size={14} />
                  <span className="flex items-center gap-1.5">
                    REST API Terkoneksi <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  </span>
                </div>
              )}
            </div>

            {/* Profile/Role Indicator */}
            <div className="flex items-center gap-2.5 pl-4 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                FD
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-white leading-none">Frontend Dev</p>
                <span className="text-[10px] text-slate-400 font-mono">DApp Operator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Page wrapper */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950/20">
          <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
