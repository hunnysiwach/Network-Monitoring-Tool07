#!/usr/bin/env bash
# ==============================================================================
# NETWATCH — Real-time Terminal Traffic Monitor
# Displays live process and interface bandwidth telemetry in terminal.
# ==============================================================================

set -euo pipefail

DATA_FILE="${1:-./data/traffic.json}"

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

cleanup() {
    tput cnorm || true
    echo -e "\n${YELLOW}Monitoring stopped.${NC}"
    exit 0
}
trap cleanup EXIT INT TERM

tput civis || true # hide cursor

while true; do
    clear || true
    echo -e "${CYAN}${BOLD}"
    echo "================================================================================"
    echo "       NETWATCH — Real-Time Network & System Activity Monitor (CLI)             "
    echo "================================================================================"
    echo -e "${NC}"

    if [[ ! -f "${DATA_FILE}" ]]; then
        echo -e "${YELLOW}Waiting for telemetry data file: ${DATA_FILE}...${NC}"
        echo -e "Make sure the NETWATCH daemon is running: ${BOLD}monitor-ctl start${NC}"
        sleep 2
        continue
    fi

    # Validate JSON with jq if available
    if command -v jq >/dev/null 2>&1; then
        if ! jq empty "${DATA_FILE}" 2>/dev/null; then
            echo -e "${RED}[ERROR] JSON data file is currently corrupted or being written.${NC}"
            sleep 1
            continue
        fi

        TIMESTAMP=$(jq -r '.timestamp // "N/A"' "${DATA_FILE}")
        STATUS=$(jq -r '.status // "UNKNOWN"' "${DATA_FILE}")
        DL=$(jq -r '.totals.download_mbps // 0' "${DATA_FILE}")
        UL=$(jq -r '.totals.upload_mbps // 0' "${DATA_FILE}")

        echo -e "Last Update: ${BOLD}${TIMESTAMP}${NC} | Status: ${GREEN}${STATUS}${NC}"
        echo -e "Current Download: ${CYAN}${BOLD}${DL} Mbps${NC} | Current Upload: ${CYAN}${BOLD}${UL} Mbps${NC}"
        echo "--------------------------------------------------------------------------------"
        printf "%-24s %-8s %-12s %-12s %-12s\n" "PROCESS" "PID" "USER" "DOWNLOAD" "UPLOAD"
        echo "--------------------------------------------------------------------------------"

        jq -r '.processes[]? | "\(.name)\t\(.pid)\t\(.user)\t\(.download_formatted)\t\(.upload_formatted)"' "${DATA_FILE}" 2>/dev/null | head -n 12 | while IFS=$'\t' read -r pname ppid puser pdl pul; do
            printf "%-24s %-8s %-12s %-12s %-12s\n" "${pname:0:23}" "${ppid}" "${puser:0:11}" "${pdl}" "${pul}"
        done

        echo "--------------------------------------------------------------------------------"
        echo -e "${BOLD}Top Users by Traffic:${NC}"
        jq -r '.users[]? | "  - \(.username): \(.total_formatted) (\(.percentage)%)"' "${DATA_FILE}" 2>/dev/null | head -n 4 || true
    else
        echo -e "${YELLOW}jq is not installed. Displaying raw data:${NC}"
        head -n 25 "${DATA_FILE}"
    fi

    echo -e "\nPress [Ctrl+C] to exit live monitoring."
    sleep 2
done
