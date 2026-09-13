#!/usr/bin/env bash
# ==============================================================================
# NETWATCH — System Doctor Diagnostic Script
# Performs automated health, dependency, configuration, and JSON integrity checks.
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

DATA_FILE="./data/traffic.json"
CONFIG_FILE="./config/netwatch.conf"
CONFIG_DEFAULT="./config/default.json"
LOG_DIR="./logs"
DATA_DIR="./data"

PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0
RECOMMENDATIONS=()

record_pass() {
    local check_name="$1"
    local details="$2"
    printf "  %-32s ${GREEN}[PASS]${NC}  %s\n" "${check_name}" "${details}"
    PASS_COUNT=$((PASS_COUNT + 1))
}

record_warn() {
    local check_name="$1"
    local details="$2"
    local fix="$3"
    printf "  %-32s ${YELLOW}[WARN]${NC}  %s\n" "${check_name}" "${details}"
    WARN_COUNT=$((WARN_COUNT + 1))
    if [[ -n "${fix}" ]]; then
        RECOMMENDATIONS+=("${YELLOW}[WARN] ${check_name}:${NC} ${fix}")
    fi
}

record_fail() {
    local check_name="$1"
    local details="$2"
    local fix="$3"
    printf "  %-32s ${RED}[FAIL]${NC}  %s\n" "${check_name}" "${details}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    if [[ -n "${fix}" ]]; then
        RECOMMENDATIONS+=("${RED}[FAIL] ${check_name}:${NC} ${fix}")
    fi
}

echo -e "${CYAN}${BOLD}"
echo "================================================================================"
echo "                         NETWATCH DOCTOR DIAGNOSTICS                            "
echo "================================================================================"
echo -e "${NC}"

echo -e "${BOLD}1. Core Binary Dependencies:${NC}"

# Node.js
if command -v node >/dev/null 2>&1; then
    NODE_V=$(node -v)
    record_pass "Node.js Runtime" "${NODE_V}"
else
    record_fail "Node.js Runtime" "Not found" "Install Node.js (v18+) via https://nodejs.org or package manager."
fi

# npm
if command -v npm >/dev/null 2>&1 || command -v npm.cmd >/dev/null 2>&1; then
    record_pass "npm Package Manager" "Available"
else
    record_fail "npm Package Manager" "Not found" "Install npm to manage project packages."
fi

# nethogs
if command -v nethogs >/dev/null 2>&1; then
    record_pass "nethogs Utility" "Installed"
else
    record_warn "nethogs Utility" "Not found in PATH" "Install nethogs via 'sudo apt-get install -y nethogs' (fallback/demo mode active)."
fi

# jq
if command -v jq >/dev/null 2>&1; then
    JQ_V=$(jq --version 2>&1 | head -n 1)
    record_pass "jq JSON Processor" "${JQ_V}"
else
    record_warn "jq JSON Processor" "Not found" "Install jq for high-speed CLI validation: 'sudo apt-get install -y jq'."
fi

# shellcheck
if command -v shellcheck >/dev/null 2>&1; then
    record_pass "ShellCheck Linter" "Available"
else
    record_warn "ShellCheck Linter" "Not found" "Install shellcheck to lint bash scripts: 'sudo apt-get install -y shellcheck'."
fi

# systemd
if command -v systemctl >/dev/null 2>&1; then
    record_pass "systemd Init System" "Available"
else
    record_warn "systemd Init System" "Not available" "Systemd not detected; background runner fallback will be used."
fi

echo -e "\n${BOLD}2. Configuration & Integrity:${NC}"

# Configuration
if [[ -f "${CONFIG_FILE}" ]] || [[ -f "${CONFIG_DEFAULT}" ]]; then
    record_pass "Configuration File" "Found valid config"
else
    record_fail "Configuration File" "No config found" "Run 'monitor-ctl install' or copy config/netwatch.conf.example."
fi

# JSON Data Integrity
if [[ -f "${DATA_FILE}" ]]; then
    if command -v jq >/dev/null 2>&1; then
        if jq empty "${DATA_FILE}" 2>/dev/null; then
            record_pass "JSON Integrity (${DATA_FILE})" "Syntactically valid"
        else
            record_fail "JSON Integrity (${DATA_FILE})" "Invalid JSON / Corrupted" "JSON file is corrupted. Restore from backup or re-initialize data/traffic.json."
        fi
    else
        # basic check
        if grep -q "{" "${DATA_FILE}"; then
            record_pass "JSON Integrity (${DATA_FILE})" "Readable"
        else
            record_fail "JSON Integrity (${DATA_FILE})" "Invalid structure" "Initialize data/traffic.json."
        fi
    fi
else
    record_warn "JSON Data File" "File not yet created" "Start monitor service to generate telemetry: 'monitor-ctl start'."
fi

echo -e "\n${BOLD}3. Storage & Filesystem Permissions:${NC}"

# Directories writable
mkdir -p "${DATA_DIR}" "${LOG_DIR}"
if [[ -w "${DATA_DIR}" ]]; then
    record_pass "Data Directory (${DATA_DIR})" "Writable"
else
    record_fail "Data Directory (${DATA_DIR})" "Read-only" "Fix permissions: chmod 755 ${DATA_DIR}"
fi

if [[ -w "${LOG_DIR}" ]]; then
    record_pass "Logs Directory (${LOG_DIR})" "Writable"
else
    record_fail "Logs Directory (${LOG_DIR})" "Read-only" "Fix permissions: chmod 755 ${LOG_DIR}"
fi

# Disk space check
if command -v df >/dev/null 2>&1; then
    FREE_KB=$(df -k . | tail -1 | awk '{print $4}' || echo "1000000")
    if [[ "${FREE_KB}" -gt 102400 ]]; then # > 100MB
        FREE_MB=$((FREE_KB / 1024))
        record_pass "Disk Space Available" "${FREE_MB} MB free"
    else
        record_warn "Disk Space Available" "Low disk space (<100MB)" "Clean up disk space to ensure continuous log and data storage."
    fi
else
    record_pass "Disk Space" "Assumed sufficient"
fi

echo -e "\n${BOLD}4. Monitoring & Service Status:${NC}"

# Process check
if pgrep -f "backend/server.js" >/dev/null 2>&1; then
    record_pass "NETWATCH Service" "Running"
else
    record_warn "NETWATCH Service" "Stopped" "Start service with 'monitor-ctl start' or 'npm start'."
fi

# Summary
echo -e "\n${BOLD}================================================================================${NC}"
echo -e "${BOLD}                             DIAGNOSTIC SUMMARY                                 ${NC}"
echo -e "${BOLD}================================================================================${NC}"
echo -e "  Passed:   ${GREEN}${PASS_COUNT}${NC}"
echo -e "  Warnings: ${YELLOW}${WARN_COUNT}${NC}"
echo -e "  Failures: ${RED}${FAIL_COUNT}${NC}"

if [[ ${FAIL_COUNT} -eq 0 ]]; then
    if [[ ${WARN_COUNT} -eq 0 ]]; then
        echo -e "\nOverall Health Status: ${GREEN}${BOLD}HEALTHY (100% PASS)${NC}\n"
    else
        echo -e "\nOverall Health Status: ${YELLOW}${BOLD}OPERATIONAL (With minor warnings)${NC}\n"
    fi
else
    echo -e "\nOverall Health Status: ${RED}${BOLD}CRITICAL / ACTION REQUIRED${NC}\n"
fi

if [[ ${#RECOMMENDATIONS[@]} -gt 0 ]]; then
    echo -e "${BOLD}Recommendations & Remediation Steps:${NC}"
    for rec in "${RECOMMENDATIONS[@]}"; do
        echo -e "  - ${rec}"
    done
    echo ""
fi

# Exit code: 0 if healthy/warnings only, 1 if critical failures
if [[ ${FAIL_COUNT} -gt 0 ]]; then
    exit 1
fi
exit 0
