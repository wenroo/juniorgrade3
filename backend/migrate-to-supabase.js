/**
 * Data Migration Script
 * Imports words_26.json data into Supabase
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Supabase configuration
const supabaseUrl = 'https://abxzcotgfyexmgonadcy.supabase.co'
const supabaseKey = 'sb_publishable_ywvGvkbAmPdh-8N3PJ5EEw_CGqmB558'

const supabase = createClient(supabaseUrl, supabaseKey)

// Default user ID for initial data
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'

console.log('🚀 Starting data migration...')
