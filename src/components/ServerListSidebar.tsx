'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Server } from 'lucide-react';
import { ServerRecord } from '../types/sentinel';
import { NetworkTopologyMesh } from './NetworkTopologyMesh';

interface ServerListSidebarProps {
  servers: ServerRecord[];
  activeServer: ServerRecord;
  setActiveServerId: (id: string) => void;
  onOpenAddServer: () => void;
  onInstantAudit: () => void;
}

export const ServerListSidebar: React.FC<ServerListSidebarProps> = ({
  servers,
  activeServer,
  setActiveServerId,
  onOpenAddServer,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'online'>('all');

  const filteredServers = filterTab === 'online'
    ? servers.filter((s) => s.status === 'online')
    : servers;

  return (
    <aside className="w-full xl:w-76 shrink-0 flex flex-col gap-3.5 p-4 bg-white border border-stone-200/90 rounded-[28px] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-stone-950">
          Server Fleet
        </h3>
        <button
          onClick={onOpenAddServer}
          className="text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Pill Tabs with smooth sliding animation */}
      <div className="flex items-center bg-stone-100 p-1 rounded-full text-xs font-bold">
        <button
          onClick={() => setFilterTab('all')}
          className={`relative flex-1 py-1 rounded-full transition-colors cursor-pointer text-center ${
            filterTab === 'all'
              ? 'text-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {filterTab === 'all' && (
            <motion.div
              layoutId="activeFleetTab"
              className="absolute inset-0 rounded-full bg-[#5b5299] shadow-xs"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          <span className="relative z-10">Activities</span>
        </button>
        <button
          onClick={() => setFilterTab('online')}
          className={`relative flex-1 py-1 rounded-full transition-colors cursor-pointer text-center ${
            filterTab === 'online'
              ? 'text-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {filterTab === 'online' && (
            <motion.div
              layoutId="activeFleetTab"
              className="absolute inset-0 rounded-full bg-[#5b5299] shadow-xs"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          <span className="relative z-10">Online</span>
        </button>
      </div>

      {/* Server List Rows */}
      <div className="flex flex-col gap-2">
        {filteredServers.map((s) => {
          const isSelected = s.id === activeServer.id;
          const isDown = s.status === 'offline';

          return (
            <div
              key={s.id}
              onClick={() => setActiveServerId(s.id)}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-stone-50 border-stone-300 shadow-xs ring-1 ring-stone-900/10'
                  : 'bg-transparent border-transparent hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Clean round avatar */}
                <div className="relative shrink-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs ${
                    isDown
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-stone-200 text-stone-800'
                  }`}>
                    {s.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    !isDown ? 'bg-emerald-500' : 'bg-rose-500'
                  }`} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-black text-stone-950 truncate">
                      {s.name}
                    </h4>
                    {isDown && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                        Down
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-500 font-mono font-medium truncate max-w-[130px]" title={s.hostname}>
                    {s.hostname}
                  </p>
                </div>
              </div>

              {/* Score */}
              <div className="text-right shrink-0">
                <span className={`text-xs font-black block ${isDown ? 'text-rose-600' : 'text-stone-950'}`}>
                  {isDown ? '0' : s.score.total}
                </span>
                <span className="text-[9px] font-bold text-stone-500">
                  {isDown ? 'offline' : 'score'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Topology Mesh matching "Live map" in reference */}
      <div className="mt-auto pt-3 border-t border-stone-100">
        <NetworkTopologyMesh
          servers={servers}
          activeServerId={activeServer.id}
          setActiveServerId={setActiveServerId}
        />
      </div>
    </aside>
  );
};
