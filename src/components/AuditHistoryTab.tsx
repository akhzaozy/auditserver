'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ServerRecord } from '../types/sentinel';

interface AuditHistoryTabProps {
  server: ServerRecord;
}

export const AuditHistoryTab: React.FC<AuditHistoryTabProps> = ({ server }) => {
  const history = server.history;

  return (
    <div className="flex flex-col gap-6">
      {/* Title Card */}
      <div className="p-6 rounded-[28px] bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
            Telemetry Timeline
          </span>
          <h2 className="text-xl font-extrabold text-[var(--text-main)]">
            Audit History & Hardening Trajectory
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Historical security posture tracking for {server.name} ({server.hostname})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
            <span className="text-[10px] font-bold text-stone-400 uppercase block">Total Audits</span>
            <span className="text-base font-black text-amber-500">{history.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-[10px] font-bold text-stone-400 uppercase block">Score Gain</span>
            <span className="text-base font-black text-emerald-600">
              +{server.score.total - (history[0]?.score || 70)} Pts
            </span>
          </div>
        </div>
      </div>

      {/* History Table & Progression */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Timeline List */}
        <div className="p-6 rounded-[28px] bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm flex flex-col gap-3">
          <h3 className="text-sm font-extrabold text-[var(--text-main)] mb-1">
            Chronological Audit Records
          </h3>

          <div className="flex flex-col divide-y divide-[var(--card-border)]">
            {history.map((entry, idx) => (
              <div key={entry.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 font-black text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-main)] block">
                      {entry.date}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {entry.checksRun || 36} Checks Evaluated
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-base font-black ${
                    entry.score >= 85 ? 'text-emerald-500' : entry.score >= 70 ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {entry.score}/100
                  </span>
                  <span className="text-[10px] text-stone-400 block font-semibold">
                    {entry.criticalIssues || 0} Critical
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Key Milestones */}
        <div className="p-6 rounded-[28px] bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-main)] mb-3">
              Security Milestones & Hardening Actions
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-main)]">
                    SSH Public Key Enforced (Score +8)
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    Password authentication disabled, root login restricted to pubkey only.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-main)]">
                    UFW Firewall Default Drop Configured (Score +15)
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    Port 3306 & administrative aaPanel locked down from external 0.0.0.0.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-main)]">
                    Next Recommended Hardening: OpenSSL Patches
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    Applying 2 pending security updates will elevate server score to 91/100.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
            <strong>Audit Cadence:</strong> Sentinel agent transmits automated security reports every 6 hours via systemd timer.
          </div>
        </div>
      </div>
    </div>
  );
};
