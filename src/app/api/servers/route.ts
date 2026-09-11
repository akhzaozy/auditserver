import { NextResponse } from 'next/server';
import { getAllServers, addServer } from '@/lib/serverStore';
import { ServerRecord } from '@/types/sentinel';
import { calculateSecurityScore } from '@/utils/scoreCalculator';

export async function GET() {
  const servers = getAllServers();
  return NextResponse.json({ success: true, servers });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, hostname, ip, os } = body;

    const token = `sentinel_sec_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
    const id = (name || hostname || 'server').toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const emptyChecks: ServerRecord['checks'] = {
      ssh: {
        running: true,
        permitRootLogin: 'yes',
        passwordAuth: 'yes',
        pubkeyAuth: 'no',
        port: 22,
        maxAuthTries: 6,
        emptyPasswordsAllowed: false,
        protocolSecure: true,
        exposedPublicly: true,
      },
      firewall: {
        enabled: false,
        backend: 'none',
        defaultIncoming: 'ALLOW',
        rules: [],
      },
      user: {
        totalUsers: 3,
        uid0Users: 1,
        sudoUsers: ['root'],
        inactiveUsers: [],
        noLoginUsers: 1,
        usersList: [{ username: 'root', uid: 0, shell: '/bin/bash', sudo: true, hasPassword: true }],
      },
      packages: {
        updatesAvailable: 5,
        securityUpdates: 2,
        normalUpdates: 3,
        packages: [],
      },
      network: {
        openPorts: [{ port: 22, proto: 'tcp', service: 'SSH', binding: '0.0.0.0', isExposed: true }],
      },
      nginx: {
        installed: false,
        httpsConfigured: false,
        httpRedirect: false,
        headers: {
          xFrameOptions: false,
          xContentTypeOptions: false,
          referrerPolicy: false,
          contentSecurityPolicy: false,
          strictTransportSecurity: false,
        },
      },
      filePerms: [
        { path: '/etc/shadow', currentPerm: '640', recommendedPerm: '640', owner: 'root:shadow', isSecure: true },
        { path: '/etc/ssh/sshd_config', currentPerm: '644', recommendedPerm: '644', owner: 'root:root', isSecure: true },
      ],
      services: [{ name: 'ssh', status: 'running', isRisky: false }],
    };

    const newServer: ServerRecord = {
      id,
      name: name || 'New Linux Host',
      hostname: hostname || 'linux-host',
      ip: ip || '127.0.0.1',
      os: os || 'Ubuntu Linux 24.04 LTS',
      kernel: '6.5.0-generic',
      cpu: 2,
      memoryMb: 4096,
      diskUsagePercent: 20,
      status: 'online',
      lastAudit: 'Just registered',
      token,
      agentVersion: 'v1.4.2',
      checks: emptyChecks,
      score: calculateSecurityScore(
        emptyChecks.ssh,
        emptyChecks.firewall,
        emptyChecks.user,
        emptyChecks.packages,
        emptyChecks.network,
        emptyChecks.nginx,
        emptyChecks.filePerms
      ),
      findings: [
        {
          id: `find-new-${Date.now()}`,
          title: 'Initial Audit Recommended',
          severity: 'MEDIUM',
          category: 'General',
          description: 'Server registered. Run sentinel audit to inspect real configuration.',
          evidence: 'Awaiting first telemetry heartbeat.',
          recommendation: 'Run `sentinel audit` on the target host.',
          fixable: false,
        },
      ],
      history: [
        {
          id: `h-init-${Date.now()}`,
          date: 'Today',
          score: 55,
          timestamp: Date.now(),
          checksRun: 15,
          criticalIssues: 1,
        },
      ],
    };

    addServer(newServer);
    return NextResponse.json({ success: true, server: newServer });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
