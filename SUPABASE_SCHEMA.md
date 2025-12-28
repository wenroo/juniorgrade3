# Supabase 数据库架构设计

## 数据库表结构

### 1. words 表（单词主表）

```sql
CREATE TABLE words (
  id BIGINT PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_words_word ON words(word);
```

### 2. translations 表（翻译表）

```sql
CREATE TABLE translations (
  id BIGSERIAL PRIMARY KEY,
  word_id BIGINT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- 词性: n., v., adj., etc.
  translation TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_translations_word_id ON translations(word_id);
CREATE INDEX idx_translations_type ON translations(type);
```

### 3. examples 表（例句表）

```sql
CREATE TABLE examples (
  id BIGSERIAL PRIMARY KEY,
  word_id BIGINT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  example TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_examples_word_id ON examples(word_id);
```

### 4. phonetics 表（音标表）

```sql
CREATE TABLE phonetics (
  word_id BIGINT PRIMARY KEY REFERENCES words(id) ON DELETE CASCADE,
  phonetic TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. user_word_status 表（用户学习状态表）

```sql
CREATE TABLE user_word_status (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 创建索引
CREATE INDEX idx_user_word_status_user_id ON user_word_status(user_id);
CREATE INDEX idx_user_word_status_word_id ON user_word_status(word_id);
CREATE INDEX idx_user_word_status_recite ON user_word_status(recite) WHERE recite = TRUE;
CREATE INDEX idx_user_word_status_important ON user_word_status(important) WHERE important = TRUE;
```

## Row Level Security (RLS) 策略

### words, translations, examples, phonetics 表
这些表是公共数据，所有用户可读，但只有管理员可写。

```sql
-- 启用 RLS
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE phonetics ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取
CREATE POLICY "Allow public read access" ON words FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON translations FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON examples FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON phonetics FOR SELECT USING (true);
```

### user_word_status 表
用户只能访问自己的学习状态。

```sql
-- 启用 RLS
ALTER TABLE user_word_status ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的状态
CREATE POLICY "Users can view own status" ON user_word_status
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能插入自己的状态
CREATE POLICY "Users can insert own status" ON user_word_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的状态
CREATE POLICY "Users can update own status" ON user_word_status
  FOR UPDATE USING (auth.uid() = user_id);
```

## 数据迁移步骤

1. 在 Supabase Dashboard 中执行上述 SQL 创建表结构
2. 运行数据迁移脚本，将 JSON 数据导入 Supabase
3. 更新前端代码使用 Supabase 客户端
4. 测试所有功能

## API 查询示例

### 获取所有单词（含翻译、例句、音标）
```javascript
const { data, error } = await supabase
  .from('words')
  .select(`
    *,
    translations (*),
    examples (*),
    phonetics (*)
  `)
```

### 获取用户学习状态
```javascript
const { data, error } = await supabase
  .from('user_word_status')
  .select('*')
  .eq('user_id', userId)
```

### 更新用户单词状态
```javascript
const { data, error } = await supabase
  .from('user_word_status')
  .upsert({
    user_id: userId,
    word_id: wordId,
    learned: true,
    error_count: 5
  })
```
