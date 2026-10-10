import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { ExamCardRenderer, ExamCardSettings } from './renderer';
import { EXAM_CARD_STYLE } from './styles';

const DEFAULT_SETTINGS: ExamCardSettings = {
  mode: 'memorize',
};

export default class ExamCardPlugin extends Plugin {
  settings: ExamCardSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    // 注册代码块处理器
    this.registerMarkdownCodeBlockProcessor('exam', (source, el, ctx) => {
      const renderer = new ExamCardRenderer(this.app, this, this.settings);
      renderer.render(source, el, ctx);
    });

    // 设置页
    this.addSettingTab(new ExamSettingTab(this.app, this));

    // 注入样式
    const style = document.createElement('style');
    style.textContent = EXAM_CARD_STYLE;
    document.head.appendChild(style);
  }

  onunload() {
    // 清理
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class ExamSettingTab extends PluginSettingTab {
  plugin: ExamCardPlugin;

  constructor(app: App, plugin: ExamCardPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Exam Plugin 设置' });

    new Setting(containerEl)
      .setName('答题模式')
      .setDesc('背题模式：看题时直接高亮正确答案；做题模式：先作答，再即时反馈对错。修改后重新打开笔记生效。')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('memorize', '背题模式（直接显示答案）')
          .addOption('test', '做题模式（先作答再反馈）')
          .setValue(this.plugin.settings.mode)
          .onChange(async (value) => {
            this.plugin.settings.mode = value as ExamCardSettings['mode'];
            await this.plugin.saveSettings();
          })
      );
  }
}
