# ClawDash 项目配置文件

## 部署配置

- **端口**: 99
- **配置目录**: ~/.openclaw

## 默认设置

```
CLAWDASH_PORT=99
OPENCLAW_DIR=~/.openclaw
```

## 服务管理

### systemd 服务（可选）

安装后可以创建 systemd 服务：

```ini
# /etc/systemd/system/clawdash.service
[Unit]
Description=ClawDash - OpenClaw Control Panel
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/clawdash
ExecStart=/usr/bin/node /opt/clawdash/src/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启用服务：
```bash
systemctl daemon-reload
systemctl enable clawdash
systemctl start clawdash
```

## 需要的 OpenClaw 命令

确保 `openclaw` 命令可用：
```bash
npm install -g openclaw
```

## 安全注意

- 本地运行，默认只绑定了 lan
- 生产环境建议加防火墙规则
- 配置修改前会自动备份