'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  KeyRound,
  Flame,
  Users,
  Package,
  Network,
  Globe,
  FileCheck,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Wrench,
} from 'lucide-react';
import { ServerRecord } from '../types/sentinel';

interface CategoryInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  server: ServerRecord;
  onOpenFixModal: (findingId?: string) => void;
}

export const CategoryInspectModal: React.FC<CategoryInspectModalProps> = ({
  isOpen,
  onClose,
  category,
  server,
  onOpenFixModal,
}) => {
  if (!isOpen) return null;

  const { checks, score } = server;

  const renderContent = () => {
    switch (category) {
      case 'ssh':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-xs font-bold text-amber-600">SSH Security Score</span>
              <span className="text-sm font-black text-amber-600">{score.categories.ssh.score}/20 pts</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[var(--panel-bg)] border border-[var(--card-border)]">
                <span className="text-[10px] font-bold text-stone-400 uppercase block">PermitRootLogin</span>
                <span className={`text-xs font-black flex items-center gap-1 mt-1 ${checks.ssh.permitRootLogin === 'no' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {checks.ssh.permitRootLogin === 'no' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {checks.ssh.permitRootLogin}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--panel-bg)] border border-[var(--card-border)]">
                <span className="text-[10px] font-bold text-stone-400 uppercase block">PasswordAuthentication</span>
                <span className={`text-xs font-black flex items-center gap-1 mt-1 ${checks.ssh.passwordAuth === 'no' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {checks.ssh.passwordAuth === 'no' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {checks.ssh.passwordAuth}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--panel-bg)] border border-[var(--card-border)]">
                <span className="text-[10px] font-bold text-stone-400 uppercase block">PubkeyAuthentication</span>
                <span className="text-xs font-black text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {checks.ssh.pubkeyAuth}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--panel-bg)] border border-[var(--card-border)]">
                <span className="text-[10px] font-bold text-stone-400 uppercase block">SSH Port Exposure</span>
                <span className={`text-xs font-black flex items-center gap-1 mt-1 ${checks.ssh.port === 22 ? 'text-amber-500' : 'text-emerald-600'}`}>
                  {checks.ssh.port === 22 ? 'Port 22 (Default Exposed)' : `Port ${checks.ssh.port} (Custom)`}
                </span>
              </div>
            </div>

            {checks.ssh.permitRootLogin === 'yes' && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                <div className="text-xs text-rose-600 font-medium">
                  <strong>High Risk:</strong> Root SSH login is enabled.
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenFixModal();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600"
                >
                  Review Fix
                </button>
              </div>
            )}
          </div>
        );

      case 'firewall':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20">
              <span className="text-xs font-bold text-orange-600">Firewall Score</span>
              <span className="text-sm font-black text-orange-600">{score.categories.firewall.score}/15 pts</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--panel-bg)] border border-[var(--card-border)] text-xs font-bold">
              <span>Status</span>
              <span className={checks.firewall.enabled ? 'text-emerald-600' : 'text-rose-500'}>
                {checks.firewall.enabled ? `ENABLED (${checks.firewall.backend.toUpperCase()}) ✓` : 'DISABLED 🔴'}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 block">
                Active Inbound Rules
              </span>
              <div className="rounded-2xl border border-[var(--card-border)] overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[var(--panel-bg)] text-stone-400 font-bold border-b border-[var(--card-border)]">
                    <tr>
                      <th className="p-2.5">Port/Protocol</th>
                      <th className="p-2.5">Action</th>
                      <th className="p-2.5">Comment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--card-border)]">
                    {checks.firewall.rules.map((r, i) => (
                      <tr key={i} className="hover:bg-black/5 dark:hover:bg-white/5">
                        <td className="p-2.5 font-mono font-bold">{r.port}/{r.proto}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            r.action === 'ALLOW' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                          }`}>
                            {r.action}
                          </span>
                        </td>
                        <td className="p-2.5 text-stone-400">{r.comment || 'Rule'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'user':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <span className="text-xs font-bold text-blue-600">User Security Score</span>
              <span className="text-sm font-black text-blue-600">{score.categories.user.score}/15 pts</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-[var(--panel-bg)] border border-[var(--card-border)]">
                <span className="text-[10px] font-bold text-stone-400 uppercase block">Total Users</span>
                <span className="text-sm font-black text-[var(--text-main)]">{checks.user.totalUsers}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--panel-bg)] border border-[var(--card-border)]">
                <span className="text-[10px] font-bold text-stone-400 uppercase block">UID 0 Accounts</span>
                <span className="text-sm font-black text-emerald-600">{checks.user.uid0Users} ✓</span>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--panel-bg)] border border-[var(--card-border)]">
                <span className="text-[10px] font-bold text-stone-400 uppercase block">Sudo Members</span>
                <span className="text-sm font-black text-amber-500">{checks.user.sudoUsers.length}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 block">
                User Accounts Breakdown (/etc/passwd)
              </span>
              <div className="rounded-2xl border border-[var(--card-border)] overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[var(--panel-bg)] text-stone-400 font-bold border-b border-[var(--card-border)]">
                    <tr>
                      <th className="p-2">User</th>
                      <th className="p-2">UID</th>
                      <th className="p-2">Shell</th>
                      <th className="p-2">Sudo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--card-border)]">
                    {checks.user.usersList.map((u, i) => (
                      <tr key={i}>
                        <td className="p-2 font-mono font-bold text-[var(--text-main)]">{u.username}</td>
                        <td className="p-2 font-mono text-stone-400">{u.uid}</td>
                        <td className="p-2 font-mono text-stone-400 text-[11px]">{u.shell}</td>
                        <td className="p-2">
                          {u.sudo ? (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 text-[9px] font-bold">
                              Sudoer
                            </span>
                          ) : (
                            <span className="text-stone-400 text-[10px]">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'packages':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-xs font-bold text-emerald-600">Package Security Score</span>
              <span className="text-sm font-black text-emerald-600">{score.categories.package.score}/15 pts</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--panel-bg)] border border-[var(--card-border)] text-xs">
              <span className="font-bold">Pending Updates</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 font-bold text-[10px]">
                  {checks.packages.securityUpdates} Security CVEs
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-bold text-[10px]">
                  {checks.packages.normalUpdates} Standard
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--card-border)] overflow-hidden max-h-52 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--panel-bg)] text-stone-400 font-bold border-b border-[var(--card-border)]">
                  <tr>
                    <th className="p-2">Package</th>
                    <th className="p-2">Installed</th>
                    <th className="p-2">Available</th>
                    <th className="p-2">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {checks.packages.packages.map((pkg, i) => (
                    <tr key={i}>
                      <td className="p-2 font-mono font-bold text-[var(--text-main)]">{pkg.name}</td>
                      <td className="p-2 font-mono text-stone-400 text-[10px]">{pkg.currentVersion}</td>
                      <td className="p-2 font-mono text-emerald-600 text-[10px]">{pkg.newVersion}</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                          pkg.isSecurity ? 'bg-rose-500/20 text-rose-600' : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                        }`}>
                          {pkg.isSecurity ? 'Security 🔴' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'network':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-xs font-bold text-purple-600">Network Exposure Score</span>
              <span className="text-sm font-black text-purple-600">{score.categories.network.score}/15 pts</span>
            </div>

            <div className="flex flex-col gap-2">
              {checks.network.openPorts.map((p, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                    p.isExposed && (p.port === 3306 || p.port === 1010)
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-[var(--panel-bg)] border-[var(--card-border)]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-[var(--text-main)]">
                        {p.port} / {p.proto.toUpperCase()}
                      </span>
                      <span className="font-semibold text-stone-500">{p.service}</span>
                    </div>
                    <span className="text-[10px] text-stone-400">Binding: {p.binding}</span>
                    {p.recommendation && (
                      <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-1 font-medium">
                        ⚠ {p.recommendation}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    p.port === 3306 || p.port === 1010 ? 'bg-amber-500 text-stone-950' : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                  }`}>
                    {p.isExposed ? 'Exposed 0.0.0.0' : 'Internal'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'filePerms':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <span className="text-xs font-bold text-cyan-600">File Permissions Score</span>
              <span className="text-sm font-black text-cyan-600">{score.categories.filePerms.score}/10 pts</span>
            </div>

            <div className="flex flex-col gap-2">
              {checks.filePerms.map((fp, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                    fp.isSecure ? 'bg-[var(--panel-bg)] border-[var(--card-border)]' : 'bg-rose-500/10 border-rose-500/40'
                  }`}
                >
                  <div>
                    <span className="font-mono font-bold text-[var(--text-main)] block">{fp.path}</span>
                    <span className="text-[10px] text-stone-400">Owner: {fp.owner}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-black ${fp.isSecure ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {fp.currentPerm} {fp.isSecure ? '✓' : `(Recommend ${fp.recommendedPerm})`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="p-5 border-b border-[var(--card-border)] flex items-center justify-between bg-[var(--panel-bg)]">
          <h3 className="text-base font-extrabold text-[var(--text-main)] uppercase tracking-wider">
            Audit Vector: {category.toUpperCase()}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close category inspection"
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">{renderContent()}</div>

        <div className="p-4 border-t border-[var(--card-border)] bg-[var(--panel-bg)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-200/50 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
