const obsidian = require('obsidian');

class ExamCardRenderer {
  parseExamBlock(source) {
    // Extract question number from code block identifier (exam1, exam2, etc.)
    // This will be handled by the plugin, number defaults to 1 if not specified

    // Parse XML tags
    const sourceMatch = source.match(/<source>([\s\S]*?)<\/source>/);
    const stemMatch = source.match(/<stem>([\s\S]*?)<\/stem>/);
    const optionsMatch = source.match(/<options>([\s\S]*?)<\/options>/);
    const answerMatch = source.match(/<answer>([\s\S]*?)<\/answer>/);
    const analysisMatch = source.match(/<analysis>([\s\S]*?)<\/analysis>/);

    // If any required tag is missing, treat as unsupported format and return null
    // This signals to render as markdown text instead
    if (!sourceMatch || !stemMatch || !optionsMatch || !answerMatch) {
      return null;
    }

    const sourceText = sourceMatch[1].trim();
    let stemText = stemMatch[1].trim();
    const optionsText = optionsMatch[1].trim();
    const correctAnswer = answerMatch[1].trim();
    const analysisText = analysisMatch ? analysisMatch[1].trim() : '';

    // Parse stem (handle underscores and markdown)
    const stem = this.processStem(stemText);

    // Parse options
    const options = this.parseOptions(optionsText);
    if (options.length === 0) {
      return null; // Unsupported format
    }

    // Validate answer
    if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      return null; // Unsupported format
    }

    // Mark correct option
    options.forEach(opt => {
      if (opt.label === correctAnswer) {
        opt.correct = true;
      }
    });

    // Parse analysis with markdown support
    const analysis = analysisText ? this.processMarkdown(analysisText) : '';

    return { source: sourceText, stem, options, correctAnswer, analysis };
  }

  processStem(stemText) {
    // Convert markdown images and preserve text
    // Return object with both raw text and processed HTML
    return {
      raw: stemText,
      html: this.processMarkdown(stemText)
    };
  }

  parseOptions(optionsText) {
    const options = [];
    const lines = optionsText.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Match A. text, A text, or A。text format
      const match = trimmed.match(/^([A-D])[.。\s]\s*([\s\S]*?)$/);
      if (match) {
        const label = match[1];
        const text = match[2].trim();
        options.push({
          label,
          text: this.processMarkdown(text),
          correct: false
        });
      }
    }

    return options;
  }

  processMarkdown(text) {
    if (!text) return '';

    // Convert markdown images: ![alt](src) to <img> tags
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      return `<img src="${src}" alt="${alt}" class="exam-card-image"/>`;
    });

    // Convert markdown bold: **text** to <strong>
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Convert markdown italic: *text* to <em>
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Convert markdown headings: ## text to <h3>, ### text to <h4>
    text = text.replace(/^### (.+)$/gm, '<h4 class="exam-card-subheading">$1</h4>');
    text = text.replace(/^## (.+)$/gm, '<h3 class="exam-card-subheading">$1</h3>');
    text = text.replace(/^# (.+)$/gm, '<h2 class="exam-card-subheading">$1</h2>');

    // Convert markdown lists: - item to <li>
    text = text.replace(/^- (.+)$/gm, '<li>$1</li>');

    // Also support * for lists
    text = text.replace(/^\* (.+)$/gm, '<li>$1</li>');

    // Wrap consecutive <li> tags in <ul>
    text = text.replace(/(<li>.*?<\/li>)/s, '<ul class="exam-card-list">$1</ul>');

    // Convert markdown code: `code` to <code>
    text = text.replace(/`([^`]+)`/g, '<code style="background: var(--bg-section); padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 0.85em;">$1</code>');

    // Convert markdown links: [text](url) to <a>
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: var(--accent); text-decoration: underline;" target="_blank">$1</a>');

    // Convert line breaks to paragraphs
    const paragraphs = text.split(/\n\s*\n/).map(p => {
      p = p.trim();
      if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<img') || p.startsWith('<blockquote')) {
        return p;
      }
      if (p) return `<p>${p}</p>`;
      return '';
    });

    return paragraphs.join('');
  }

  render(source, el, questionNumber = 1) {
    const renderer = new ExamCardRenderer();
    const exam = renderer.parseExamBlock(source);

    // If parsing failed (unsupported format), render as markdown text
    if (exam === null) {
      const markdownDiv = el.createDiv('exam-card-markdown');
      markdownDiv.style.padding = '16px';
      markdownDiv.innerHTML = renderer.processMarkdown(source);
      return;
    }

    try {
      const wrapper = el.createDiv('exam-card-wrapper');

      // Question number badge
      const badge = wrapper.createDiv('exam-card-badge');
      badge.textContent = questionNumber.toString();

      // Card collapse toggle button
      const collapseBtn = wrapper.createDiv('exam-card-collapse-btn');
      collapseBtn.innerHTML = '▼';
      collapseBtn.title = 'Toggle card';
      collapseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        wrapper.classList.toggle('collapsed');
      });

      // Main card
      const card = wrapper.createDiv('exam-card');
      const content = card.createDiv('exam-card-content');

      // Stem with source inline - combine into single flow
      const stemDiv = content.createDiv('exam-card-stem');
      const sourceTag = `<span class="exam-card-source">${exam.source}</span>`;
      stemDiv.innerHTML = sourceTag + exam.stem.html;

      // Options
      const optionsDiv = content.createDiv('exam-card-options');
      exam.options.forEach((opt) => {
        const optEl = optionsDiv.createDiv(
          'exam-card-option' + (opt.correct ? ' correct' : '')
        );
        const label = optEl.createSpan('exam-card-option-label');
        label.textContent = opt.label;
        const text = optEl.createSpan('exam-card-option-text');
        text.innerHTML = opt.text;
      });

      // Analysis section (collapsible)
      if (exam.analysis) {
        const expandBtn = card.createDiv('exam-card-expand');
        expandBtn.textContent = '查看解析';
        expandBtn.addEventListener('click', () => {
          card.classList.toggle('expanded');
        });

        const analysisDiv = card.createDiv('exam-card-analysis');
        const analysisInner = analysisDiv.createDiv('exam-card-analysis-inner');
        analysisInner.innerHTML = exam.analysis;
      }
    } catch (error) {
      const errorDiv = el.createDiv();
      errorDiv.style.color = 'var(--text-secondary)';
      errorDiv.style.padding = '16px';
      errorDiv.style.borderRadius = '8px';
      errorDiv.style.backgroundColor = 'var(--bg-section)';
      errorDiv.style.border = '1px solid var(--border)';
      errorDiv.textContent = `❌ Exam Card Error: ${error instanceof Error ? error.message : String(error)}`;
      console.error('Exam Card Render Error:', error);
    }
  }
}

const EXAM_CARD_STYLE = `
:root {
  --bg-page: #fafbfc;
  --bg-card: #ffffff;
  --bg-section: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-light: #9ca3af;
  --border: #e5e7eb;
  --accent: #2563eb;
  --accent-light: #dbeafe;
  --success: #10b981;
  --success-light: #d1fae5;
}

.theme-dark {
  --bg-page: #111827;
  --bg-card: #1f2937;
  --bg-section: #111827;
  --text-primary: #f3f4f6;
  --text-secondary: #d1d5db;
  --text-light: #9ca3af;
  --border: #374151;
  --accent: #60a5fa;
  --accent-light: #1e3a8a;
  --success: #34d399;
  --success-light: #064e3b;
}

.exam-card-wrapper {
  margin: 10px 0;
  position: relative;
  transition: all 0.3s ease;
}

.exam-card-collapse-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--accent);
  font-size: 0.8rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  z-index: 10;
  user-select: none;
}

.exam-card-collapse-btn:hover {
  background: var(--accent-light);
  transform: scale(1.1);
}

.exam-card-wrapper.collapsed .exam-card-collapse-btn {
  transform: rotate(180deg);
}

.exam-card-wrapper.collapsed .exam-card {
  max-height: 54px;
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.exam-card-badge {
  position: absolute;
  top: 6px;
  left: -32px;
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 1.4rem;
  color: var(--accent);
  opacity: 0.25;
  z-index: 0;
  pointer-events: none;
  min-width: 40px;
  text-align: center;
}

.exam-card {
  background: var(--bg-card);
  border-radius: 10px;
  border: 1px solid var(--border);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  max-height: 10000px;
}

.exam-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent) 0%, #8b5cf6 100%);
}

.exam-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--accent);
}

.exam-card-content {
  padding: 18px 22px;
  position: relative;
  z-index: 1;
}

.exam-card-header {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.85rem;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.exam-card-source {
  color: var(--accent);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 2px 6px;
  background: var(--accent-light);
  border-radius: 3px;
  white-space: nowrap;
  display: inline;
  margin-right: 4px;
}

.exam-card-stem {
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: 10px;
  font-weight: 500;
  word-break: break-word;
}

.exam-card-stem p {
  margin: 0;
  display: inline;
}

.exam-card-source {
  color: var(--accent);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 2px 6px;
  background: var(--accent-light);
  border-radius: 3px;
  white-space: nowrap;
  display: inline-block;
  margin-right: 6px;
  vertical-align: middle;
}

.exam-card-stem p + p::before {
  content: ' ';
}

.exam-card-image {
  max-width: 100%;
  height: auto;
  margin: 8px 0;
  border-radius: 6px;
}

/* Underline-style blanks */
.exam-card-stem span.blank {
  display: inline-block;
  min-width: 80px;
  border-bottom: 2px solid var(--accent);
  margin: 0 2px;
  position: relative;
  top: 1px;
}

.exam-card-options {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.exam-card-option {
  padding: 0;
  border-radius: 0;
  background: transparent;
  border: none;
  display: flex;
  gap: 12px;
  font-size: 0.9rem;
  color: var(--text-primary);
  transition: all 0.2s ease;
  cursor: pointer;
  line-height: 1.4;
  align-items: center;
}

.exam-card-option:hover {
  border-color: transparent;
  background: transparent;
  transform: none;
}

.exam-card-option-label {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 700;
  color: var(--text-primary);
  min-width: 40px;
  width: 40px;
  height: 40px;
  text-align: center;
  flex-shrink: 0;
  font-size: 0.95rem;
  border: 2px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: var(--bg-card);
}

.exam-card-option:hover .exam-card-option-label {
  border-color: var(--accent);
  color: var(--accent);
}

.exam-card-option-text {
  flex: 1;
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  min-height: 1.4em;
  font-weight: 400;
}

.exam-card-option-text img {
  max-width: 100%;
  height: auto;
  margin-top: 6px;
  border-radius: 4px;
}

.exam-card-option.correct {
  background: transparent;
  border-color: transparent;
}

.exam-card-option.correct .exam-card-option-label {
  background: var(--success);
  border-color: var(--success);
  color: white;
  font-weight: 700;
}

.exam-card-option.correct .exam-card-option-text {
  color: var(--text-primary);
  font-weight: 600;
}

.exam-card-option.correct::after {
  content: '';
  display: none;
}

.exam-card-expand {
  padding: 9px 18px;
  border-top: 1px solid var(--border);
  background: transparent;
  text-align: center;
  cursor: pointer;
  user-select: none;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.8rem;
  color: var(--accent);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s ease;
  margin-top: 0;
}

.exam-card-expand:hover {
  background: var(--accent-light);
}

.exam-card-expand::after {
  content: '▾';
  display: inline-block;
  font-size: 0.7rem;
  transition: transform 0.3s ease;
  color: var(--accent);
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
  max-height: 3000px;
}

.exam-card-analysis-inner {
  padding: 16px 20px;
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.65;
}

.exam-card-analysis-inner p {
  margin: 0 0 8px 0;
}

.exam-card-analysis-inner p:last-child {
  margin-bottom: 0;
}

.exam-card-analysis-inner strong {
  color: var(--accent);
  font-weight: 700;
}

.exam-card-analysis-inner em {
  font-style: italic;
  color: var(--accent);
}

.exam-card-analysis-inner h2 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent);
  margin: 12px 0 8px 0;
  text-transform: none;
  letter-spacing: normal;
}

.exam-card-analysis-inner h3 {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--accent);
  margin: 10px 0 6px 0;
  text-transform: none;
  letter-spacing: normal;
}

.exam-card-analysis-inner h4 {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 8px 0 4px 0;
  text-transform: none;
  letter-spacing: normal;
  font-style: italic;
}

.exam-card-subheading {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
  margin: 10px 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.exam-card-list {
  list-style: none;
  padding: 0;
  margin: 8px 0;
}

.exam-card-list li {
  margin-left: 16px;
  margin-bottom: 6px;
  position: relative;
}

.exam-card-list li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: var(--accent);
  font-weight: bold;
  font-size: 0.8rem;
}

.exam-card-analysis-inner img {
  max-width: 100%;
  height: auto;
  margin: 8px 0;
  border-radius: 6px;
}

.exam-card-markdown {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text-primary);
}

.exam-card-markdown p {
  margin: 8px 0;
}

.exam-card-markdown strong {
  color: var(--accent);
  font-weight: 700;
}

.exam-card-markdown h3 {
  color: var(--accent);
  font-weight: 700;
  margin: 12px 0 8px 0;
  font-size: 0.9rem;
}

.exam-card-markdown ul {
  margin: 8px 0;
  padding-left: 20px;
}

.exam-card-markdown li {
  margin-bottom: 6px;
}

@media (max-width: 640px) {
  .exam-card-content {
    padding: 16px 18px;
  }

  .exam-card-option {
    flex-direction: row;
    padding: 10px 12px;
  }

  .exam-card-option-label {
    min-width: 22px;
  }

  .exam-card-analysis-inner {
    padding: 12px 16px;
  }
}
`;

class ExamCardPlugin extends obsidian.Plugin {
  async onload() {
    // Inject styles
    const style = document.createElement('style');
    style.textContent = EXAM_CARD_STYLE;
    document.head.appendChild(style);

    // Register processor for exam blocks with optional number: exam1, exam2, exam, etc.
    this.registerMarkdownCodeBlockProcessor('exam', (source, el, ctx) => {
      // Extract question number from code block info using the full source
      let questionNumber = 1;

      // Try to extract from ctx.language (the 'exam1', 'exam2' part)
      if (ctx.language) {
        const match = ctx.language.match(/exam(\d+)/);
        if (match) {
          questionNumber = parseInt(match[1]);
        }
      }

      const renderer = new ExamCardRenderer();
      renderer.render(source, el, questionNumber);
    });

    // Also register exam1, exam2, etc as separate processors that map to the main exam processor
    for (let i = 1; i <= 20; i++) {
      this.registerMarkdownCodeBlockProcessor(`exam${i}`, (source, el, ctx) => {
        const renderer = new ExamCardRenderer();
        renderer.render(source, el, i);
      });
    }
  }

  onunload() {
  }
}

module.exports = ExamCardPlugin;
