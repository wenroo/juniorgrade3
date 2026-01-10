import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

// A post-processing tool for CSS to help enforce consistent styles
export default (ctx) => ({
  // Setting the 'map' option for source map support.
  // If 'ctx.options.map' is defined, it uses that; otherwise, it defaults to 'false'.
  map: ctx.options?.map || true,
  // 明确设置from选项，解决警告
  from: ctx.file?.path || undefined,
  plugins: [
    tailwindcss(),
    autoprefixer()
  ],
});
