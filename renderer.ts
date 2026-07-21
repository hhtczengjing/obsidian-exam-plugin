import { MarkdownPostProcessorContext, MarkdownRenderer, Component } from 'obsidian';

interface ExamQuestion {
  num?: string;
  source: string;
  stem: string;
  options: { label: string; text: string }[];
  answer: string[];
  analysis?: string;
}

export class ExamCardRenderer {
  private component: Component;

  constructor(component: Component) {
    this.component = component;
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

    if (!sourceText) throw new Error('<source> 标签不能为空');
    if (!stem) throw new Error('<stem> 标签不能为空');
    if (!optionsText) throw new Error('<options> 标签不能为空');
    if (!answerText) throw new Error('<answer> 标签不能为空');

    const optionLines = optionsText.trim().split('\n').filter(line => line.trim());
    const options: ExamQuestion['options'] = [];
    for (const line of optionLines) {
      const match = line.trim().match(/^([A-D])\.?\s+(.+?)(\s+\*)?$/);
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

    return { num: num || undefined, source: sourceText, stem, options, answer, analysis };
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

      // 填空线替换
      stemDiv.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, blockquote').forEach(el => {
        el.innerHTML = el.innerHTML.replace(/_+/g, '<span class="exam-card-blank"></span>');
      });
      stemDiv.innerHTML = stemDiv.innerHTML.replace(/_+/g, '<span class="exam-card-blank"></span>');

      // 在题干首段插入来源标签
      const firstP = stemDiv.querySelector('p');
      const target = firstP || stemDiv;

      const sourceSpan = document.createElement('span');
      sourceSpan.className = 'exam-card-source';
      sourceSpan.textContent = `（${exam.source}）`;
      target.insertBefore(sourceSpan, target.firstChild);

      // 选项
      const optionsDiv = content.createDiv('exam-card-options');
      exam.options.forEach((opt) => {
        const isCorrect = exam.answer.includes(opt.label);
        const optEl = optionsDiv.createDiv(
          'exam-card-option' + (isCorrect ? ' correct' : '')
        );
        const label = optEl.createSpan('exam-card-option-label');
        label.textContent = opt.label;
        const text = optEl.createSpan();
        text.textContent = opt.text;
      });

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

  private async renderMarkdown(markdown: string, el: HTMLElement, sourcePath: string) {
    await MarkdownRenderer.renderMarkdown(
      markdown,
      el,
      sourcePath,
      this.component
    );
  }
}
