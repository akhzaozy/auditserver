import {
  SshCheck,
  FirewallCheck,
  UserCheck,
  PackageCheck,
  NetworkCheck,
  NginxCheck,
  FilePermissionCheck,
  SecurityScoreSummary,
} from '../types/sentinel';

export function calculateSecurityScore(
  ssh: SshCheck,
  firewall: FirewallCheck,
  user: UserCheck,
  packages: PackageCheck,
  network: NetworkCheck,
  nginx: NginxCheck,
  filePerms: FilePermissionCheck[]
): SecurityScoreSummary {
  // 1. SSH Security (Max 20)
  let sshScore = 0;
  if (ssh.running) sshScore += 3;
  if (ssh.pubkeyAuth === 'yes') sshScore += 4;
  if (ssh.passwordAuth === 'no') sshScore += 4;
  if (ssh.permitRootLogin === 'no') sshScore += 4;
  if (!ssh.emptyPasswordsAllowed) sshScore += 2;
  if (ssh.maxAuthTries <= 4) sshScore += 2;
  if (ssh.protocolSecure) sshScore += 1;
  // Penalty if default port 22 exposed to public
  if (ssh.exposedPublicly && ssh.port === 22) {
    sshScore = Math.max(0, sshScore - 2);
  }
  sshScore = Math.min(20, Math.max(0, sshScore));

  // 2. Firewall (Max 15)
  let firewallScore = 0;
  if (firewall.enabled) {
    firewallScore += 9;
    if (firewall.defaultIncoming === 'DROP' || firewall.defaultIncoming === 'REJECT') {
      firewallScore += 3;
    }
    // Check if dangerous ports are blocked
    const openDangerous = firewall.rules.some(
      (r) => (r.port === '3306' || r.port === '5432' || r.port === '6379') && r.action === 'ALLOW'
    );
    if (!openDangerous) {
      firewallScore += 3;
    }
  } else {
    firewallScore = 0; // Disabled firewall gets 0
  }
  firewallScore = Math.min(15, Math.max(0, firewallScore));

  // 3. User & Privilege Security (Max 15)
  let userScore = 15;
  // Penalty for multiple UID 0 users
  if (user.uid0Users > 1) {
    userScore -= 6;
  }
  // Penalty for too many sudo users
  if (user.sudoUsers.length > 4) {
    userScore -= 3;
  }
  // Penalty for inactive shell accounts
  if (user.inactiveUsers.length > 0) {
    userScore -= Math.min(3, user.inactiveUsers.length);
  }
  userScore = Math.min(15, Math.max(0, userScore));

  // 4. Package Security (Max 15)
  let packageScore = 15;
  if (packages.securityUpdates > 0) {
    // Critical penalty for pending security patches
    packageScore -= Math.min(9, packages.securityUpdates * 2);
  }
  if (packages.normalUpdates > 0) {
    packageScore -= Math.min(4, Math.floor(packages.normalUpdates / 3));
  }
  packageScore = Math.min(15, Math.max(0, packageScore));

  // 5. Network & Open Port Exposure (Max 15)
  let networkScore = 15;
  const exposedDbOrAdmin = network.openPorts.filter(
    (p) =>
      p.isExposed &&
      (p.port === 3306 || p.port === 5432 || p.port === 6379 || p.port === 27017 || p.port === 1010 || p.port === 8888)
  );
  if (exposedDbOrAdmin.length > 0) {
    networkScore -= exposedDbOrAdmin.length * 4;
  }
  networkScore = Math.min(15, Math.max(0, networkScore));

  // 6. Web Server Security (Max 10)
  let nginxScore = 10;
  if (nginx.installed) {
    if (!nginx.httpsConfigured) nginxScore -= 3;
    if (!nginx.httpRedirect) nginxScore -= 2;
    if (!nginx.headers.xFrameOptions) nginxScore -= 1;
    if (!nginx.headers.xContentTypeOptions) nginxScore -= 1;
    if (!nginx.headers.contentSecurityPolicy) nginxScore -= 1;
    if (!nginx.headers.strictTransportSecurity) nginxScore -= 1;
    if (!nginx.headers.referrerPolicy) nginxScore -= 1;
  } else {
    // If not a webserver, award baseline points
    nginxScore = 10;
  }
  nginxScore = Math.min(10, Math.max(0, nginxScore));

  // 7. File Permissions (Max 10)
  let fileScore = 10;
  filePerms.forEach((fp) => {
    if (!fp.isSecure) {
      fileScore -= 3;
    }
  });
  fileScore = Math.min(10, Math.max(0, fileScore));

  const total = sshScore + firewallScore + userScore + packageScore + networkScore + nginxScore + fileScore;

  let status: SecurityScoreSummary['status'] = 'GOOD';
  if (total >= 90) status = 'EXCELLENT';
  else if (total >= 80) status = 'GOOD';
  else if (total >= 65) status = 'FAIR';
  else if (total >= 50) status = 'POOR';
  else status = 'CRITICAL';

  return {
    total,
    status,
    categories: {
      ssh: { score: sshScore, max: 20, weightLabel: '20 pts' },
      firewall: { score: firewallScore, max: 15, weightLabel: '15 pts' },
      user: { score: userScore, max: 15, weightLabel: '15 pts' },
      package: { score: packageScore, max: 15, weightLabel: '15 pts' },
      network: { score: networkScore, max: 15, weightLabel: '15 pts' },
      nginx: { score: nginxScore, max: 10, weightLabel: '10 pts' },
      filePerms: { score: fileScore, max: 10, weightLabel: '10 pts' },
    },
  };
}
