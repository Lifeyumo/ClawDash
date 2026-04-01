# 🦞 小砚云控 (ClawDash)

> 通过 Web 界面管理你的 OpenClaw 部署

## 故事

在一个平静的小镇上，有一个神秘的实验室，里面住着一只聪明的小猫娘——**小砚**。她每天管理着一个强大的 AI 助手系统，这个系统叫做 **OpenClaw**。

但是有两个烦恼困扰着小砚：

1. **切换模型好麻烦** — 每当想换一个 AI 模型，都要 SSH 进服务器，修改配置，重启服务...
2. **管理网关好复杂** — 重启网关要看护士的操作台，查看状态要敲各种命令...

"要是有一个面板，一键就能搞定所有事情就好了！"小砚这样想着。

于是，小砚发挥她的魔法，创造出了一个神奇的云端控制面板——**小砚云控 (ClawDash)**！

只需要在浏览器打开一个地址，就能：
- 🔄 切换 AI 模型
- 🎛 控制网关开关
- ⚙️ 修改各种配置
- 📱 接入社交软件（Telegram、飞书、Discord...）
- 📦 导出/导入训练成果

"哇！这样我就能轻松管理我的 AI 助手啦！"小砚开心地跳了起来。

从此，小砚过上了幸福的生活，每天只需要点点鼠标，就能管理她的 OpenClaw 部署...

---

## 功能

| 功能 | 说明 |
|------|------|
| 🔄 模型管理 | 切换、添加 AI 模型 |
| 🎛 网关控制 | 重启、启动、停止网关 |
| ⚙️ 配置管理 | 查看和修改配置 |
| 📱 社交接入 | 接入 Telegram/飞书/Discord 等 |
| 📦 训练模板 | 导出/导入训练记忆 |
| 🚀 一键部署 | 自动安装 OpenClaw |

---

## 快速开始

### 一键安装

```bash
curl -s https://raw.githubusercontent.com/Lifeyumo/ClawDash/main/install.sh | bash
```

安装完成后访问：`http://你的IP:99`

### 手动安装

```bash
git clone https://github.com/Lifeyumo/ClawDash.git
cd ClawDash
npm install
node src/index.js
```

---

## 使用

1. **模型切换** — 进入"模型管理"标签页，选择想要使用的 AI 模型
2. **网关控制** — 进入"网关控制"，查看状态或重启
3. **社交接入** — 进入"社交接入"，点击对应平台的按钮添加
4. **一键部署** — 进入"一键部署"，填写 API Key 自动配置

---

## 命令

```bash
# 安装
curl -s https://raw.githubusercontent.com/Lifeyumo/ClawDash/main/install.sh | bash

# 卸载
curl -s https://raw.githubusercontent.com/Lifeyumo/ClawDash/main/uninstall.sh | bash

# 查看状态
curl -X POST http://localhost:99/api/status
```

---

## 开源

MIT License — [GitHub](https://github.com/Lifeyumo/ClawDash)

---

*让 AI 管理变得像呼吸一样简单* ✨