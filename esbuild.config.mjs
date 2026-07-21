import esbuild from 'esbuild';
import process from 'process';

const prod = process.argv[2] === 'production';

const config = {
  entryPoints: ['main.ts'],
  bundle: true,
  external: [
    'obsidian',
    'electron',
    '@codemirror/autocomplete',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/view',
    '@lezer/common',
    '@lezer/highlight',
    '@lezer/lr',
  ],
  format: 'cjs',
  target: 'es2018',
  logLevel: 'info',
  sourcemap: prod ? false : 'inline',
  treeShaking: true,
  outfile: 'main.js',
};

if (prod) {
  await esbuild.build(config);
} else {
  const ctx = await esbuild.build({
    ...config,
    watch: {
      onRebuild(error) {
        if (error) {
          console.error('❌ 构建失败:', error);
        } else {
          console.log('✅ 重新构建完成');
        }
      },
    },
  });
  console.log('👀 监听中，文件变化将自动重新构建...');
}
