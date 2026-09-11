'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Server,
  Laptop,
  Scale,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import { ServerRecord } from '../types/sentinel';

interface NetworkTopologyMeshProps {
  servers: ServerRecord[];
  activeServerId: string;
  setActiveServerId: (id: string) => void;
}

export const NetworkTopologyMesh: React.FC<NetworkTopologyMeshProps> = ({
  servers,
  activeServerId,
  setActiveServerId,
}) => {
  // Traffic Load State: 'normal' (38 req/s) vs 'spike' (920 req/s)
  const [loadMode, setLoadMode] = useState<'normal' | 'spike'>('normal');
  const isHighLoad = loadMode === 'spike';

  return (
    <div className="flex flex-col gap-2">
      {/* Header & Traffic Load Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black text-stone-950 uppercase tracking-wider">
            Live Mesh
          </span>
          <span className="text-[10px] text-stone-500 font-bold">
            • Topology
          </span>
        </div>

        {/* Load Balancer Simulation Switcher */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-full border border-stone-200 text-[10px] font-bold">
          <button
            onClick={() => setLoadMode('normal')}
            className={`px-2 py-0.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
              !isHighLoad
                ? 'bg-white text-stone-900 shadow-xs font-black'
                : 'text-stone-500 hover:text-stone-800'
            }`}
            title="Normal traffic baseline (38 req/s)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Normal
          </button>
          <button
            onClick={() => setLoadMode('spike')}
            className={`px-2 py-0.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
              isHighLoad
                ? 'bg-amber-500 text-stone-950 shadow-xs font-black'
                : 'text-stone-500 hover:text-amber-600'
            }`}
            title="Simulate high web traffic spike (920 req/s) to trigger auto load balancing"
          >
            <Zap className="w-2.5 h-2.5 fill-current" />
            Spike Load
          </button>
        </div>
      </div>

      {/* Clean Topology Canvas */}
      <div className="relative rounded-2xl bg-stone-50 border border-stone-200/90 p-2.5 flex flex-col gap-1.5 overflow-hidden">
        
        {/* Tier 1: ISP Backbone */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-stone-200 shadow-xs text-xs">
            <Globe className="w-3 h-3 text-stone-600" />
            <span className="text-[10px] font-black text-stone-900">
              ISP Backbone (12ms)
            </span>
          </div>

          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
            isHighLoad ? 'bg-amber-100 text-amber-900 animate-pulse' : 'bg-stone-200/60 text-stone-600'
          }`}>
            {isHighLoad ? '⚡ 920 req/s' : '38 req/s'}
          </span>
        </div>

        {/* Dynamic Tier 1.5: Smart Load Balancer Node */}
        <div className="relative w-full my-0.5">
          <motion.div
            layout
            className={`p-1.5 rounded-xl border transition-all flex items-center justify-between ${
              isHighLoad
                ? 'bg-amber-50/90 border-amber-400 shadow-xs'
                : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-lg ${isHighLoad ? 'bg-amber-500 text-stone-950' : 'bg-stone-100 text-stone-600'}`}>
                <Scale className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black text-stone-950 block">
                    Sentinel Smart LB
                  </span>
                  <span className={`text-[8px] font-bold px-1 rounded-full ${
                    isHighLoad ? 'bg-emerald-500 text-white animate-pulse' : 'bg-stone-200 text-stone-700'
                  }`}>
                    {isHighLoad ? 'AUTO-BALANCING' : 'PASSIVE'}
                  </span>
                </div>
                <p className="text-[9px] text-stone-500 font-mono">
                  {isHighLoad ? 'Alg: Least-Connections (50/50)' : 'Alg: Direct Route'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-[9px] font-mono font-black ${isHighLoad ? 'text-amber-700' : 'text-stone-500'}`}>
                {isHighLoad ? '14.8 MB/s' : '0.6 MB/s'}
              </span>
              <span className="text-[8px] text-stone-400 block font-sans">
                {isHighLoad ? 'Failover: Active' : 'Optimal'}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Animated Connecting Lines (LB -> Nodes) */}
        <div className="relative w-full h-4 flex justify-center items-center pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 240 16">
            {/* Path 1: LB to STB Primary (Laser dash stream) */}
            <motion.path
              d="M 120,0 L 55,16"
              fill="none"
              stroke="#059669"
              strokeWidth={isHighLoad ? 2.5 : 1.8}
              strokeDasharray="4 4"
              animate={{ strokeDashoffset: [-16, 0] }}
              transition={{ repeat: Infinity, duration: isHighLoad ? 0.6 : 1.2, ease: 'linear' }}
            />
            {/* Path 2: LB to STB Replica (Laser dash stream in High Load) */}
            {isHighLoad && (
              <motion.path
                d="M 120,0 L 120,16"
                fill="none"
                stroke="#0284c7"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                animate={{ strokeDashoffset: [-16, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
              />
            )}
            {/* Path 3: LB to FSTI (Down / Bypassed) */}
            <path
              d="M 120,0 L 185,16"
              fill="none"
              stroke="#dc2626"
              strokeWidth={1.2}
              strokeDasharray="2,4"
              strokeOpacity={isHighLoad ? 0.3 : 0.6}
            />
          </svg>

          {/* Flowing animated packets to STB Primary (Dual wave) */}
          <motion.div
            animate={{ y: [0, 13], x: [0, -48], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: isHighLoad ? 0.65 : 1.4, ease: 'linear' }}
            className="absolute w-2 h-2 rounded-full bg-emerald-500 shadow-xs"
          />
          <motion.div
            animate={{ y: [0, 13], x: [0, -48], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: isHighLoad ? 0.65 : 1.4, ease: 'linear', delay: isHighLoad ? 0.32 : 0.7 }}
            className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-xs"
          />

          {/* Flowing animated packets to STB Replica (Active in High Load) */}
          {isHighLoad && (
            <>
              <motion.div
                animate={{ y: [0, 13], x: [0, 0], opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.65, ease: 'linear', delay: 0.15 }}
                className="absolute w-2 h-2 rounded-full bg-sky-500 shadow-xs"
              />
              <motion.div
                animate={{ y: [0, 13], x: [0, 0], opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.65, ease: 'linear', delay: 0.48 }}
                className="absolute w-1.5 h-1.5 rounded-full bg-sky-400 shadow-xs"
              />
            </>
          )}
        </div>

        {/* Tier 2: Servers Grid (Primary, Auto-Scaled Replica, & Offline Server) */}
        <div className={`grid gap-1.5 text-xs ${isHighLoad ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {/* Node 1: STB Primary Server */}
          <div
            onClick={() => setActiveServerId('stb-production')}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeServerId === 'stb-production'
                ? 'bg-white border-stone-900 shadow-xs ring-1 ring-stone-900/15'
                : 'bg-white/90 border-stone-200 hover:border-stone-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <Server className="w-3 h-3 text-stone-800" />
              <span className="text-[8px] font-black px-1 rounded-full bg-emerald-100 text-emerald-800">
                {isHighLoad ? '50% Load' : 'Online'}
              </span>
            </div>
            <div className="mt-1">
              <strong className="text-[10px] font-black text-stone-950 block leading-tight">
                STB Master
              </strong>
              <span className="text-[8px] text-stone-500 font-mono truncate block" title="xxxxx.akhzafachrozy.my.id">
                xxxxx.akhza...
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[9px] font-bold">
              <span className="text-stone-900">Score 87</span>
              <span className="text-emerald-700 font-mono text-[8px]">{isHighLoad ? '44% CPU' : '38% CPU'}</span>
            </div>
          </div>

          {/* Node 2: STB Replica (Spawns Dynamically when Load is High) */}
          <AnimatePresence>
            {isHighLoad && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', damping: 15 }}
                className="p-2 rounded-xl border border-sky-400 bg-sky-50/80 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <Layers className="w-3 h-3 text-sky-600" />
                  <span className="text-[8px] font-black px-1 rounded-full bg-sky-500 text-white">
                    Replica (50%)
                  </span>
                </div>
                <div className="mt-1">
                  <strong className="text-[10px] font-black text-sky-950 block leading-tight">
                    STB-Worker-02
                  </strong>
                  <span className="text-[8px] text-sky-700 font-mono truncate block" title="xxxxx.akhzafachrozy.my.id:8081">
                    Auto-Scaled
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[9px] font-bold">
                  <span className="text-sky-900">Sync ✓</span>
                  <span className="text-sky-700 font-mono text-[8px]">41% CPU</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Node 3: FSTI Server (Down - Failover Bypassed) */}
          <div
            onClick={() => setActiveServerId('fsti-server')}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeServerId === 'fsti-server'
                ? 'bg-rose-50 border-rose-500 shadow-xs ring-1 ring-rose-500/20'
                : 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <Server className="w-3 h-3 text-rose-600" />
              <span className="text-[8px] font-black px-1 rounded-full bg-rose-600 text-white">
                {isHighLoad ? 'Bypassed' : 'Down'}
              </span>
            </div>
            <div className="mt-1">
              <strong className="text-[10px] font-black text-rose-950 block leading-tight">
                FSTI Server
              </strong>
              <span className="text-[8px] text-rose-700 font-mono truncate block" title="xxxxx.myst-tech.com">
                xxxxx.myst...
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[9px] font-bold">
              <span className="text-rose-600">Timeout ✕</span>
              <span className="text-rose-700 font-mono text-[8px]">0% traffic</span>
            </div>
          </div>
        </div>

        {/* Animated Connecting Lines (Servers -> Clients) */}
        <div className="relative w-full h-3 flex justify-center items-center pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 240 12">
            <motion.path
              d="M 60,0 L 120,12"
              fill="none"
              stroke="#059669"
              strokeWidth={2}
              strokeDasharray="4 4"
              animate={{ strokeDashoffset: [-16, 0] }}
              transition={{ repeat: Infinity, duration: isHighLoad ? 0.6 : 1.2, ease: 'linear' }}
            />
            {isHighLoad && (
              <motion.path
                d="M 120,0 L 120,12"
                fill="none"
                stroke="#0284c7"
                strokeWidth={2}
                strokeDasharray="4 4"
                animate={{ strokeDashoffset: [-16, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
              />
            )}
            <path
              d="M 180,0 L 120,12"
              fill="none"
              stroke="#dc2626"
              strokeWidth={1.2}
              strokeDasharray="1,4"
              strokeOpacity="0.2"
            />
          </svg>

          <motion.div
            animate={{ y: [0, 10], x: [-45, 0], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: isHighLoad ? 0.65 : 1.4, ease: 'linear', delay: 0.1 }}
            className="absolute w-2 h-2 rounded-full bg-emerald-500"
          />
          {isHighLoad && (
            <motion.div
              animate={{ y: [0, 10], x: [0, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.65, ease: 'linear', delay: 0.35 }}
              className="absolute w-2 h-2 rounded-full bg-sky-500"
            />
          )}
        </div>

        {/* Tier 3: Clients & Telemetry Strip */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-stone-200 shadow-xs text-xs">
            <Laptop className="w-3 h-3 text-stone-600" />
            <span className="text-[10px] font-black text-stone-900">
              {isHighLoad ? '380 Edge Clients' : '24 Client Devices'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-stone-600">
            <Activity className="w-2.5 h-2.5 text-emerald-600" />
            <span>Latency: {isHighLoad ? '18ms (Stable)' : '12ms'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
