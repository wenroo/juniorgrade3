# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + Vite application for learning English vocabulary, specifically targeting junior grade 3 level students. The app includes a word list with English words and their Chinese translations, with tracking for learned status.

## Technology Stack

- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS 4.x (via @tailwindcss/vite plugin)
- **Dev Tools**: Vue DevTools plugin for development
- **Node Version**: Requires Node.js ^20.19.0 or >=22.12.0

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Project Structure

```
src/
├── main.js              # Application entry point
├── App.vue              # Root component
├── assets/
│   ├── word_list.json   # Vocabulary data (id, word, translation, learned)
│   ├── main.css         # Global styles
│   └── base.css         # Base CSS variables and resets
└── components/
    ├── HelloWorld.vue   # Example component with props
    ├── TheWelcome.vue   # Welcome section component
    ├── WelcomeItem.vue  # Reusable welcome item component
    └── icons/           # SVG icon components
```

## Architecture Notes

### Path Aliases
- `@/` is aliased to `src/` directory (configured in both vite.config.js and jsconfig.json)
- Use `import Component from '@/components/Component.vue'` for cleaner imports

### Component Patterns
- All components use Vue 3 Composition API with `<script setup>` syntax
- Props are defined using `defineProps()` with type validation
- Scoped styles are used to prevent CSS leakage

### Data Structure
The word list in `src/assets/word_list.json` follows this schema:
```json
{
  "id": number,
  "word": string,
  "translation": string,
  "learned": boolean
}
```

### Styling Approach
- Tailwind CSS 4.x is integrated via Vite plugin
- Custom CSS variables and base styles in `assets/base.css`
- Component-specific styles use `<style scoped>`
- Responsive design with mobile-first approach

## Configuration Files

- `vite.config.js` - Vite configuration with Vue plugin and path aliases
- `jsconfig.json` - JavaScript project configuration for IDE support
- `package.json` - Dependencies and npm scripts
