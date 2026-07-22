# Exam Plugin

一个 Obsidian 插件，将考试题目渲染成精美的交互式卡片。使用 XML 标签定义题目结构。

## 功能特性

- 📝 **XML 标签格式** — 使用 `<num>`、`<source>`、`<stem>`、`<options>`、`<answer>`、`<analysis>` 标签定义题目
- 🔢 **题号角标** — 支持 `<num>` 标签，显示为卡片左上角蓝色角标
- 🎨 **精美卡片设计** — 现代化卡片界面，渐变顶部装饰线
- 🌓 **深色/浅色主题** — 自动适配 Obsidian 主题
- ✅ **正确答案高亮** — 正确选项绿色边框 + 勾号标记
- 🖊️ **填空支持** — 下划线 `___` 自动渲染为填空线
- 🔍 **可折叠解析** — 点击「查看解析」展开详细分析（支持 Markdown）
- 📱 **响应式设计** — 适配移动端屏幕
- ⚠️ **错误提示** — 格式错误时显示友好提示

## 使用方法

### 基本语法

在 Obsidian 中使用 `exam` 代码块，内容为 XML 标签格式：

````markdown
```exam
<num>1</num>
<source>2022年高考英语</source>
<stem>
The company aims to ___ its market share by 20% next year.
</stem>
<options>
A. increase
B. decrease
C. maintain
D. ignore
</options>
<answer>A</answer>
<analysis>
increase 表示"增加"，decrease 表示"减少"。
根据句意"公司将目标明年增加 20% 市场份额"，应选 A。
</analysis>
```
````

### 标签说明

| 标签 | 说明 | 必需 |
|------|------|------|
| `<num>` | 题号，显示为卡片左上角蓝色角标（自动补零为两位） | ❌ |
| `<source>` | 题目来源（如 "2022年高考英语"），显示在题干前蓝色高亮 | ❌ |
| `<stem>` | 题干内容，支持 Markdown，下划线 `___` 自动转填空线 | ✅ |
| `<options>` | 选项列表，每行格式 `字母. 内容`（如 `A. 选项文本`） | ✅ |
| `<answer>` | 正确答案字母，多选用逗号分隔如 `A,C` | ✅ |
| `<analysis>` | 答案解析，支持 Markdown，点击「查看解析」展开 | ❌ |

### 各种用法示例

#### 单选题

```xml
<num>5</num>
<source>2022年春季</source>
<stem>What is the capital of France?</stem>
<options>
A. London
B. Paris
C. Berlin
D. Madrid
</options>
<answer>B</answer>
<analysis>Paris is the capital and most populous city of France.</analysis>
```

#### 多选题

在 `<answer>` 中逗号分隔多个答案：

```xml
<num>12</num>
<source>2022年期中</source>
<stem>以下哪些是哺乳动物？</stem>
<options>
A. 鲸鱼
B. 鲨鱼
C. 海豚
D. 海龟
</options>
<answer>A,C</answer>
<analysis>鲸鱼和海豚都属于海洋哺乳动物，鲨鱼是鱼类，海龟是爬行动物。</analysis>
```

#### 带填空的题目

题干中用下划线 `___` 表示填空位置：

```xml
<num>8</num>
<source>词汇练习</source>
<stem>
The project was completed ahead of ___.
</stem>
<options>
A. schedule
B. budget
C. deadline
D. plan
</options>
<answer>A</answer>
<analysis>ahead of schedule 表示"提前"，是固定搭配。</analysis>
```

#### 无来源的题目

`<source>` 和 `<num>` 为可选标签，不写则不显示：

```xml
<stem>以下哪个不是编程语言？</stem>
<options>
A. Python
B. Java
C. HTML
D. Go
</options>
<answer>C</answer>
<analysis>HTML 是标记语言（Markup Language），不是编程语言。</analysis>
```

#### 题干和解析中包含图片

```xml
<num>15</num>
<source>地理题</source>
<stem>
根据下图回答问题：

![地图](images/map.png)
</stem>
<options>
A. 北京
B. 上海
C. 广州
D. 深圳
</options>
<answer>B</answer>
<analysis>
![解析图](images/analysis.png)

图中标记位置为上海市。
</analysis>
```

## 安装

### 方式一：BRAT 安装（推荐）

1. 在 Obsidian 社区插件中搜索安装 [BRAT](https://github.com/TfTHacker/obsidian42-brat)
2. 打开 BRAT 设置 → 「Add Beta plugin」
3. 输入仓库地址：`hhtczengjing/obsidian-exam-plugin`
4. 安装后在「第三方插件」中启用

> BRAT 会自动检测 GitHub 仓库更新。

### 方式二：GitHub Release 安装

1. 前往 [Releases](https://github.com/hhtczengjing/obsidian-exam-plugin/releases) 页面
2. 下载最新版本的 `obsidian-exam-plugin.zip`
3. 解压到 `<vault>/.obsidian/plugins/obsidian-exam-plugin/`
4. 重启 Obsidian，在「第三方插件」中启用

### 方式三：手动克隆

```bash
cd <vault路径>/.obsidian/plugins/
git clone https://github.com/hhtczengjing/obsidian-exam-plugin.git
```

## 开发

```bash
npm install        # 安装依赖
npm run dev        # 开发模式（监听文件变化自动构建）
npm run build      # 生产构建
npm run release    # 打包 zip
```

## 许可证

MIT License © zengjing
