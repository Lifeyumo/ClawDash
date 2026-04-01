# 小砚云控 (ClawDash) 🦞

> OpenClaw 云端控制面板 - 通过 Web 界面管理你的 OpenClaw 部署

## 简介

小砚云控（ClawDash）是一个轻量级的 Web 管理面板，让你可以通过浏览器远程管理 OpenClaw 部署，无需 SSH 进入服务器也能切换模型、重启网关、查看配置等。

## 功能

- 🔄 **模型管理** - 切换模型、添加新模型
- 🎛 **网关控制** - 重启/启动/停止网关
- ⚙️ **配置管理** - 查看和修改所有配置
- 🚀 **一键部署** - 完整的非交互式部署
- 📦 **训练模板** - 导出/导入训练成果

## 快速开始

### 一键部署

```bash
curl -s https://raw.githubusercontent.com/Lifeyumo/ClawDash/main/install.sh | bash
```

### 手动安装

```bash
# 1. 克隆仓库
git clone https://github.com/Lifeyumo/ClawDash.git
cd ClawDash

# 2. 安装依赖
npm install

# 3. 启动
node src/index.js
```

访问 `http://你的IP:99`

## API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/status` | POST | 获取状态 |
| `/api/models` | POST | 获取模型列表 |
| `/api/models/set` | POST | 切换模型 |
| `/api/models/add` | POST | 添加模型 |
| `/api/gateway/restart` | POST | 重启网关 |
| `/api/gateway/start` | POST | 启动网关 |
| `/api/gateway/stop` | POST | 停止网关 |
| `/api/config/get` | POST | 获取配置 |
| `/api/config/set` | POST | 设置配置 |
| `/api/config/validate` | POST | 验证配置 |
| `/api/deploy` | POST | 一键部署 |
| `/api/template/export` | POST | 导出模板 |
| `/api/template/import` | POST | 导入模板 |

## 配置

- 端口: `99`（可通过 `CLAWDASH_PORT` 环境变量修改）
- 配置目录: `~/.openclaw`（可通过 `OPENCLAW_DIR` 环境变量修改）

## 技术栈

- Node.js
- Express.js
- 原生 HTML/CSS/JS

## 开源协议

MIT License

## 贡献

欢迎提交 Issue 和 PR！