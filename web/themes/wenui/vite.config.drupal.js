import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

import { resolve, join, relative } from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { globSync } from 'glob';

// 获取所有SOURCE文件作为入口
const scssFile = {
  '': 'src/scss/*.scss',
  'main': 'src/scripts/index.js',
  'app': 'app/app.js',
  'components': 'components/**/*.scss'
};

// 确保 app.js 作为独立入口，不依赖 index.html
const appEntry = resolve(__dirname, 'app/app.js');

const iconLibs = {
  'colors': ['src/icons'],
};


export default defineConfig(() => {

  // 处理 Drupal 主题路径的插件
  const drupalPathPlugin = {
    name: 'drupal-path-handler',
    enforce: 'pre',
    resolveId(source) {
      // 只将已构建的资源（dist目录）标记为外部，让 Vite 处理源文件中的资源导入
      if (source.startsWith('/themes/wenui/dist/')) {
        return { id: source, external: true };
      }
    }
  };

  // 在生成阶段将 assets/components/**.css 移动为 components/**.css
  const moveComponentsCssPlugin = {
    name: 'move-components-css',
    apply: 'build',
    generateBundle(_options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (!chunk || chunk.type !== 'asset' || !fileName.endsWith('.css')) continue;

        // 目标：dist 下移动到 components/**，并在源代码目录 components/** 写入一份
        let finalDistName = fileName;
        if (fileName.startsWith('assets/components/')) {
          const newFileName = fileName.replace(/^assets\//, '');
          chunk.fileName = newFileName;
          delete bundle[fileName];
          bundle[newFileName] = chunk;
          finalDistName = newFileName;
        }

        if (finalDistName.startsWith('components/')) {
          const absoluteOutPath = resolve(__dirname, finalDistName);
          const absoluteOutDir = absoluteOutPath.substring(0, absoluteOutPath.lastIndexOf('/'));
          try {
            mkdirSync(absoluteOutDir, { recursive: true });
            const content = typeof chunk.source === 'string' ? chunk.source : chunk.source?.toString() ?? '';
            writeFileSync(absoluteOutPath, content);
          } catch (_e) {
            // 忽略写入失败以不阻塞构建
          }
        }
      }
    }
  };

  const sourceEntries = Object.entries(scssFile).reduce((entries, [folder, pattern]) => {
    const files = globSync(join(__dirname, pattern));
    files.forEach((file) => {
      const relativePath = relative(__dirname, file).replace(/\\/g, '/');
      let outputKey;
      if (folder === 'components') {
        // 保留 components 下的目录结构，去掉扩展名作为 [name]
        outputKey = relativePath.replace(/\.[^/.]+$/, '');
      } else {
        // 维持现有行为：仅使用文件名（无目录），并去掉 .js 扩展
        outputKey = join(folder, relativePath).split('/').pop().replace('.js', '');
      }
      entries[outputKey] = resolve(__dirname, file);
    });
    return entries;
  }, {});

  return {
    base: '/themes/wenui/dist/',
    publicDir: false,
    server: {
      watch: {
        // 避免 .css 文件导致的循环监听与重建
        ignored: ['**/*.css']
      }
    },
    plugins: [
      drupalPathPlugin,
      vue(),
      vueDevTools(),
      tailwindcss(),
      moveComponentsCssPlugin
    ],
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["import"],
          quietDeps: true,
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'app')
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      minify: process.env.NODE_ENV === 'production',
      assetsInlineLimit: 0,
      // 在 rollup 的 watch 模式下也排除 .css，防止循环重建
      watch: {
        exclude: ['**/*.css']
      },
      copyPublicDir: false,
      rollupOptions: {
        input: sourceEntries,
        output: {
          entryFileNames: "js/[name].bundle.js",
          assetFileNames: (assetInfo) => {
            if (assetInfo.name.endsWith('.css')) {
              // 来自 components 的样式先输出到 assets/[name].css（name 已含 components/ 前缀），稍后由插件移动
              if (assetInfo.name.startsWith('components/')) {
                return '[name].css'
              }
              return 'css/[name].bundle.css'
            }
            return '[name].[ext]'
          }
        }
      }
    }
  }
})