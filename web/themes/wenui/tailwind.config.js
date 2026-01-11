/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

import icons from './src/fonts/icons/iconfont.json';

const wenIcons = [], classes = [];
icons['glyphs'].map((icon) => {
  classes.push(`icon-${icon.font_class}`);
  wenIcons.push({
    [`.${(`icon-${icon.font_class}`)}`]: {
      '&::before': {
          content: `"\\${icon.unicode}"`
      }
    }
  });
});


module.exports = {
  content: {
    files:[
      './components/**/*.scss',
      './src/scss/**/*.scss',
      './templates/**/*.html.twig'
    ]
  },
  safelist: [
    ...classes
  ],
  theme: {
    extend: {
      animation: {
        'wenui-xmove': 'wenui-layout-50 2.5s cubic-bezier(0.25, 1, 0.5, 1)',
      },
      keyframes: {
        'wenui-spinner': {
          '0%': { rotate: '(0)' },
          '100%': { rotate: '(360deg)' }
        },
        'wenui-layout-25': {
          '0%': { transform: 'translateX(25px)' },
          '100%': { transform: 'translateX(0)' }
        },
        'wenui-layout-50': {
          '0%': { transform: 'translateX(50px)' },
          '100%': { transform: 'translateX(0)' }
        },
        'wenui-layout-75': {
          '0%': { transform: 'translateX(75px)' },
          '100%': { transform: 'translateX(0)' }
        },
        'wenui-layout-100': {
          '0%': { transform: 'translateX(100px)' },
          '100%': { transform: 'translateX(0)' }
        },        
        'wenui-layout-25-infinite': {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-25px)' },
          '100%': { transform: 'translateX(0)' },
        },
        'wenui-layout-50-infinite': {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-50px)' },
          '100%': { transform: 'translateX(0)' },
        },
        'wenui-layout-75-infinite': {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-75px)' },
          '100%': { transform: 'translateX(0)' },
        },
        'wenui-layout-100-infinite': {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-100px)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      transitionTimingFunction: {
        'wenui-outside': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      textDecorationStyle: {
        'wavy': 'wavy',
      },
    }
  },
  plugins: [
    plugin(function({ addBase, addUtilities, matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow')}
      ),
      addUtilities(wenIcons)
    }),
    plugin(function({ addUtilities }) {
      addUtilities({
        '.wenui-layout-move': {
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
        },
      });
    })
  ]
}

