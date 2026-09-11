'use client';

import React from 'react';
import {
  Bell,
  LayoutDashboard,
  Server,
  Shield,
  Activity,
  Terminal,
  Settings,
  Palette,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  criticalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  criticalCount,
}) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'fleet', icon: Server, label: 'Servers' },
    { id: 'vectors', icon: Shield, label: 'Audit Checks', badge: criticalCount > 0 ? criticalCount : undefined },
    { id: 'history', icon: Activity, label: 'History' },
    { id: 'terminal', icon: Terminal, label: 'Terminal' },
  ];

  const cycleTheme = () => {
    if (theme === 'solar-amber') {
      setTheme('lilac-clay');
    } else if (theme === 'lilac-clay') {
      setTheme('obsidian-tactical');
    } else {
      setTheme('solar-amber');
    }
  };

  return (
    <aside className="w-[72px] md:w-[78px] shrink-0 flex flex-col items-center py-6 px-2 justify-between bg-stone-900 text-stone-300 rounded-[30px] shadow-sm z-20">
      {/* Top Notification / Logo Icon */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => setActiveTab('dashboard')}
          aria-label="Sentinel Core Dashboard"
          className="w-11 h-11 rounded-2xl bg-stone-800 hover:bg-stone-700 transition-colors flex items-center justify-center text-amber-400"
          title="Sentinel Dashboard"
        >
          <Shield className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      {/* Main Navigation - Clean line icons */}
      <nav className="flex flex-col items-center gap-3 my-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative w-11 h-11 rounded-2xl transition-all flex items-center justify-center ${
                isActive
                  ? 'text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/80'
              }`}
              title={item.label}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute inset-0 rounded-2xl bg-amber-500 shadow-sm"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <span className="relative z-10">
                <Icon className="w-5 h-5 stroke-[1.8]" />
              </span>

              {item.badge !== undefined && (
                <span className="absolute top-1 right-1 z-20 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-stone-900" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={cycleTheme}
          aria-label="Switch visual theme"
          className="w-10 h-10 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors flex items-center justify-center"
          title="Toggle Color Theme"
        >
          <Palette className="w-4 h-4 stroke-[1.8]" />
        </button>
      </div>
    </aside>
  );
};
