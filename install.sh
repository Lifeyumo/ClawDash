#!/bin/bash
# ClawDash 安装脚本
# 用法: curl -s https://raw.githubusercontent.com/[你的用户名]/clawdash/main/install.sh | bash

set -e

# 配置
CLAWDASH_DIR="/opt/clawdash"
PORT=99
GITHUB_REPO="[你的GitHub用户名]/clawdash"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查 root
if [ "$EUID" -ne 0 ]; then 
  log_warn "建议使用 root 用户运行"
fi

# 检查 Node.js
log_info "检查环境..."
if ! command -v node &> /dev/null; then
  log_info "安装 Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

NODE_VERSION=$(node -v)
log_info "Node.js: $NODE_VERSION"

# 安装 ClawDash
log_info "安装 ClawDash..."

# 创建目录
mkdir -p "$CLAWDASH_DIR"
cd "$CLAWDASH_DIR"

# 下载代码（如果没有 git 就下载 zip）
if command -v git &> /dev/null; then
  git clone https://github.com/$GITHUB_REPO.git . 2>/dev/null || log_warn "使用已有代码"
else
  log_info "安装 git..."
  apt-get install -y git
  git clone https://github.com/$GITHUB_REPO.git . 2>/dev/null || log_warn "使用已有代码"
fi

# 安装依赖
log_info "安装依赖..."
npm install --production 2>/dev/null || npm install

# 启动服务
log_info "启动 ClawDash..."

# 获取 IP
HOST_IP=$(hostname -I | awk '{print $1}')

# 后台运行
nohup node src/index.js > /var/log/clawdash.log 2>&1 &
CLAWDASH_PID=$!

# 保存 PID
echo $CLAWDASH_PID > /var/run/clawdash.pid

# 等待启动
sleep 2

# 检查是否启动成功
if curl -s http://localhost:$PORT/api/status > /dev/null 2>&1; then
  log_info "====================================="
  log_info "🎉 ClawDash 安装完成！"
  log_info ""
  log_info "访问地址: http://$HOST_IP:$PORT"
  log_info "本地地址: http://localhost:$PORT"
  log_info ""
  log_info "管理命令:"
  log_info "  启动: systemctl start clawdash"
  log_info "  停止: systemctl stop clawdash"
  log_info "  日志: journalctl -u clawdash -f"
  log_info "====================================="
else
  log_error "启动失败，请检查日志: /var/log/clawdash.log"
fi