#!/bin/bash
# ClawDash 小砚云控 - 卸载脚本
# 用法: curl -s https://raw.githubusercontent.com/Lifeyumo/ClawDash/main/uninstall.sh | bash

set -e

# 配置
CLAWDASH_DIR="/opt/clawdash"
PORT=99

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "=========================================="
echo "  🦞 小砚云控 ClawDash 卸载脚本"
echo "=========================================="
echo ""

# 确认
log_warn "此操作将删除："
echo "  - ClawDash 服务"
echo "  - /opt/clawdash 目录"
echo "  - /var/log/clawdash.log 日志"
echo "  - /var/run/clawdash.pid"
echo ""
log_warn "注意：此操作不会删除 OpenClaw"
echo ""

if [ "$1" != "--yes" ] && [ "$1" != "-y" ]; then
  read -p "确认删除 ClawDash？(y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "取消删除"
    exit 0
  fi
fi

# 停止服务
log_info "停止 ClawDash 服务..."

# 通过 PID 文件
if [ -f /var/run/clawdash.pid ]; then
  PID=$(cat /var/run/clawdash.pid 2>/dev/null)
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    kill "$PID" 2>/dev/null || true
    log_info "进程 $PID 已停止"
  fi
  rm -f /var/run/clawdash.pid
fi

# 通过端口查找
if command -v lsof >/dev/null 2>&1; then
  PID=$(lsof -t -i:$PORT 2>/dev/null || true)
  if [ -n "$PID" ]; then
    kill "$PID" 2>/dev/null || true
    log_info "端口 $PORT 上的进程已停止"
  fi
fi

# 通过 netstat 查找
if command -v netstat >/dev/null 2>&1; then
  PID=$(netstat -tlnp 2>/dev/null | grep ":$PORT " | awk '{print $7}' | cut -d'/' -f1 | head -1)
  if [ -n "$PID" ]; then
    kill "$PID" 2>/dev/null || true
  fi
fi

# 删除目录
log_info "删除 ClawDash 目录..."
rm -rf "$CLAWDASH_DIR"
log_info "删除日志..."
rm -f /var/log/clawdash.log

# 清理完成
echo ""
echo "=========================================="
echo "  🎉 ClawDash 卸载完成"
echo "=========================================="
echo ""
log_info "已删除："
echo "  - 服务已停止"
echo "  - /opt/clawdash 目录"
echo "  - 日志文件"
echo ""
log_info "OpenClaw 未受影响"
echo ""