/**
 * ClawDash - OpenClaw 云端控制面板
 * 主入口文件
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const CONFIG = {
  port: process.env.CLAWDASH_PORT || 99,
  openclawDir: process.env.OPENCLAW_DIR || path.join(process.env.HOME || '/root', '.openclaw'),
  openclawJson: 'openclaw.json',
  backupPrefix: 'openclaw.json.bak'
};

// 初始化目录
const initDirs = () => {
  const dirs = [CONFIG.openclawDir];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// 读取配置
const readConfig = () => {
  const configPath = path.join(CONFIG.openclawDir, CONFIG.openclawJson);
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    return {};
  }
};

// 写配置
const writeConfig = (config) => {
  const configPath = path.join(CONFIG.openclawDir, CONFIG.openclawJson);
  // 先备份
  const backupPath = configPath + '.bak.' + Date.now();
  if (fs.existsSync(configPath)) {
    fs.copyFileSync(configPath, backupPath);
    // 只保留最近3个备份
    const backups = fs.readdirSync(CONFIG.openclawDir)
      .filter(f => f.startsWith(CONFIG.backupPrefix))
      .sort()
      .reverse();
    backups.slice(3).forEach(f => {
      fs.unlinkSync(path.join(CONFIG.openclawDir, f));
    });
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
};

// 执行命令
const runCommand = (cmd) => {
  try {
    return { success: true, output: execSync(cmd, { encoding: 'utf8', cwd: CONFIG.openclawDir }).trim() };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

// API 路由
const apiRoutes = {
  // 获取状态
  '/api/status': (req, res) => {
    const config = readConfig();
    const gatewayStatus = runCommand('openclaw gateway status');
    res.json({
      success: true,
      data: {
        config,
        gateway: gatewayStatus.success ? gatewayStatus.output : '未运行',
        openclawDir: CONFIG.openclawDir
      }
    });
  },

  // 获取模型列表
  '/api/models': (req, res) => {
    const config = readConfig();
    const models = [];
    
    // 从配置中提取模型
    if (config.models && config.models.providers) {
      Object.entries(config.models.providers).forEach(([provider, info]) => {
        if (info.models) {
          info.models.forEach(m => {
            models.push({
              id: m.id,
              name: m.name || m.id,
              provider,
              baseUrl: info.baseUrl
            });
          });
        }
      });
    }
    
    res.json({ success: true, models });
  },

  // 获取当前模型
  '/api/models/current': (req, res) => {
    const config = readConfig();
    res.json({
      success: true,
      model: config.agents?.defaults?.model?.primary || 'minimax/MiniMax-M2.1'
    });
  },

  // 切换模型
  '/api/models/set': (req, res) => {
    const { model } = req.body;
    if (!model) {
      return res.json({ success: false, error: '缺少模型参数' });
    }
    
    const config = readConfig();
    if (!config.agents) config.agents = {};
    if (!config.agents.defaults) config.agents.defaults = {};
    if (!config.agents.defaults.model) config.agents.defaults.model = {};
    
    config.agents.defaults.model.primary = model;
    writeConfig(config);
    
    res.json({ success: true, message: `已切换到 ${model}` });
  },

  // 添加模型配置
  '/api/models/add': (req, res) => {
    const { provider, baseUrl, apiKey, modelId, api = 'anthropic-messages' } = req.body;
    if (!provider || !baseUrl || !apiKey || !modelId) {
      return res.json({ success: false, error: '缺少必要参数' });
    }
    
    const config = readConfig();
    if (!config.models) config.models = { mode: 'merge', providers: {} };
    
    config.models.providers[provider] = {
      baseUrl,
      api,
      authHeader: true,
      apiKey,
      models: [{
        id: modelId,
        name: modelId,
        reasoning: true,
        input: ['text'],
        contextWindow: 200000,
        maxTokens: 8192
      }]
    };
    
    writeConfig(config);
    res.json({ success: true, message: `已添加模型 ${provider}/${modelId}` });
  },

  // 网关控制
  '/api/gateway/restart': (req, res) => {
    const result = runCommand('openclaw gateway restart');
    res.json(result);
  },

  '/api/gateway/start': (req, res) => {
    const result = runCommand('openclaw gateway start');
    res.json(result);
  },

  '/api/gateway/stop': (req, res) => {
    const result = runCommand('openclaw gateway stop');
    res.json(result);
  },

  '/api/gateway/status': (req, res) => {
    const result = runCommand('openclaw gateway status');
    res.json(result);
  },

  // 配置管理
  '/api/config/get': (req, res) => {
    const config = readConfig();
    res.json({ success: true, config });
  },

  '/api/config/set': (req, res) => {
    const { key, value } = req.body;
    if (!key) {
      return res.json({ success: false, error: '缺少配置键' });
    }
    
    const config = readConfig();
    const keys = key.split('.');
    let obj = config;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    
    writeConfig(config);
    res.json({ success: true, message: `已设置 ${key}` });
  },

  '/api/config/validate': (req, res) => {
    const result = runCommand('openclaw config validate');
    res.json(result);
  },

  // 服务管理
  '/api/service/install': (req, res) => {
    const result = runCommand('openclaw onboard --install-daemon');
    res.json(result);
  },

  '/api/service/uninstall': (req, res) => {
    const result = runCommand('openclaw gateway stop && sudo openclaw service uninstall');
    res.json(result);
  },

  // 一键部署（完整配置）
  '/api/deploy': (req, res) => {
    const { 
      apiKey, 
      provider = 'minimax',
      authChoice = 'minimax-api-key',
      gatewayPort = 18789,
      gatewayBind = 'lan',
      skipChannels = true,
      skipSkills = true
    } = req.body;
    
    if (!apiKey) {
      return res.json({ success: false, error: '缺少 API Key' });
    }
    
    const cmd = [
      'openclaw onboard --non-interactive',
      '--accept-risk',
      `--${authChoice} ${apiKey}`,
      `--gateway-port ${gatewayPort}`,
      `--gateway-bind ${gatewayBind}`,
      skipChannels ? '--skip-channels' : '',
      skipSkills ? '--skip-skills' : '',
      '--skip-ui',
      '--no-install-daemon'
    ].filter(Boolean).join(' ');
    
    const result = runCommand(cmd);
    res.json(result);
  },

  // 训练模板 - 导出
  '/api/template/export': (req, res) => {
    const config = readConfig();
    const template = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      config: {
        models: config.models,
        agents: config.agents,
        channels: config.channels,
        tools: config.tools,
        commands: config.commands
      }
    };
    
    // 导出 memory
    const memoryDir = path.join(CONFIG.openclawDir, 'memory');
    const memories = {};
    if (fs.existsSync(memoryDir)) {
      fs.readdirSync(memoryDir).forEach(f => {
        if (f.endsWith('.md')) {
          memories[f] = fs.readFileSync(path.join(memoryDir, f), 'utf8');
        }
      });
    }
    template.memory = memories;
    
    res.json({ success: true, template });
  },

  // 训练模板 - 导入
  '/api/template/import': (req, res) => {
    const { template } = req.body;
    if (!template || !template.config) {
      return res.json({ success: false, error: '无效的模板' });
    }
    
    const config = readConfig();
    
    // 合并配置
    if (template.config.models) config.models = template.config.models;
    if (template.config.agents) config.agents = template.config.agents;
    if (template.config.channels) config.channels = template.config.channels;
    if (template.config.tools) config.tools = template.config.tools;
    if (template.config.commands) config.commands = template.config.commands;
    
    writeConfig(config);
    
    // 导入 memory
    if (template.memory) {
      const memoryDir = path.join(CONFIG.openclawDir, 'memory');
      if (!fs.existsSync(memoryDir)) {
        fs.mkdirSync(memoryDir, { recursive: true });
      }
      Object.entries(template.memory).forEach(([filename, content]) => {
        fs.writeFileSync(path.join(memoryDir, filename), content);
      });
    }
    
    res.json({ success: true, message: '模板导入成功' });
  },

  // 社交软件频道管理
  '/api/channels/list': (req, res) => {
    const result = runCommand('openclaw channels list --json');
    let channels = [];
    if (result.success) {
      try {
        channels = JSON.parse(result.output);
      } catch (e) {
        channels = result.output.split('\n').filter(l => l.trim());
      }
    }
    res.json({ success: true, channels });
  },

  '/api/channels/add': (req, res) => {
    const { channel, token, name, botToken, appToken, webhookUrl, webhookPath, baseUrl, appId, appSecret } = req.body;
    if (!channel) {
      return res.json({ success: false, error: '缺少 channel 参数' });
    }
    
    let cmd = `openclaw channels add --channel ${channel}`;
    if (token) cmd += ` --token "${token}"`;
    if (name) cmd += ` --name "${name}"`;
    if (botToken) cmd += ` --bot-token "${botToken}"`;
    if (appToken) cmd += ` --app-token "${appToken}"`;
    if (webhookUrl) cmd += ` --webhook-url "${webhookUrl}"`;
    if (webhookPath) cmd += ` --webhook-path "${webhookPath}"`;
    if (baseUrl) cmd += ` --url "${baseUrl}"`;
    
    const result = runCommand(cmd);
    res.json(result);
  },

  '/api/channels/remove': (req, res) => {
    const { channel, account } = req.body;
    if (!channel) {
      return res.json({ success: false, error: '缺少 channel 参数' });
    }
    
    let cmd = `openclaw channels remove --channel ${channel}`;
    if (account) cmd += ` --account ${account}`;
    
    const result = runCommand(cmd);
    res.json(result);
  },

  '/api/channels/login': (req, res) => {
    const { channel } = req.body;
    if (!channel) {
      return res.json({ success: false, error: '缺少 channel 参数' });
    }
    
    const result = runCommand(`openclaw channels login --channel ${channel}`);
    res.json(result);
  },

  // 获取 channels 配置（用于网页交互）
  '/api/channels/web/enable': (req, res) => {
    const config = readConfig();
    if (!config.channels) config.channels = {};
    if (!config.channels.web) {
      config.channels.web = {
        enabled: true
      };
    } else {
      config.channels.web.enabled = true;
    }
    writeConfig(config);
    res.json({ success: true, message: '网页交互已开启' });
  },

  '/api/channels/web/disable': (req, res) => {
    const config = readConfig();
    if (config.channels && config.channels.web) {
      config.channels.web.enabled = false;
      writeConfig(config);
    }
    res.json({ success: true, message: '网页交互已关闭' });
  },

  '/api/channels/web/status': (req, res) => {
    const config = readConfig();
    const webEnabled = config.channels?.web?.enabled || false;
    res.json({ success: true, enabled: webEnabled });
  },

  // 获取可用通道类型
  '/api/channels/capabilities': (req, res) => {
    const result = runCommand('openclaw channels capabilities --all --json');
    try {
      const caps = result.success ? JSON.parse(result.output) : {};
      res.json({ success: true, capabilities: caps });
    } catch (e) {
      res.json({ success: true, capabilities: {} });
    }
  },

  // 重置 OpenClaw（抹掉所有配置）
  '/api/reset': (req, res) => {
    const { confirm } = req.body;
    if (!confirm) {
      return res.json({ success: false, error: '需要确认，请传 confirm: true' });
    }
    
    // 停止网关
    runCommand('openclaw gateway stop');
    
    // 删除配置
    const configPath = path.join(CONFIG.openclawDir, CONFIG.openclawJson);
    const backupPath = configPath + '.reset.' + Date.now();
    if (fs.existsSync(configPath)) {
      fs.copyFileSync(configPath, backupPath);
    }
    
    // 重置配置
    fs.writeFileSync(configPath, JSON.stringify({}, null, 2));
    
    res.json({ success: true, message: '配置已重置，原配置备份在: ' + backupPath });
  },

  // 获取可用命令列表
  '/api/commands': (req, res) => {
    const result = runCommand('openclaw --help');
    res.json({ 
      success: true, 
      commands: result.success ? result.output.split('\n').filter(l => l.trim()) : [] 
    });
  }
};

// 创建 Express 应用
const createApp = () => {
  const app = express();
  
  app.use(cors());
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, 'public')));
  
  // 注册 API 路由
  Object.entries(apiRoutes).forEach(([route, handler]) => {
    app.all(route, handler);
  });
  
  // 首页
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });
  
  // 错误处理
  app.use((err, req, res, next) => {
    console.error(err);
    res.json({ success: false, error: err.message });
  });
  
  return app;
};

// 启动服务
const start = () => {
  initDirs();
  const app = createApp();
  app.listen(CONFIG.port, () => {
    console.log(`🦞 ClawDash 运行在 http://0.0.0.0:${CONFIG.port}`);
  });
};

// 导出
module.exports = { start, createApp, CONFIG, apiRoutes };

// 直接运行
if (require.main === module) {
  start();
}