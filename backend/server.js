const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3123;
const DATA_FILE = path.join(__dirname, 'data/words_26.json'); // 你的数据文件路径
const PHONETIC_FILE = path.join(__dirname, 'data/phonetics.json'); // 音标数据文件
const USER_STATUS_FILE = path.join(__dirname, 'data/user_word_status.json'); // 用户状态数据文件
const IRREGULAR_WORDS_FILE = path.join(__dirname, 'data/irregular_words.json'); // 不规则动词数据文件
const SETTINGS_FILE = path.join(__dirname, 'settings.json'); // 设置配置文件

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

// 1.5 获取音标数据 (GET)
app.get('/api/phonetics', (req, res) => {
    fs.readFile(PHONETIC_FILE, 'utf8', (err, data) => {
        if (err) {
            // 如果文件不存在，返回空对象
            return res.json();
        }
        try {
            res.json(JSON.parse(data));
        } catch (e) {
            res.status(500).send('音标文件格式错误');
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

// 3. 更新单个单词的音标 (PATCH) - 已废弃，保留用于兼容
app.patch('/api/words/:id/phonetic', (req, res) => {
    const wordId = parseInt(req.params.id);
    const { phonetic } = req.body;

    // 读取音标文件
    fs.readFile(PHONETIC_FILE, 'utf8', (err, data) => {
        let phonetics = {};

        // 如果文件存在，解析数据
        if (!err && data) {
            try {
                phonetics = JSON.parse(data);
            } catch (e) {
                console.error('音标文件格式错误:', e);
            }
        }

        // 更新音标数据 (使用 wordId 作为 key)
        phonetics[wordId] = phonetic;

        // 保存回文件
        fs.writeFile(PHONETIC_FILE, JSON.stringify(phonetics, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('保存音标失败');
            }
            console.log(`单词 ID ${wordId} 的音标已更新: ${phonetic}`);
            res.send({ success: true, message: '音标已保存', phonetic });
        });
    });
});

// 4. 批量保存音标数据 (POST)
app.post('/api/phonetics', (req, res) => {
    const phoneticsData = req.body;

    // 直接保存完整的音标对象
    fs.writeFile(PHONETIC_FILE, JSON.stringify(phoneticsData, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('保存音标失败');
        }
        console.log('音标数据已批量保存，共', Object.keys(phoneticsData).length, '条');
        res.send({ success: true, message: '音标已保存', count: Object.keys(phoneticsData).length });
    });
});

// 5. 获取用户单词状态 (GET)
app.get('/api/user-status', (req, res) => {
    fs.readFile(USER_STATUS_FILE, 'utf8', (err, data) => {
        if (err) {
            // 如果文件不存在，返回空对象
            return res.json({ words: [] });
        }
        try {
            res.json(JSON.parse(data));
        } catch (e) {
            res.status(500).send('用户状态文件格式错误');
        }
    });
});

// 6. 更新单个单词的用户状态 (PATCH)
app.patch('/api/user-status/:id', (req, res) => {
    const wordId = parseInt(req.params.id);
    const statusUpdates = req.body;

    // 读取现有状态文件
    fs.readFile(USER_STATUS_FILE, 'utf8', (err, data) => {
        let userStatus = { words: [] };

        // 如果文件存在，解析数据
        if (!err && data) {
            try {
                userStatus = JSON.parse(data);
            } catch (e) {
                console.error('用户状态文件格式错误:', e);
            }
        }

        // 查找或创建该单词的状态
        let wordStatus = userStatus.words.find(w => w.id === wordId);
        if (!wordStatus) {
            wordStatus = {
                id: wordId,
                status: {
                    learned: false,
                    recite: false,
                    last_review: '',
                    important: false,
                    error_count: 0,
                    next_review_ts: 0,
                    true_count: 0
                }
            };
            userStatus.words.push(wordStatus);
        }

        // 更新状态
        Object.assign(wordStatus.status, statusUpdates);

        // 保存回文件
        fs.writeFile(USER_STATUS_FILE, JSON.stringify(userStatus, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('保存用户状态失败');
            }
            console.log(`单词 ID ${wordId} 的状态已更新:`, statusUpdates);
            res.send({ success: true, message: '状态已保存', wordId, status: wordStatus.status });
        });
    });
});

// 7. 批量更新单词和用户状态 (POST)
app.post('/api/batch-update', (req, res) => {
    const { wordUpdates, statusUpdates } = req.body;

    // 读取 words_26.json
    fs.readFile(DATA_FILE, 'utf8', (err, wordsData) => {
        if (err) {
            return res.status(500).send('读取单词文件失败');
        }

        let words = [];
        try {
            words = JSON.parse(wordsData);
        } catch (e) {
            return res.status(500).send('单词文件格式错误');
        }

        // 更新单词的翻译 used 状态
        if (wordUpdates && Array.isArray(wordUpdates)) {
            wordUpdates.forEach(update => {
                const word = words.find(w => w.id === update.id);
                if (word && word.translations && update.translationIndex !== null) {
                    if (word.translations[update.translationIndex]) {
                        word.translations[update.translationIndex].used = true;
                    }
                }
            });
        }

        // 保存更新后的单词文件
        fs.writeFile(DATA_FILE, JSON.stringify(words, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).send('保存单词文件失败');
            }

            // 读取用户状态文件
            fs.readFile(USER_STATUS_FILE, 'utf8', (err, statusData) => {
                let userStatus = { words: [] };

                if (!err && statusData) {
                    try {
                        userStatus = JSON.parse(statusData);
                    } catch (e) {
                        console.error('用户状态文件格式错误:', e);
                    }
                }

                // 更新用户状态
                if (statusUpdates && Array.isArray(statusUpdates)) {
                    statusUpdates.forEach(update => {
                        let wordStatus = userStatus.words.find(w => w.id === update.id);
                        if (!wordStatus) {
                            wordStatus = {
                                id: update.id,
                                status: {
                                    learned: false,
                                    recite: false,
                                    last_review: '',
                                    important: false,
                                    error_count: 0,
                                    next_review_ts: 0,
                                    true_count: 0
                                }
                            };
                            userStatus.words.push(wordStatus);
                        }
                        Object.assign(wordStatus.status, update.status);
                    });
                }

                // 保存用户状态文件
                fs.writeFile(USER_STATUS_FILE, JSON.stringify(userStatus, null, 2), 'utf8', (err) => {
                    if (err) {
                        return res.status(500).send('保存用户状态失败');
                    }
                    console.log('批量更新完成:', wordUpdates?.length || 0, '个单词,', statusUpdates?.length || 0, '个状态');
                    res.send({ success: true, message: '批量更新成功' });
                });
            });
        });
    });
});

// 8. 获取不规则动词数据 (GET)
app.get('/api/irregular-words', (req, res) => {
    fs.readFile(IRREGULAR_WORDS_FILE, 'utf8', (err, data) => {
        if (err) {
            // 如果文件不存在，返回空数组
            console.warn('不规则动词文件不存在:', err.message);
            return res.json([]);
        }
        try {
            const irregularWords = JSON.parse(data);
            console.log('不规则动词数据已加载，共', irregularWords.length, '条');
            res.json(irregularWords);
        } catch (e) {
            console.error('不规则动词文件格式错误:', e);
            res.status(500).send('不规则动词文件格式错误');
        }
    });
});

// 9. 获取设置配置 (GET)
app.get('/api/settings', (req, res) => {
    fs.readFile(SETTINGS_FILE, 'utf8', (err, data) => {
        if (err) {
            // 如果文件不存在，返回默认配置
            console.warn('设置文件不存在，返回默认配置');
            const defaultSettings = {
                dictation: {
                    timeLeft: 600,
                    batchSize: 10
                }
            };
            return res.json(defaultSettings);
        }
        try {
            const settings = JSON.parse(data);
            console.log('设置配置已加载');
            res.json(settings);
        } catch (e) {
            console.error('设置文件格式错误:', e);
            res.status(500).send('设置文件格式错误');
        }
    });
});

// 10. 保存设置配置 (POST)
app.post('/api/settings', (req, res) => {
    const newSettings = req.body;

    fs.writeFile(SETTINGS_FILE, JSON.stringify(newSettings, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('保存设置失败:', err);
            return res.status(500).send('保存设置失败');
        }
        console.log('设置已保存:', newSettings);
        res.send({ success: true, message: '设置已保存', settings: newSettings });
    });
});

// 启动服务
app.listen(PORT, '0.0.0.0', () => {
    console.log(`后端服务已启动!`);
    console.log(`Local (WSL内部): http://localhost:${PORT}`);
    console.log(`Windows访问:     http://localhost:${PORT}`); 
});