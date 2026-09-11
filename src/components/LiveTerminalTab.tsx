'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TermIcon, Play, RefreshCw, CheckCircle, Shield, Wifi, WifiOff, AlertTriangle, Scale, Zap } from 'lucide-react';
import { ServerRecord } from '../types/sentinel';

interface LiveTerminalTabProps {
  server: ServerRecord;
  onInstantAudit: () => void;
  onApplyFixSuccess: (findingId: string, updatedChecks: ServerRecord['checks']) => void;
}

export const LiveTerminalTab: React.FC<LiveTerminalTabProps> = ({
  server,
  onInstantAudit,
  onApplyFixSuccess,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [history, setHistory] = useState<string[]>([
    '============================================================',
    'Sentinel Linux Security Agent & Remote Terminal (v1.4.2)',
    'Connected to Sentinel Fleet Control Node',
    'Configured Targets:',
    '  [1] STB Production : xxxxx.akhzafachrozy.my.id (ONLINE)',
    '  [2] Server FSTI    : xxxxx.myst-tech.com (DOWN / OFFLINE 🔴)',
    '============================================================',
    'Type "help" or click any quick command below.',
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = async (cmdToRun?: string) => {
    const cmd = (cmdToRun || inputVal).trim();
    if (!cmd) return;

    setHistory((prev) => [...prev, `sentinel@fleet-node:~# ${cmd}`]);
    setInputVal('');

    if (cmd === 'clear') {
      setHistory([]);
      return;
    }

    if (cmd === 'help') {
      setHistory((prev) => [
        ...prev,
        'Available Sentinel Terminal Commands:',
        '  ssh xxxxx.akhzafachrozy.my.id           - Connect to STB remote server via SSH',
        '  ssh xxxxx.myst-tech.com                 - Probe SSH connection to FSTI server',
        '  ping xxxxx.akhzafachrozy.my.id          - Check ICMP latency and uptime for STB',
        '  ping xxxxx.myst-tech.com                - Diagnose FSTI server down status',
        '  sentinel lb status                      - View Smart Load Balancer status & auto-scaling',
        '  sentinel stress test                    - Simulate HTTP surge & trigger auto load balancing',
        '  sentinel audit                          - Run live 8-vector security audit on active host',
        '  sentinel status                         - View live fleet topology status',
        '  clear                                   - Clear terminal buffer',
      ]);
      return;
    }

    setIsExecuting(true);

    try {
      const res = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: cmd,
          activeServerId: server.id,
        }),
      });

      const data = await res.json();
      if (data.output && Array.isArray(data.output)) {
        setHistory((prev) => [...prev, ...data.output]);
      }
    } catch (err) {
      setHistory((prev) => [...prev, `[ERROR] Failed to execute command: ${err}`]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Quick Action Bar for Real User Servers */}
      <div className="flex flex-col gap-2.5 p-4 rounded-[28px] bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TermIcon className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-main)]">
                Sentinel Remote Terminal & Diagnostics
              </h3>
              <p className="text-[11px] text-stone-400">
                Direct diagnostic shell targeting <span className="font-mono text-amber-500 font-bold">xxxxx.akhzafachrozy.my.id</span> and <span className="font-mono text-rose-500 font-bold">xxxxx.myst-tech.com</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              STB Active
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              FSTI Down
            </span>
          </div>
        </div>

        {/* Quick Command Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--card-border)]">
          <button
            onClick={() => handleCommand('ssh xxxxx.akhzafachrozy.my.id')}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-bold text-amber-600 hover:bg-amber-500 hover:text-stone-950 transition-all"
          >
            ssh xxxxx.akhzafachrozy.my.id
          </button>
          <button
            onClick={() => handleCommand('ping xxxxx.akhzafachrozy.my.id')}
            className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-mono font-semibold text-stone-600 dark:text-stone-300 hover:border-amber-500 border border-[var(--card-border)] transition-all"
          >
            ping STB
          </button>
          <button
            onClick={() => handleCommand('ping xxxxx.myst-tech.com')}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-mono font-bold text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
          >
            ping FSTI (Down)
          </button>
          <button
            onClick={() => handleCommand('ssh xxxxx.myst-tech.com')}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-mono font-bold text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
          >
            ssh FSTI
          </button>
          <button
            onClick={() => handleCommand('sentinel lb status')}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500 hover:text-stone-950 transition-all flex items-center gap-1"
          >
            <Scale className="w-3 h-3" />
            sentinel lb status
          </button>
          <button
            onClick={() => handleCommand('sentinel stress test')}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-mono font-bold text-rose-600 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1"
          >
            <Zap className="w-3 h-3 fill-current" />
            sentinel stress test
          </button>
          <button
            onClick={() => handleCommand('sentinel audit')}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            sentinel audit
          </button>
          <button
            onClick={() => handleCommand('sentinel status')}
            className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-mono font-semibold text-stone-600 dark:text-stone-300 hover:border-amber-500 border border-[var(--card-border)] transition-all"
          >
            sentinel status
          </button>
        </div>
      </div>

      {/* Terminal Canvas */}
      <div className="relative rounded-[28px] bg-stone-950 border border-stone-800 p-5 shadow-2xl flex flex-col h-[520px] font-mono text-xs text-emerald-400">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800/80 mb-3 text-stone-500 text-[11px]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-stone-400 font-bold">sentinel-fleet-shell (bash 5.2)</span>
          </div>
          <span>fleet-controller@sentinel-mesh</span>
        </div>

        {/* Terminal Log Output */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-2">
          {history.map((line, i) => (
            <div key={i} className="leading-relaxed whitespace-pre-wrap">
              {line.startsWith('sentinel@') ? (
                <span className="text-amber-400 font-bold">{line}</span>
              ) : line.includes('DOWN') || line.includes('UNREACHABLE') || line.includes('timed out') || line.includes('FATAL') ? (
                <span className="text-rose-400 font-semibold">{line}</span>
              ) : line.includes('SUCCESS') || line.includes('✓') || line.includes('ONLINE') ? (
                <span className="text-emerald-400 font-semibold">{line}</span>
              ) : line.includes('WARN') || line.includes('Score:') ? (
                <span className="text-amber-300 font-semibold">{line}</span>
              ) : (
                <span className="text-stone-300">{line}</span>
              )}
            </div>
          ))}
          {isExecuting && (
            <div className="text-amber-400 flex items-center gap-2 pt-1">
              <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>Transmitting packet probe to remote socket...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Prompt */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommand();
          }}
          className="mt-3 pt-3 border-t border-stone-800 flex items-center gap-2"
        >
          <span className="text-amber-400 font-bold">sentinel@fleet-node:~#</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type 'ssh xxxxx.akhzafachrozy.my.id' or 'sentinel audit'..."
            className="flex-1 bg-transparent text-emerald-300 focus:outline-none text-xs font-mono"
            disabled={isExecuting}
          />
          <button
            type="submit"
            disabled={isExecuting}
            aria-label="Send command to terminal"
            className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-amber-400 transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        </form>
      </div>
    </div>
  );
};
