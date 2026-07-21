export const EXAM_CARD_STYLE = `
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

.exam-card-badge {
  position: absolute;
  top: -1px;
  left: -1px;
  padding: 3px 10px;
  border-radius: 4px;
  background: linear-gradient(135deg, var(--blue) 0%, #5a67d8 100%);
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
  content: '▼';
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
