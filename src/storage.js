import { supabase, hasSupabase } from './supabase'

var LS_KEY = 'startpage_tiles_v3'

var DEFAULT_TILES = [
  { id: '1', name: 'LinearCRM', url: 'https://linearcrm.l-h.fr', icon: '💼', color: '#CC0000', cat: 'Groupe Linear', logo: '', position: 1, type: 'link', folder_id: null, open_mode: 'tab', fav: false },
  { id: '2', name: 'Linear Desk', url: '#', icon: '🏗️', color: '#374151', cat: 'Groupe Linear', logo: '', position: 2, type: 'link', folder_id: null, open_mode: 'tab', fav: false },
  { id: '3', name: 'Audio-Technique', url: 'https://audio-technique.com', icon: '🔊', color: '#CC0000', cat: 'Groupe Linear', logo: '', position: 3, type: 'link', folder_id: null, open_mode: 'tab', fav: false },
  { id: '4', name: 'SL Technologie', url: 'https://sltechnologie.fr', icon: '📡', color: '#1a6fc4', cat: 'Groupe Linear', logo: '', position: 4, type: 'link', folder_id: null, open_mode: 'tab', fav: false },
  { id: '5', name: 'Linear Tech', url: 'https://lineartech.fr', icon: '🔌', color: '#374151', cat: 'Groupe Linear', logo: '', position: 5, type: 'link', folder_id: null, open_mode: 'tab', fav: false },
  { id: '6', name: 'lestudio23', url: '#', icon: '🎙️', color: '#1a6fc4', cat: 'Verts', logo: '', position: 6, type: 'link', folder_id: null, open_mode: 'tab', fav: false },
  { id: '7', name: 'Verts Podcast', url: 'https://verts-podcast.fr', icon: '🎬', color: '#1a8f5c', cat: 'Verts', logo: '', position: 7, type: 'link', folder_id: null, open_mode: 'tab', fav: false },
  { id: '8', name: 'TousVerts', url: 'https://tousverts.fr', icon: '🌱', color: '#1a8f5c', cat: 'Verts', logo: '', position: 8, type: 'link', folder_id: null, open_mode: 'tab', fav: false },
  { id: '9', name: 'E-PhotoBooth', url: 'https://ephotobooth.fr', icon: '📷', color: '#9b3ccf', cat: 'Projets', logo: '', position: 9, type: 'link', folder_id: null, open_mode: 'tab', fav: false },
  { id: '10', name: 'HubCommerce', url: '#', icon: '🏢', color: '#d97316', cat: 'Projets', logo: '', position: 10, type: 'link', folder_id: null, open_mode: 'tab', fav: false },
  { id: '11', name: 'BonnetteMicro', url: 'https://bonnettemicro.fr', icon: '🎤', color: '#CC0000', cat: 'Projets', logo: '', position: 11, type: 'link', folder_id: null, open_mode: 'tab', fav: false },
  { id: '12', name: 'La Borne Mobile', url: 'https://labornemobile.fr', icon: '🚗', color: '#1a8f5c', cat: 'Projets', logo: '', position: 12, type: 'link', folder_id: null, open_mode: 'tab', fav: false },
]

function toDb(tile) {
  var t = Object.assign({}, tile)
  if (t.openMode !== undefined) { t.open_mode = t.openMode; delete t.openMode }
  if (t.logo && t.logo.length > 500000) { t.logo = '' }
  return t
}

function fromDb(tile) {
  var t = Object.assign({}, tile)
  if (t.open_mode !== undefined) { t.openMode = t.open_mode }
  return t
}

function lsLoad() {
  try { var raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : DEFAULT_TILES } catch(e) { return DEFAULT_TILES }
}
function lsSave(tiles) { try { localStorage.setItem(LS_KEY, JSON.stringify(tiles)) } catch(e) {} }

export async function loadTiles() {
  if (hasSupabase) {
    var res = await supabase.from('tiles').select('*').order('position')
    if (!res.error && res.data && res.data.length) return res.data.map(fromDb)
    if (!res.error && res.data && res.data.length === 0) {
      await supabase.from('tiles').insert(DEFAULT_TILES.map(function(t) { var d = toDb(Object.assign({}, t)); delete d.id; return d }))
      var res2 = await supabase.from('tiles').select('*').order('position')
      return (res2.data || DEFAULT_TILES).map(fromDb)
    }
  }
  return lsLoad()
}

export async function addTile(tile, currentTiles) {
  var maxPos = currentTiles.length ? Math.max.apply(null, currentTiles.map(function(t) { return t.position || 0 })) : 0
  if (hasSupabase) {
    var dbTile = toDb(Object.assign({}, tile, { position: maxPos + 1 }))
    delete dbTile.id
    var res = await supabase.from('tiles').insert([dbTile]).select()
    if (!res.error && res.data) return fromDb(res.data[0])
  }
  var newTile = Object.assign({}, tile, { id: String(Date.now()), position: maxPos + 1 })
  lsSave(currentTiles.concat([newTile]))
  return newTile
}

export async function updateTile(id, tile, currentTiles) {
  if (hasSupabase) {
    var dbTile = toDb(Object.assign({}, tile))
    delete dbTile.id
    var res = await supabase.from('tiles').update(dbTile).eq('id', id).select()
    if (!res.error && res.data) return fromDb(res.data[0])
  }
  var updated = (currentTiles || []).map(function(t) { return t.id === id ? Object.assign({}, t, tile) : t })
  lsSave(updated)
  return updated.find(function(t) { return t.id === id }) || null
}

export async function deleteTile(id, currentTiles) {
  if (hasSupabase) { await supabase.from('tiles').delete().eq('id', id) }
  var updated = (currentTiles || []).filter(function(t) { return t.id !== id })
  lsSave(updated)
  return updated
}
