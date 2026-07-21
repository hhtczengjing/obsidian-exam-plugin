import { Plugin, MarkdownPostProcessorContext } from 'obsidian';
import { ExamCardRenderer } from './renderer';
import { EXAM_CARD_STYLE } from './styles';

export default class ExamCardPlugin extends Plugin {
  async onload() {
    // 注册代码块处理器，支持 exam、exam1、exam2 等
    const render = (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      const renderer = new ExamCardRenderer();
      renderer.render(source, el, ctx);
    };
    this.registerMarkdownCodeBlockProcessor('exam', render);
    // 同时注册带编号的别名 exam1, exam2, ... exam9
    for (let i = 1; i <= 9; i++) {
      this.registerMarkdownCodeBlockProcessor(`exam${i}`, render);
    }

    // 注入样式
    const style = document.createElement('style');
    style.textContent = EXAM_CARD_STYLE;
    document.head.appendChild(style);
  }

  onunload() {
    // 清理
  }
}
