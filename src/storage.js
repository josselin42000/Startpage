import { supabase, hasSupabase } from './supabase'

const LS_KEY = 'startpage_tiles_v1'

const DEFAULT_TILES = [
  { id: '1', name: 'LinearCRM', url: 'https://linearcrm.l-h.fr', icon: '💼', color: '#CC0000', cat: 'Groupe Linear', logo: '', position: 1 },
  { id: '2', name: 'Linear Desk', url: '#', icon: '🏗️', color: '#374151', cat: 'Groupe Linear', logo: '', position: 2 },
  { id: '3', name: 'Audio-Technique', url: 'https://audio-technique.com', icon: '🔊', color: '#CC0000', cat: 'Groupe Linear', logo: '', position: 3 },
  { id: '4', name: 'SL Technologie', url: 'https://sltechnologie.fr', icon: '📡', color: '#1a6fc4', cat: 'Groupe Linear', logo: '', position: 4 },
  { id: '5', name: 'Linear Tech', url: 'https://lineartech.fr', icon: '🔌', color: '#374151', cat: 'Groupe Linear', logo: '', position: 5 },
  { id: '6', name: 'lestudio23', url: '#', icon: '🎙️', color: '#1a6fc4', cat: 'Verts Podcast', logo: '', position: 6 },
  { id: '7', name: 'Verts Podcast', url: 'https://verts-podcast.fr', icon: '🎬', color: '#1a8f5c', cat: 'Verts Podcast', logo: '', position: 7 },
  { id: '8', name: 'TousVerts', url: 'https://tousverts.fr', icon: '🌱', color: '#1a8f5c', cat: 'Verts Podcast', logo: '', position: 8 },
  { id: '9', name: 'E-PhotoBooth', url: 'https://ephotobooth.fr', icon: '📷', color: '#9b3ccf', cat: 'SaaS', logo: '', position: 9 },
  { id: '10', name: 'HubCommerce', url: '#', icon: '🏢', color: '#d97316', cat: 'SaaS', logo: '', position: 10 },
  { id: '11', name: 'BonnetteMicro', url: 'https://bonnettemicro.fr', icon: '🎤', color: '#CC0000', cat: 'SaaS', logo: '', position: 11 },
  { id: '12', name: 'La Borne Mobile', url: 'https://labornemobile.fr', icon: '🚗', color: '#1a8f5c', cat: 'SaaS', logo: '', position: 12 },
]

function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_TILES
  } catch { return DEFAULT_TILES }
}
function lsSave(tiles) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(tiles)) } catch {}
}

export async function loadTiles() {
  if (hasSupabase) {
    const { data, error } = await supabase.from('tiles').select('*').order('position')
    if (!error && data?.length) return data
    if (!error && data?.length === 0) {
      await supabase.from('tiles').insert(DEFAULT_TILES.map(({ id, ...t }) => t))
      const { data: d2 } = await supabase.from('tiles').select('*').order('position')
      return d2 || DEFAULT_TILES
    }
  }
  return lsLoad()
}

export async function addTile(tile, currentTiles) {
  if (hasSupabase) {
    const maxPos = currentTiles.length ? Math.max(...currentTiles.map(t => t.position || 0)) : 0
    const { data, error } = await supabase.from('tiles').insert([{ ...tile, position: maxPos + 1 }]).select()
    if (!error && data) return data[0]
  }
  const newTile = { ...tile, id: Date.now().toString(), position: currentTiles.length + 1 }
  lsSave([...currentTiles, newTile])
  return newTile
}

export async function updateTile(id, tile, currentTiles) {
  if (hasSupabase) {
    const { data, error } = await supabase.from('tiles').update(tile).eq('id', id).select()
    if (!error && data) return data[0]
  }
  const updated = currentTiles.map(t => t.id === id ? { ...t, ...tile } : t)
  lsSave(updated)
  return updated.find(t => t.id === id)
}

export async function deleteTile(id, currentTiles) {
  if (hasSupabase) {
    await supabase.from('tiles').delete().eq('id', id)
  }
  const updated = currentTiles.filter(t => t.id !== id)
  lsSave(updated)
  return updated
}
