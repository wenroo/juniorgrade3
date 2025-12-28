# Supabase 数据库设置指南

## 第一步：在 Supabase Dashboard 创建表

### 1. 登录 Supabase Dashboard
访问 https://supabase.com/dashboard 并登录你的项目

### 2. 创建 words 表

进入 SQL Editor，执行以下 SQL：

```sql
-- 创建 words 表
CREATE TABLE words (
  id BIGINT PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_words_word ON words(word);
```

### 3. 创建 translations 表

```sql
-- 创建 translations 表
CREATE TABLE translations (
  id BIGSERIAL PRIMARY KEY,
  word_id BIGINT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  translation TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_translations_word_id ON translations(word_id);
CREATE INDEX idx_translations_type ON translations(type);
```

### 4. 创建 examples 表

```sql
-- 创建 examples 表
CREATE TABLE examples (
  id BIGSERIAL PRIMARY KEY,
  word_id BIGINT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  example TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_examples_word_id ON examples(word_id);
```

### 5. 创建 phonetics 表

```sql
-- 创建 phonetics 表
CREATE TABLE phonetics (
  word_id BIGINT PRIMARY KEY REFERENCES words(id) ON DELETE CASCADE,
  phonetic TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. 创建 user_word_status 表

```sql
-- 创建 user_word_status 表
CREATE TABLE user_word_status (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  word_id BIGINT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  learned BOOLEAN DEFAULT FALSE,
  recite BOOLEAN DEFAULT FALSE,
  important BOOLEAN DEFAULT FALSE,
  error_count INTEGER DEFAULT 0,
  true_count INTEGER DEFAULT 0,
  last_review TIMESTAMP WITH TIME ZONE,
  next_review_ts BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);
```

### 7. 创建索引

```sql
-- user_word_status 表索引
CREATE INDEX idx_user_word_status_user_id ON user_word_status(user_id);
CREATE INDEX idx_user_word_status_word_id ON user_word_status(word_id);
CREATE INDEX idx_user_word_status_recite ON user_word_status(recite) WHERE recite = TRUE;
CREATE INDEX idx_user_word_status_important ON user_word_status(important) WHERE important = TRUE;
```

## 第二步：配置 Row Level Security (RLS)

### 1. 为公共数据表启用 RLS

```sql
-- 启用 RLS
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE phonetics ENABLE ROW LEVEL SECURITY;
```

### 2. 允许所有人读取公共数据

```sql
-- 允许所有人读取单词数据
CREATE POLICY "Allow public read access" ON words FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON translations FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON examples FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON phonetics FOR SELECT USING (true);
```

### 3. 配置用户状态表的 RLS

```sql
-- 启用 RLS
ALTER TABLE user_word_status ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的状态
CREATE POLICY "Users can view own status" ON user_word_status
  FOR SELECT USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');
```

-- 用户可以插入和更新自己的状态
CREATE POLICY "Users can insert own status" ON user_word_status
  FOR INSERT WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own status" ON user_word_status
  FOR UPDATE USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');
```

## 第三步：导入数据

你需要将 `backend/words_26.json` 的数据导入到 Supabase。

### 选项 1：使用 Supabase Dashboard
1. 进入 Table Editor
2. 选择对应的表
3. 点击 "Insert" -> "Insert row" 手动添加数据

### 选项 2：编写数据迁移脚本
创建一个 Node.js 脚本读取 JSON 文件并批量插入到 Supabase。

## 第四步：测试连接

在前端代码中测试 Supabase 连接是否正常。

## 下一步

完成数据库设置后，需要：
1. 将前端代码切换到使用新的 `wordServiceSupabase.js`
2. 添加用户认证功能
3. 测试所有功能是否正常
