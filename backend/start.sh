#!/bin/bash

# 启动后端服务的脚本
echo "正在启动后端服务..."

# 检查是否已有服务在运行
if pgrep -f "node server.js" > /dev/null; then
    echo "后端服务已在运行"
    exit 0
fi

# 启动服务
cd "$(dirname "$0")"
nohup node server.js > server.log 2>&1 &

echo "后端服务已启动，PID: $!"
echo "日志文件: $(pwd)/server.log"
