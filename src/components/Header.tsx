'use client';

import React from 'react';
import { Search, Plus, RotateCw, ChevronDown } from 'lucide-react';
import { ServerRecord } from '../types/sentinel';

interface HeaderProps {
  servers: ServerRecord[];
  activeServer: ServerRecord;
  setActiveServerId: (id: string) => void;
  onOpenAddServer: () => void;
  onInstantAudit: () => void;
  isAuditing: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  servers,
  activeServer,
  setActiveServerId,
  onOpenAddServer,
  onInstantAudit,
  isAuditing,
  searchQuery,
  setSearchQuery,
}) => {
  const isDown = activeServer.status === 'offline';

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
      {/* Title block: High contrast, crystal clear text */}
      <div>
        <span className="text-[11px] font-bold tracking-wider text-stone-500 block leading-tight">
          Primary
        </span>
        <h1 className="text-2xl font-black tracking-tight text-stone-900 flex items-center gap-2">
          Dashboard
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            isDown
              ? 'bg-rose-50 text-rose-700 border-rose-300'
              : 'bg-stone-100 text-stone-800 border-stone-300'
          }`}>
            {activeServer.name}
          </span>
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search input with crisp dark text */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-44 md:w-56 pl-8 pr-3 py-1.5 text-xs font-medium rounded-full bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 placeholder-stone-400 shadow-xs"
          />
        </div>

        {/* Server Switcher Pill */}
        <div className="relative flex items-center bg-white border border-stone-300 rounded-full px-3 py-1 text-xs shadow-xs">
          <select
            value={activeServer.id}
            onChange={(e) => setActiveServerId(e.target.value)}
            aria-label="Select target server"
            className="bg-transparent text-xs font-bold text-stone-900 focus:outline-none cursor-pointer pr-4"
          >
            {servers.map((s) => (
              <option key={s.id} value={s.id} className="bg-white text-stone-900">
                {s.name} {s.status === 'offline' ? '(Down)' : `(${s.score.total})`}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-stone-600 absolute right-2.5 pointer-events-none" />
        </div>

        {/* Quick Audit Button */}
        <button
          onClick={onInstantAudit}
          disabled={isAuditing}
          className="px-3 py-1.5 text-xs font-bold rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          title="Run quick audit probe"
        >
          <RotateCw className={`w-3 h-3 ${isAuditing ? 'animate-spin text-amber-600' : 'text-stone-700'}`} />
          <span>{isAuditing ? 'Auditing' : 'Audit'}</span>
        </button>

        {/* Add Server Button */}
        <button
          onClick={onOpenAddServer}
          className="px-3.5 py-1.5 text-xs font-black rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>+ Add Server</span>
        </button>

        {/* User Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-black shadow-sm ml-1">
          A
        </div>
      </div>
    </header>
  );
};
