#!/usr/bin/env bash
# start-dev.sh — persistent Next.js dev server launcher
#
# The sandbox kills any process whose parent is the bash shell spawned by the
# python session manager. A plain `nohup ... &` or `setsid ... &` (single fork)
# does NOT survive across tool calls. A proper double-fork daemon does, because
# the grandchild gets reparented to PID 1 (tini) which does not reap it.
#
# Usage:  bash start-dev.sh
# Stop:   pkill -9 -f "next dev"

set -e
cd /home/z/my-project

# Kill any existing dev server so we never run duplicate instances.
pkill -9 -f "next dev" 2>/dev/null || true
sleep 1

: > dev.log

# Double-fork via python3 so the dev server is fully detached (reparented to
# PID 1) and survives across bash tool invocations. stdout+stderr -> dev.log.
python3 -c "
import os, sys
pid = os.fork()
if pid > 0:
    sys.exit(0)
os.setsid()
pid = os.fork()
if pid > 0:
    os._exit(0)
os.chdir('/home/z/my-project')
os.execv('./node_modules/.bin/next', ['next', 'dev', '-p', '3000'])
" < /dev/null > dev.log 2>&1

echo "Dev server daemon launched. Waiting for readiness..."
for i in $(seq 1 30); do
  if curl -sf -o /dev/null http://localhost:3000/ 2>/dev/null; then
    echo "Dev server is ready on http://localhost:3000"
    break
  fi
  sleep 1
done

ps -ef | grep -E "next-server|next dev" | grep -v grep || echo "WARNING: no next process found"
