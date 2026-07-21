import { MarkdownPostProcessorContext } from 'obsidian';

interface ExamQuestion {
  number: number;
  source: string;
  question: string;
  options: { label: string; text: string; correct?: boolean }[];
  analysis?: string;
  vocab?: { word: string; def: string }[];
}

export class ExamCardRenderer {
  parseExamBlock(source: string): ExamQuestion {
    const lines = source.trim().split('\n').filter(line => line.trim());
    let idx = 0;

    if (idx >= lines.length) {
      throw new Error('Empty exam block');
    }

    // 解析序号和来源
    const headerLine = lines[idx++].trim();
    const numberMatch = headerLine.match(/^(\d+)\s+(.+)$/);
    if (!numberMatch) {
      throw new Error('First line must be: <number> <source>');
    }

    const number = parseInt(numberMatch[1]);
    const sourceName = numberMatch[2];

    // 解析题干（多行，直到遇到选项）
    let question = '';
    while (idx < lines.length && !/^[A-D]\s+/.test(lines[idx].trim())) {
      question += lines[idx].trim() + ' ';
      idx++;
    }
    question = question.trim();

    if (!question) {
      throw new Error('Question text is required');
    }

    // 解析选项
    const options: ExamQuestion['options'] = [];
    while (idx < lines.length && /^[A-D]\s+/.test(lines[idx].trim())) {
      const line = lines[idx].trim();
      const match = line.match(/^([A-D])\s+(.+?)(\s+\*)?$/);
      if (match) {
        options.push({
          label: match[1],
          text: match[2].trim(),
          correct: !!match[3],
        });
      }
      idx++;
    }

    if (options.length === 0) {
      throw new Error('At least one option is required');
    }

    // 解析解析（可选）
    let analysis: string | undefined;
    if (idx < lines.length && lines[idx].startsWith('解析：')) {
      analysis = lines[idx].substring(3).trim();
      idx++;
    }

    // 解析词汇（可选）
    const vocab: ExamQuestion['vocab'] = [];
    if (idx < lines.length && lines[idx].startsWith('词汇：')) {
      idx++;
      while (idx < lines.length && lines[idx].trim()) {
        const vocabLine = lines[idx].trim();
        const vocabMatch = vocabLine.match(/^(.+?)\s*-\s*(.+)$/);
        if (vocabMatch) {
          vocab.push({
            word: vocabMatch[1].trim(),
            def: vocabMatch[2].trim(),
          });
        }
        idx++;
      }
    }

    return { number, source: sourceName, question, options, analysis, vocab };
  }

  render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    try {
      const exam = this.parseExamBlock(source);
      const wrapper = el.createDiv('exam-card-wrapper');

      // 序号角标
      const badge = wrapper.createDiv('exam-card-badge');
      badge.textContent = exam.number.toString();

      // 卡片容器
      const card = wrapper.createDiv('exam-card');

      // 内容区
      const content = card.createDiv('exam-card-content');

      // 头部（来源 + 题干）
      const header = content.createDiv('exam-card-header');
      const sourceSpan = header.createSpan('exam-card-source');
      sourceSpan.textContent = exam.source;
      const questionSpan = header.createSpan('exam-card-question');
      questionSpan.innerHTML = this.formatQuestion(exam.question);

      // 选项
      const options = content.createDiv('exam-card-options');
      exam.options.forEach((opt) => {
        const optEl = options.createDiv(
          'exam-card-option' + (opt.correct ? ' correct' : '')
        );
        const label = optEl.createSpan('exam-card-option-label');
        label.textContent = opt.label;
        const text = optEl.createSpan();
        text.textContent = opt.text;
      });

      // 展开按钮
      if (exam.analysis || exam.vocab?.length) {
        const expandBtn = card.createDiv('exam-card-expand');
        expandBtn.textContent = '查看解析';
        expandBtn.addEventListener('click', () => {
          card.classList.toggle('expanded');
        });

        // 解析区
        const analysis = card.createDiv('exam-card-analysis');
        const analysisInner = analysis.createDiv('exam-card-analysis-inner');

        if (exam.analysis) {
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

        // 词汇
        if (exam.vocab?.length) {
          const vocabSection = analysisInner.createDiv(
            'exam-card-vocab-section'
          );
          const vocabTitle = vocabSection.createDiv('exam-card-vocab-title');
          vocabTitle.textContent = '相关词汇';
          const vocabGrid = vocabSection.createDiv('exam-card-vocab-grid');
          exam.vocab.forEach((v) => {
            const item = vocabGrid.createDiv('exam-card-vocab-item');
            const word = item.createDiv('exam-card-vocab-word');
            word.textContent = v.word;
            const def = item.createDiv('exam-card-vocab-def');
            def.textContent = v.def;
          });
        }
      }
    } catch (error) {
      const errorDiv = el.createDiv();
      errorDiv.style.color = 'var(--text-secondary)';
      errorDiv.style.padding = '16px';
      errorDiv.style.borderRadius = '8px';
      errorDiv.style.backgroundColor = 'var(--bg-section)';
      errorDiv.style.border = '1px solid var(--border)';
      errorDiv.textContent = `❌ 考题卡片错误: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  private formatQuestion(question: string): string {
    return question.replace(/_+/g, '<span class="exam-card-blank"></span>');
  }
}
