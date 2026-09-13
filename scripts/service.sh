#!/usr/bin/env bash
# ==============================================================================
# NETWATCH — Service Lifecycle Management Script
# Handles start, stop, restart, and status for netwatch daemon.
# ==============================================================================

set -euo pipefail

ACTION="${1:-status}"
PID_FILE="/var/run/netwatch.pid"
LOCAL_PID_FILE="./data/netwatch.pid"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

use_systemd() {
    command -v systemctl >/dev/null 2>&1 && [[ -f /etc/systemd/system/netwatch.service ]]
}

start_service() {
    echo -e "${BLUE}[*] Starting NETWATCH service...${NC}"
    if use_systemd; then
        sudo systemctl start netwatch
        echo -e "${GREEN}[OK] Started via systemd (netwatch.service)${NC}"
    else
        # Process fallback
        if [[ -f "${LOCAL_PID_FILE}" ]] && kill -0 "$(cat "${LOCAL_PID_FILE}")" 2>/dev/null; then
            echo -e "${YELLOW}[!] NETWATCH is already running (PID: $(cat "${LOCAL_PID_FILE}")).${NC}"
            return 0
        fi
        mkdir -p ./data ./logs
        nohup node backend/server.js >> ./logs/netwatch.log 2>&1 &
        echo $! > "${LOCAL_PID_FILE}"
        echo -e "${GREEN}[OK] Started in background (PID: $!)${NC}"
    fi
}

stop_service() {
    echo -e "${BLUE}[*] Stopping NETWATCH service...${NC}"
    if use_systemd; then
        sudo systemctl stop netwatch
        echo -e "${GREEN}[OK] Stopped via systemd.${NC}"
    else
        if [[ -f "${LOCAL_PID_FILE}" ]]; then
            local pid
            pid=$(cat "${LOCAL_PID_FILE}")
            if kill -0 "${pid}" 2>/dev/null; then
                kill "${pid}" || true
                rm -f "${LOCAL_PID_FILE}"
                echo -e "${GREEN}[OK] Stopped background process (PID: ${pid}).${NC}"
            else
                rm -f "${LOCAL_PID_FILE}"
                echo -e "${YELLOW}[!] Process was not running, removed stale PID file.${NC}"
            fi
        else
            # Try finding node process
            pkill -f "backend/server.js" || true
            echo -e "${GREEN}[OK] Stopped.${NC}"
        fi
    fi
}

restart_service() {
    echo -e "${BLUE}[*] Restarting NETWATCH service...${NC}"
    stop_service
    sleep 1
    start_service
}

status_service() {
    echo -e "${BOLD}================================================================================${NC}"
    echo -e "${BOLD}                            NETWATCH SERVICE STATUS                             ${NC}"
    echo -e "${BOLD}================================================================================${NC}"
    if use_systemd; then
        systemctl status netwatch --no-pager || true
    else
        if [[ -f "${LOCAL_PID_FILE}" ]] && kill -0 "$(cat "${LOCAL_PID_FILE}")" 2>/dev/null; then
            local pid
            pid=$(cat "${LOCAL_PID_FILE}")
            echo -e "Service Status:  ${GREEN}${BOLD}RUNNING${NC} (Standalone daemon)"
            echo -e "Process ID (PID): ${BOLD}${pid}${NC}"
            echo -e "Dashboard URL:   ${BLUE}http://localhost:4000${NC}"
        else
            echo -e "Service Status:  ${RED}${BOLD}STOPPED${NC}"
        fi
    fi
}

case "${ACTION}" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        restart_service
        ;;
    status)
        status_service
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
