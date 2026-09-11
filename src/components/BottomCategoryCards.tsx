'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  Shield,
  Users,
  Package,
  Network,
  FileText,
  MoreHorizontal,
} from 'lucide-react';
import { ServerRecord } from '../types/sentinel';

interface BottomCategoryCardsProps {
  server: ServerRecord;
  onOpenInspect: (category: string) => void;
  onOpenFixModal: (findingId?: string) => void;
}

export const BottomCategoryCards: React.FC<BottomCategoryCardsProps> = ({
  server,
  onOpenInspect,
}) => {
  const [activeGroup, setActiveGroup] = useState<'core' | 'more'>('core');
  const { checks, score } = server;

  const coreCards = [
    {
      id: 'ssh',
      title: 'SSH Hardening',
      sub: checks.ssh.running ? 'Daemon active • Port 22' : 'SSH Inactive',
      score: score.categories.ssh.score,
      max: score.categories.ssh.max,
      pct: Math.round((score.categories.ssh.score / score.categories.ssh.max) * 100),
      icon: Key,
      iconBg: 'bg-[#5b5299] text-white',
      badge: checks.ssh.permitRootLogin === 'no' ? 'Root disabled' : 'Root enabled',
      badgeBg: checks.ssh.permitRootLogin === 'no' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200',
    },
    {
      id: 'firewall',
      title: 'Firewall Rules',
      sub: checks.firewall.enabled ? `${checks.firewall.rules.length} active rules` : 'Firewall disabled',
      score: score.categories.firewall.score,
      max: score.categories.firewall.max,
      pct: Math.round((score.categories.firewall.score / score.categories.firewall.max) * 100),
      icon: Shield,
      iconBg: 'bg-[#5b5299] text-white',
      badge: checks.firewall.enabled ? 'UFW Active' : 'Disabled',
      badgeBg: checks.firewall.enabled ? 'bg-stone-100 text-stone-800 border border-stone-300' : 'bg-rose-50 text-rose-800 border border-rose-200',
    },
    {
      id: 'user',
      title: 'User Privileges',
      sub: `${checks.user.totalUsers} registered users`,
      score: score.categories.user.score,
      max: score.categories.user.max,
      pct: Math.round((score.categories.user.score / score.categories.user.max) * 100),
      icon: Users,
      iconBg: 'bg-[#5b5299] text-white',
      badge: `${checks.user.sudoUsers.length} sudoers`,
      badgeBg: 'bg-stone-100 text-stone-800 border border-stone-300',
    },
  ];

  const moreCards = [
    {
      id: 'packages',
      title: 'Package Security',
      sub: `${checks.packages.updatesAvailable} updates available`,
      score: score.categories.package.score,
      max: score.categories.package.max,
      pct: Math.round((score.categories.package.score / score.categories.package.max) * 100),
      icon: Package,
      iconBg: 'bg-[#5b5299] text-white',
      badge: checks.packages.securityUpdates > 0 ? `${checks.packages.securityUpdates} CVEs` : 'Clean',
      badgeBg: checks.packages.securityUpdates > 0 ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    },
    {
      id: 'network',
      title: 'Network Ports',
      sub: `${checks.network.openPorts.length} open listeners`,
      score: score.categories.network.score,
      max: score.categories.network.max,
      pct: Math.round((score.categories.network.score / score.categories.network.max) * 100),
      icon: Network,
      iconBg: 'bg-[#5b5299] text-white',
      badge: checks.network.openPorts.some((p) => p.port === 3306) ? 'Port 3306' : 'Secure',
      badgeBg: 'bg-stone-100 text-stone-800 border border-stone-300',
    },
    {
      id: 'filePerms',
      title: 'File Permissions',
      sub: '/etc/shadow, sshd_config',
      score: score.categories.filePerms.score,
      max: score.categories.filePerms.max,
      pct: Math.round((score.categories.filePerms.score / score.categories.filePerms.max) * 100),
      icon: FileText,
      iconBg: 'bg-[#5b5299] text-white',
      badge: 'Protected',
      badgeBg: 'bg-stone-100 text-stone-800 border border-stone-300',
    },
  ];

  const currentCards = activeGroup === 'core' ? coreCards : moreCards;

  return (
    <div className="flex flex-col gap-2">
      {/* Category Toggle Bar: High contrast bold title */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-black uppercase tracking-wider text-stone-900">
          Security Modules
        </span>

        <div className="flex items-center gap-1 bg-stone-200/80 p-0.5 rounded-full text-xs font-bold">
          <button
            onClick={() => setActiveGroup('core')}
            className={`px-3 py-0.5 rounded-full transition-all cursor-pointer ${
              activeGroup === 'core'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            Core
          </button>
          <button
            onClick={() => setActiveGroup('more')}
            className={`px-3 py-0.5 rounded-full transition-all cursor-pointer ${
              activeGroup === 'more'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            System
          </button>
        </div>
      </div>

      {/* 3 Modular Cards: White cards with crystal-clear black text */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {currentCards.map((card) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.id}
              onClick={() => onOpenInspect(card.id)}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
              className="p-3.5 sm:p-4 bg-white border border-stone-200/90 rounded-[24px] shadow-sm hover:border-stone-400 cursor-pointer flex flex-col justify-between transition-all"
            >
              {/* Top Row: Circular Icon Pill & 3 Dots Menu matching reference */}
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center ${card.iconBg} shadow-sm`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>
                <button
                  aria-label="Card options"
                  className="text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Title and Subtitle in high contrast black */}
              <div className="mt-2.5">
                <h4 className="text-xs sm:text-sm font-black text-stone-950">
                  {card.title}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-stone-600 mt-0.5 font-semibold truncate">
                  {card.sub}
                </p>
              </div>

              {/* Progress Bar & Sub-info */}
              <div className="mt-2.5 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1 font-bold text-stone-600">
                  <span>Progress</span>
                  <span className="font-black text-stone-950">{card.pct}%</span>
                </div>

                {/* Progress Bar with smooth animation */}
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${card.pct}%` }}
                    transition={{ duration: 0.85, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      card.pct >= 90 ? 'bg-emerald-500' : card.pct >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />
                </div>

                {/* Bottom Badges */}
                <div className="flex items-center justify-between mt-2.5 text-[11px]">
                  <span className="text-stone-700 font-bold">
                    {card.score} / {card.max}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${card.badgeBg}`}>
                    {card.badge}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
