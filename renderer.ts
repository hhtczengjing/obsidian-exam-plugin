import { App, MarkdownPostProcessorContext, MarkdownRenderer, Component } from 'obsidian';

export interface ExamCardSettings {
  mode: 'memorize' | 'test';
}

interface ExamQuestion {
  num?: string;
  source?: string;
  stem: string;
  options: { label: string; text: string }[];
  answer: string[];
  analysis?: string;
}

export class ExamCardRenderer {
  private app: App;
  private component: Component;
  private settings: ExamCardSettings;

  constructor(app: App, component: Component, settings: ExamCardSettings) {
    this.app = app;
    this.component = component;
    this.settings = settings;
  }

  parseExamBlock(source: string): ExamQuestion {
    const getTagContent = (tag: string): string => {
      const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's');
      const match = source.match(regex);
      return match ? match[1].trim() : '';
    };

    const sourceText = getTagContent('source');
    const num = getTagContent('num');
    const stem = getTagContent('stem');
    const optionsText = getTagContent('options');
    const answerText = getTagContent('answer');
    const analysis = getTagContent('analysis');

    if (!stem) throw new Error('<stem> 标签不能为空');
    if (!optionsText) throw new Error('<options> 标签不能为空');
    if (!answerText) throw new Error('<answer> 标签不能为空');

    const optionLines = optionsText.trim().split('\n').filter(line => line.trim());
    const options: ExamQuestion['options'] = [];
    for (const line of optionLines) {
      const match = line.trim().match(/^([A-D])\.?\s*(.+?)(\s+\*)?$/);
      if (match) {
        options.push({ label: match[1], text: match[2].trim() });
      }
    }

    if (options.length === 0) {
      throw new Error('<options> 中至少需要一个选项');
    }

    const answer = answerText.split(',').map(s => s.trim()).filter(Boolean);
    if (answer.length === 0) {
      throw new Error('<answer> 标签格式错误');
    }

    return { num: num || undefined, source: sourceText || undefined, stem, options, answer, analysis };
  }

  async render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    try {
      const exam = this.parseExamBlock(source);
      const wrapper = el.createDiv('exam-card-wrapper');

      // 题号角标：卡片左上角
      if (exam.num) {
        const badge = wrapper.createDiv('exam-card-badge');
        badge.textContent = exam.num.padStart(2, '0');
      }

      const card = wrapper.createDiv('exam-card');
      const content = card.createDiv('exam-card-content');

      // 题干容器
      const stemDiv = content.createDiv('exam-card-question');
      await this.renderMarkdown(exam.stem, stemDiv, ctx.sourcePath);

      // 填空线替换：仅处理文本节点，避免破坏 <img>/<a> 等元素属性中的下划线
      this.replaceBlanks(stemDiv);

      // 在题干首段插入来源标签
      if (exam.source) {
        const firstP = stemDiv.querySelector('p');
        const target = firstP || stemDiv;

        const sourceSpan = document.createElement('span');
        sourceSpan.className = 'exam-card-source';
        sourceSpan.textContent = `（${exam.source}）`;
        target.insertBefore(sourceSpan, target.firstChild);
      }

      // 选项
      const optionsDiv = content.createDiv('exam-card-options');
      this.renderOptions(optionsDiv, exam);

      // 解析区（可折叠，Markdown 渲染）
      if (exam.analysis) {
        const expandBtn = card.createDiv('exam-card-expand');
        expandBtn.textContent = '查看解析';
        expandBtn.addEventListener('click', () => {
          card.classList.toggle('expanded');
        });

        const analysisDiv = card.createDiv('exam-card-analysis');
        const analysisInner = analysisDiv.createDiv('exam-card-analysis-inner');

        const title = analysisInner.createDiv('exam-card-analysis-title');
        title.textContent = '详细解析';

        const contentDiv = analysisInner.createDiv('exam-card-analysis-content');
        await this.renderMarkdown(exam.analysis, contentDiv, ctx.sourcePath);
      }
    } catch (error) {
      const errorDiv = el.createDiv();
      errorDiv.style.color = 'var(--text-muted)';
      errorDiv.style.padding = '16px';
      errorDiv.style.borderRadius = '8px';
      errorDiv.style.backgroundColor = 'var(--background-secondary)';
      errorDiv.style.border = '1px solid var(--background-modifier-border)';
      errorDiv.textContent = `❌ Exam Plugin: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  private renderOptions(optionsDiv: HTMLElement, exam: ExamQuestion) {
    const answerSet = new Set(exam.answer);
    const optionEls: { el: HTMLElement; label: string }[] = [];

    exam.options.forEach((opt) => {
      const optEl = optionsDiv.createDiv('exam-card-option');
      optEl.dataset.label = opt.label;
      const label = optEl.createSpan('exam-card-option-label');
      label.textContent = opt.label;
      const text = optEl.createSpan();
      text.textContent = opt.text;
      optionEls.push({ el: optEl, label: opt.label });
    });

    // 背题模式：直接高亮正确答案
    if (this.settings.mode === 'memorize') {
      exam.options.forEach((opt, i) => {
        if (answerSet.has(opt.label)) optionEls[i].el.classList.add('correct');
      });
      return;
    }

    // 做题模式：先作答，再反馈
    const isMulti = exam.answer.length > 1;
    const selected = new Set<string>();
    let answered = false;

    const feedback = optionsDiv.createDiv('exam-card-feedback');
    feedback.hidden = true;

    const submitBtn = isMulti ? optionsDiv.createDiv('exam-card-submit') : null;
    if (submitBtn) {
      submitBtn.textContent = '提交答案';
      submitBtn.hidden = true;
    }

    const showResult = (chosen: Set<string>) => {
      answered = true;
      const allCorrect =
        chosen.size === answerSet.size &&
        [...chosen].every((l) => answerSet.has(l));

      optionEls.forEach(({ el, label }) => {
        el.classList.remove('selected');
        if (answerSet.has(label)) {
          el.classList.add('correct');
        } else if (chosen.has(label)) {
          el.classList.add('wrong');
        }
      });

      if (submitBtn) submitBtn.hidden = true;

      feedback.hidden = false;
      if (allCorrect) {
        feedback.classList.add('correct');
        feedback.textContent = '✓ 回答正确';
      } else {
        feedback.classList.add('wrong');
        feedback.textContent = `✗ 回答错误，正确答案：${[...answerSet].join('、')}`;
      }
    };

    optionEls.forEach(({ el, label }) => {
      el.addEventListener('click', () => {
        if (answered) return;
        if (isMulti) {
          if (selected.has(label)) {
            selected.delete(label);
            el.classList.remove('selected');
          } else {
            selected.add(label);
            el.classList.add('selected');
          }
          if (submitBtn) submitBtn.hidden = selected.size === 0;
        } else {
          showResult(new Set([label]));
        }
      });
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (answered || selected.size === 0) return;
        showResult(new Set(selected));
      });
    }
  }

  private replaceBlanks(root: HTMLElement) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) =>
        node.textContent && node.textContent.includes('_')
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT,
    });

    const targets: Text[] = [];
    while (walker.nextNode()) targets.push(walker.currentNode as Text);

    for (const textNode of targets) {
      const parts = textNode.textContent!.split(/_+/);
      if (parts.length === 1) continue;

      const frag = document.createDocumentFragment();
      parts.forEach((part, i) => {
        if (i > 0) {
          const blank = document.createElement('span');
          blank.className = 'exam-card-blank';
          frag.appendChild(blank);
        }
        if (part) frag.appendChild(document.createTextNode(part));
      });
      textNode.replaceWith(frag);
    }
  }

  private async renderMarkdown(markdown: string, el: HTMLElement, sourcePath: string) {
    // 必须使用带 app 的 render：内部图片（相对路径 / ![[ ]]）解析为
    // .internal-embed 占位符后，只有传入 app 才会被加载成真正的 <img>
    await MarkdownRenderer.render(
      this.app,
      markdown,
      el,
      sourcePath,
      this.component
    );
  }
}
