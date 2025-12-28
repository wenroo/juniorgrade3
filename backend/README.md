# 后端服务管理说明

## ⚠️ 重要提示

**后端服务需要手动启动和管理，请勿自动启动！**

用户需要在 terminal 中手动控制服务的启动、重启和查看状态。

## 启动服务

```bash
cd backend
node server.js
```

服务将在 `http://localhost:3123` 启动

## 查看服务状态

```bash
# 查看是否有 server.js 进程在运行
ps aux | grep "node server.js" | grep -v grep

# 或者测试 API 是否响应
curl http://localhost:3123/api/words | head -c 100
```

## 停止服务

```bash
# 方法 1: 在运行服务的 terminal 中按 Ctrl+C

# 方法 2: 查找并杀死进程
pkill -f "node server.js"

# 方法 3: 找到 PID 后手动 kill
ps aux | grep "node server.js" | grep -v grep
kill <PID>
```

## 重启服务

```bash
# 停止服务
pkill -f "node server.js"

# 启动服务
cd backend
node server.js
```

## API 端点

- `GET /api/words` - 获取单词列表
- `POST /api/words` - 保存单词列表
- `GET /api/phonetics` - 获取音标数据
- `POST /api/phonetics` - 批量保存音标
- `PATCH /api/words/:id/phonetic` - 更新单个单词音标（已废弃）
- `GET /api/user-status` - 获取用户单词状态
- `PATCH /api/user-status/:id` - 更新单个单词状态
- `POST /api/batch-update` - 批量更新单词和用户状态

## 数据文件

- `words_26.json` - 单词数据
- `phonetics.json` - 音标数据
- `user_word_status.json` - 用户学习状态

## 依赖

```bash
npm install
```

依赖包：
- express
- cors
- body-parser
