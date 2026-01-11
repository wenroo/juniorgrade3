/**
 * Unified Word Service Entry Point
 *
 * Automatically exports the correct service based on SERVICE_MODE configuration.
 * This allows easy switching between local and Supabase backends.
 *
 * Usage in components:
 *   import { useWordService } from '@/services'
 */

// Use local Express backend (default) or Drupal service
import * as wordService from './wordService.js'
console.log('🏠 Using wordService')

// Re-export everything from the selected service
export const useWordService = wordService.useWordService
export const {
  words,
  totalCount,
  isLoading,
  error,
  loadWords,
  updateWordStatus
} = wordService
