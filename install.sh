#!/bin/bash
# ClawDash 小砚云控 - 一键安装脚本
# 用法: curl -s https://raw.githubusercontent.com/Lifeyumo/ClawDash/main/install.sh | bash

set -e

# 配置
CLAWDASH_DIR="/opt/clawdash"
PORT=99
GITHUB_REPO="Lifeyumo/ClawDash"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[步骤 $1]${NC} $2"; }

echo ""
echo "=========================================="
echo "  🦞 小砚云控 ClawDash 安装脚本"
echo "=========================================="
echo ""

# 检查 root
if [ "$EUID" -ne 0 ]; then 
  log_warn "建议使用 root 用户运行以获得最佳体验"
  log_warn "当前用户: $(whoami)"
  echo ""
fi

# ========== 第1步：检查环境 ==========
log_step 1 "检查运行环境..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
  log_info "未检测到 Node.js，正在安装..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
  apt-get install -y nodejs > /dev/null 2>&1
  log_info "Node.js 安装完成"
fi

NODE_VERSION=$(node -v)
log_info "Node.js: $NODE_VERSION"

# 检查 OpenClaw
log_info "检查 OpenClaw..."
if command -v openclaw &> /dev/null; then
  OPENCLAW_VERSION=$(openclaw --version 2>/dev/null | head -1)
  log_info "OpenClaw: $OPENCLAW_VERSION"
  OPENCLAW_INSTALLED=true
else
  log_warn "未检测到 OpenClaw"
  OPENCLAW_INSTALLED=false
  echo ""
  echo "  💡 提示: 如果没有安装 OpenClaw，请先运行:"
  echo "     npm install -g openclaw"
  echo "     openclaw onboard"
  echo ""
fi

# 获取 IP
HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "127.0.0.1")
log_info "本机 IP: $HOST_IP"

# ========== 第2步：安装 ClawDash ==========
log_step 2 "安装 ClawDash..."

# 创建目录
mkdir -p "$CLAWDASH_DIR"
cd "$CLAWDASH_DIR"

# 下载代码
if command -v git &> /dev/null; then
  if [ ! -d ".git" ]; then
    log_info "下载 ClawDash 代码..."
    git clone https://github.com/$GITHUB_REPO.git . 2>/dev/null || true
  fi
else
  log_info "安装 git..."
  apt-get install -y git > /dev/null 2>&1
  if [ ! -d ".git" ]; then
    log_info "下载 ClawDash 代码..."
    git clone https://github.com/$GITHUB_REPO.git . 2>/dev/null || true
  fi
fi

# 检查是否下载成功
if [ ! -f "package.json" ]; then
  log_error "下载失败，请检查网络连接"
  exit 1
fi

# 安装依赖
log_info "安装依赖..."
npm install --production 2>/dev/null || npm install

# ========== 第3步：启动服务 ==========
log_step 3 "启动 ClawDash..."

# 检查是否已运行
if curl -s http://localhost:$PORT/api/status > /dev/null 2>&1; then
  log_warn "ClawDash 已在运行中"
  echo ""
  echo "=========================================="
  echo "  🎉 ClawDash 已经在运行！"
  echo "=========================================="
  echo ""
  echo "访问地址: http://$HOST_IP:$PORT"
  echo "本地地址: http://localhost:$PORT"
  echo ""
  if [ "$OPENCLAW_INSTALLED" = true ]; then
    echo "OpenClaw 网关: $(command -v openclaw >/dev/null && openclaw gateway status 2>/dev/null | head -1 || echo '请手动检查')"
  fi
  echo ""
  exit 0
fi

# 后台运行
nohup node src/index.js > /var/log/clawdash.log 2>&1 &
CLAWDASH_PID=$!

# 保存 PID
echo $CLAWDASH_PID > /var/run/clawdash.pid

# 等待启动
sleep 2

# 检查是否启动成功
if curl -s http://localhost:$PORT/api/status > /dev/null 2>&1; then
  echo ""
  echo "=========================================="
  echo "  🎉 ClawDash 安装完成！"
  echo "=========================================="
  echo ""
  echo "📍 访问地址:"
  echo "   本机: http://localhost:$PORT"
  echo "   局域网: http://$HOST_IP:$PORT"
  echo ""
  echo "📋 管理命令:"
  echo "   查看状态: curl http://localhost:$PORT/api/status"
  echo "   停止服务: kill \$(cat /var/run/clawdash.pid)"
  echo "   查看日志: tail -f /var/log/clawdash.log"
  echo ""
  if [ "$OPENCLAW_INSTALLED" = true ]; then
    echo "🤖 OpenClaw 状态:"
    openclaw gateway status 2>/dev/null | head -3 || echo "   请手动检查"
    echo ""
    echo "💡 现在可以:"
    echo "   1. 访问 http://$HOST_IP:$PORT 打开管理面板"
    echo "   2. 在面板中切换模型、管理网关"
    echo "   3. 接入社交软件（Telegram/飞书等）"
    echo ""
  else
    echo "⚠️ OpenClaw 未安装，请先安装后再使用本面板"
    echo ""
  fi
else
  log_error "启动失败，请检查日志: /var/log/clawdash.log"
  cat /var/log/clawdash.log 2>/dev/null | tail -10
  exit 1
fi