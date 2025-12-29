/**
 * Unified Word Service Entry Point
 *
 * Automatically exports the correct service based on SERVICE_MODE configuration.
 * This allows easy switching between local and Supabase backends.
 *
 * Usage in components:
 *   import { useWordService } from '@/services'
 */

import { SERVICE_MODE } from './config'

let wordService

if (SERVICE_MODE === 'supabase') {
  // Use Supabase backend
  wordService = await import('./wordServiceSupabase.js')
  console.log('📡 Using Supabase backend')
} else {
  // Use local Express backend (default)
  wordService = await import('./wordService.js')
  console.log('🏠 Using local Express backend')
}

// Re-export everything from the selected service
export const useWordService = wordService.useWordService
export const {
  words,
  isLoading,
  error,
  loadWords,
  updateWordStatus,
  batchUpdateWordsAndStatus
} = wordService
