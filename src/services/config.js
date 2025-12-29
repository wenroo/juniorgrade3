/**
 * Word Service Configuration
 *
 * Switch between different backend implementations:
 * - 'local': Use local Express backend (wordService.js)
 * - 'supabase': Use Supabase backend (wordServiceSupabase.js)
 */

export const SERVICE_MODE = 'local' // Change to 'supabase' to use Supabase

export const SERVICE_CONFIG = {
  local: {
    name: 'Local Express Backend',
    description: 'Uses local Node.js Express server with JSON files'
  },
  supabase: {
    name: 'Supabase Backend',
    description: 'Uses Supabase cloud database'
  }
}
