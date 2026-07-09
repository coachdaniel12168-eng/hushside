import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- Card helpers ---

export async function fetchCards(level = null) {
  let q = supabase.from('hs_cards').select('*').eq('active', true).order('card_no')
  if (level) q = q.eq('level', level)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function fetchWitnessCards(depth = null) {
  let q = supabase.from('hs_witness_cards').select('*').eq('active', true).order('id')
  if (depth) q = q.eq('depth', depth)
  const { data, error } = await q
  if (error) throw error
  return data
}

// --- Session helpers ---

export async function createSession(players) {
  const { data, error } = await supabase
    .from('hs_sessions')
    .insert({ players, level_reached: 1, cards_seen: [], witnesses_seen: [] })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSession(id, updates) {
  const { data, error } = await supabase
    .from('hs_sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
