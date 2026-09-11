import { NextResponse } from 'next/server';
import { getAllServers, updateServer } from '@/lib/serverStore';
import { SecurityFinding, ServerRecord } from '@/types/sentinel';
import { calculateSecurityScore } from '@/utils/scoreCalculator';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const token = request.headers.get('X-Sentinel-Token') || payload.token;

    const servers = getAllServers();
    const matched = servers.find((s) => s.token === token || s.id === payload.server_id);

    if (!matched) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid Agent Token or Server ID' },
        { status: 401 }
      );
    }

    const checks = payload.checks || matched.checks;

    // Dynamically generate security findings based on real audit checks
    const findings: SecurityFinding[] = [];

    // SSH checks
    if (checks.ssh) {
      if (checks.ssh.permitRootLogin === 'yes') {
        findings.push({
          id: `find-ssh-root-${Date.now()}`,
          title: 'Root SSH Login Enabled',
          severity: 'HIGH',
          category: 'SSH Security',
          description: 'Direct root login via SSH is enabled in sshd_config.',
          evidence: 'PermitRootLogin yes',
          recommendation: 'Disable PermitRootLogin in /etc/ssh/sshd_config.',
          fixable: true,
          fixKey: 'disable-root-ssh',
          fixCommand: 'sudo sed -i "s/^PermitRootLogin.*/PermitRootLogin no/" /etc/ssh/sshd_config && sudo sshd -t && sudo systemctl reload sshd',
        });
      }
      if (checks.ssh.passwordAuth === 'yes') {
        findings.push({
          id: `find-ssh-pass-${Date.now()}`,
          title: 'Password Authentication Enabled',
          severity: 'MEDIUM',
          category: 'SSH Security',
          description: 'SSH server allows password-based authentication, exposing it to brute force.',
          evidence: 'PasswordAuthentication yes',
          recommendation: 'Enforce SSH public key authentication and disable passwords.',
          fixable: true,
          fixKey: 'disable-password-auth',
          fixCommand: 'sudo sed -i "s/^PasswordAuthentication.*/PasswordAuthentication no/" /etc/ssh/sshd_config && sudo sshd -t && sudo systemctl reload sshd',
        });
      }
    }

    // Firewall checks
    if (checks.firewall && !checks.firewall.enabled) {
      findings.push({
        id: `find-fw-${Date.now()}`,
        title: 'Firewall is Disabled',
        severity: 'CRITICAL',
        category: 'Firewall',
        description: 'System firewall is currently disabled, leaving all listening ports unprotected.',
        evidence: 'Status: inactive',
        recommendation: 'Enable UFW with default incoming drop and allow port 22.',
        fixable: true,
        fixKey: 'enable-firewall-safe',
        fixCommand: 'sudo ufw default deny incoming && sudo ufw allow 22/tcp && sudo ufw --force enable',
      });
    }

    // File permissions
    if (checks.filePerms) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      checks.filePerms.forEach((fp: any) => {
        if (!fp.isSecure || fp.currentPerm === '777') {
          findings.push({
            id: `find-fp-${Date.now()}-${fp.path.replace(/\//g, '_')}`,
            title: `Insecure Permissions on ${fp.path}`,
            severity: 'CRITICAL',
            category: 'File Permissions',
            description: `File ${fp.path} has excessive permissions (${fp.currentPerm}), recommended is ${fp.recommendedPerm}.`,
            evidence: `Current: ${fp.currentPerm}, Recommended: ${fp.recommendedPerm}`,
            recommendation: `Change permissions using chmod ${fp.recommendedPerm} ${fp.path}`,
            fixable: true,
            fixKey: `fix-perm-${fp.path.replace(/\//g, '_')}`,
            fixCommand: `sudo chmod ${fp.recommendedPerm} ${fp.path}`,
          });
        }
      });
    }

    // Recalculate score
    const score = calculateSecurityScore(
      checks.ssh,
      checks.firewall,
      checks.user,
      checks.packages,
      checks.network,
      checks.nginx,
      checks.filePerms || []
    );

    const newHistory = [
      ...matched.history,
      {
        id: `h-${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        score: score.total,
        timestamp: Date.now(),
        checksRun: 36,
        criticalIssues: findings.filter((f) => f.severity === 'CRITICAL').length,
      },
    ];

    const updated = updateServer(matched.id, {
      hostname: payload.hostname || matched.hostname,
      os: payload.os || matched.os,
      kernel: payload.kernel || matched.kernel,
      cpu: payload.cpu || matched.cpu,
      memoryMb: payload.memoryMb || matched.memoryMb,
      diskUsagePercent: payload.diskUsagePercent ?? matched.diskUsagePercent,
      lastAudit: 'Just now',
      status: 'online',
      checks,
      score,
      findings,
      history: newHistory,
    });

    return NextResponse.json({
      success: true,
      message: 'Audit processed and score recalculated',
      server: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
