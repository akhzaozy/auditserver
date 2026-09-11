'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Key,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  X,
  Play,
  ArrowRight,
  HardDrive,
} from 'lucide-react';
import { ServerRecord } from '../types/sentinel';

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServerAdded: (newServer: ServerRecord) => void;
}

export const AddServerModal: React.FC<AddServerModalProps> = ({
  isOpen,
  onClose,
  onServerAdded,
}) => {
  const [serverName, setServerName] = useState('');
  const [hostname, setHostname] = useState('');
  const [ip, setIp] = useState('192.168.1.');
  const [os, setOs] = useState('Ubuntu 24.04 LTS');
  const [generatedToken] = useState(
    () => `sentinel_sec_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`
  );
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedRegister, setCopiedRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://auditsentinel.akhzafachrozy.my.id';
  const installCmd = `curl -fsSL ${currentHost}/api/agent/install.sh | sudo bash`;
  const registerCmd = `sentinel register --token ${generatedToken} --server ${currentHost} --name "${serverName || 'linux-server'}"`;

  const copyToClipboard = (text: string, type: 'install' | 'register') => {
    navigator.clipboard.writeText(text);
    if (type === 'install') {
      setCopiedInstall(true);
      setTimeout(() => setCopiedInstall(false), 2000);
    } else {
      setCopiedRegister(true);
      setTimeout(() => setCopiedRegister(false), 2000);
    }
  };

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serverName || 'Linux Node',
          hostname: hostname || 'srv-node',
          ip: ip || '192.168.1.100',
          os,
        }),
      });

      const data = await res.json();
      if (data.success && data.server) {
        onServerAdded(data.server);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-xl bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--card-border)] flex items-center justify-between bg-[var(--panel-bg)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                Agent Enrollment
              </span>
              <h3 className="text-lg font-extrabold text-[var(--text-main)]">
                Connect New Linux Server
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close add server dialog"
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreateServer} className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">
                Server Friendly Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. STB Production"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--panel-bg)] border border-[var(--card-border)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">
                Hostname
              </label>
              <input
                type="text"
                placeholder="e.g. stb-edge-arm64"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--panel-bg)] border border-[var(--card-border)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">
                IP Address
              </label>
              <input
                type="text"
                placeholder="192.168.1.50"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--panel-bg)] border border-[var(--card-border)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">
                Linux Distribution
              </label>
              <select
                value={os}
                onChange={(e) => setOs(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--panel-bg)] border border-[var(--card-border)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Ubuntu 24.04 LTS">Ubuntu 24.04 / 22.04 LTS</option>
                <option value="Debian GNU/Linux 12">Debian GNU/Linux 12</option>
                <option value="Armbian (STB Server)">Armbian Linux (STB Server)</option>
                <option value="CentOS / Rocky Linux 9">CentOS / Rocky Linux 9</option>
                <option value="Arch Linux">Arch Linux</option>
              </select>
            </div>
          </div>

          {/* Generated Agent Token */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-600 block">
                  Generated Agent Token
                </span>
                <span className="font-mono text-xs font-bold text-[var(--text-main)]">
                  {generatedToken}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Ready
            </span>
          </div>

          {/* Step 1: Install command */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                1. Install Agent on Target Host:
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(installCmd, 'install')}
                className="text-xs font-bold text-amber-500 flex items-center gap-1 hover:underline"
              >
                {copiedInstall ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedInstall ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-3 rounded-2xl bg-stone-950 font-mono text-xs text-amber-300 border border-stone-800 break-all select-all">
              {installCmd}
            </div>
          </div>

          {/* Step 2: Register command */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                2. Register Agent:
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(registerCmd, 'register')}
                className="text-xs font-bold text-amber-500 flex items-center gap-1 hover:underline"
              >
                {copiedRegister ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRegister ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-3 rounded-2xl bg-stone-950 font-mono text-xs text-emerald-300 border border-stone-800 break-all select-all">
              {registerCmd}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="mt-2 pt-4 border-t border-[var(--card-border)] flex items-center justify-between">
            <span className="text-[11px] text-stone-400">
              Agent runs natively via Bash + systemd (zero Docker).
            </span>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 text-stone-950 text-xs font-black flex items-center gap-2 shadow-[0_4px_14px_rgba(245,158,11,0.3)] hover:bg-amber-400 transition-all"
            >
              <span>{isSubmitting ? 'Registering...' : 'Complete & Connect'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
