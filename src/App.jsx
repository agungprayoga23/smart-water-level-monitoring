'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { db } from './firebase';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [condition, setCondition] = useState(null);
  const [waterLevel, setWaterLevel] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('tank-section');
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  // 1. Firebase Realtime Listeners
  useEffect(() => {
    // Connection status listener
    const connectedRef = ref(db, '.info/connected');
    const unsubConnected = onValue(connectedRef, (snap) => {
      setIsConnected(snap.val() === true);
    });

    // Level_sensor/condition listener
    const conditionRef = ref(db, 'Level_sensor/condition');
    const unsubCondition = onValue(conditionRef, (snap) => {
      setCondition(snap.val());
    });

    // level_air/value listener
    const levelAirRef = ref(db, 'level_air/value');
    const unsubLevelAir = onValue(levelAirRef, (snap) => {
      setWaterLevel(snap.val());
    });

    // historyData listener
    const historyRef = ref(db, 'historyData');
    const unsubHistory = onValue(historyRef, (snap) => {
      const dataObj = snap.val() || {};
      const parsed = Object.entries(dataObj).map(([key, item]) => ({
        key,
        condition: item && item.condition != null ? String(item.condition) : '-',
        pump_status: item && item.pump_status != null ? String(item.pump_status).toUpperCase() : '-',
        timestamp: item && item.timestamp ? Number(item.timestamp) : 0,
        value: item && item.value != null ? Number(item.value) : null
      }));
      setHistoryList(parsed);
    });

    return () => {
      unsubConnected();
      unsubCondition();
      unsubLevelAir();
      unsubHistory();
    };
  }, []);

  // Derived state: latest record for pump status
  const sortedHistoryDesc = useMemo(() => {
    return [...historyList].sort((a, b) => b.timestamp - a.timestamp);
  }, [historyList]);

  const latestRecord = sortedHistoryDesc[0] || null;
  const pumpStatus = latestRecord?.pump_status === 'ON' ? 'MENYALA' : (latestRecord?.pump_status === 'OFF' ? 'MATI' : null);
  const isPumpOn = pumpStatus === 'MENYALA';

  // Format Level Value in cm
  const formattedLevelCm = useMemo(() => {
    if (waterLevel == null) return '--';
    if (typeof waterLevel === 'number') {
      return Number.isInteger(waterLevel) ? waterLevel.toString() : waterLevel.toFixed(2);
    }
    return String(waterLevel);
  }, [waterLevel]);

  // Derived tank liquid fill height
  const liquidFillHeight = useMemo(() => {
    const condLower = String(condition || '').toLowerCase();
    if (condLower.includes('tinggi') || condLower.includes('high')) return '85%';
    if (condLower.includes('rendah') || condLower.includes('low')) return '20%';
    if (condLower.includes('sedang') || condLower.includes('mid') || condLower.includes('normal')) return '55%';
    return '50%';
  }, [condition]);

  // Sparkline SVG path generation from chronological values
  const sparklinePath = useMemo(() => {
    const valid = historyList
      .filter((r) => r.value != null && !isNaN(r.value))
      .sort((a, b) => a.timestamp - b.timestamp);

    if (valid.length < 2) return 'M0,20 L100,20';

    const slice = valid.slice(-20);
    const vals = slice.map((r) => r.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;

    const points = vals.map((v, i) => {
      const x = (i / (vals.length - 1)) * 100;
      const y = 35 - ((v - min) / range) * 30;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return 'M ' + points.join(' L ');
  }, [historyList]);

  // Filtered history table rows
  const filteredHistory = useMemo(() => {
    return sortedHistoryDesc.filter((r) => {
      if (filter === 'all') return true;
      if (filter === 'pump') return r.pump_status === 'ON' || r.pump_status === 'OFF';
      if (filter === 'alarm') {
        const c = r.condition.toLowerCase();
        return c.includes('tinggi') || c.includes('high') || c.includes('rendah') || c.includes('low');
      }
      return true;
    });
  }, [sortedHistoryDesc, filter]);

  // Helper to format timestamp
  const formatTimestamp = (ts) => {
    if (!ts || isNaN(ts)) return '-';
    const d = new Date(ts);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${h}:${m}:${s}`;
  };

  // Safety lock notice trigger
  const showSafetyNotice = (actionName) => {
    setToast({
      show: true,
      message: `Aksi "${actionName}" ditahan. Seluruh kontrol fisik dinonaktifkan sesuai protokol keselamatan PLC. Website beroperasi dalam mode Monitoring.`
    });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 4500);
  };

  // Manual snapshot sync
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const [condSnap, levelSnap, histSnap] = await Promise.all([
        get(ref(db, 'Level_sensor/condition')),
        get(ref(db, 'level_air/value')),
        get(ref(db, 'historyData'))
      ]);
      setCondition(condSnap.val());
      setWaterLevel(levelSnap.val());
      const dataObj = histSnap.val() || {};
      const parsed = Object.entries(dataObj).map(([key, item]) => ({
        key,
        condition: item && item.condition != null ? String(item.condition) : '-',
        pump_status: item && item.pump_status != null ? String(item.pump_status).toUpperCase() : '-',
        timestamp: item && item.timestamp ? Number(item.timestamp) : 0,
        value: item && item.value != null ? Number(item.value) : null
      }));
      setHistoryList(parsed);
    } catch (err) {
      console.error('Manual sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Smooth scroll helper
  const scrollTo = (id) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const condLower = String(condition || '').toLowerCase();
  const isHigh = condLower.includes('tinggi') || condLower.includes('high');
  const isLow = condLower.includes('rendah') || condLower.includes('low');
  const isMid = condLower.includes('sedang') || condLower.includes('mid') || condLower.includes('normal');

  return (
    <div className="bg-surface text-slate-100 font-sans antialiased min-h-screen flex flex-col mesh-ambient grid-lines selection:bg-primary/30 pb-20 md:pb-8">
      {/* ========================================================================= */}
      {/* 1. RESPONSIVE HEADER                                                      */}
      {/* ========================================================================= */}
      <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-surface-border bg-surface-card/90 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        {/* Brand & Node Status */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 p-0.5 shadow-lg shadow-sky-500/20 shrink-0">
            <div className="w-full h-full bg-surface-card rounded-[10px] flex items-center justify-center">
              <span className="material-symbols-outlined text-cyan-400" style={{ fontSize: '20px' }}>water_ec</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-display font-bold tracking-tight text-white text-sm sm:text-base lg:text-lg">HYDRO-FLOW</span>
              <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-semibold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">TK-01 CORE</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400 font-mono">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald animate-pulse"></span>
              <span className="truncate max-w-[140px] sm:max-w-none">ESP32 WOKWI • STASIUN-PLTA #4</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-elevated/70 p-1 rounded-xl border border-surface-border/60 text-xs font-medium">
          <button 
            onClick={() => scrollTo('tank-section')} 
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'tank-section' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>dashboard</span>
            <span>Monitoring</span>
          </button>
          <button 
            onClick={() => scrollTo('pump-section')} 
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'pump-section' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>tune</span>
            <span>Kontrol Pompa</span>
          </button>
          <button 
            onClick={() => scrollTo('history-section')} 
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'history-section' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>analytics</span>
            <span>Histori Log</span>
          </button>
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => showSafetyNotice('Mode Toggle AUTO/MANUAL')} className="px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-medium flex items-center gap-1.5 sm:gap-2 bg-emerald/10 border border-emerald/30 text-emerald hover:bg-emerald/20 transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.15)]" title="Mode Operasi Monitoring IoT">
            <span className="material-symbols-outlined text-emerald" style={{ fontSize: '15px' }}>hdr_auto</span>
            <span className="hidden xs:inline">AUTO MODE</span>
            <span className="xs:hidden">AUTO</span>
          </button>
          <button onClick={() => showSafetyNotice('Emergency Stop (E-STOP)')} className="px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-semibold bg-rose/10 hover:bg-rose/20 text-rose border border-rose/30 flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(244,63,94,0.15)] active:scale-95" title="Kontrol fisik dinonaktifkan demi keselamatan operasional">
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>emergency</span>
            <span className="hidden sm:inline">E-STOP</span>
          </button>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold text-sky-400 shrink-0" title="Operator Konsol Utama">
            OP-3
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN APPLICATION CONTENT                                               */}
      {/* ========================================================================= */}
      <main className="flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full space-y-4 sm:space-y-6">
        {/* FAST INTERACTIVE SIMULATION & CONTROLLER STRIP */}
        <section className="bg-surface-card border border-surface-border/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <span className="material-symbols-outlined">sensors</span>
            </div>
            <div>
              <div className="text-[10px] sm:text-xs uppercase font-mono tracking-wider text-slate-400">Stream Telemetri Real-Time</div>
              <div className="text-xs sm:text-sm font-semibold text-white">Monitoring Sensor ESP32 Wokwi</div>
            </div>
          </div>
          <div className="w-full md:max-w-md flex items-center gap-2 sm:gap-3 px-1 sm:px-2">
            <span className="text-[10px] sm:text-xs font-mono text-slate-500">Min</span>
            <input className="w-full h-2 bg-surface-elevated rounded-lg appearance-none cursor-not-allowed border border-surface-border opacity-70" disabled max="500" min="0" step="1" type="range" value={typeof waterLevel === 'number' ? Math.min(Math.max(waterLevel, 0), 500) : 345} readOnly />
            <span className="text-[10px] sm:text-xs font-mono text-slate-500">Max</span>
            <span className="min-w-[50px] sm:min-w-[60px] text-center font-mono font-bold text-[11px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-md bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">LIVE</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] sm:text-xs font-mono px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="font-semibold text-cyan-300">LIVE IOT STREAM</span>
            </span>
          </div>
        </section>

        {/* PRIMARY BENTO GRID: TANK VISUALIZER + PUMP ACTUATOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {/* 2.1 MODERN 3D GLASSPHORPHISM TANK CARD */}
          <section className="lg:col-span-6 bg-surface-card border border-surface-border/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden" id="tank-section">
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-surface-border">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <h2 className="font-display font-bold text-white text-sm sm:text-base tracking-wide">TANGKI AIR</h2>
                </div>
                <span className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium font-mono border ${isHigh ? 'bg-rose/15 text-rose border-rose/40' : (isLow ? 'bg-amber/15 text-amber border-amber/40' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30')}`}>
                  {condition ? `Kondisi: ${condition}` : 'Menghubungkan...'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 my-3 sm:my-5 items-end">
                <div>
                  <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider block">Ketinggian Air</span>
                  <div className="flex items-baseline gap-1 mt-0.5 sm:mt-1">
                    <span className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">{formattedLevelCm}</span>
                    <span className="font-mono text-lg sm:text-xl font-semibold text-cyan-400">cm</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider block">Volume Terisi</span>
                  <div className="font-mono text-lg sm:text-xl lg:text-2xl font-bold text-slate-200 mt-0.5 sm:mt-1">
                    <span>--</span> <span className="text-xs sm:text-sm font-normal text-slate-400">/ 1.000 L</span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-mono text-cyan-400">Telemetri Realtime</span>
                </div>
              </div>
            </div>

            {/* 3D Cylindrical Vessel Tank Graphics */}
            <div className="relative w-full h-64 sm:h-80 rounded-xl sm:rounded-2xl glass-tank border border-white/10 overflow-hidden flex my-2">
              <div className="absolute inset-0 flex flex-col justify-between p-2.5 sm:p-3 pointer-events-none z-30 select-none">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400 border-b border-white/5 pb-0.5 sm:pb-1">
                  <span>100% KAPASITAS MAX (2.50m)</span>
                  <span>1.000 L</span>
                </div>
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-rose border-b border-rose/30 pb-0.5">
                  <div className="flex items-center gap-1 sm:gap-1.5 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose"></span>
                    <span>BATAS HIGH (Kondisi: Tinggi)</span>
                  </div>
                  <span>2.00m</span>
                </div>
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-500 border-b border-white/5 border-dashed">
                  <span>50% NOMINAL BUFFER (Kondisi: Sedang)</span>
                  <span>1.25m</span>
                </div>
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-emerald border-b border-emerald/40 pb-0.5">
                  <div className="flex items-center gap-1 sm:gap-1.5 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald"></span>
                    <span>BATAS LOW (Kondisi: Rendah)</span>
                  </div>
                  <span>0.75m</span>
                </div>
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-500 pt-0.5 sm:pt-1">
                  <span>0% KOSONG</span>
                  <span>0.00m</span>
                </div>
              </div>

              {/* Animated Liquid Body */}
              <div className="w-full h-full flex items-end relative z-10">
                <div className="w-full relative transition-all duration-700 ease-out bg-gradient-to-t from-sky-700 via-sky-500 to-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.4)]" style={{ height: liquidFillHeight }}>
                  <div className="absolute -top-3 left-0 right-0 h-6 overflow-hidden pointer-events-none opacity-80">
                    <svg className="w-[200%] h-full wave-animate-fast fill-cyan-300" preserveAspectRatio="none" viewBox="0 0 1200 120">
                      <path d="M0,0 C150,90 350,-40 500,30 C650,100 900,-30 1200,40 L1200,120 L0,120 Z"></path>
                    </svg>
                  </div>
                  <div className="absolute -top-2 left-0 right-0 h-5 overflow-hidden pointer-events-none opacity-50">
                    <svg className="w-[200%] h-full wave-animate-slow fill-sky-200" preserveAspectRatio="none" viewBox="0 0 1200 120">
                      <path d="M0,20 C200,110 400,-20 600,40 C800,90 1000,0 1200,60 L1200,120 L0,120 Z"></path>
                    </svg>
                  </div>
                  <div className="absolute -top-1 inset-x-0 h-1 bg-white opacity-80 shadow-[0_0_8px_#ffffff]"></div>
                  <div className="absolute -top-7 right-2 sm:right-4 px-2 sm:px-2.5 py-0.5 rounded-md bg-surface-card/90 backdrop-blur-md border border-cyan-400/50 text-cyan-300 font-mono text-[11px] sm:text-xs font-bold shadow-lg">
                    <span>{formattedLevelCm} cm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Metrics Footer */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-surface-border text-center font-mono">
              <div className="p-2 sm:p-2.5 rounded-xl bg-surface-elevated/50 border border-surface-border">
                <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Tinggi Fisik</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-400">--</span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-surface-elevated/50 border border-surface-border">
                <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Suhu Air</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-400">--</span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-surface-elevated/50 border border-surface-border">
                <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Kekeruhan</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-400">--</span>
              </div>
            </div>
          </section>

          {/* 2.2 MOTOR PUMP ACTUATOR & LOGIC CARD */}
          <section className="lg:col-span-6 bg-surface-card border border-surface-border/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col justify-between" id="pump-section">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-surface-border">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isPumpOn ? 'bg-emerald animate-pulse' : 'bg-slate-500'}`}></span>
                  <h2 className="font-display font-bold text-white text-sm sm:text-base tracking-wide">MOTOR POMPA P-01</h2>
                </div>
                <div className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${isPumpOn ? 'bg-emerald/15 text-emerald border border-emerald/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : (pumpStatus ? 'bg-rose/15 text-rose border border-rose/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'bg-slate-500/15 text-slate-400 border border-slate-500/30')}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>{isPumpOn ? 'check_circle' : 'power_settings_new'}</span>
                  <span>{pumpStatus ? (isPumpOn ? 'POMPA MENYALA (ON)' : 'POMPA STANDBY (OFF)') : 'MEMUAT...'}</span>
                </div>
              </div>

              {/* Pump Rotor + Actuator Box (Responsive Stack on Mobile) */}
              <div className="my-3 sm:my-5 p-3 sm:p-4 rounded-xl bg-surface-elevated/50 border border-surface-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                    <span className={`material-symbols-outlined ${isPumpOn ? 'text-emerald pump-spinning' : 'text-slate-500'}`} style={{ fontSize: '28px' }}>
                      sync
                    </span>
                    <span className="absolute inset-0 rounded-xl sm:rounded-2xl border border-white/5 pointer-events-none"></span>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs font-mono text-slate-400">UNIT SENTRIFUGAL 2.2kW</div>
                    <div className="text-sm sm:text-base font-semibold text-white">{isPumpOn ? 'Aktif Beroperasi (Data Telemetri)' : 'Aliran Ditutup / Standby'}</div>
                    <div className="text-[10px] sm:text-xs text-slate-400 font-mono mt-0.5">Mode: <span className="text-emerald font-semibold">MONITORING IOT (SAFETY LOCK)</span></div>
                  </div>
                </div>

                <button onClick={() => showSafetyNotice('Kontrol Manual Pompa')} className="w-full sm:w-auto justify-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-wider bg-slate-800/80 hover:bg-slate-800 text-slate-400 border border-slate-700/60 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 shrink-0" title="Kontrol fisik dinonaktifkan (Safety Lock Aktif)">
                  <span className="material-symbols-outlined text-amber" style={{ fontSize: '15px' }}>lock</span>
                  <span>KONTROL TERKUNCI</span>
                </button>
              </div>

              {/* Key Motor Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 my-3 sm:my-4 font-mono">
                <div className="p-2.5 sm:p-3 rounded-xl bg-surface-elevated/40 border border-surface-border">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Laju Alir</span>
                  <div className="mt-0.5 sm:mt-1">
                    <span className="text-lg sm:text-xl font-bold text-slate-400">--</span>
                    <span className="text-[10px] sm:text-xs text-slate-500"> L/mnt</span>
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-surface-elevated/40 border border-surface-border">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Arus Motor</span>
                  <div className="mt-0.5 sm:mt-1">
                    <span className="text-lg sm:text-xl font-bold text-slate-400">--</span>
                    <span className="text-[10px] sm:text-xs text-slate-500"> A</span>
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-surface-elevated/40 border border-surface-border">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Tegangan</span>
                  <div className="mt-0.5 sm:mt-1">
                    <span className="text-lg sm:text-xl font-bold text-slate-400">--</span>
                    <span className="text-[10px] sm:text-xs text-slate-500"> V</span>
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-surface-elevated/40 border border-surface-border">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Suhu Mesin</span>
                  <div className="mt-0.5 sm:mt-1">
                    <span className="text-lg sm:text-xl font-bold text-slate-400">--</span>
                    <span className="text-[10px] sm:text-xs text-slate-500"> °C</span>
                  </div>
                </div>
              </div>

              {/* Diagram Logika Otomasi (Ladder Rule) */}
              <div className="space-y-1.5 sm:space-y-2 mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-surface-border">
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono text-slate-400 uppercase tracking-wide">
                  <span>Diagram Logika Otomasi (Ladder Rule)</span>
                  <span className="text-cyan-400">Aktif Real-Time</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 sm:gap-2 font-mono text-[10px] sm:text-xs">
                  {/* LOW RULE */}
                  <div className={`p-2 sm:p-2.5 rounded-xl border flex items-center justify-between transition-all ${isLow ? 'bg-emerald/15 border-emerald/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-surface-elevated/40 border-surface-border'}`}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald shrink-0"></span>
                      <span className="text-slate-300"><strong className="text-emerald">LOW (Rendah):</strong> Pompa Otomatis <strong>ON</strong></span>
                    </div>
                    <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded font-bold shrink-0 ${isLow ? 'bg-emerald text-surface-card' : 'bg-surface-card text-slate-400'}`}>
                      {isLow ? 'TRIGGER' : 'STANDBY'}
                    </span>
                  </div>
                  {/* MID RULE */}
                  <div className={`p-2 sm:p-2.5 rounded-xl border flex items-center justify-between transition-all ${isMid ? 'bg-sky-500/15 border-sky-500/30' : 'bg-surface-elevated/40 border-surface-border'}`}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
                      <span className="text-slate-200"><strong className="text-cyan-300">MID (Sedang):</strong> Status Berjalan Normal / Stabil</span>
                    </div>
                    <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded font-semibold shrink-0 ${isMid ? 'bg-cyan-500/20 text-cyan-300' : 'bg-surface-card text-slate-400'}`}>
                      {isMid ? 'STABIL' : 'STANDBY'}
                    </span>
                  </div>
                  {/* HIGH RULE */}
                  <div className={`p-2 sm:p-2.5 rounded-xl border flex items-center justify-between transition-all ${isHigh ? 'bg-rose/15 border-rose/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'bg-surface-elevated/40 border-surface-border'}`}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose shrink-0"></span>
                      <span className="text-slate-300"><strong className="text-rose">HIGH (Tinggi):</strong> Pompa Otomatis <strong>OFF</strong></span>
                    </div>
                    <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded font-bold shrink-0 ${isHigh ? 'bg-rose text-white' : 'bg-surface-card text-slate-400'}`}>
                      {isHigh ? 'TRIGGER' : 'STANDBY'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-surface-border/70 flex flex-wrap items-center justify-between text-[10px] sm:text-xs font-mono text-slate-500 gap-1">
              <span>Relay Coil Adr: 0x4B21</span>
              <span className="text-emerald flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald"></span> Interlock: Terproteksi (Safety Lock)
              </span>
            </div>
          </section>
        </div>

        {/* 3. SENSOR & TELEMETRY SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
          {/* Sensor 1: Ultrasonic Sensor */}
          <div className="bg-surface-card border border-surface-border/80 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-slate-400">
                <span className="material-symbols-outlined text-emerald" style={{ fontSize: '18px' }}>sensors</span>
                <span>SENSOR JARAK ULTRASONIK</span>
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-white">
                {formattedLevelCm} cm <span className="text-[11px] sm:text-xs font-normal text-emerald font-sans">(ESP32 Realtime)</span>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-mono">Nilai Level Air (level_air/value)</div>
            </div>
            <div className="h-10 w-24 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 100 40">
                <path d={sparklinePath} fill="none" stroke="#10b981" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
              </svg>
            </div>
          </div>

          {/* Sensor 2: Empty Spacer */}

          {/* Sensor 3: Inflow Rate */}
          <div className="bg-surface-card border border-surface-border/80 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-slate-400">
                <span className="material-symbols-outlined text-cyan-400" style={{ fontSize: '18px' }}>speed</span>
                <span>DEBIT ALIRAN MASUK</span>
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-slate-400">
                -- <span className="text-[11px] sm:text-xs font-normal text-slate-500 font-sans">(Tidak Terpasang)</span>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-mono">Daya Pengisian Pompa Sentrifugal</div>
            </div>
            <div className="h-10 w-24 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 100 40">
                <path d="M0,20 L100,20" fill="none" opacity="0.4" stroke="#00f0ff" strokeWidth="2.5"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* 4. STREAMLINED ACTIVITY HISTORY TABLE */}
        <section className="bg-surface-card border border-surface-border/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl space-y-3 sm:space-y-4" id="history-section">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-surface-border">
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
              <span className="p-2 sm:p-2.5 rounded-xl bg-surface-elevated border border-surface-border text-cyan-400 shrink-0">
                <span className="material-symbols-outlined">history</span>
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-bold text-white text-sm sm:text-base">Riwayat Aktivitas &amp; Log Otomasi</h3>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-medium shadow-[0_0_10px_rgba(16,185,129,0.15)] ${isConnected ? 'bg-emerald/10 border border-emerald/30 text-emerald' : 'bg-rose/10 border border-rose/30 text-rose'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald animate-pulse' : 'bg-rose'}`}></span>
                    {isConnected ? 'Firebase: Connected' : 'Firebase: Belum Terkoneksi'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Pencatatan real-time perubahan status pompa dan peringatan level air</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-surface-elevated/70 border border-surface-border text-[11px] sm:text-xs font-mono">
                <span className="material-symbols-outlined text-amber" style={{ fontSize: '15px' }}>database</span>
                <span className="text-slate-400 text-[10px] sm:text-[11px]">Path:</span>
                <span className="text-cyan-300 text-[10px] sm:text-[11px] font-semibold truncate max-w-[130px] sm:max-w-none">Level_sensor | level_air | historyData</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald text-[10px] sm:text-[11px]">{isConnected ? 'Live' : 'Offline'}</span>
              </div>
              <button onClick={handleManualSync} disabled={isSyncing} className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-surface-elevated hover:bg-sky-500/15 border border-surface-border hover:border-sky-500/30 text-slate-200 hover:text-sky-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm" title="Perbarui snapshot sekarang">
                <span className={`material-symbols-outlined text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} style={{ fontSize: '14px' }}>sync</span>
                <span>Sinkron</span>
              </button>
              <div className="flex items-center gap-1 bg-surface-elevated/60 p-1 rounded-xl border border-surface-border text-xs font-mono">
                <button onClick={() => setFilter('all')} className={`px-2 sm:px-2.5 py-1 rounded-lg transition ${filter === 'all' ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-400 hover:text-white'}`}>
                  Semua
                </button>
                <button onClick={() => setFilter('pump')} className={`px-2 sm:px-2.5 py-1 rounded-lg transition ${filter === 'pump' ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-400 hover:text-white'}`}>
                  Pompa
                </button>
                <button onClick={() => setFilter('alarm')} className={`px-2 sm:px-2.5 py-1 rounded-lg transition ${filter === 'alarm' ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-400 hover:text-white'}`}>
                  Alarm
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 px-3 py-2 rounded-xl bg-surface-elevated/40 border border-surface-border/60 text-[10px] sm:text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
              <span className="text-slate-300 font-medium">Snapshot Listener Aktif</span>
              <span className="text-slate-500">•</span>
              <span className="truncate">Sinkronisasi mutasi otomatis via WebSocket</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 shrink-0">
              <span className="text-emerald font-semibold">Auto-Sync: ON</span>
              <span className="text-slate-500">•</span>
              <span>Total {historyList.length} Record</span>
            </div>
          </div>

          {/* Horizontally Scrollable Table Container with Visual Fade Edge */}
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="min-w-[620px] w-full text-left font-mono text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-surface-border/60 pb-2">
                  <th className="py-2.5 px-3 font-medium">DOC / LOG ID</th>
                  <th className="py-2.5 px-3 font-medium">WAKTU (WIB)</th>
                  <th className="py-2.5 px-3 font-medium">TIPE EVENT</th>
                  <th className="py-2.5 px-3 font-medium">DESKRIPSI KEJADIAN</th>
                  <th className="py-2.5 px-3 font-medium">LEVEL AIR (cm)</th>
                  <th className="py-2.5 px-3 font-medium text-right">STATUS POMPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-500">
                      {historyList.length === 0 ? 'Menghubungkan ke Firebase Realtime Database...' : 'Tidak ada log untuk filter yang dipilih.'}
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((r) => {
                    const c = r.condition.toLowerCase();
                    const badgeClass = (c.includes('tinggi') || c.includes('high'))
                      ? 'bg-rose/15 text-rose border-rose/30'
                      : ((c.includes('rendah') || c.includes('low')) ? 'bg-amber/15 text-amber border-amber/30' : 'bg-sky-500/15 text-sky-300 border-sky-500/30');

                    const displayKey = r.key.length > 12 ? `#${r.key.slice(-8)}` : `#${r.key}`;
                    const valFormatted = r.value != null ? (Number.isInteger(r.value) ? `${r.value} cm` : `${r.value.toFixed(2)} cm`) : '-';

                    return (
                      <tr key={r.key} className="hover:bg-white/[0.02] transition">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-amber" style={{ fontSize: '13px' }}>tag</span>
                            <span className="font-bold text-amber text-[11px]">{displayKey}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{formatTimestamp(r.timestamp)}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold border ${badgeClass}`}>
                            {r.condition}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-200">
                          Kondisi: {r.condition} | Sensor: {valFormatted} | Pompa: {r.pump_status === 'ON' ? 'MENYALA' : (r.pump_status === 'OFF' ? 'MATI' : r.pump_status)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-100">{valFormatted}</td>
                        <td className="py-2.5 px-3 text-right">
                          {r.pump_status === 'ON' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald/15 text-emerald border border-emerald/30">MENYALA (ON)</span>
                          ) : r.pump_status === 'OFF' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose/10 text-rose border border-rose/30">MATI (OFF)</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">{r.pump_status}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 3. MOBILE BOTTOM NAVIGATION (FIELD INSPECTION SCADA BAR)                  */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-card/95 backdrop-blur-lg border-t border-surface-border px-4 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => scrollTo('tank-section')}
          className={`flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-xl ${activeTab === 'tank-section' ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>dashboard</span>
          <span className="text-[10px] font-mono font-medium">Monitoring</span>
        </button>

        <button
          onClick={() => scrollTo('pump-section')}
          className={`flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-xl ${activeTab === 'pump-section' ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>tune</span>
          <span className="text-[10px] font-mono font-medium">Pompa</span>
        </button>

        <button
          onClick={() => scrollTo('history-section')}
          className={`flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-xl ${activeTab === 'history-section' ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>analytics</span>
          <span className="text-[10px] font-mono font-medium">Histori</span>
        </button>
      </div>

      {/* Safety Interlock Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-20 md:bottom-5 right-3 md:right-5 left-3 md:left-auto z-50 max-w-md p-4 rounded-xl bg-surface-card border border-amber/40 shadow-2xl text-xs font-mono text-slate-200 transition-all duration-300 transform translate-y-0">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-amber shrink-0" style={{ fontSize: '22px' }}>lock</span>
            <div className="space-y-1">
              <div className="font-bold text-amber tracking-wide uppercase flex items-center gap-1.5">
                <span>Safety Lock Aktif</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber/20 text-amber font-normal border border-amber/30">Read-Only</span>
              </div>
              <div className="text-slate-300 leading-relaxed">{toast.message}</div>
            </div>
            <button onClick={() => setToast({ show: false, message: '' })} className="text-slate-400 hover:text-white ml-auto">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
