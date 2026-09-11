import { ServerRecord } from '../types/sentinel';
import { initialServers } from '../data/mockServers';
import { calculateSecurityScore } from '../utils/scoreCalculator';

// In-memory store for development & server execution
declare global {
  // eslint-disable-next-line no-var
  var __SENTINEL_SERVERS__: ServerRecord[] | undefined;
}

if (!global.__SENTINEL_SERVERS__) {
  global.__SENTINEL_SERVERS__ = initialServers;
}

export function getAllServers(): ServerRecord[] {
  return global.__SENTINEL_SERVERS__ || initialServers;
}

export function getServerById(id: string): ServerRecord | undefined {
  return (global.__SENTINEL_SERVERS__ || initialServers).find((s) => s.id === id);
}

export function addServer(server: ServerRecord): ServerRecord {
  if (!global.__SENTINEL_SERVERS__) {
    global.__SENTINEL_SERVERS__ = [...initialServers];
  }
  global.__SENTINEL_SERVERS__.push(server);
  return server;
}

export function updateServer(id: string, updates: Partial<ServerRecord>): ServerRecord | undefined {
  if (!global.__SENTINEL_SERVERS__) {
    global.__SENTINEL_SERVERS__ = [...initialServers];
  }
  const idx = global.__SENTINEL_SERVERS__.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;

  const current = global.__SENTINEL_SERVERS__[idx];
  const updated: ServerRecord = {
    ...current,
    ...updates,
  };

  // Recalculate score if checks were updated
  if (updates.checks) {
    updated.score = calculateSecurityScore(
      updated.checks.ssh,
      updated.checks.firewall,
      updated.checks.user,
      updated.checks.packages,
      updated.checks.network,
      updated.checks.nginx,
      updated.checks.filePerms
    );
  }

  global.__SENTINEL_SERVERS__[idx] = updated;
  return updated;
}
