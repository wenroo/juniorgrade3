# Word Service - Backend Switching Guide

## 概述

本项目支持两种后端方案，可以通过简单的配置切换：

1. **Local Express Backend** - 本地 Node.js Express 服务器 + JSON 文件存储
2. **Supabase Backend** - Supabase 云数据库

## 如何切换后端

只需修改 `src/services/config.js` 文件中的 `SERVICE_MODE` 配置：

```javascript
// 使用本地 Express 后端（默认）
export const SERVICE_MODE = 'local'

// 或者使用 Supabase 后端
export const SERVICE_MODE = 'supabase'
```

修改后刷新页面即可生效，无需修改任何组件代码。

## 文件说明

### 核心文件

- **`config.js`** - 后端配置文件，控制使用哪个后端
- **`index.js`** - 统一入口，根据配置自动导出对应的服务
- **`wordService.js`** - 本地 Express 后端实现
- **`wordServiceSupabase.js`** - Supabase 后端实现
- **`supabaseClient.js`** - Supabase 客户端配置

### 使用方式

所有组件统一使用以下方式导入：

```javascript
import { useWordService } from '@/services'
```

系统会根据 `config.js` 的配置自动加载对应的后端实现。

## 两种方案对比

### Local Express Backend

**优点：**
- 完全本地控制，无需网络连接
- 数据存储在本地 JSON 文件
- 简单直接，易于调试

**缺点：**
- 需要手动启动后端服务器
- 不支持多用户
- 数据不会自动同步

**启动方式：**
```bash
cd backend
node server.js
```

### Supabase Backend

**优点：**
- 云端数据库，自动同步
- 支持多用户和用户认证
- 无需手动管理后端服务器
- 提供实时数据更新

**缺点：**
- 需要网络连接
- 依赖第三方服务
- 可能有使用配额限制

**配置：**
- Supabase URL 和 API Key 在 `supabaseClient.js` 中配置
- 默认使用匿名用户模式（DEFAULT_USER_ID）

## 注意事项

1. 切换后端后，数据不会自动迁移，需要手动处理数据迁移
2. 两种后端的数据结构略有不同，但接口保持一致
3. 建议在开发环境使用 Local Backend，生产环境使用 Supabase
4. 切换后建议清除浏览器缓存以避免数据冲突

## 开发建议

- 保持两种实现的接口一致性
- 新增功能时同时更新两个实现
- 使用 TypeScript 可以更好地保证接口一致性
