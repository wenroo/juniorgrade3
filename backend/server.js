const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3123;
const DATA_FILE = path.join(__dirname, 'words_26.json'); // 你的数据文件路径

// 中间件
app.use(cors()); // 允许前端跨域访问
app.use(bodyParser.json({ limit: '50mb' })); // 支持大数据量的JSON

// 1. 获取单词列表 (GET)
app.get('/api/words', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            // 如果文件不存在，返回空数组
            return res.json([]);
        }
        try {
            res.json(JSON.parse(data));
        } catch (e) {
            res.status(500).send('数据文件格式错误');
        }
    });
});

// 2. 保存单词列表 (POST)
app.post('/api/words', (req, res) => {
    const newData = req.body;
    // 将数据写入文件
    fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('写入文件失败');
        }
        console.log('数据已保存！时间:', new Date().toLocaleString());
        res.send({ success: true, message: '保存成功' });
    });
});

// 启动服务
app.listen(PORT, '0.0.0.0', () => {
    console.log(`后端服务已启动!`);
    console.log(`Local (WSL内部): http://localhost:${PORT}`);
    console.log(`Windows访问:     http://localhost:${PORT}`); 
});