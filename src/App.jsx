import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { hasSupabase } from './supabase'
import { loadTiles, addTile, updateTile, deleteTile } from './storage'
import Toolbar from './components/Toolbar'
import Grid from './components/Grid'
import Modal from './components/Modal'
import ToolsPage from './components/ToolsPage'
import Weather from './components/Weather'

export default function App() {
  var tilesState = useState([])
  var tiles = tilesState[0]; var setTiles = tilesState[1]
  var loadingState = useState(true)
  var loading = loadingState[0]; var setLoading = loadingState[1]
  var editModeState = useState(false)
  var editMode = editModeState[0]; var setEditMode = editModeState[1]
  var filterCatState = useState('all')
  var filterCat = filterCatState[0]; var setFilterCat = filterCatState[1]
  var searchState = useState('')
  var search = searchState[0]; var setSearch = searchState[1]
  var modalOpenState = useState(false)
  var modalOpen = modalOpenState[0]; var setModalOpen = modalOpenState[1]
  var editingTileState = useState(null)
  var editingTile = editingTileState[0]; var setEditingTile = editingTileState[1]
  var clockState = useState('')
  var clock = clockState[0]; var setClock = clockState[1]
  var pageState = useState('home')
  var page = pageState[0]; var setPage = pageState[1]

  useEffect(function() {
    function tick() {
      var n = new Date()
      setClock(n.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }) + ' · ' + n.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    }
    tick()
    var id = setInterval(tick, 10000)
    return function() { clearInterval(id) }
  }, [])

  var fetchTiles = useCallback(function() {
    setLoading(true)
    loadTiles().then(function(data) { setTiles(data); setLoading(false) }).catch(function(e) { console.error(e); setLoading(false) })
  }, [])

  useEffect(function() { fetchTiles() }, [fetchTiles])

  function handleAdd(tile) {
    addTile(tile, tiles).then(function(newTile) {
      if (newTile) setTiles(function(prev) { return prev.concat([newTile]) })
      setModalOpen(false)
    })
  }

  function handleUpdate(tile) {
    updateTile(editingTile.id, tile, tiles).then(function(updated) {
      if (updated) setTiles(function(prev) { return prev.map(function(t) { return t.id === editingTile.id ? updated : t }) })
      setModalOpen(false)
    })
  }

  function handleDelete(id) {
    if (!confirm('Supprimer ce lien ?')) return
    deleteTile(id, tiles).then(function(updated) { setTiles(updated) })
  }

  function handleEditCat(oldCat, newCat) {
    var toUpdate = tiles.filter(function(t) { return t.cat === oldCat })
    var updated = tiles.slice()
    Promise.all(toUpdate.map(function(t) {
      return updateTile(t.id, Object.assign({}, t, { cat: newCat }), updated).then(function(result) {
        var idx = updated.findIndex(function(x) { return x.id === t.id })
        if (idx >= 0 && result) updated[idx] = result
      })
    })).then(function() { setTiles(updated.slice()) })
  }

  function handleDeleteCat(cat) {
    if (!confirm('Supprimer la categorie "' + cat + '" ?')) return
    var toUpdate = tiles.filter(function(t) { return t.cat === cat })
    var updated = tiles.slice()
    Promise.all(toUpdate.map(function(t) {
      return updateTile(t.id, Object.assign({}, t, { cat: '' }), updated).then(function(result) {
        var idx = updated.findIndex(function(x) { return x.id === t.id })
        if (idx >= 0 && result) updated[idx] = result
      })
    })).then(function() { setTiles(updated.slice()); if (filterCat === cat) setFilterCat('all') })
  }

  var catSet = ['all']
  tiles.forEach(function(t) { if (t.cat && catSet.indexOf(t.cat) === -1) catSet.push(t.cat) })

  var shown = tiles.filter(function(t) {
    var cOk = filterCat === 'all' || t.cat === filterCat
    var sOk = !search || t.name.toLowerCase().indexOf(search.toLowerCase()) !== -1 || (t.cat || '').toLowerCase().indexOf(search.toLowerCase()) !== -1
    return cOk && sOk
  })

  var hour = new Date().getHours()
  var greet = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon apres-midi' : 'Bonsoir'

  if (page === 'tools') {
    return React.createElement(ToolsPage, { onBack: function() { setPage('home') } })
  }

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808' } },
    React.createElement('header', {
      style: { background: '#0a0a0a', borderBottom: '1px solid #1c1c1c', padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
    },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
        React.createElement('h1', { style: { fontSize: 22, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center' } },
          React.createElement('span', { style: { color: '#fff' } }, 'GROUPE\u00a0'),
          React.createElement('span', { style: { color: '#CC0000' } }, 'LINEAR')
        ),
        React.createElement('p', { style: { fontSize: 13, color: '#888', letterSpacing: '0.03em' } }, greet + ', let\'s go !')
      ),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 20 } },
        React.createElement(Weather, null),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 } },
          React.createElement('span', { style: { fontSize: 13, color: '#666', letterSpacing: '0.06em' } }, clock),
          !hasSupabase ? React.createElement('span', { style: { fontSize: 9, color: '#333', textTransform: 'uppercase' } }, 'local') : null
        )
      )
    ),
    React.createElement(Toolbar, {
      cats: catSet, filterCat: filterCat, setFilterCat: setFilterCat,
      search: search, setSearch: setSearch,
      editMode: editMode, setEditMode: setEditMode,
      onEditCat: handleEditCat, onDeleteCat: handleDeleteCat,
    }),
    React.createElement('main', { style: { flex: 1, padding: 28 } },
      loading
        ? React.createElement('div', { style: { textAlign: 'center', paddingTop: 80, color: '#444', fontSize: 13 } }, 'Chargement...')
        : React.createElement(Grid, {
            tiles: shown, editMode: editMode,
            onAdd: function() { setEditingTile(null); setModalOpen(true) },
            onEdit: function(t) { setEditingTile(t); setModalOpen(true) },
            onDelete: handleDelete,
            onLongPressActivate: function() { setEditMode(true) },
            onOpenTools: function() { setPage('tools') },
            filterCat: filterCat,
          })
    ),
    modalOpen ? React.createElement(Modal, {
      tile: editingTile,
      onSave: editingTile ? handleUpdate : handleAdd,
      onClose: function() { setModalOpen(false) },
    }) : null
  )
}
