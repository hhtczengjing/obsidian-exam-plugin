var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// main.ts
__export(exports, {
  default: () => ExamCardPlugin
});
var import_obsidian2 = __toModule(require("obsidian"));

// renderer.ts
var import_obsidian = __toModule(require("obsidian"));
var ExamCardRenderer = class {
  constructor(app, component, settings) {
    this.app = app;
    this.component = component;
    this.settings = settings;
  }
  parseExamBlock(source) {
    const getTagContent = (tag) => {
      const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, "s");
      const match = source.match(regex);
      return match ? match[1].trim() : "";
    };
    const sourceText = getTagContent("source");
    const num = getTagContent("num");
    const stem = getTagContent("stem");
    const optionsText = getTagContent("options");
    const answerText = getTagContent("answer");
    const analysis = getTagContent("analysis");
    if (!stem)
      throw new Error("<stem> \u6807\u7B7E\u4E0D\u80FD\u4E3A\u7A7A");
    if (!optionsText)
      throw new Error("<options> \u6807\u7B7E\u4E0D\u80FD\u4E3A\u7A7A");
    if (!answerText)
      throw new Error("<answer> \u6807\u7B7E\u4E0D\u80FD\u4E3A\u7A7A");
    const optionLines = optionsText.trim().split("\n").filter((line) => line.trim());
    const options = [];
    for (const line of optionLines) {
      const match = line.trim().match(/^([A-D])\.?\s*(.+?)(\s+\*)?$/);
      if (match) {
        options.push({ label: match[1], text: match[2].trim() });
      }
    }
    if (options.length === 0) {
      throw new Error("<options> \u4E2D\u81F3\u5C11\u9700\u8981\u4E00\u4E2A\u9009\u9879");
    }
    const answer = answerText.split(",").map((s) => s.trim()).filter(Boolean);
    if (answer.length === 0) {
      throw new Error("<answer> \u6807\u7B7E\u683C\u5F0F\u9519\u8BEF");
    }
    return { num: num || void 0, source: sourceText || void 0, stem, options, answer, analysis };
  }
  async render(source, el, ctx) {
    try {
      const exam = this.parseExamBlock(source);
      const wrapper = el.createDiv("exam-card-wrapper");
      if (exam.num) {
        const badge = wrapper.createDiv("exam-card-badge");
        badge.textContent = exam.num.padStart(2, "0");
      }
      const card = wrapper.createDiv("exam-card");
      const content = card.createDiv("exam-card-content");
      const stemDiv = content.createDiv("exam-card-question");
      await this.renderMarkdown(exam.stem, stemDiv, ctx.sourcePath);
      this.replaceBlanks(stemDiv);
      if (exam.source) {
        const firstP = stemDiv.querySelector("p");
        const target = firstP || stemDiv;
        const sourceSpan = document.createElement("span");
        sourceSpan.className = "exam-card-source";
        sourceSpan.textContent = `\uFF08${exam.source}\uFF09`;
        target.insertBefore(sourceSpan, target.firstChild);
      }
      const optionsDiv = content.createDiv("exam-card-options");
      this.renderOptions(optionsDiv, exam);
      if (exam.analysis) {
        const expandBtn = card.createDiv("exam-card-expand");
        expandBtn.textContent = "\u67E5\u770B\u89E3\u6790";
        expandBtn.addEventListener("click", () => {
          card.classList.toggle("expanded");
        });
        const analysisDiv = card.createDiv("exam-card-analysis");
        const analysisInner = analysisDiv.createDiv("exam-card-analysis-inner");
        const title = analysisInner.createDiv("exam-card-analysis-title");
        title.textContent = "\u8BE6\u7EC6\u89E3\u6790";
        const contentDiv = analysisInner.createDiv("exam-card-analysis-content");
        await this.renderMarkdown(exam.analysis, contentDiv, ctx.sourcePath);
      }
    } catch (error) {
      const errorDiv = el.createDiv();
      errorDiv.style.color = "var(--text-muted)";
      errorDiv.style.padding = "16px";
      errorDiv.style.borderRadius = "8px";
      errorDiv.style.backgroundColor = "var(--background-secondary)";
      errorDiv.style.border = "1px solid var(--background-modifier-border)";
      errorDiv.textContent = `\u274C Exam Plugin: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  renderOptions(optionsDiv, exam) {
    const answerSet = new Set(exam.answer);
    const optionEls = [];
    exam.options.forEach((opt) => {
      const optEl = optionsDiv.createDiv("exam-card-option");
      optEl.dataset.label = opt.label;
      const label = optEl.createSpan("exam-card-option-label");
      label.textContent = opt.label;
      const text = optEl.createSpan();
      text.textContent = opt.text;
      optionEls.push({ el: optEl, label: opt.label });
    });
    if (this.settings.mode === "memorize") {
      exam.options.forEach((opt, i) => {
        if (answerSet.has(opt.label))
          optionEls[i].el.classList.add("correct");
      });
      return;
    }
    const isMulti = exam.answer.length > 1;
    const selected = new Set();
    let answered = false;
    const feedback = optionsDiv.createDiv("exam-card-feedback");
    feedback.hidden = true;
    const submitBtn = isMulti ? optionsDiv.createDiv("exam-card-submit") : null;
    if (submitBtn) {
      submitBtn.textContent = "\u63D0\u4EA4\u7B54\u6848";
      submitBtn.hidden = true;
    }
    const showResult = (chosen) => {
      answered = true;
      const allCorrect = chosen.size === answerSet.size && [...chosen].every((l) => answerSet.has(l));
      optionEls.forEach(({ el, label }) => {
        el.classList.remove("selected");
        if (answerSet.has(label)) {
          el.classList.add("correct");
        } else if (chosen.has(label)) {
          el.classList.add("wrong");
        }
      });
      if (submitBtn)
        submitBtn.hidden = true;
      feedback.hidden = false;
      if (allCorrect) {
        feedback.classList.add("correct");
        feedback.textContent = "\u2713 \u56DE\u7B54\u6B63\u786E";
      } else {
        feedback.classList.add("wrong");
        feedback.textContent = `\u2717 \u56DE\u7B54\u9519\u8BEF\uFF0C\u6B63\u786E\u7B54\u6848\uFF1A${[...answerSet].join("\u3001")}`;
      }
    };
    optionEls.forEach(({ el, label }) => {
      el.addEventListener("click", () => {
        if (answered)
          return;
        if (isMulti) {
          if (selected.has(label)) {
            selected.delete(label);
            el.classList.remove("selected");
          } else {
            selected.add(label);
            el.classList.add("selected");
          }
          if (submitBtn)
            submitBtn.hidden = selected.size === 0;
        } else {
          showResult(new Set([label]));
        }
      });
    });
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        if (answered || selected.size === 0)
          return;
        showResult(new Set(selected));
      });
    }
  }
  replaceBlanks(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => node.textContent && node.textContent.includes("_") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    const targets = [];
    while (walker.nextNode())
      targets.push(walker.currentNode);
    for (const textNode of targets) {
      const parts = textNode.textContent.split(/_+/);
      if (parts.length === 1)
        continue;
      const frag = document.createDocumentFragment();
      parts.forEach((part, i) => {
        if (i > 0) {
          const blank = document.createElement("span");
          blank.className = "exam-card-blank";
          frag.appendChild(blank);
        }
        if (part)
          frag.appendChild(document.createTextNode(part));
      });
      textNode.replaceWith(frag);
    }
  }
  async renderMarkdown(markdown, el, sourcePath) {
    await import_obsidian.MarkdownRenderer.render(this.app, markdown, el, sourcePath, this.component);
  }
};

// styles.ts
var EXAM_CARD_STYLE = `
:root {
  --bg-page: #fafbfc;
  --bg-card: #ffffff;
  --bg-section: #f5f7fa;
  --text-primary: #1a202c;
  --text-secondary: #718096;
  --text-light: #a0aec0;
  --border: #e2e8f0;
  --blue: #3182ce;
  --blue-light: #ebf4ff;
  --green: #38a169;
  --green-light: #f0fff4;
  --red: #e53e3e;
  --red-light: #fff5f5;
}

.theme-dark {
  --bg-page: #0f1419;
  --bg-card: #1a202c;
  --bg-section: #2d3748;
  --text-primary: #e2e8f0;
  --text-secondary: #a0aec0;
  --text-light: #718096;
  --border: #2d3748;
  --blue: #63b3ed;
  --blue-light: #2c5282;
  --green: #68d391;
  --green-light: #22543d;
  --red: #fc8181;
  --red-light: #3b2d2d;
}

.exam-card-wrapper {
  position: relative;
  margin: 16px 0;
}

.exam-card-badge {
  position: absolute;
  top: 0;
  left: 0;
  padding: 3px 10px;
  border-radius: 8px 0 8px 0;
  background: var(--blue);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'Noto Sans SC', sans-serif;
  line-height: 1.4;
  z-index: 10;
}

.exam-card {
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
}

.exam-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--blue) 0%, #5a67d8 100%);
}

.exam-card-content {
  padding: 16px 24px;
  position: relative;
  z-index: 1;
}

.exam-card-source {
  color: var(--blue);
  font-weight: 500;
  margin-right: 4px;
  white-space: nowrap;
}

.exam-card-question {
  color: var(--text-primary);
  font-size: 0.96rem;
  line-height: 1.8;
}

.exam-card-question p {
  margin: 0;
}

.exam-card-question img {
  max-width: 100%;
  border-radius: 8px;
}

.exam-card-question strong {
  color: var(--text-primary);
  font-weight: 600;
}

.exam-card-blank {
  display: inline-block;
  min-width: 60px;
  border-bottom: 2px solid var(--blue);
  margin: 0 4px;
  position: relative;
  top: 3px;
}

.exam-card-options {
  display: grid;
  gap: 0;
  margin-top: 16px;
}

.exam-card-option {
  padding: 8px 0;
  border-radius: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.96rem;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.exam-card-option:hover .exam-card-option-label {
  border-color: var(--blue);
  color: var(--blue);
}

.exam-card-option-label {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.exam-card-option.correct .exam-card-option-label {
  background: var(--green);
  border-color: var(--green);
  color: #fff;
}

.exam-card-option.selected .exam-card-option-label {
  background: var(--blue);
  border-color: var(--blue);
  color: #fff;
}

.exam-card-option.wrong .exam-card-option-label {
  background: var(--red);
  border-color: var(--red);
  color: #fff;
}

.exam-card-feedback {
  margin-top: 12px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: 'Noto Sans SC', sans-serif;
}

.exam-card-feedback.correct {
  background: var(--green-light);
  color: var(--green);
}

.exam-card-feedback.wrong {
  background: var(--red-light);
  color: var(--red);
}

.exam-card-submit {
  margin-top: 16px;
  padding: 8px 0;
  border-radius: 8px;
  background: var(--blue);
  color: #fff;
  text-align: center;
  cursor: pointer;
  user-select: none;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.exam-card-submit:hover {
  opacity: 0.9;
}

.exam-card-expand {
  padding: 8px 24px;
  border-top: 1px solid var(--border);
  background: var(--bg-section);
  text-align: center;
  cursor: pointer;
  user-select: none;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.85rem;
  color: var(--blue);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.exam-card-expand:hover {
  background: var(--blue-light);
}

.exam-card-expand::after {
  content: '\u25BC';
  display: inline-block;
  font-size: 0.6rem;
  transition: transform 0.3s ease;
}

.exam-card.expanded .exam-card-expand::after {
  transform: rotate(180deg);
}

.exam-card-analysis {
  padding: 0;
  border-top: 1px solid var(--border);
  background: var(--bg-section);
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.exam-card.expanded .exam-card-analysis {
  max-height: 2500px;
}

.exam-card-analysis-inner {
  padding: 16px 24px;
}

.exam-card-analysis-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  margin-bottom: 16px;
  font-weight: 600;
}

.exam-card-analysis-content {
  color: var(--text-primary);
  line-height: 1.85;
  font-size: 0.96rem;
}

.exam-card-analysis-content p {
  margin-bottom: 12px;
}

.exam-card-analysis-content p:last-child {
  margin-bottom: 0;
}

.exam-card-analysis-content strong {
  color: var(--blue);
  font-weight: 600;
}

.exam-card-analysis-content em {
  color: var(--text-secondary);
}

.exam-card-analysis-content ul,
.exam-card-analysis-content ol {
  padding-left: 1.5em;
  margin-bottom: 12px;
}

.exam-card-analysis-content li {
  margin-bottom: 4px;
}

.exam-card-analysis-content h1,
.exam-card-analysis-content h2,
.exam-card-analysis-content h3,
.exam-card-analysis-content h4,
.exam-card-analysis-content h5,
.exam-card-analysis-content h6 {
  color: var(--text-primary);
  font-weight: 600;
  margin: 16px 0 8px 0;
}

.exam-card-analysis-content h1 { font-size: 1.4em; }
.exam-card-analysis-content h2 { font-size: 1.2em; }
.exam-card-analysis-content h3 { font-size: 1.1em; }
.exam-card-analysis-content h4 { font-size: 1em; }

.exam-card-analysis-content code {
  background: var(--bg-section);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  color: var(--blue);
}

.exam-card-analysis-content pre {
  background: var(--bg-section);
  padding: 12px 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 12px;
}

.exam-card-analysis-content pre code {
  background: none;
  padding: 0;
  color: var(--text-primary);
}

.exam-card-analysis-content blockquote {
  border-left: 3px solid var(--blue);
  padding-left: 16px;
  margin: 12px 0;
  color: var(--text-secondary);
}

.exam-card-analysis-content a {
  color: var(--blue);
  text-decoration: none;
}

.exam-card-analysis-content a:hover {
  text-decoration: underline;
}

.exam-card-analysis-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
}

.exam-card-analysis-content th,
.exam-card-analysis-content td {
  border: 1px solid var(--border);
  padding: 8px 12px;
  text-align: left;
}

.exam-card-analysis-content th {
  background: var(--bg-section);
  font-weight: 600;
}

.exam-card-analysis-content img {
  max-width: 100%;
  border-radius: 8px;
}

.exam-card-vocab-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.exam-card-vocab-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  margin-bottom: 14px;
  font-weight: 600;
}

.exam-card-vocab-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 16px;
}

.exam-card-vocab-item {
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
}

.exam-card-vocab-word {
  font-weight: 600;
  color: var(--blue);
  font-size: 0.92rem;
  margin-bottom: 4px;
}

.exam-card-vocab-def {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

@media (max-width: 640px) {
  .exam-card-content {
    padding: 16px;
  }

  .exam-card-analysis-inner {
    padding: 16px;
  }

  .exam-card-vocab-grid {
    grid-template-columns: 1fr;
  }
}
`;

// main.ts
var DEFAULT_SETTINGS = {
  mode: "memorize"
};
var ExamCardPlugin = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
  }
  async onload() {
    await this.loadSettings();
    this.registerMarkdownCodeBlockProcessor("exam", (source, el, ctx) => {
      const renderer = new ExamCardRenderer(this.app, this, this.settings);
      renderer.render(source, el, ctx);
    });
    this.addSettingTab(new ExamSettingTab(this.app, this));
    const style = document.createElement("style");
    style.textContent = EXAM_CARD_STYLE;
    document.head.appendChild(style);
  }
  onunload() {
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var ExamSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Exam Plugin \u8BBE\u7F6E" });
    new import_obsidian2.Setting(containerEl).setName("\u7B54\u9898\u6A21\u5F0F").setDesc("\u80CC\u9898\u6A21\u5F0F\uFF1A\u770B\u9898\u65F6\u76F4\u63A5\u9AD8\u4EAE\u6B63\u786E\u7B54\u6848\uFF1B\u505A\u9898\u6A21\u5F0F\uFF1A\u5148\u4F5C\u7B54\uFF0C\u518D\u5373\u65F6\u53CD\u9988\u5BF9\u9519\u3002\u4FEE\u6539\u540E\u91CD\u65B0\u6253\u5F00\u7B14\u8BB0\u751F\u6548\u3002").addDropdown((dropdown) => dropdown.addOption("memorize", "\u80CC\u9898\u6A21\u5F0F\uFF08\u76F4\u63A5\u663E\u793A\u7B54\u6848\uFF09").addOption("test", "\u505A\u9898\u6A21\u5F0F\uFF08\u5148\u4F5C\u7B54\u518D\u53CD\u9988\uFF09").setValue(this.plugin.settings.mode).onChange(async (value) => {
      this.plugin.settings.mode = value;
      await this.plugin.saveSettings();
    }));
  }
};
