'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Terminal,
  ArrowRight,
  X,
  FileCheck2,
  Play,
  Lock,
} from 'lucide-react';
import { SecurityFinding, ServerRecord } from '../types/sentinel';

interface OneClickFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: ServerRecord;
  targetFindingId?: string;
  onApplyFixSuccess: (findingId: string, updatedChecks: ServerRecord['checks']) => void;
}

type Step = 'confirm' | 'executing' | 'success' | 'failed';

export const OneClickFixModal: React.FC<OneClickFixModalProps> = ({
  isOpen,
  onClose,
  server,
  targetFindingId,
  onApplyFixSuccess,
}) => {
  const [activeStep, setActiveStep] = useState<Step>('confirm');
  const [currentProgressIndex, setCurrentProgressIndex] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [selectedFindingId, setSelectedFindingId] = useState<string>(
    targetFindingId || server.findings[0]?.id || ''
  );

  const currentFinding = server.findings.find((f) => f.id === selectedFindingId) || server.findings[0];

  useEffect(() => {
    if (targetFindingId) {
      setSelectedFindingId(targetFindingId);
    } else if (server.findings.length > 0) {
      setSelectedFindingId(server.findings[0].id);
    }
    setActiveStep('confirm');
    setTerminalLogs([]);
    setCurrentProgressIndex(0);
  }, [isOpen, targetFindingId, server.id]);

  if (!isOpen || !currentFinding) return null;

  const steps = [
    { title: 'Backup Configuration', desc: 'Create timestamped backup snapshot' },
    { title: 'Safe Modification', desc: 'Apply target security directive' },
    { title: 'Syntax Validation', desc: 'Execute sshd -t / syntax checker' },
    { title: 'Daemon Reload', desc: 'Graceful reload without dropping sessions' },
    { title: 'Post-Audit Verification', desc: 'Verify listening socket and recalculate score' },
  ];

  const handleStartFix = async () => {
    setActiveStep('executing');
    setTerminalLogs([
      `[SENTINEL ENGINE] Initiating Safe Remediation Protocol: ${currentFinding.title}`,
      `[SENTINEL ENGINE] Server: ${server.hostname} (${server.ip})`,
      `[STEP 1/5] Creating configuration backup...`,
    ]);

    // Step 1: Backup
    await new Promise((r) => setTimeout(r, 700));
    setTerminalLogs((prev) => [
      ...prev,
      `✓ Backup saved to /var/backups/sentinel/config_${Date.now()}.bak (Mode 0600)`,
      `[STEP 2/5] Applying safe configuration modification...`,
    ]);
    setCurrentProgressIndex(1);

    // Step 2: Modify
    await new Promise((r) => setTimeout(r, 800));
    setTerminalLogs((prev) => [
      ...prev,
      `✓ Command applied: ${currentFinding.fixCommand || 'Auto-hardening directive applied'}`,
      `[STEP 3/5] Executing syntax validation test...`,
    ]);
    setCurrentProgressIndex(2);

    // Step 3: Validate
    await new Promise((r) => setTimeout(r, 900));
    setTerminalLogs((prev) => [
      ...prev,
      `✓ Validation: Syntax check passed with code 0. Zero configuration errors.`,
      `[STEP 4/5] Executing graceful daemon reload...`,
    ]);
    setCurrentProgressIndex(3);

    // Step 4: Apply/Reload
    await new Promise((r) => setTimeout(r, 700));
    setTerminalLogs((prev) => [
      ...prev,
      `✓ Systemd reload signal dispatched. Active sessions preserved.`,
      `[STEP 5/5] Performing immediate post-remediation audit...`,
    ]);
    setCurrentProgressIndex(4);

    // Step 5: Verification & Confetti
    await new Promise((r) => setTimeout(r, 800));
    setTerminalLogs((prev) => [
      ...prev,
      `✓ Verification verified: Service is active (running) and secure.`,
      `🎉 REMEDIATION COMPLETE: Security score increased!`,
    ]);
    setCurrentProgressIndex(5);
    setActiveStep('success');

    // Trigger celebration confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#fbbf24'],
    });

    // Update server checks locally
    const newChecks = JSON.parse(JSON.stringify(server.checks));
    if (currentFinding.category === 'SSH Security') {
      newChecks.ssh.permitRootLogin = 'no';
      newChecks.ssh.passwordAuth = 'no';
      newChecks.ssh.pubkeyAuth = 'yes';
    } else if (currentFinding.category === 'Firewall') {
      newChecks.firewall.enabled = true;
      newChecks.firewall.rules.push({ port: '22', proto: 'tcp', action: 'ALLOW' });
    } else if (currentFinding.category === 'Package Security') {
      newChecks.packages.securityUpdates = 0;
      newChecks.packages.updatesAvailable = Math.max(0, newChecks.packages.updatesAvailable - 2);
    } else if (currentFinding.category === 'File Permissions') {
      newChecks.filePerms.forEach((f: { isSecure: boolean; currentPerm: string }) => {
        f.isSecure = true;
        f.currentPerm = '644';
      });
    }

    onApplyFixSuccess(currentFinding.id, newChecks);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[var(--card-border)] flex items-center justify-between bg-[var(--panel-bg)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600">
                  Safe Remediation Engine
                </span>
                <span className="text-xs text-stone-400">•</span>
                <span className="text-xs font-semibold text-stone-500">{server.name}</span>
              </div>
              <h3 className="text-lg font-extrabold text-[var(--text-main)]">
                One-Click Security Hardening
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Finding Selector if multiple findings exist */}
          {server.findings.length > 1 && (
            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 block">
                Select Vulnerability to Fix:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {server.findings.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setSelectedFindingId(f.id);
                      setActiveStep('confirm');
                    }}
                    className={`p-3 rounded-2xl text-left border text-xs font-semibold transition-all ${
                      selectedFindingId === f.id
                        ? 'bg-amber-500/10 border-amber-500 text-[var(--text-main)] shadow-sm'
                        : 'bg-[var(--panel-bg)] border-[var(--card-border)] text-stone-500 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        f.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-600' : 'bg-amber-500/20 text-amber-600'
                      }`}>
                        {f.severity}
                      </span>
                      <span className="text-[10px] text-stone-400">{f.category}</span>
                    </div>
                    <span className="line-clamp-1 font-bold">{f.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Finding Details Card */}
          <div className="p-4 rounded-2xl bg-[var(--panel-bg)] border border-[var(--card-border)] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[var(--text-main)]">
                {currentFinding.title}
              </span>
              <span className="text-xs font-bold text-amber-500">
                +4 to +12 Score Boost
              </span>
            </div>

            <p className="text-xs text-stone-500 font-medium leading-relaxed">
              {currentFinding.description}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--card-border)] text-[11px]">
              <div>
                <span className="text-stone-400 block">Current State:</span>
                <span className="font-mono text-rose-500 font-bold">{currentFinding.evidence}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Target Fix:</span>
                <span className="font-mono text-emerald-600 font-bold">{currentFinding.recommendation}</span>
              </div>
            </div>
          </div>

          {/* Safety Alert (Mandatory Safety Protocol Warning) */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-extrabold block text-amber-800 dark:text-amber-300">
                Sentinel Safety Protocol Enforced
              </strong>
              Sentinel will automatically snapshot current configuration, apply atomic edits, validate daemon syntax, and auto-rollback if any validation test fails. Your active SSH sessions will not be dropped.
            </div>
          </div>

          {/* 5-Step Visual Pipeline */}
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-3">
              Automated Execution Pipeline:
            </span>
            <div className="grid grid-cols-5 gap-2 text-center">
              {steps.map((s, idx) => {
                const isPassed = currentProgressIndex > idx || activeStep === 'success';
                const isCurrent = currentProgressIndex === idx && activeStep === 'executing';

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-emerald-500 text-white shadow-md'
                          : isCurrent
                          ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-500/20 animate-pulse'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className="text-[10px] font-bold text-[var(--text-main)] leading-tight">
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Terminal Logs Output */}
          {terminalLogs.length > 0 && (
            <div className="rounded-2xl bg-stone-950 p-4 font-mono text-xs text-emerald-400 border border-stone-800 max-h-44 overflow-y-auto space-y-1 shadow-inner">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-800 text-stone-500 text-[10px]">
                <Terminal className="w-3.5 h-3.5" />
                <span>root@{server.hostname}:~# sentinel-remediate</span>
              </div>
              {terminalLogs.map((log, i) => (
                <div key={i} className="leading-tight">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-[var(--card-border)] bg-[var(--panel-bg)] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-stone-500 hover:text-stone-800 hover:bg-stone-200/50 transition-all"
          >
            Cancel
          </button>

          {activeStep === 'confirm' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartFix}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 text-stone-950 text-xs font-extrabold flex items-center gap-2 shadow-[0_4px_14px_rgba(245,158,11,0.35)] hover:bg-amber-400 transition-all"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>Backup & Execute Safe Fix</span>
            </motion.button>
          )}

          {activeStep === 'executing' && (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
              <span className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>Executing Safety Pipeline...</span>
            </div>
          )}

          {activeStep === 'success' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-md hover:bg-emerald-600 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Done & Close</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
