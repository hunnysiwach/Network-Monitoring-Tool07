#!/usr/bin/env bash
# ==============================================================================
# NETWATCH — Uninstallation Script
# Safely stops services, cleans configuration/binaries, and preserves logs.
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

SERVICE_FILE="/etc/systemd/system/netwatch.service"
BIN_LINK="/usr/local/bin/monitor-ctl"
PURGE_DATA=false

# Check flags
for arg in "$@"; do
    if [[ "${arg}" == "--purge" || "${arg}" == "-p" ]]; then
        PURGE_DATA=true
    fi
done

echo -e "${YELLOW}${BOLD}"
echo "================================================================================"
echo "                   NETWATCH — Service Uninstallation"
echo "================================================================================"
echo -e "${NC}"

# 1. Stop & Disable systemd service
if command -v systemctl >/dev/null 2>&1; then
    if systemctl is-active --quiet netwatch 2>/dev/null; then
        echo -e "${BLUE}[*] Stopping netwatch service...${NC}"
        systemctl stop netwatch || true
        echo -e "    ${GREEN}[OK]${NC} Service stopped."
    fi

    if systemctl is-enabled --quiet netwatch 2>/dev/null; then
        echo -e "${BLUE}[*] Disabling netwatch service...${NC}"
        systemctl disable netwatch || true
        echo -e "    ${GREEN}[OK]${NC} Service disabled."
    fi

    if [[ -f "${SERVICE_FILE}" ]]; then
        echo -e "${BLUE}[*] Removing service unit ${SERVICE_FILE}...${NC}"
        rm -f "${SERVICE_FILE}"
        systemctl daemon-reload
        echo -e "    ${GREEN}[OK]${NC} Service file removed."
    fi
fi

# 2. Remove binary symlink
if [[ -L "${BIN_LINK}" || -f "${BIN_LINK}" ]]; then
    echo -e "${BLUE}[*] Removing CLI symlink ${BIN_LINK}...${NC}"
    rm -f "${BIN_LINK}"
    echo -e "    ${GREEN}[OK]${NC} CLI symlink removed."
fi

# 3. Handle data and logs
if [[ "${PURGE_DATA}" == true ]]; then
    echo -e "${RED}[*] Purge mode requested. Removing configuration, data, and logs...${NC}"
    rm -rf /var/lib/netwatch /var/log/netwatch /etc/netwatch ./data ./logs ./config/netwatch.conf
    echo -e "    ${GREEN}[OK]${NC} All data and logs purged."
else
    echo -e "${BLUE}[*] Preserving logs and collected data for defensive audit compliance.${NC}"
    echo -e "    (Use --purge if you want to permanently remove data and log files)."
fi

echo -e "\n${GREEN}${BOLD}[SUCCESS] NETWATCH has been cleanly uninstalled.${NC}\n"
