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
  content: '✓';
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
