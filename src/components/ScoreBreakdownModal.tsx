'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, Award } from 'lucide-react';
import { ServerRecord } from '../types/sentinel';

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: ServerRecord;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({
  isOpen,
  onClose,
  server,
}) => {
  if (!isOpen) return null;

  const { categories, total, status } = server.score;

  const categoryRows = [
    { label: 'SSH Security', score: categories.ssh.score, max: categories.ssh.max },
    { label: 'Firewall Status & Rules', score: categories.firewall.score, max: categories.firewall.max },
    { label: 'User & Privilege Security', score: categories.user.score, max: categories.user.max },
    { label: 'Package Security & CVEs', score: categories.package.score, max: categories.package.max },
    { label: 'Network & Port Exposure', score: categories.network.score, max: categories.network.max },
    { label: 'Web Server / Nginx Security', score: categories.nginx.score, max: categories.nginx.max },
    { label: 'File Permissions Integrity', score: categories.filePerms.score, max: categories.filePerms.max },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-[var(--card-border)] flex items-center justify-between bg-[var(--panel-bg)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                Formula & Weights
              </span>
              <h3 className="text-base font-extrabold text-[var(--text-main)]">
                Security Score Breakdown
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close score breakdown"
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Big Score Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
              Composite Integrity Rating
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-4xl font-black text-amber-500 tracking-tight">
                {total}
              </span>
              <span className="text-sm font-bold text-stone-400">/ 100</span>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 uppercase tracking-wider">
              {status}
            </span>
          </div>

          {/* Table Breakdown */}
          <div className="flex flex-col divide-y divide-[var(--card-border)] text-xs">
            {categoryRows.map((cat, idx) => {
              const pct = (cat.score / cat.max) * 100;

              return (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-stone-600 dark:text-stone-300">
                    {cat.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-[var(--text-main)] w-10 text-right">
                      {cat.score}/{cat.max}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="pt-3 flex items-center justify-between font-black text-sm text-[var(--text-main)]">
              <span>TOTAL SECURITY SCORE</span>
              <span className="font-mono text-amber-500 text-base">{total} / 100</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--card-border)] bg-[var(--panel-bg)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-all"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
};
