import React, { useState, useEffect, useCallback } from 'react'
import { hasSupabase } from './supabase'
import { loadTiles, addTile, updateTile, deleteTile } from './storage'
import Toolbar from './components/Toolbar'
import Grid from './components/Grid'
import Modal from './components/Modal'

export default function App() {
  const [tiles, setTiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [filterCat, setFilterCat] = useState('all')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTile, setEditingTile] = useState(null)
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setClock(
        n.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }) +
        ' · ' + n.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      )
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [])

  const fetchTiles = useCallback(async () => {
    setLoading(true)
    try { setTiles(await loadTiles()) } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => { fetchTiles() }, [fetchTiles])

  const handleAdd = async (tile) => {
    const newTile = await addTile(tile, tiles)
    if (newTile) setTiles(prev => [...prev, newTile])
    setModalOpen(false)
  }

  const handleUpdate = async (tile) => {
    const updated = await updateTile(editingTile.id, tile, tiles)
    if (updated) setTiles(prev => prev.map(t => t.id === editingTile.id ? updated : t))
    setModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce lien ?')) return
    setTiles(await deleteTile(id, tiles))
  }

  const cats = ['all', ...new Set(tiles.map(t => t.cat).filter(Boolean))]
  const shown = tiles.filter(t => {
    const cOk = filterCat === 'all' || t.cat === filterCat
    const sOk = !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.cat || '').toLowerCase().includes(search.toLowerCase())
    return cOk && sOk
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{
        background: '#0d0d0d', borderBottom: '1px solid #1c1c1c',
        padding: '16px 28px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50
      }}>
        <h1 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
          ● MON <span style={{ color: '#CC0000', marginLeft: 6 }}>ESPACE</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {!hasSupabase && (
            <span style={{ fontSize: 10, color: '#333', letterSpacing: '0.06em', textTransform: 'uppercase', border: '1px solid #222', padding: '3px 8px', borderRadius: 4 }}>
              local
            </span>
          )}
          <span style={{ fontSize: 13, color: '#444', letterSpacing: '0.06em' }}>{clock}</span>
        </div>
      </header>

      <Toolbar
        cats={cats} filterCat={filterCat} setFilterCat={setFilterCat}
        search={search} setSearch={setSearch}
        editMode={editMode} setEditMode={setEditMode}
      />

      <main style={{ flex: 1, padding: 28 }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 80, color: '#333', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Chargement…
          </div>
        ) : (
          <Grid tiles={shown} editMode={editMode} onAdd={() => { setEditingTile(null); setModalOpen(true) }}
            onEdit={t => { setEditingTile(t); setModalOpen(true) }} onDelete={handleDelete} filterCat={filterCat} />
        )}
      </main>

      {modalOpen && (
        <Modal tile={editingTile} onSave={editingTile ? handleUpdate : handleAdd} onClose={() => setModalOpen(false)} />
      )}
    </div>
  )
}
