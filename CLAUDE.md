# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + Vite application for learning English vocabulary, specifically targeting junior grade 3 level students. The app provides multiple learning modes including word recitation, dictation practice, and wrong word review. It features a comprehensive word management system with phonetics, translations, and learning status tracking.

### Key Features

- **背单词模式 (Recite Mode)**: Browse and learn words with phonetics, translations, and examples
- **听写模式 (Dictation Mode)**: Practice spelling with English-to-Chinese or Chinese-to-English dictation
- **错题本 (Wrong Words)**: Review and practice words that were answered incorrectly
- **智能过滤**: Filter words by first letter, part of speech, importance, and recite status
- **学习追踪**: Track learning progress with status indicators (learned, important, error count)
- **音标支持**: Display and manage phonetic transcriptions for all words

## Technology Stack

### Frontend
- **Framework**: Vue 3.5.25 (Composition API with `<script setup>`)
- **Router**: Vue Router 4.6.4
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.18 (via @tailwindcss/vite plugin)
- **Dev Tools**: Vue DevTools plugin 8.0.5
- **Node Version**: Requires Node.js ^20.19.0 or >=22.12.0

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.2.1
- **Middleware**: CORS 2.8.5, Body-Parser 2.2.1
- **Data Storage**: JSON files (words, phonetics, user status)

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

## Backend Server Management

**⚠️ IMPORTANT: Backend server must be managed manually by the user.**

- **DO NOT** automatically start, stop, or restart the backend server
- **DO NOT** run `node server.js` or `pkill -f "node server.js"` commands
- User will manually manage the backend server in their terminal
- If backend issues are detected, inform the user and let them handle it manually
- Backend documentation is available at `backend/README.md`

## Project Structure

```
juniorgrade3/
├── src/
│   ├── main.js                      # Application entry point
│   ├── App.vue                      # Root component with router-view
│   ├── router/
│   │   └── index.js                 # Vue Router configuration
│   ├── views/
│   │   ├── RecitePage.vue           # Word recitation page (default route)
│   │   ├── DictationPage.vue        # Dictation practice page
│   │   └── WrongWordsPage.vue       # Wrong words review page
│   ├── components/
│   │   ├── NavBar.vue               # Navigation bar
│   │   ├── AppFooter.vue            # Footer component
│   │   ├── ReciteMode.vue           # Word display cards
│   │   ├── DictationMode.vue        # Dictation input interface
│   │   ├── FilterSidebar.vue        # Word filtering sidebar
│   │   ├── WordPhonetic.vue         # Phonetic display component
│   │   ├── ProgressBar.vue          # Progress indicator
│   │   ├── TimerDisplay.vue         # Timer component
│   │   └── NavigationButtons.vue    # Pagination controls
│   ├── services/
│   │   └── wordService.js           # API service for word data
│   ├── config/
│   │   └── partOfSpeechColors.js    # Part of speech color scheme
│   └── assets/
│       ├── main.css                 # Global styles
│       ├── base.css                 # CSS variables and resets
│       └── images/                  # Image assets
├── backend/
│   ├── server.js                    # Express API server
│   ├── words_26.json                # Main word database
│   ├── phonetics.json               # Phonetic data
│   ├── user_word_status.json        # User learning status
│   └── README.md                    # Backend documentation
└── public/                          # Static assets
```

## Architecture Notes

### Path Aliases
- `@/` is aliased to `src/` directory (configured in both vite.config.js and jsconfig.json)
- Use `import Component from '@/components/Component.vue'` for cleaner imports

### Component Patterns
- All components use Vue 3 Composition API with `<script setup>` syntax
- Props are defined using `defineProps()` with type validation
- Scoped styles are used to prevent CSS leakage
- Centralized word service (`useWordService`) for data management

### Routing
- `/` - Redirects to `/recite`
- `/recite` - Word recitation page with filtering
- `/dictation` - English-to-Chinese dictation mode
- `/dictation-chinese` - Chinese-to-English dictation mode
- `/wrong-words` - Review incorrect words

### Data Structures

**Word Object** (from backend/words_26.json):
```json
{
  "id": number,
  "word": string,
  "translations": [
    {
      "type": string,        // Part of speech (n., v., adj., etc.)
      "translation": string,
      "used": boolean        // Whether this translation was used in dictation
    }
  ],
  "examples": [string],      // Example sentences
  "status": {                // User learning status
    "learned": boolean,
    "recite": boolean,       // In wrong words list
    "important": boolean,
    "error_count": number,
    "true_count": number,
    "last_review": string,
    "next_review_ts": number
  }
}
```

**Phonetic Data** (from backend/phonetics.json):
```json
{
  "wordId": "phonetic_string"  // Key-value pairs of word ID to phonetic
}
```

### Styling Approach
- Tailwind CSS 4.x is integrated via Vite plugin
- Custom CSS variables and base styles in `assets/base.css`
- Component-specific styles use `<style scoped>`
- Part of speech colors defined in `config/partOfSpeechColors.js`
- Responsive design with mobile-first approach

## API Endpoints

Backend server runs on `http://localhost:3123` with the following endpoints:

- `GET /api/words` - Fetch all words
- `POST /api/words` - Save word list
- `GET /api/phonetics` - Fetch phonetic data
- `POST /api/phonetics` - Batch save phonetics
- `GET /api/user-status` - Fetch user learning status
- `PATCH /api/user-status/:id` - Update single word status
- `POST /api/batch-update` - Batch update words and status

## Configuration Files

- `vite.config.js` - Vite configuration with Vue plugin and path aliases
- `jsconfig.json` - JavaScript project configuration for IDE support
- `package.json` - Dependencies and npm scripts
- `backend/package.json` - Backend dependencies
