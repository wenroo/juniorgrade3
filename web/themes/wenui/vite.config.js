import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'

import { resolve, join, relative} from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { globSync } from 'glob';

import svgSpritePlugin from '@pivanov/vite-plugin-svg-sprite';
// 获取所有SOURCE文件作为入口
const scssFile = {
  '': 'src/scss/*.scss',
  'main': 'src/scripts/index.js',
  'components': 'components/**/*.scss'
};

const iconLibs = {
  'colors': ['src/icons'],
};

// Plugin svgSprite
const plugins = Object.entries(iconLibs).map(([lib, folders]) =>
  svgSpritePlugin({
    iconDirs: folders,
    symbolId: '[name]',
    fileName: `../assets/icon-${lib}.svg`,
    svgDomId: 'svg-sprite',
  })
);

export default defineConfig(() => {

  // 保持资源路径不变的插件
  const preserveAssetPathsPlugin = {
    name: 'preserve-asset-paths',
    load(id) {
      // /themes/custom/wenui/assets/ 开头的路径不需要处理
      if (id.startsWith('/themes/custom/wenui/assets/')) {
        return 'export default ' + JSON.stringify(id);
      }
    },
    generateBundle(options, bundle) {
      // 移除所有图片资源
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk && chunk.type === 'asset' && /\.(png|jpe?g|gif|svg|webp)$/i.test(fileName)) {
          delete bundle[fileName];
        }
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
    base: '/themes/custom/wenui/',
    publicDir: false,
    server: {
      watch: {
        // 避免 .css 文件导致的循环监听与重建
        ignored: ['**/*.css']
      }
    },
    plugins: [
        ...plugins,
        tailwindcss(),
        preserveAssetPathsPlugin,
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
        '@': resolve(__dirname, 'src')
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
        external: (id) => {
          // 将图片资源标记为外部，不打包
          return /\.(png|jpe?g|gif|svg|webp)$/.test(id);
        },
        output: {
          entryFileNames:"js/[name].bundle.js",
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