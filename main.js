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
  constructor(component) {
    this.component = component;
  }
  parseExamBlock(source) {
    const getTagContent = (tag) => {
      const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, "s");
      const match = source.match(regex);
      return match ? match[1].trim() : "";
    };
    const sourceText = getTagContent("source");
    const stem = getTagContent("stem");
    const optionsText = getTagContent("options");
    const answerText = getTagContent("answer");
    const analysis = getTagContent("analysis");
    if (!sourceText)
      throw new Error("<source> \u6807\u7B7E\u4E0D\u80FD\u4E3A\u7A7A");
    if (!stem)
      throw new Error("<stem> \u6807\u7B7E\u4E0D\u80FD\u4E3A\u7A7A");
    if (!optionsText)
      throw new Error("<options> \u6807\u7B7E\u4E0D\u80FD\u4E3A\u7A7A");
    if (!answerText)
      throw new Error("<answer> \u6807\u7B7E\u4E0D\u80FD\u4E3A\u7A7A");
    const optionLines = optionsText.trim().split("\n").filter((line) => line.trim());
    const options = [];
    for (const line of optionLines) {
      const match = line.trim().match(/^([A-D])\.?\s+(.+?)(\s+\*)?$/);
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
    return { source: sourceText, stem, options, answer, analysis };
  }
  async render(source, el, ctx) {
    try {
      const exam = this.parseExamBlock(source);
      const wrapper = el.createDiv("exam-card-wrapper");
      const card = wrapper.createDiv("exam-card");
      const content = card.createDiv("exam-card-content");
      const stemDiv = content.createDiv("exam-card-question");
      await this.renderMarkdown(exam.stem, stemDiv, ctx.sourcePath);
      stemDiv.querySelectorAll("p, li, h1, h2, h3, h4, h5, h6, blockquote").forEach((el2) => {
        el2.innerHTML = el2.innerHTML.replace(/_+/g, '<span class="exam-card-blank"></span>');
      });
      stemDiv.innerHTML = stemDiv.innerHTML.replace(/_+/g, '<span class="exam-card-blank"></span>');
      const sourceSpan = document.createElement("span");
      sourceSpan.className = "exam-card-source";
      sourceSpan.textContent = `\uFF08${exam.source}\uFF09`;
      const firstP = stemDiv.querySelector("p");
      if (firstP) {
        firstP.insertBefore(sourceSpan, firstP.firstChild);
      } else {
        stemDiv.insertBefore(sourceSpan, stemDiv.firstChild);
      }
      const optionsDiv = content.createDiv("exam-card-options");
      exam.options.forEach((opt) => {
        const isCorrect = exam.answer.includes(opt.label);
        const optEl = optionsDiv.createDiv("exam-card-option" + (isCorrect ? " correct" : ""));
        const label = optEl.createSpan("exam-card-option-label");
        label.textContent = opt.label;
        const text = optEl.createSpan();
        text.textContent = opt.text;
      });
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
  async renderMarkdown(markdown, el, sourcePath) {
    await import_obsidian.MarkdownRenderer.renderMarkdown(markdown, el, sourcePath, this.component);
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
}

.exam-card-wrapper {
  position: relative;
  margin: 16px 0;
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
  padding: 20px 24px;
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
  margin-bottom: 8px;
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

.exam-card-expand {
  padding: 10px 24px;
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
  padding: 20px 24px;
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
var ExamCardPlugin = class extends import_obsidian2.Plugin {
  async onload() {
    const render = (source, el, ctx) => {
      const renderer = new ExamCardRenderer(this);
      renderer.render(source, el, ctx);
    };
    this.registerMarkdownCodeBlockProcessor("exam", render);
    for (let i = 1; i <= 99; i++) {
      this.registerMarkdownCodeBlockProcessor(`exam${i}`, render);
    }
    const style = document.createElement("style");
    style.textContent = EXAM_CARD_STYLE;
    document.head.appendChild(style);
  }
  onunload() {
  }
};
