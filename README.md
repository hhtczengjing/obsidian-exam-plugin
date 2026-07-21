# Exam Plugin

一个 Obsidian 插件，将考试题目渲染成精美的交互式卡片。支持 XML 格式的题目定义，包含题干、选项、答案和详细解析。

## 功能特性

- 📝 **XML 格式支持** - 使用简洁的 XML 标签定义题目
- 🎨 **精美卡片设计** - 现代化的交互式卡片界面
- 🌓 **深色/浅色主题** - 自适应 Obsidian 主题
- 📱 **响应式设计** - 支持各种屏幕尺寸
- 🔵 **圆形选项按钮** - ABCD 选项用圆形按钮表示
- 🔍 **可折叠解析** - 点击展开详细答案解析
- ✨ **Markdown 支持** - 题干和解析支持完整的 Markdown 语法
- 🖼️ **图片支持** - 题目中可以嵌入图片

## 使用方法

### 基本语法

在 Obsidian 中创建代码块，使用 `exam` 或 `exam1`、`exam2` 等作为语言标识：

```xml
```exam1
<source>2022 Exam</source>
<stem>题目内容，可以包含 ![图片](image.png)</stem>
<options>
A. 选项A
B. 选项B
C. 选项C
D. 选项D
</options>
<answer>B</answer>
<analysis>
## 解析标题

详细的答案解析，支持 **加粗**、*斜体*、列表等 Markdown 格式。

- 列表项1
- 列表项2

### 子标题

更多内容...
</analysis>
```
```

### 标签说明

| 标签 | 说明 | 必需 |
|------|------|------|
| `<source>` | 题目来源（如 "2022 山东国考"） | ✅ |
| `<stem>` | 题干内容 | ✅ |
| `<options>` | 选项列表（A、B、C、D） | ✅ |
| `<answer>` | 正确答案（A/B/C/D） | ✅ |
| `<analysis>` | 详细解析（可选） | ❌ |

### 高级功能

#### 题干中的图片
```xml
<stem>
题目描述文本

![描述](images/diagram.png)

更多文本...
</stem>
```

#### 选项中的图片
```xml
<options>
A. 选项A描述 ![图片A](option-a.png)
B. 选项B描述
C. 选项C描述
D. 选项D描述
</options>
```

#### 解析中的 Markdown
```xml
<analysis>
## 主标题

### 副标题

**加粗文本** 和 *斜体文本*

`代码片段`

[链接文本](https://example.com)

- 列表项1
- 列表项2

### 错误选项分析

- **A** - 原因1
- **B** - 原因2
</analysis>
```

## 多选题支持

如需支持多选题，在 `<answer>` 标签中用逗号分隔多个答案：

```xml
<answer>A,C</answer>
```

此时对应的选项按钮会同时显示为绿色。

## 样式特性

- **圆形字母按钮** - ABCD 以 40px 圆形按钮显示
- **悬停效果** - 鼠标悬停时边框变蓝
- **正确答案高亮** - 正确的选项按钮变成绿色
- **可折叠解析** - "View Analysis" 按钮点击展开/折叠
- **响应式** - 移动设备上自动调整布局

## 安装

### 从社区插件安装

1. 打开 Obsidian 设置
2. 进入 "社区插件" 页面
3. 搜索 "Exam Card Renderer"
4. 点击 "安装"
5. 启用插件

### 手动安装

1. 创建文件夹：`.obsidian/plugins/obsidian-exam-plugin`
2. 将 `main.js` 和 `manifest.json` 复制到该文件夹
3. 重启 Obsidian 或刷新插件列表

## 主题支持

插件自动支持 Obsidian 的浅色和深色主题，会根据主题自动调整颜色。

## 许可证

MIT License
