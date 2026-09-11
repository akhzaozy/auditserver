# 🛡️ Sentinel — Linux Security Audit & Automated Hardening Dashboard

<p align="center">
  <strong>Next-Generation Linux Security Compliance, Safe One-Click Hardening, and Fleet Radar</strong><br>
  Designed with Modern Claymorphism, Real-Time Mesh Topology, and Intelligent Auto-Load Balancing.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Framer_Motion-12.0-ff0055?logo=framer" alt="Framer Motion">
  <img src="https://img.shields.io/badge/Security_Vectors-8_Layers-emerald" alt="Security">
</p>

---

## 🌟 Key Features

- 🎯 **Visual Inspired by Claymorphism**: High-contrast, clean 100vh dashboard without page scroll, featuring vertical pill dock navigation and sleek card layouts.
- ⚖️ **Automated Smart Load Balancer (HAProxy / Ingress)**:
  - Dynamic traffic surge simulation: Toggle between **`Normal (38 req/s)`** and **`Spike Load (920 req/s)`**.
  - **Auto-Failover**: Diverts 100% of traffic away from offline nodes (`FSTI Server 🔴`).
  - **Auto-Scaling Replica**: Automatically springs in replica worker node (`STB-Worker-02`) with laser-dash packet stream animations.
- 📡 **Fleet Radar & Live Topology Mesh**:
  - Visual hierarchy: **ISP Backbone ➔ Smart Load Balancer ➔ Production Servers ➔ Edge Clients**.
  - Real-time animated flowing SVG laser streams and packet wave pulses.
- 🛡️ **8 Core Linux Audit Vectors**:
  - **SSH Security**: Root login, password authentication, idle timeout, protocol compliance.
  - **Firewall & UFW**: Policy enforcement, default DROP, active listening rule validation.
  - **User & Privileges**: UID 0 detection, excessive sudoers verification, empty passwords.
  - **Package Vulnerabilities**: Automated CVE and unattended-upgrade scanning.
  - **Network Exposure**: World-exposed ports (e.g. MariaDB 3306 on 0.0.0.0).
  - **Nginx & Web Security**: SSL/TLS 1.3 protocol, HSTS, CSP, X-Frame-Options.
  - **File Permissions**: `/etc/shadow`, `/etc/passwd`, `/etc/ssh/sshd_config`.
  - **System Hardening**: Kernel sysctl configs, ICMP flood limits, swap protections.
- ⚡ **Safe 5-Step Automated Remediation**:
  - Automatic snapshot backup (`/var/backups/sentinel`).
  - Strict syntax dry-run verification (`sshd -t`, `nginx -t`).
  - Zero-downtime service reload (`systemctl reload`).
  - Post-apply telemetry verification with automatic rollback upon regression.
- 💻 **Interactive Remote Shell**:
  - Integrated terminal with diagnostic probes (`ssh`, `ping`, `sentinel lb status`, `sentinel stress test`, `sentinel audit`).

---

## 🏗️ Architecture

```
                 🌐 ISP Backbone (Fiber / 12ms)
                               │
                ⚖️ Sentinel Smart Load Balancer
                 (Least-Connections Algorithm)
                 ┌─────────────┴─────────────┐
                 │ 50% Flow                  │ 50% Auto-Scaled
        🖥️ STB Gateway Node          🖥️ STB Worker Replica
      (xxxxx.akhzafachrozy.my.id)     (Container Port: 8081)
                 │                           │
                 └─────────────┬─────────────┘
                               │
                     📱 Edge Client Devices
```

---

## 🚀 Deployment Guide

### Option 1: Deploy to Vercel (Recommended)

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete Sentinel audit & load balancer dashboard"
   git push origin main
   ```
2. Import your repository into [Vercel](https://vercel.com):
   - **Framework Preset**: Next.js
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
3. Click **Deploy**!

### Option 2: Deploy to VPS / Cloud Server (Docker or Node.js)

```bash
# 1. Install dependencies
npm install

# 2. Build production bundle
npm run build

# 3. Start high-performance production server
npm run start
```

Or using **PM2**:
```bash
pm2 start npm --name "sentinel-dashboard" -- start
```

---

## 💻 Standalone Agent Installation on Linux Servers

To register a remote Linux server (Ubuntu/Debian/Armbian/CentOS):

```bash
curl -sSL https://your-domain.com/api/agent/install.sh | sudo bash -s -- \
  --server https://your-domain.com \
  --token sentinel_sec_stb_token
```

---

## 📄 License
MIT License. Created by Akhza Fachrozy for Linux Security & DevOps Engineering portfolio.

