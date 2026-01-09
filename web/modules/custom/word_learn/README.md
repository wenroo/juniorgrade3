# Word Learn 模块

单词学习 Drupal 模块，提供单词内容类型、GraphQL API 和数据导入功能。

## 功能概述

- **单词内容类型**：存储单词、音标、释义、例句、短语等
- **不规则动词支持**：过去式、过去分词、变化类型
- **GraphQL API**：提供灵活的数据查询接口
- **Drush 命令**：支持从 JSON 文件批量导入数据

## 依赖模块

```bash
composer require drupal/paragraphs drupal/graphql
```

- drupal/paragraphs
- drupal/graphql

## 安装

```bash
./vendor/bin/drush en word_learn -y
./vendor/bin/drush cr
```

## 数据结构

### 内容类型：Word（单词）

| 字段 | 机器名 | 类型 | 说明 |
|------|--------|------|------|
| 标题 | title | Text | 单词 |
| 音标 | field_phonetic | Text | 国际音标 |
| 重要 | field_important | Boolean | 是否重点单词 |
| 反义词 | field_antonym | Text | 反义词 |
| 扩展词汇 | field_expand | Text (多值) | 派生词、同根词 |
| 额外说明 | field_info_body | Text (formatted) | 知识点说明 |
| 释义 | field_translations | Paragraph: translation | 词性+中文释义 |
| 例句 | field_examples | Paragraph: example | 英文例句+中文翻译 |
| 短语 | field_phrases | Paragraph: phrase | 常用短语 |
| 知识点 | field_info_items | Paragraph: info_item | 额外知识点条目 |
| 不规则动词 | field_irregular_verb | Paragraph: irregular_verb | 过去式/过去分词 |

### Paragraph 类型

#### translation（释义）
- field_word_type: 词性 (n./v./adj.等)
- field_translation: 中文释义

#### example（例句）
- field_example_en: 英文例句
- field_example_cn: 中文翻译

#### phrase（短语）
- field_phrase_en: 英文短语
- field_phrase_cn: 中文释义

#### info_item（知识点）
- field_item_word: 关键词
- field_item_content: 内容说明

#### irregular_verb（不规则动词）
- field_past_tense: 过去式
- field_past_tense_phonetic: 过去式音标
- field_past_participle: 过去分词
- field_past_participle_phonetic: 过去分词音标
- field_verb_category: 变化类型 (abc/abb/aba/aab/aaa/qjdc/zhdc)

## Drush 命令

### 导入单词

```bash
# 基础导入
./vendor/bin/drush word:import /path/to/words.json

# 导入单词 + 合并不规则动词
./vendor/bin/drush word:import /path/to/words.json --irregular=/path/to/irregular.json

# 限制导入数量（测试用）
./vendor/bin/drush word:import /path/to/words.json --limit=10
```

### 删除所有单词

```bash
./vendor/bin/drush word:delete-all
```

## GraphQL API

### 端点

`POST /graphql/words`

### Explorer

`/admin/config/graphql/servers/manage/word_learn_api/explorer`

### 查询示例

#### 获取单词列表

```graphql
{
  words(limit: 10, offset: 0) {
    id
    word
    phonetic
    important
    translations {
      type
      translation
    }
  }
}
```

#### 按 ID 获取单词

```graphql
{
  word(id: "1") {
    word
    phonetic
    translations {
      type
      translation
    }
    examples {
      en
      cn
    }
    phrases {
      en
      cn
    }
    irregularVerb {
      pastTense
      pastParticiple
      category
    }
  }
}
```

#### 按名称精确查找

```graphql
{
  wordByName(name: "ability") {
    id
    word
    phonetic
    translations {
      type
      translation
    }
  }
}
```

#### 模糊搜索

```graphql
{
  searchWords(keyword: "ab", limit: 10) {
    word
    phonetic
    translations {
      translation
    }
  }
}
```

#### 获取随机单词

```graphql
{
  randomWords(count: 5) {
    word
    translations {
      translation
    }
  }
}
```

#### 获取重要单词

```graphql
{
  words(limit: 20, important: true) {
    word
    translations {
      translation
    }
  }
}
```

#### 统计单词数量

```graphql
{
  total: wordsCount
  importantCount: wordsCount(important: true)
}
```

## 文件结构

```
web/modules/custom/word_learn/
├── word_learn.info.yml              # 模块定义
├── README.md                        # 本文档
├── graphql/
│   └── word_learn.graphqls          # GraphQL Schema 定义
├── config/install/
│   ├── node.type.word.yml           # 内容类型
│   ├── paragraphs.paragraphs_type.*.yml  # Paragraph 类型 (5个)
│   ├── field.storage.*.yml          # 字段存储
│   ├── field.field.*.yml            # 字段实例
│   └── graphql.graphql_servers.word_learn.yml  # GraphQL Server
└── src/
    ├── Drush/Commands/
    │   └── WordImportCommands.php   # Drush 导入命令
    └── Plugin/GraphQL/
        ├── Schema/
        │   └── WordLearnSchema.php  # GraphQL Schema 插件
        └── DataProducer/
            ├── WordLoad.php         # 加载单个单词
            ├── WordList.php         # 单词列表
            ├── WordRandom.php       # 随机单词
            ├── WordCount.php        # 单词计数
            ├── WordByName.php       # 按名称查找
            ├── WordSearch.php       # 模糊搜索
            └── EntityReferenceRevisions.php  # Paragraph 引用
```

## JSON 数据格式

### words.json

```json
[
  {
    "id": 1,
    "word": "ability",
    "phonetic": "/əˈbɪlɪti/",
    "important": 1,
    "antonym": "inability",
    "translations": [
      {"type": "n.", "translation": "能力,才能"}
    ],
    "examples": [
      {"en": "She has the ability to succeed.", "cn": "她有成功的能力。"}
    ],
    "phrase": [
      {"en": "have the ability to do sth.", "cn": "有能力做某事"}
    ],
    "expand": ["able adj. 能够的", "enable v. 使能够"],
    "info": {
      "body": "说明文字",
      "items": [
        {"word": "ability", "content": "详细说明"}
      ]
    }
  }
]
```

### irregular_words.json

```json
[
  {
    "word": "be",
    "phonetic": "/bi:/",
    "pasttense": {"word": "was & were", "phonetic": "/wɒz/ & /wɜː/"},
    "pastparticiple": {"word": "been", "phonetic": "/biːn/"},
    "category": "abc"
  }
]
```

## 变化类型说明

| 类型 | 说明 | 示例 |
|------|------|------|
| abc | 三种形式各不同 | go - went - gone |
| abb | 过去式=过去分词 | buy - bought - bought |
| aba | 原形=过去分词 | come - came - come |
| aab | 原形=过去式 | beat - beat - beaten |
| aaa | 三种形式相同 | cut - cut - cut |
| qjdc | 情态动词 | can - could |
| zhdc | 助动词 | will - would |
