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
var import_obsidian = __toModule(require("obsidian"));

// renderer.ts
var ExamCardRenderer = class {
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
      const match = line.trim().match(/^([A-D])\.\s+(.+?)(\s+\*)?$/);
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
  render(source, el, ctx) {
    try {
      const exam = this.parseExamBlock(source);
      const wrapper = el.createDiv("exam-card-wrapper");
      const card = wrapper.createDiv("exam-card");
      const content = card.createDiv("exam-card-content");
      const header = content.createDiv("exam-card-header");
      const sourceSpan = header.createSpan("exam-card-source");
      sourceSpan.textContent = exam.source;
      const stemDiv = content.createDiv("exam-card-question");
      stemDiv.innerHTML = this.formatStem(exam.stem);
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
        const paragraphs = exam.analysis.split("\n").filter((p) => p.trim());
        if (paragraphs.length > 1) {
          contentDiv.innerHTML = paragraphs.map((p) => `<p>${p.trim()}</p>`).join("");
        } else {
          contentDiv.textContent = exam.analysis;
        }
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
  formatStem(stem) {
    return stem.replace(/_+/g, '<span class="exam-card-blank"></span>');
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
  margin: 24px 0;
}

.exam-card-badge {
  position: absolute;
  top: -4px;
  left: 24px;
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 300;
  font-size: 3.5rem;
  color: var(--blue);
  opacity: 0.08;
  z-index: 0;
}

.exam-card {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--blue);
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.08);
  position: relative;
  overflow: hidden;
}

.exam-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--blue) 0%, #5a67d8 100%);
  opacity: 1;
}

.exam-card:hover {
  box-shadow: 0 6px 16px rgba(49, 130, 206, 0.12);
}

.exam-card-content {
  padding: 32px;
  position: relative;
  z-index: 1;
}

.exam-card-header {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.96rem;
  margin-bottom: 18px;
}

.exam-card-source {
  color: var(--blue);
  font-weight: 500;
  margin-right: 8px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.exam-card-question {
  color: var(--text-primary);
  font-size: 0.96rem;
  line-height: 1.8;
}

.exam-card-blank {
  display: inline-block;
  min-width: 120px;
  border-bottom: 3px solid var(--blue);
  margin: 0 6px;
  position: relative;
  top: 3px;
  background: linear-gradient(to right, transparent 0%, var(--blue) 100%);
  background-position: bottom;
  background-size: 100% 3px;
  background-repeat: no-repeat;
}

.exam-card-options {
  display: grid;
  gap: 10px;
  margin-top: 20px;
}

.exam-card-option {
  padding: 13px 16px;
  border-radius: 8px;
  background: var(--bg-section);
  border: 1.5px solid var(--border);
  cursor: pointer;
  display: flex;
  gap: 12px;
  font-size: 0.96rem;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.exam-card-option:hover {
  border-color: var(--blue);
  background: var(--blue-light);
}

.exam-card-option-label {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.exam-card-option.correct {
  background: var(--green-light);
  border-color: var(--green);
}

.exam-card-option.correct .exam-card-option-label {
  color: var(--green);
}

.exam-card-option.correct::after {
  content: '\u2713';
  margin-left: auto;
  color: var(--green);
  font-weight: bold;
  font-size: 1.1rem;
}

.exam-card-expand {
  padding: 14px 32px;
  border-top: 1px solid var(--border);
  background: var(--bg-section);
  text-align: center;
  cursor: pointer;
  user-select: none;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.9rem;
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
  padding: 24px 32px;
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
    padding: 24px;
  }

  .exam-card-vocab-grid {
    grid-template-columns: 1fr;
  }
}
`;

// main.ts
var ExamCardPlugin = class extends import_obsidian.Plugin {
  async onload() {
    const render = (source, el, ctx) => {
      const renderer = new ExamCardRenderer();
      renderer.render(source, el, ctx);
    };
    this.registerMarkdownCodeBlockProcessor("exam", render);
    for (let i = 1; i <= 9; i++) {
      this.registerMarkdownCodeBlockProcessor(`exam${i}`, render);
    }
    const style = document.createElement("style");
    style.textContent = EXAM_CARD_STYLE;
    document.head.appendChild(style);
  }
  onunload() {
  }
};
