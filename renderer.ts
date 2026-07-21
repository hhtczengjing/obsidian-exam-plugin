import { MarkdownPostProcessorContext } from 'obsidian';

interface ExamQuestion {
  source: string;
  stem: string;
  options: { label: string; text: string }[];
  answer: string[];
  analysis?: string;
}

export class ExamCardRenderer {
  parseExamBlock(source: string): ExamQuestion {
    // 解析 XML 标签
    const getTagContent = (tag: string): string => {
      const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's');
      const match = source.match(regex);
      return match ? match[1].trim() : '';
    };

    const sourceText = getTagContent('source');
    const stem = getTagContent('stem');
    const optionsText = getTagContent('options');
    const answerText = getTagContent('answer');
    const analysis = getTagContent('analysis');

    if (!sourceText) throw new Error('<source> 标签不能为空');
    if (!stem) throw new Error('<stem> 标签不能为空');
    if (!optionsText) throw new Error('<options> 标签不能为空');
    if (!answerText) throw new Error('<answer> 标签不能为空');

    // 解析选项：每行 A. xxx / A. xxx * 格式，* 标记正确答案
    const optionLines = optionsText.trim().split('\n').filter(line => line.trim());
    const options: ExamQuestion['options'] = [];
    for (const line of optionLines) {
      const match = line.trim().match(/^([A-D])\.\s+(.+?)(\s+\*)?$/);
      if (match) {
        options.push({ label: match[1], text: match[2].trim() });
      }
    }

    if (options.length === 0) {
      throw new Error('<options> 中至少需要一个选项');
    }

    // 解析答案：支持单个 B 或多选 A,C
    const answer = answerText.split(',').map(s => s.trim()).filter(Boolean);
    if (answer.length === 0) {
      throw new Error('<answer> 标签格式错误');
    }

    return { source: sourceText, stem, options, answer, analysis };
  }

  render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    try {
      const exam = this.parseExamBlock(source);
      const wrapper = el.createDiv('exam-card-wrapper');

      // 卡片容器
      const card = wrapper.createDiv('exam-card');

      // 内容区
      const content = card.createDiv('exam-card-content');

      // 头部：来源
      const header = content.createDiv('exam-card-header');
      const sourceSpan = header.createSpan('exam-card-source');
      sourceSpan.textContent = exam.source;

      // 题干
      const stemDiv = content.createDiv('exam-card-question');
      stemDiv.innerHTML = this.formatStem(exam.stem);

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

      // 解析区（可折叠）
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
        const paragraphs = exam.analysis.split('\n').filter(p => p.trim());
        if (paragraphs.length > 1) {
          contentDiv.innerHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
        } else {
          contentDiv.textContent = exam.analysis;
        }
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

  private formatStem(stem: string): string {
    // 下划线转填空线
    return stem.replace(/_+/g, '<span class="exam-card-blank"></span>');
  }
}
