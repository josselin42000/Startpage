import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
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

  // Clock
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

  // Load tiles
  const loadTiles = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tiles')
      .select('*')
      .order('position', { ascending: true })
    if (!error) setTiles(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadTiles() }, [loadTiles])

  // CRUD
  const addTile = async (tile) => {
    const maxPos = tiles.length ? Math.max(...tiles.map(t => t.position || 0)) : 0
    const { data, error } = await supabase
      .from('tiles')
      .insert([{ ...tile, position: maxPos + 1 }])
      .select()
    if (!error && data) setTiles(prev => [...prev, data[0]])
  }

  const updateTile = async (id, tile) => {
    const { data, error } = await supabase
      .from('tiles')
      .update(tile)
      .eq('id', id)
      .select()
    if (!error && data) setTiles(prev => prev.map(t => t.id === id ? data[0] : t))
  }

  const deleteTile = async (id) => {
    await supabase.from('tiles').delete().eq('id', id)
    setTiles(prev => prev.filter(t => t.id !== id))
  }

  // Filtered tiles
  const cats = ['all', ...new Set(tiles.map(t => t.cat).filter(Boolean))]
  const shown = tiles.filter(t => {
    const cOk = filterCat === 'all' || t.cat === filterCat
    const sOk = !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.cat || '').toLowerCase().includes(search.toLowerCase())
    return cOk && sOk
  })

  const openAdd = () => { setEditingTile(null); setModalOpen(true) }
  const openEdit = (tile) => { setEditingTile(tile); setModalOpen(true) }

  const handleSave = async (data) => {
    if (editingTile) {
      await updateTile(editingTile.id, data)
    } else {
      await addTile(data)
    }
    setModalOpen(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* HEADER */}
      <header style={{
        background: '#0d0d0d', borderBottom: '1px solid #1c1c1c',
        padding: '16px 28px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50
      }}>
        <h1 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
          ● MON <span style={{ color: '#CC0000', marginLeft: 6 }}>ESPACE</span>
        </h1>
        <span style={{ fontSize: 13, color: '#444', letterSpacing: '0.06em' }}>{clock}</span>
      </header>

      <Toolbar
        cats={cats}
        filterCat={filterCat}
        setFilterCat={setFilterCat}
        search={search}
        setSearch={setSearch}
        editMode={editMode}
        setEditMode={setEditMode}
      />

      <main style={{ flex: 1, padding: 28 }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 80, color: '#333', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Chargement…
          </div>
        ) : (
          <Grid
            tiles={shown}
            editMode={editMode}
            onAdd={openAdd}
            onEdit={openEdit}
            onDelete={deleteTile}
            filterCat={filterCat}
          />
        )}
      </main>

      {modalOpen && (
        <Modal
          tile={editingTile}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
