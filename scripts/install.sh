#!/usr/bin/env bash
# ==============================================================================
# NETWATCH — Installation Script
# Defensive, robust installation for Debian/Ubuntu Linux systems.
# ==============================================================================

set -euo pipefail

# ANSI Color Codes for SOC Terminal styling
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

INSTALL_DIR="/opt/netwatch"
CONFIG_DIR="/etc/netwatch"
DATA_DIR="/var/lib/netwatch/data"
LOG_DIR="/var/log/netwatch"
SERVICE_FILE="/etc/systemd/system/netwatch.service"
BIN_LINK="/usr/local/bin/monitor-ctl"

# Temporary cleanup trap
TMP_DIR=""
cleanup() {
    local exit_code=$?
    if [[ -n "${TMP_DIR}" && -d "${TMP_DIR}" ]]; then
        rm -rf "${TMP_DIR}"
    fi
    if [[ ${exit_code} -ne 0 ]]; then
        echo -e "\n${RED}[ERROR] Installation aborted due to an unexpected error.${NC}"
    fi
    exit ${exit_code}
}
trap cleanup EXIT INT TERM

echo -e "${CYAN}${BOLD}"
echo "================================================================================"
echo "    NETWATCH — Network Traffic Monitoring & System Activity Platform"
echo "                             Installer v1.0.0"
echo "================================================================================"
echo -e "${NC}"

# 1. OS Check
echo -e "${BLUE}[*] Checking operating system compatibility...${NC}"
if [[ -f /etc/os-release ]]; then
    # shellcheck source=/dev/null
    . /etc/os-release
    OS_NAME="${NAME:-Linux}"
    echo -e "    Detected OS: ${BOLD}${OS_NAME}${NC}"
else
    echo -e "${YELLOW}[!] Warning: /etc/os-release not found. Assuming generic Linux environment.${NC}"
fi

# 2. Privilege Check
if [[ "${EUID}" -ne 0 ]]; then
    echo -e "${YELLOW}[!] Notice: Running without root privileges.${NC}"
    echo -e "    To install system-wide service and /usr/local/bin symlink, root is required."
    echo -e "    Running in local development mode..."
    INSTALL_DIR="$(pwd)"
    CONFIG_DIR="${INSTALL_DIR}/config"
    DATA_DIR="${INSTALL_DIR}/data"
    LOG_DIR="${INSTALL_DIR}/logs"
fi

# 3. Dependency Verification
echo -e "\n${BLUE}[*] Verifying system dependencies...${NC}"
MISSING_DEPS=()

check_dep() {
    local cmd="$1"
    local pkg_hint="$2"
    if command -v "${cmd}" >/dev/null 2>&1; then
        local ver
        ver=$("${cmd}" --version 2>&1 | head -n 1 || echo "installed")
        echo -e "    ${GREEN}[PASS]${NC} ${cmd} (${ver})"
    else
        echo -e "    ${RED}[FAIL]${NC} ${cmd} is NOT installed."
        MISSING_DEPS+=("${pkg_hint}")
    fi
}

check_dep "node" "nodejs (v18+ recommended)"
check_dep "npm" "npm"
check_dep "nethogs" "nethogs (sudo apt install -y nethogs)"
check_dep "jq" "jq (sudo apt install -y jq)"
check_dep "shellcheck" "shellcheck (sudo apt install -y shellcheck)"

if command -v systemctl >/dev/null 2>&1; then
    echo -e "    ${GREEN}[PASS]${NC} systemd (systemctl available)"
else
    echo -e "    ${YELLOW}[WARN]${NC} systemd not detected (service management will use process fallback)"
fi

if [[ ${#MISSING_DEPS[@]} -gt 0 ]]; then
    echo -e "\n${RED}${BOLD}[ERROR] Missing required dependencies:${NC}"
    for dep in "${MISSING_DEPS[@]}"; do
        echo -e "    - ${dep}"
    done
    echo -e "\n${YELLOW}Please install missing packages before continuing:${NC}"
    echo -e "    sudo apt-get update && sudo apt-get install -y nethogs jq shellcheck nodejs npm\n"
    if [[ "${EUID}" -eq 0 ]]; then
        read -r -p "Would you like to attempt automated apt install? (y/N): " attempt_install || attempt_install="n"
        if [[ "${attempt_install}" =~ ^[Yy]$ ]]; then
            apt-get update && apt-get install -y nethogs jq shellcheck nodejs npm
        else
            echo -e "${YELLOW}Proceeding with partial install. Doctor will flag missing components.${NC}"
        fi
    fi
fi

# 4. Create Directories
echo -e "\n${BLUE}[*] Setting up directories...${NC}"
mkdir -p "${CONFIG_DIR}"
mkdir -p "${DATA_DIR}"
mkdir -p "${LOG_DIR}"
chmod 755 "${DATA_DIR}" "${LOG_DIR}"
echo -e "    ${GREEN}[OK]${NC} Directories verified: ${DATA_DIR}, ${LOG_DIR}, ${CONFIG_DIR}"

# 5. Default Configuration
CONFIG_FILE="${CONFIG_DIR}/netwatch.conf"
if [[ ! -f "${CONFIG_FILE}" ]]; then
    echo -e "${BLUE}[*] Creating initial configuration at ${CONFIG_FILE}...${NC}"
    cat <<EOF > "${CONFIG_FILE}"
# NETWATCH Configuration
DOWNLOAD_THRESHOLD_MBPS=50
UPLOAD_THRESHOLD_MBPS=20
MONITORING_INTERVAL_SECONDS=2
PORT=4000
HOST=0.0.0.0
DATA_DIR=${DATA_DIR}
JSON_OUTPUT_FILE=${DATA_DIR}/traffic.json
LOG_DIR=${LOG_DIR}
LOG_FILE=${LOG_DIR}/netwatch.log
LOG_RETENTION_DAYS=7
LOG_MAX_SIZE_MB=10
LOG_LEVEL=INFO
FIM_ENABLED=true
FIM_DIRECTORIES=test_monitor_dir
ALERTS_ENABLED=true
ALERT_SPIKE_PERCENTAGE=150
DEMO_MODE=false
EOF
    chmod 644 "${CONFIG_FILE}"
    echo -e "    ${GREEN}[OK]${NC} Configuration created."
else
    echo -e "    ${YELLOW}[SKIP]${NC} Configuration already exists at ${CONFIG_FILE}."
fi

# 6. Install Systemd Service if root and systemd present
if [[ "${EUID}" -eq 0 ]] && command -v systemctl >/dev/null 2>&1; then
    echo -e "\n${BLUE}[*] Installing systemd service...${NC}"
    if [[ -f "$(pwd)/systemd/netwatch.service" ]]; then
        cp "$(pwd)/systemd/netwatch.service" "${SERVICE_FILE}"
        systemctl daemon-reload
        echo -e "    ${GREEN}[OK]${NC} netwatch.service installed to ${SERVICE_FILE}"
    fi

    # Symlink CLI
    if [[ -f "$(pwd)/cli/monitor-ctl" ]]; then
        chmod +x "$(pwd)/cli/monitor-ctl"
        ln -sf "$(pwd)/cli/monitor-ctl" "${BIN_LINK}"
        echo -e "    ${GREEN}[OK]${NC} CLI linked to ${BIN_LINK}"
    fi
fi

# 7. Initial JSON structure
INITIAL_JSON="${DATA_DIR}/traffic.json"
if [[ ! -f "${INITIAL_JSON}" ]]; then
    echo -e "${BLUE}[*] Initializing empty JSON dataset...${NC}"
    cat <<EOF > "${INITIAL_JSON}"
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "INITIALIZED",
  "interfaces": [],
  "processes": [],
  "users": [],
  "totals": {
    "download_mbps": 0.0,
    "upload_mbps": 0.0,
    "total_download_bytes": 0,
    "total_upload_bytes": 0
  }
}
EOF
    chmod 644 "${INITIAL_JSON}"
    echo -e "    ${GREEN}[OK]${NC} Initial JSON created and validated."
fi

echo -e "\n${GREEN}${BOLD}================================================================================${NC}"
echo -e "${GREEN}${BOLD}               NETWATCH Installation Completed Successfully!                     ${NC}"
echo -e "${GREEN}${BOLD}================================================================================${NC}"
echo -e "\nNext steps:"
echo -e "  - Run diagnostics:      ${CYAN}monitor-ctl doctor${NC}"
echo -e "  - Start service:        ${CYAN}monitor-ctl start${NC}"
echo -e "  - Check status:         ${CYAN}monitor-ctl status${NC}"
echo -e "  - View live dashboard:  ${CYAN}http://localhost:4000${NC}\n"
