export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface SshCheck {
  running: boolean;
  permitRootLogin: 'no' | 'yes' | 'without-password';
  passwordAuth: 'no' | 'yes';
  pubkeyAuth: 'yes' | 'no';
  port: number;
  maxAuthTries: number;
  emptyPasswordsAllowed: boolean;
  protocolSecure: boolean;
  exposedPublicly: boolean;
}

export interface FirewallRule {
  port: string;
  proto: 'tcp' | 'udp';
  action: 'ALLOW' | 'BLOCKED';
  comment?: string;
}

export interface FirewallCheck {
  enabled: boolean;
  backend: 'ufw' | 'firewalld' | 'nftables' | 'none';
  defaultIncoming: 'DROP' | 'REJECT' | 'ALLOW';
  rules: FirewallRule[];
}

export interface SystemUser {
  username: string;
  uid: number;
  shell: string;
  sudo: boolean;
  hasPassword: boolean;
  lastLogin?: string;
}

export interface UserCheck {
  totalUsers: number;
  uid0Users: number;
  sudoUsers: string[];
  inactiveUsers: string[];
  noLoginUsers: number;
  usersList: SystemUser[];
}

export interface PackageUpdate {
  name: string;
  currentVersion: string;
  newVersion: string;
  isSecurity: boolean;
}

export interface PackageCheck {
  updatesAvailable: number;
  securityUpdates: number;
  normalUpdates: number;
  packages: PackageUpdate[];
}

export interface OpenPort {
  port: number;
  proto: 'tcp' | 'udp';
  service: string;
  binding: string;
  isExposed: boolean;
  recommendation?: string;
}

export interface NetworkCheck {
  openPorts: OpenPort[];
}

export interface NginxCheck {
  installed: boolean;
  httpsConfigured: boolean;
  httpRedirect: boolean;
  headers: {
    xFrameOptions: boolean;
    xContentTypeOptions: boolean;
    referrerPolicy: boolean;
    contentSecurityPolicy: boolean;
    strictTransportSecurity: boolean;
  };
}

export interface FilePermissionCheck {
  path: string;
  currentPerm: string;
  recommendedPerm: string;
  owner: string;
  isSecure: boolean;
}

export interface ServiceCheck {
  name: string;
  status: 'running' | 'stopped' | 'failed';
  isRisky: boolean;
  reason?: string;
}

export interface SecurityFinding {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  description: string;
  evidence: string;
  recommendation: string;
  fixable: boolean;
  fixKey?: string;
  fixCommand?: string;
}

export interface CategoryScore {
  score: number;
  max: number;
  weightLabel: string;
}

export interface SecurityScoreSummary {
  total: number;
  status: 'CRITICAL' | 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  categories: {
    ssh: CategoryScore;
    firewall: CategoryScore;
    user: CategoryScore;
    package: CategoryScore;
    network: CategoryScore;
    nginx: CategoryScore;
    filePerms: CategoryScore;
  };
}

export interface AuditHistoryEntry {
  id: string;
  date: string;
  score: number;
  timestamp: number;
  checksRun: number;
  criticalIssues: number;
}

export interface ServerRecord {
  id: string;
  name: string;
  hostname: string;
  ip: string;
  os: string;
  kernel: string;
  cpu: number;
  memoryMb: number;
  diskUsagePercent: number;
  status: 'online' | 'offline' | 'auditing';
  lastAudit: string;
  token: string;
  agentVersion: string;
  score: SecurityScoreSummary;
  checks: {
    ssh: SshCheck;
    firewall: FirewallCheck;
    user: UserCheck;
    packages: PackageCheck;
    network: NetworkCheck;
    nginx: NginxCheck;
    filePerms: FilePermissionCheck[];
    services: ServiceCheck[];
  };
  findings: SecurityFinding[];
  history: AuditHistoryEntry[];
}
