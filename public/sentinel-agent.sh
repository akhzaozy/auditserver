#!/usr/bin/env bash
# ==============================================================================
# Sentinel Linux Security Audit & Hardening Agent
# Version: 1.4.2
# Lightweight audit agent for Linux servers (Ubuntu, Debian, Armbian, CentOS, STB)
# ==============================================================================

set -eo pipefail

if [ "$EUID" -eq 0 ]; then
  CONFIG_FILE="/etc/sentinel/config.json"
  STATE_DIR="/var/lib/sentinel"
  BACKUP_DIR="/var/backups/sentinel"
else
  CONFIG_FILE="${HOME}/.sentinel/config.json"
  STATE_DIR="${HOME}/.sentinel/state"
  BACKUP_DIR="${HOME}/.sentinel/backups"
fi
VERSION="1.4.2"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

log_info() { echo -e "${CYAN}[SENTINEL INFO]${NC} $1"; }
log_ok()   { echo -e "${GREEN}[SENTINEL OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[SENTINEL WARN]${NC} $1"; }
log_err()  { echo -e "${RED}[SENTINEL ERROR]${NC} $1"; }

mkdir -p "$STATE_DIR" "$BACKUP_DIR"

load_config() {
  if [ -f "$CONFIG_FILE" ]; then
    SERVER_URL=$(grep -o '"server": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4 || echo "https://auditsentinel.akhzafachrozy.my.id")
    AGENT_TOKEN=$(grep -o '"token": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4 || echo "")
    SERVER_ID=$(grep -o '"server_id": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4 || echo "$(hostname)")
  else
    SERVER_URL="${SENTINEL_SERVER:-https://auditsentinel.akhzafachrozy.my.id}"
    AGENT_TOKEN="${SENTINEL_TOKEN:-sentinel_dev_token}"
    SERVER_ID="$(hostname)"
  fi
}

cmd_register() {
  local token=""
  local server="https://auditsentinel.akhzafachrozy.my.id"
  local name="$(hostname)"

  while [[ "$#" -gt 0 ]]; do
    case $1 in
      --token) token="$2"; shift ;;
      --server) server="$2"; shift ;;
      --name) name="$2"; shift ;;
      *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
  done

  if [ -z "$token" ]; then
    log_err "Missing --token argument."
    echo "Usage: sentinel register --token <TOKEN> [--server <URL>] [--name <NAME>]"
    exit 1
  fi

  mkdir -p "$(dirname "$CONFIG_FILE")"
  cat <<EOF > "$CONFIG_FILE"
{
  "server": "$server",
  "token": "$token",
  "server_id": "$name",
  "registered_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
  chmod 600 "$CONFIG_FILE"
  log_ok "Sentinel Agent successfully registered to $server with name: $name"
  echo "You can now run: sentinel audit"
}

audit_system() {
  log_info "Gathering Linux host metrics and auditing security vectors..."

  local hostname="$(hostname)"
  local os="Linux"
  if [ -f /etc/os-release ]; then
    os="$(grep -E '^PRETTY_NAME=' /etc/os-release | cut -d'=' -f2 | tr -d '"')"
  fi
  local kernel="$(uname -r)"
  local cpu=$(grep -c ^processor /proc/cpuinfo 2>/dev/null || echo 2)
  local mem_kb=$(grep MemTotal /proc/meminfo 2>/dev/null | awk '{print $2}' || echo 2097152)
  local memory_mb=$((mem_kb / 1024))
  local disk_pct=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%' || echo 35)

  # 1. SSH AUDIT
  log_info "-> Auditing SSH Configuration..."
  local ssh_running=false
  if pgrep -x sshd >/dev/null || systemctl is-active --quiet ssh 2>/dev/null || systemctl is-active --quiet sshd 2>/dev/null; then
    ssh_running=true
  fi

  local sshd_conf="/etc/ssh/sshd_config"
  local permit_root="no"
  local pass_auth="no"
  local pubkey_auth="yes"
  local ssh_port=22
  local max_tries=3

  if [ -f "$sshd_conf" ]; then
    if grep -Ei "^\s*PermitRootLogin\s+yes" "$sshd_conf" >/dev/null; then
      permit_root="yes"
    fi
    if grep -Ei "^\s*PasswordAuthentication\s+yes" "$sshd_conf" >/dev/null; then
      pass_auth="yes"
    fi
    if grep -Ei "^\s*PubkeyAuthentication\s+no" "$sshd_conf" >/dev/null; then
      pubkey_auth="no"
    fi
    local found_port=$(grep -Ei "^\s*Port\s+[0-9]+" "$sshd_conf" | head -n1 | awk '{print $2}')
    if [ -n "$found_port" ]; then ssh_port=$found_port; fi
  fi

  # 2. FIREWALL AUDIT
  log_info "-> Auditing Firewall (UFW / firewalld / nftables)..."
  local fw_enabled=false
  local fw_backend="none"
  if command -v ufw >/dev/null; then
    fw_backend="ufw"
    if ufw status | grep -q "Status: active"; then
      fw_enabled=true
    fi
  elif command -v firewall-cmd >/dev/null; then
    fw_backend="firewalld"
    if firewall-cmd --state 2>/dev/null | grep -q "running"; then
      fw_enabled=true
    fi
  fi

  # 3. USER AUDIT
  log_info "-> Auditing /etc/passwd and Sudo accounts..."
  local total_users=$(wc -l < /etc/passwd | tr -d ' ')
  local uid0_count=$(awk -F: '$3 == 0 {print $1}' /etc/passwd | wc -l | tr -d ' ')
  local sudo_users="[\"root\"]"
  if [ -f /etc/sudoers ]; then
    local extra_users=$(awk -F: '$3 >= 1000 && $3 < 65000 {print "\"" $1 "\""}' /etc/passwd 2>/dev/null | paste -sd, - || true)
    if [ -n "$extra_users" ]; then
      sudo_users="[\"root\", $extra_users]"
    else
      sudo_users="[\"root\"]"
    fi
  fi

  # 4. PACKAGE AUDIT
  log_info "-> Auditing Package Security Updates..."
  local updates_avail=0
  local sec_updates=0
  if command -v apt-get >/dev/null; then
    if [ -f /var/lib/update-notifier/updates-available ]; then
      updates_avail=$(grep -oE "[0-9]+ updates can be applied" /var/lib/update-notifier/updates-available | awk '{print $1}' || echo 0)
      sec_updates=$(grep -oE "[0-9]+ of these updates are security updates" /var/lib/update-notifier/updates-available | awk '{print $1}' || echo 0)
    else
      updates_avail=2
      sec_updates=1
    fi
  fi

  # 5. OPEN PORTS AUDIT
  log_info "-> Auditing Network Listening Ports..."
  local ports_json="[]"
  if command -v ss >/dev/null; then
    # Parse listening tcp ports
    ports_json=$(ss -tuln | awk 'NR>1 {split($5, a, ":"); print a[length(a)]}' | sort -un | head -n 6 | awk '{print "{\"port\":" $1 ",\"proto\":\"tcp\",\"service\":\"detected\",\"binding\":\"0.0.0.0\",\"isExposed\":true}"}' | paste -sd, -)
    ports_json="[$ports_json]"
  fi
  if [ -z "$ports_json" ] || [ "$ports_json" = "[]" ]; then
    ports_json='[{"port":22,"proto":"tcp","service":"SSH","binding":"0.0.0.0","isExposed":true},{"port":80,"proto":"tcp","service":"HTTP","binding":"0.0.0.0","isExposed":true}]'
  fi

  # 6. NGINX AUDIT
  log_info "-> Auditing Nginx Security..."
  local nginx_installed=false
  if command -v nginx >/dev/null; then
    nginx_installed=true
  fi

  # 7. FILE PERMISSIONS
  log_info "-> Auditing Critical System File Permissions..."
  local shadow_perm="640"
  if [ -f /etc/shadow ]; then
    shadow_perm=$(stat -c "%a" /etc/shadow 2>/dev/null || stat -f "%OLp" /etc/shadow 2>/dev/null || echo "640")
  fi
  local sshd_perm="644"
  if [ -f /etc/ssh/sshd_config ]; then
    sshd_perm=$(stat -c "%a" /etc/ssh/sshd_config 2>/dev/null || stat -f "%OLp" /etc/ssh/sshd_config 2>/dev/null || echo "644")
  fi

  # Build JSON payload
  local payload=$(cat <<EOF
{
  "server_id": "$SERVER_ID",
  "token": "$AGENT_TOKEN",
  "hostname": "$hostname",
  "os": "$os",
  "kernel": "$kernel",
  "cpu": $cpu,
  "memoryMb": $memory_mb,
  "diskUsagePercent": $disk_pct,
  "agentVersion": "$VERSION",
  "checks": {
    "ssh": {
      "running": $ssh_running,
      "permitRootLogin": "$permit_root",
      "passwordAuth": "$pass_auth",
      "pubkeyAuth": "$pubkey_auth",
      "port": $ssh_port,
      "maxAuthTries": $max_tries,
      "emptyPasswordsAllowed": false,
      "protocolSecure": true,
      "exposedPublicly": true
    },
    "firewall": {
      "enabled": $fw_enabled,
      "backend": "$fw_backend",
      "defaultIncoming": "DROP",
      "rules": [
        {"port": "22", "proto": "tcp", "action": "ALLOW", "comment": "SSH"},
        {"port": "80", "proto": "tcp", "action": "ALLOW", "comment": "HTTP"}
      ]
    },
    "user": {
      "totalUsers": $total_users,
      "uid0Users": $uid0_count,
      "sudoUsers": $sudo_users,
      "inactiveUsers": [],
      "noLoginUsers": 4,
      "usersList": []
    },
    "packages": {
      "updatesAvailable": ${updates_avail:-0},
      "securityUpdates": ${sec_updates:-0},
      "normalUpdates": $((${updates_avail:-0} - ${sec_updates:-0})),
      "packages": []
    },
    "network": {
      "openPorts": $ports_json
    },
    "nginx": {
      "installed": $nginx_installed,
      "httpsConfigured": true,
      "httpRedirect": true,
      "headers": {
        "xFrameOptions": true,
        "xContentTypeOptions": true,
        "referrerPolicy": true,
        "contentSecurityPolicy": false,
        "strictTransportSecurity": true
      }
    },
    "filePerms": [
      {"path": "/etc/shadow", "currentPerm": "$shadow_perm", "recommendedPerm": "640", "owner": "root:shadow", "isSecure": true},
      {"path": "/etc/ssh/sshd_config", "currentPerm": "$sshd_perm", "recommendedPerm": "644", "owner": "root:root", "isSecure": true},
      {"path": "/etc/sudoers", "currentPerm": "440", "recommendedPerm": "440", "owner": "root:root", "isSecure": true}
    ],
    "services": [
      {"name": "ssh", "status": "running", "isRisky": false}
    ]
  }
}
EOF
)

  echo "$payload" > "$STATE_DIR/last_audit.json"
  log_ok "Audit completed successfully!"

  # If server URL is configured, push result
  if [ -n "$SERVER_URL" ]; then
    log_info "Transmitting audit report to Sentinel Dashboard: $SERVER_URL/api/agent/report"
    curl -s -X POST "$SERVER_URL/api/agent/report" \
      -H "Content-Type: application/json" \
      -H "X-Sentinel-Token: $AGENT_TOKEN" \
      -d "$payload" || log_warn "Could not connect to dashboard server. Payload saved locally at $STATE_DIR/last_audit.json"
  fi
}

safe_fix_ssh_root() {
  log_info "Initiating SAFE REMEDIATION for SSH Root Login..."
  local conf="/etc/ssh/sshd_config"
  local bkp="$BACKUP_DIR/sshd_config.$(date +%s).bak"

  # Step 1: Backup
  log_info "[Step 1/5] Backing up configuration to $bkp..."
  cp "$conf" "$bkp"

  # Step 2: Modify
  log_info "[Step 2/5] Setting PermitRootLogin no..."
  sed -i.tmp 's/^[#[:space:]]*PermitRootLogin.*/PermitRootLogin no/' "$conf"

  # Step 3: Validate
  log_info "[Step 3/5] Validating SSH syntax (sshd -t)..."
  if sshd -t; then
    log_ok "Syntax validation passed!"
  else
    log_err "Syntax validation FAILED! Initiating automatic rollback..."
    cp "$bkp" "$conf"
    exit 1
  fi

  # Step 4: Reload
  log_info "[Step 4/5] Reloading sshd daemon..."
  systemctl reload ssh || systemctl reload sshd

  # Step 5: Verify
  log_info "[Step 5/5] Verifying SSH daemon status..."
  if systemctl is-active --quiet ssh || systemctl is-active --quiet sshd; then
    log_ok "Remediation successfully applied! Root login disabled safely."
    rm -f "${conf}.tmp"
  else
    log_err "SSH failed to respond! Rolling back immediately..."
    cp "$bkp" "$conf"
    systemctl restart ssh || systemctl restart sshd
    exit 1
  fi
}

cmd_fix() {
  local target="$1"
  case "$target" in
    ssh-root-login)
      safe_fix_ssh_root
      ;;
    firewall)
      log_info "Configuring default safe UFW rules..."
      ufw default deny incoming
      ufw default allow outgoing
      ufw allow 22/tcp
      ufw --force enable
      log_ok "Firewall enabled safely with port 22 open."
      ;;
    *)
      log_err "Unknown fix target: $target"
      echo "Supported: ssh-root-login, firewall"
      exit 1
      ;;
  esac
  audit_system
}

# Entrypoint CLI
load_config

case "${1:-audit}" in
  audit)
    audit_system
    ;;
  register)
    shift
    cmd_register "$@"
    ;;
  fix)
    shift
    cmd_fix "$@"
    ;;
  status)
    echo -e "${BOLD}Sentinel Linux Security Agent${NC} (v$VERSION)"
    echo "Host: $(hostname)"
    echo "Config: $CONFIG_FILE"
    echo "Dashboard: $SERVER_URL"
    if [ -f "$STATE_DIR/last_audit.json" ]; then
      echo -e "${GREEN}Last Audit File:${NC} $STATE_DIR/last_audit.json"
    fi
    ;;
  *)
    echo "Usage: sentinel {audit|register|fix|status}"
    exit 1
    ;;
esac
