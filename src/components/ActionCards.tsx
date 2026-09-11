'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Wrench } from 'lucide-react';
import { ServerRecord } from '../types/sentinel';

interface ActionCardsProps {
  server: ServerRecord;
  onInstantAudit: () => void;
  isAuditing: boolean;
  onOpenFixModal: (findingId?: string) => void;
  onOpenInspect: (category: string) => void;
}

export const ActionCards: React.FC<ActionCardsProps> = ({
  server,
  onInstantAudit,
  isAuditing,
  onOpenFixModal,
}) => {
  const fixableCount = server.findings.filter((f) => f.fixable).length;

  return (
    <div className="flex flex-col gap-3.5 h-full justify-between">
      {/* Top Card: Soft Indigo/Purple Clay Card matching reference "Daily Jogging" */}
      <motion.div
        onClick={onInstantAudit}
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="group rounded-[24px] p-4 bg-[#4c447c] text-white shadow-sm cursor-pointer hover:shadow-md transition-all flex items-center justify-between flex-1"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0 group-hover:bg-white/25 transition-colors">
            <Play className={`w-4 h-4 fill-white stroke-none ${isAuditing ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Daily Audit
            </h3>
            <span className="text-[11px] text-stone-300 font-medium mt-0.5 block">
              {isAuditing ? 'Running probe...' : `Last: ${server.lastAudit}`}
            </span>
          </div>
        </div>

        <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0 group-hover:bg-white/25 transition-colors">
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </motion.div>

      {/* Bottom Card: Soft Coral/Rose Clay Card matching reference "My Jogging" */}
      <motion.div
        onClick={() => onOpenFixModal()}
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="group rounded-[24px] p-4 bg-[#ff6b8b] text-white shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col justify-between flex-1"
      >
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
            <Wrench className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-sm font-bold text-white">
            Quick Fix
          </span>
        </div>

        <div className="flex items-end justify-between mt-3">
          <div>
            <span className="text-[10px] font-medium text-rose-100 uppercase tracking-wider block">
              Pending Issues
            </span>
            <span className="text-xl font-black text-white">
              {fixableCount} Fixes
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-white text-[#ff6b8b] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
