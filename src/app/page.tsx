'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { OverviewCard } from '@/components/OverviewCard';
import { ActionCards } from '@/components/ActionCards';
import { BottomCategoryCards } from '@/components/BottomCategoryCards';
import { ServerListSidebar } from '@/components/ServerListSidebar';
import { OneClickFixModal } from '@/components/OneClickFixModal';
import { AddServerModal } from '@/components/AddServerModal';
import { CategoryInspectModal } from '@/components/CategoryInspectModal';
import { ScoreBreakdownModal } from '@/components/ScoreBreakdownModal';
import { LiveTerminalTab } from '@/components/LiveTerminalTab';
import { AuditHistoryTab } from '@/components/AuditHistoryTab';
import { initialServers } from '@/data/mockServers';
import { ServerRecord } from '@/types/sentinel';
import { calculateSecurityScore } from '@/utils/scoreCalculator';
import { Key, Shield, Users, Package, Network, Globe, FileText, WifiOff } from 'lucide-react';

export default function SentinelDashboardPage() {
  const [servers, setServers] = useState<ServerRecord[]>(initialServers);
  const [activeServerId, setActiveServerId] = useState<string>('stb-production');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<string>('solar-amber');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  // Modals state
  const [isFixModalOpen, setIsFixModalOpen] = useState<boolean>(false);
  const [targetFixFindingId, setTargetFixFindingId] = useState<string | undefined>(undefined);
  const [isAddServerOpen, setIsAddServerOpen] = useState<boolean>(false);
  const [inspectCategory, setInspectCategory] = useState<string | null>(null);
  const [isScoreBreakdownOpen, setIsScoreBreakdownOpen] = useState<boolean>(false);

  // Sync theme with HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Active server instance
  const activeServer = servers.find((s) => s.id === activeServerId) || servers[0];

  // Critical findings count across current server
  const criticalCount = activeServer.findings.filter((f) => f.severity === 'CRITICAL').length;

  // Handle instant telemetry scan
  const handleInstantAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setServers((prev) =>
        prev.map((s) =>
          s.id === activeServer.id
            ? {
                ...s,
                lastAudit: 'Just now',
                history: [
                  ...s.history,
                  {
                    id: `h-${Date.now()}`,
                    date: 'Today',
                    score: s.score.total,
                    timestamp: Date.now(),
                    checksRun: s.status === 'offline' ? 0 : 36,
                    criticalIssues: s.findings.filter((f) => f.severity === 'CRITICAL').length,
                  },
                ],
              }
            : s
        )
      );
    }, 1200);
  };

  // Handle successful fix remediation
  const handleApplyFixSuccess = (findingId: string, updatedChecks: ServerRecord['checks']) => {
    setServers((prev) =>
      prev.map((s) => {
        if (s.id !== activeServer.id) return s;

        const newScore = calculateSecurityScore(
          updatedChecks.ssh,
          updatedChecks.firewall,
          updatedChecks.user,
          updatedChecks.packages,
          updatedChecks.network,
          updatedChecks.nginx,
          updatedChecks.filePerms
        );

        const newFindings = s.findings.filter((f) => f.id !== findingId);

        return {
          ...s,
          checks: updatedChecks,
          score: newScore,
          findings: newFindings,
          lastAudit: 'Just now (Remediated)',
          history: [
            ...s.history,
            {
              id: `h-fix-${Date.now()}`,
              date: 'Today',
              score: newScore.total,
              timestamp: Date.now(),
              checksRun: 36,
              criticalIssues: newFindings.filter((f) => f.severity === 'CRITICAL').length,
            },
          ],
        };
      })
    );
  };

  // Handle new server registration
  const handleServerAdded = (newServer: ServerRecord) => {
    setServers((prev) => [newServer, ...prev]);
    setActiveServerId(newServer.id);
  };

  return (
    <main className="h-screen w-screen overflow-hidden p-2 sm:p-3 md:p-3.5 flex items-center justify-center bg-[var(--canvas-bg)]">
      {/* Outer Shell Canvas Container - Fixed screen viewport matching reference */}
      <div className="w-full max-w-[1720px] h-full max-h-[100vh] rounded-[30px] bg-[var(--panel-bg)] border border-[var(--card-border)] shadow-md p-3 md:p-3.5 flex flex-row items-stretch gap-3.5 overflow-hidden">
        {/* FAR LEFT: Vertical Pill Sidebar anchored to the far left border */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          setTheme={setTheme}
          criticalCount={criticalCount}
        />

        {/* WORKSPACE AREA TO THE RIGHT OF SIDEBAR */}
        <div className="flex-1 flex flex-col gap-2 min-w-0 h-full overflow-hidden">
          {/* Header Bar */}
          <Header
            servers={servers}
            activeServer={activeServer}
            setActiveServerId={setActiveServerId}
            onOpenAddServer={() => setIsAddServerOpen(true)}
            onInstantAudit={handleInstantAudit}
            isAuditing={isAuditing}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Body: Main Center Content + Far Right Server Fleet Sidebar */}
          <div className="flex-1 flex flex-col xl:flex-row gap-3.5 min-h-0 overflow-hidden">
            {/* Center Stage - fits perfectly inside 100vh */}
            <div className="flex-1 flex flex-col justify-between gap-2.5 min-h-0 overflow-hidden pr-0.5">
              {activeTab === 'dashboard' && (
                <div className="flex flex-col justify-between h-full gap-2.5 overflow-hidden">
                  {/* Offline Warning Banner if Server FSTI is selected */}
                  {activeServer.status === 'offline' && (
                    <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between text-rose-600 shrink-0">
                      <div className="flex items-center gap-2">
                        <WifiOff className="w-4 h-4 animate-pulse" />
                        <div>
                          <strong className="text-xs font-black block">SERVER DOWN: {activeServer.name}</strong>
                          <span className="text-[10px] text-stone-500">
                            Host {activeServer.hostname} is unreachable on port 22 and 443. Audit checks suspended.
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleInstantAudit}
                        className="px-2.5 py-1 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600"
                      >
                        Retry Probe
                      </button>
                    </div>
                  )}

                  {/* Upper Row: Hero Overview Card (65%) + 2 Action Cards (35%) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
                    <div className="lg:col-span-8 h-full min-h-0">
                      <OverviewCard
                        server={activeServer}
                        onOpenScoreBreakdown={() => setIsScoreBreakdownOpen(true)}
                      />
                    </div>
                    <div className="lg:col-span-4 h-full min-h-0">
                      <ActionCards
                        server={activeServer}
                        onInstantAudit={handleInstantAudit}
                        isAuditing={isAuditing}
                        onOpenFixModal={(fId) => {
                          setTargetFixFindingId(fId);
                          setIsFixModalOpen(true);
                        }}
                        onOpenInspect={(cat) => setInspectCategory(cat)}
                      />
                    </div>
                  </div>

                  {/* Bottom Row: 3 Modular Cards */}
                  <div className="shrink-0">
                    <BottomCategoryCards
                      server={activeServer}
                      onOpenInspect={(cat) => setInspectCategory(cat)}
                      onOpenFixModal={(fId) => {
                        setTargetFixFindingId(fId);
                        setIsFixModalOpen(true);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Audit Vectors Tab */}
              {activeTab === 'vectors' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-4"
                >
                  <div className="p-6 rounded-[28px] bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-extrabold text-[var(--text-main)]">
                        Comprehensive Security Vector Audit
                      </h2>
                      <p className="text-xs text-stone-400 mt-1">
                        Real-time inspection of 8 core hardening vectors on <span className="font-mono text-amber-500 font-bold">{activeServer.hostname}</span>
                      </p>
                    </div>
                    <button
                      onClick={handleInstantAudit}
                      className="px-4 py-2 rounded-2xl bg-amber-500 text-stone-950 font-bold text-xs shadow-md hover:bg-amber-400"
                    >
                      Refresh All Vectors
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { id: 'ssh', name: 'SSH Protocol & Auth', score: activeServer.score.categories.ssh.score, max: 20, icon: Key, status: activeServer.checks.ssh.permitRootLogin === 'no' ? 'Secure' : 'Warning' },
                      { id: 'firewall', name: 'Firewall Filtering', score: activeServer.score.categories.firewall.score, max: 15, icon: Shield, status: activeServer.checks.firewall.enabled ? 'Active' : 'Disabled' },
                      { id: 'user', name: 'User Accounts & Sudo', score: activeServer.score.categories.user.score, max: 15, icon: Users, status: `${activeServer.checks.user.sudoUsers.length} Sudo` },
                      { id: 'packages', name: 'Package CVE Patches', score: activeServer.score.categories.package.score, max: 15, icon: Package, status: `${activeServer.checks.packages.securityUpdates} CVEs` },
                      { id: 'network', name: 'Network Port Exposure', score: activeServer.score.categories.network.score, max: 15, icon: Network, status: `${activeServer.checks.network.openPorts.length} Ports` },
                      { id: 'nginx', name: 'Nginx & TLS Headers', score: activeServer.score.categories.nginx.score, max: 10, icon: Globe, status: activeServer.checks.nginx.installed ? 'Configured' : 'N/A' },
                      { id: 'filePerms', name: 'System File Permissions', score: activeServer.score.categories.filePerms.score, max: 10, icon: FileText, status: activeServer.checks.filePerms.every(f => f.isSecure) ? 'Clean' : 'Alert' },
                    ].map((v) => {
                      const Icon = v.icon;
                      return (
                        <div
                          key={v.id}
                          onClick={() => setInspectCategory(v.id)}
                          className="clay-box p-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl cursor-pointer hover:border-amber-500/40 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black font-mono text-[var(--text-main)]">
                              {v.score}/{v.max}
                            </span>
                          </div>
                          <div className="mt-4">
                            <h4 className="text-sm font-extrabold text-[var(--text-main)]">{v.name}</h4>
                            <span className="text-[10px] font-bold text-stone-400 uppercase mt-1 block">
                              {v.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Audit History Tab */}
              {activeTab === 'history' && <AuditHistoryTab server={activeServer} />}

              {/* Live Terminal Tab */}
              {activeTab === 'terminal' && (
                <LiveTerminalTab
                  server={activeServer}
                  onInstantAudit={handleInstantAudit}
                  onApplyFixSuccess={handleApplyFixSuccess}
                />
              )}

              {/* Fleet Tab */}
              {activeTab === 'fleet' && (
                <div className="p-6 rounded-[28px] bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-extrabold text-[var(--text-main)]">
                      Production Linux Nodes ({servers.length})
                    </h2>
                    <button
                      onClick={() => setIsAddServerOpen(true)}
                      className="px-4 py-2 rounded-2xl bg-amber-500 text-stone-950 text-xs font-bold shadow-md hover:bg-amber-400"
                    >
                      + Add New Node
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {servers.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setActiveServerId(s.id);
                          setActiveTab('dashboard');
                        }}
                        className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                          s.status === 'offline'
                            ? 'bg-rose-500/5 border-rose-500/30 hover:border-rose-500'
                            : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-amber-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-[var(--text-main)]">{s.name}</span>
                          <span className={`text-xs font-black ${s.status === 'offline' ? 'text-rose-500' : 'text-amber-500'}`}>
                            {s.status === 'offline' ? 'DOWN (0/100)' : `${s.score.total}/100`}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-stone-400 mt-1">{s.hostname}</p>
                        <div className="mt-4 pt-3 border-t border-[var(--card-border)] flex items-center justify-between text-[11px] text-stone-500">
                          <span>OS: {s.os.split(' ')[0]}</span>
                          <span className={s.status === 'offline' ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
                            {s.status === 'offline' ? '🔴 Unreachable' : '● Online'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* FAR RIGHT: Server Fleet Sidebar with Topology Mesh */}
            <ServerListSidebar
              servers={servers}
              activeServer={activeServer}
              setActiveServerId={setActiveServerId}
              onOpenAddServer={() => setIsAddServerOpen(true)}
              onInstantAudit={handleInstantAudit}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <OneClickFixModal
        isOpen={isFixModalOpen}
        onClose={() => setIsFixModalOpen(false)}
        server={activeServer}
        targetFindingId={targetFixFindingId}
        onApplyFixSuccess={handleApplyFixSuccess}
      />

      <AddServerModal
        isOpen={isAddServerOpen}
        onClose={() => setIsAddServerOpen(false)}
        onServerAdded={handleServerAdded}
      />

      <CategoryInspectModal
        isOpen={inspectCategory !== null}
        onClose={() => setInspectCategory(null)}
        category={inspectCategory || ''}
        server={activeServer}
        onOpenFixModal={(fId) => {
          setInspectCategory(null);
          setTargetFixFindingId(fId);
          setIsFixModalOpen(true);
        }}
      />

      <ScoreBreakdownModal
        isOpen={isScoreBreakdownOpen}
        onClose={() => setIsScoreBreakdownOpen(false)}
        server={activeServer}
      />
    </main>
  );
}
