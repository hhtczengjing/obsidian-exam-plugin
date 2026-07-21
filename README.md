# Exam Plugin

一个 Obsidian 插件，将考试题目渲染成精美的交互式卡片。

## 功能特性

- 🎨 **精美卡片设计** — 带序号角标、渐变顶栏的现代化卡片
- 🌓 **深色/浅色主题** — 自动适配 Obsidian 主题
- 📝 **简洁语法** — 基于纯文本行格式，无需 XML
- ✅ **正确答案标记** — 选项末尾 `*` 标记正确答案，绿色高亮 + ✓ 勾号
- 🖊️ **填空支持** — 下划线 `___` 自动渲染为填空线
- 🔍 **可折叠解析** — 点击「查看解析」展开详细分析
- 📖 **词汇表** — 支持在解析区展示相关词汇释义
- 📱 **响应式设计** — 适配移动端屏幕
- ⚠️ **错误提示** — 格式错误时显示友好提示

## 使用方法

### 基本语法

在 Obsidian 中使用 `exam` 代码块：

````markdown
```exam
1 2022年春季
The company aims to ___ its market share by 20% next year.
A. increase *
B. decrease
C. maintain
D. ignore
解析：increase 表示"增加"，符合句意 "公司将目标明年增加 20% 市场份额"。
词汇：
aim to - 旨在，目标是
market share - 市场份额
```
````

### 渲染效果

卡片包含：
- 左上方大号淡色数字角标（题号）
- 题号 + 来源作为头部
- 题干（下划线 `___` 渲染为填空线）
- 选项列表（ABCD）
- 正确答案以绿色边框 + ✓ 标记
- 底部「查看解析 ▼」按钮，点击展开

### 格式说明

```
第一行：<题号> <来源>
随后行：题干内容（支持多行，下划线 ___ 转为填空）
选项：  A/B/C/D. <选项内容> [*]
解析：  解析：<解析内容>（可选）
词汇：  词汇：（可选，下一行开始 word - definition 格式）
```

### 各元素详解

#### 第一行 — 题号 + 来源

```
1 2022年高考英语
```

| 部分 | 说明 |
|------|------|
| `1` | 题号，渲染为卡片左上角的淡色水印 |
| `2022年高考英语` | 来源，显示在题干前（蓝色高亮） |

#### 题干

支持多行文本，其中的连续下划线 `___` 会被渲染为填空线：

```exam
2 词汇运用
The project was completed ahead of ___.
A. schedule *
B. budget
C. deadline
D. plan
```

#### 选项

每行一个选项，格式为 `<字母>. <内容>`，正确答案在末尾加 `*`：

```
A. increase *
B. decrease
C. maintain
D. ignore
```

- 正确答案显示为绿色边框 + 绿色 ✓ 标记
- 无需显式 `<answer>` 标签

#### 解析（可选）

以 `解析：` 开头，后面的内容会显示在可折叠区域：

```
解析：increase 表示增加，decrease 表示减少。根据句意选 A。
```

#### 词汇（可选）

以 `词汇：` 开头，随后每行 `word - definition` 格式：

```
词汇：
aim to - 目标是
market share - 市场份额
schedule - 日程安排
```

词汇会以网格形式展示在解析区域下方，单词以蓝色高亮。

## 语法速查

| 元素 | 格式 | 必需 |
|------|------|------|
| 题号 + 来源 | `<数字> <来源文本>` | ✅ |
| 题干 | 任意文本，`___` 变填空线 | ✅ |
| 选项 | `A/B/C/D. <内容> [*]` | ✅（至少一个） |
| 解析 | `解析：<内容>` | ❌ |
| 词汇 | `词汇：` 后每行 `word - def` | ❌ |

## 安装

### 方式一：BRAT 安装（推荐）

1. 在 Obsidian 社区插件中搜索安装 [BRAT](https://github.com/TfTHacker/obsidian42-brat)
2. 打开 BRAT 设置 → 「Add Beta plugin」
3. 输入仓库地址：`zengjing/obsidian-exam-plugin`
4. 安装后在「第三方插件」中启用

> BRAT 会自动检测 GitHub 仓库更新。

### 方式二：GitHub Release 安装

1. 前往 [Releases](https://github.com/zengjing/obsidian-exam-plugin/releases) 页面
2. 下载最新版本的 `obsidian-exam-plugin.zip`
3. 解压到 `<vault>/.obsidian/plugins/obsidian-exam-plugin/`
4. 重启 Obsidian，在「第三方插件」中启用

### 方式三：手动克隆

```bash
cd <vault路径>/.obsidian/plugins/
git clone https://github.com/zengjing/obsidian-exam-plugin.git
```

然后在 Obsidian 中启用插件。

## 开发

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 构建
npm run build

# 打包发布 zip
npm run release
```

## 许可证

MIT License © zengjing
