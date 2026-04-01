# 小砚云控 (ClawDash) 完成状态

## 项目结构

```
clawdash/
├── src/
│   └── index.js          # 主程序 ✅
├── public/
│   └── index.html       # Web 界面 ✅
├── install.sh          # 一键安装脚本 ✅
├── package.json         # 项目配置 ✅
├── CONFIG.md          # 配置文件 ✅
├── README.md          # 说明文档 ✅
```

## 功能完成

### 1. 模型 ✅
- [x] 获取已配置的模型列表
- [x] 切换模型
- [x] 添加模型（自定义 API 地址、API Key）
- [x] 查看当前模型

### 2. 网关控制 ✅
- [x] 重启网关
- [x] 启动网关
- [x] 停止网关
- [x] 查看网关状态

### 3. 配置管理 ✅
- [x] 查看所有配置
- [x] 修改配置（key.value 格式）
- [x] 验证配置

### 4. 社交接入 ✅（新增）
- [x] 网页交互开关（开启/关闭）
- [x] Telegram 接入
- [x] Discord 接入
- [x] 飞书接入
- [x] WhatsApp 接入
- [x] Slack 接入
- [x] Matrix 接入
- [x] Signal 接入
- [x] LINE 接入
- [x] 查看已接入列表

### 5. 运维 ✅（新增）
- [x] 重启网关
- [x] 启动网关
- [x] 停止网关
- [x] 抹掉配置重置

### 6. 一键部署 ✅
- [x] 非交互式部署
- [x] 配置模型/API
- [x] 安装服务

### 7. 训练模板 ✅
- [x] 导出配置和记忆
- [x] 导入配置和记忆

## 一键部署命令

```bash
curl -s https://raw.githubusercontent.com/Lifeyumo/ClawDash/main/install.sh | bash
```

访问 http://IP:99

## GitHub

https://github.com/Lifeyumo/ClawDash