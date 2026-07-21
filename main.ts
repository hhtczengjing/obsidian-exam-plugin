import { Plugin, MarkdownPostProcessorContext } from 'obsidian';
import { ExamCardRenderer } from './renderer';
import { EXAM_CARD_STYLE } from './styles';

export default class ExamCardPlugin extends Plugin {
  async onload() {
    // 注册代码块处理器
    this.registerMarkdownCodeBlockProcessor('exam', (source, el, ctx) => {
      const renderer = new ExamCardRenderer();
      renderer.render(source, el, ctx);
    });

    // 注入样式
    const style = document.createElement('style');
    style.textContent = EXAM_CARD_STYLE;
    document.head.appendChild(style);
  }

  onunload() {
    // 清理
  }
}
