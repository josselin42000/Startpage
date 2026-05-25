import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { hasSupabase } from './supabase'
import { loadTiles, addTile, updateTile, deleteTile } from './storage'
import Toolbar from './components/Toolbar'
import Grid from './components/Grid'
import Modal from './components/Modal'
import ToolsPage from './components/ToolsPage'
import FolderPage from './components/FolderPage'
import Weather from './components/Weather'

var EMOJIS_FOLDER = ['📁','📂','⭐','🔴','🟠','🟡','🟢','🔵','🟣','🏠','💼','🎯','🔧','📊','🎙️','🌱','🚀','💎','🎬','🌍']
var COLORS_F = ['#CC0000','#1a6fc4','#1a8f5c','#9b3ccf','#d97316','#0891b2','#374151','#b45309']

function useClock() {
  var state = useState({ fr: '', cn: '' })
  var clock = state[0]; var setClock = state[1]
  useEffect(function() {
    function tick() {
      var n = new Date()
      var fr = n.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      var cn = n.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Shanghai' })
      var date = n.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })
      setClock({ fr: fr, cn: cn, date: date })
    }
    tick(); var id = setInterval(tick, 10000)
    return function() { clearInterval(id) }
  }, [])
  return clock
}

export default function App() {
  var tilesState = useState([]); var tiles = tilesState[0]; var setTiles = tilesState[1]
  var loadingState = useState(true); var loading = loadingState[0]; var setLoading = loadingState[1]
  var editModeState = useState(false); var editMode = editModeState[0]; var setEditMode = editModeState[1]
  var filterCatState = useState('all'); var filterCat = filterCatState[0]; var setFilterCat = filterCatState[1]
  var searchState = useState(''); var search = searchState[0]; var setSearch = searchState[1]
  var modalOpenState = useState(false); var modalOpen = modalOpenState[0]; var setModalOpen = modalOpenState[1]
  var editingTileState = useState(null); var editingTile = editingTileState[0]; var setEditingTile = editingTileState[1]
  var pageState = useState('home'); var page = pageState[0]; var setPage = pageState[1]
  var folderState = useState(null); var openFolder = folderState[0]; var setOpenFolder = folderState[1]
  var draggingState = useState(null); var dragging = draggingState[0]; var setDragging = draggingState[1]
  var dragOverState = useState(null); var dragOver = dragOverState[0]; var setDragOver = dragOverState[1]
  var folderModalState = useState(false); var folderModalOpen = folderModalState[0]; var setFolderModalOpen = folderModalState[1]
  var folderFormState = useState({ name: '', icon: '📁', color: '#CC0000' })
  var folderForm = folderFormState[0]; var setFolderForm = folderFormState[1]

  var clock = useClock()

  var fetchTiles = useCallback(function() {
    setLoading(true)
    loadTiles().then(function(data) { setTiles(data); setLoading(false) }).catch(function(e) { console.error(e); setLoading(false) })
  }, [])

  useEffect(function() { fetchTiles() }, [fetchTiles])

  function handleAdd(tile) {
    var extra = openFolder ? { folder_id: openFolder.id } : {}
    addTile(Object.assign({}, tile, extra), tiles).then(function(newTile) {
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
    if (!confirm('Supprimer ?')) return
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

  function handleDragStart(e, id) { setDragging(id); e.dataTransfer.effectAllowed = 'move' }
  function handleDragOver(e, id) { e.preventDefault(); if (id !== dragging) setDragOver(id) }
  function handleDragEnd() { setDragging(null); setDragOver(null) }

  function handleDrop(e, targetId) {
    e.preventDefault()
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return }
    var draggedTile = tiles.find(function(t) { return t.id === dragging })
    var targetTile = tiles.find(function(t) { return t.id === targetId })
    if (!draggedTile || !targetTile) { setDragging(null); setDragOver(null); return }
    if (targetTile.type === 'folder' && draggedTile.type !== 'folder') {
      updateTile(draggedTile.id, Object.assign({}, draggedTile, { folder_id: targetTile.id }), tiles).then(function(updated) {
        if (updated) setTiles(function(prev) { return prev.map(function(t) { return t.id === draggedTile.id ? updated : t }) })
      })
    } else {
      var dPos = draggedTile.position || 0; var tPos = targetTile.position || 0
      setTiles(tiles.map(function(t) {
        if (t.id === dragging) return Object.assign({}, t, { position: tPos })
        if (t.id === targetId) return Object.assign({}, t, { position: dPos })
        return t
      }))
      updateTile(dragging, { position: tPos }, tiles)
      updateTile(targetId, { position: dPos }, tiles)
    }
    setDragging(null); setDragOver(null)
  }

  function handleFolderReorder(dragId, targetId) {
    var dt = tiles.find(function(t) { return t.id === dragId })
    var tt = tiles.find(function(t) { return t.id === targetId })
    if (!dt || !tt) return
    var dPos = dt.position || 0; var tPos = tt.position || 0
    setTiles(tiles.map(function(t) {
      if (t.id === dragId) return Object.assign({}, t, { position: tPos })
      if (t.id === targetId) return Object.assign({}, t, { position: dPos })
      return t
    }))
    updateTile(dragId, { position: tPos }, tiles)
    updateTile(targetId, { position: dPos }, tiles)
  }

  function handleRemoveFromFolder(tileId) {
    var t = tiles.find(function(x) { return x.id === tileId })
    if (!t) return
    updateTile(tileId, Object.assign({}, t, { folder_id: null }), tiles).then(function(updated) {
      if (updated) setTiles(function(prev) { return prev.map(function(x) { return x.id === tileId ? updated : x }) })
    })
  }

  function handleCreateFolder() {
    if (!folderForm.name.trim()) return
    addTile({ name: folderForm.name.trim(), icon: folderForm.icon, color: folderForm.color, type: 'folder', url: '#', cat: '', logo: '', folder_id: null }, tiles).then(function(newTile) {
      if (newTile) setTiles(function(prev) { return prev.concat([newTile]) })
      setFolderModalOpen(false)
      setFolderForm({ name: '', icon: '📁', color: '#CC0000' })
    })
  }

  var catSet = ['all']
  tiles.forEach(function(t) { if (t.cat && catSet.indexOf(t.cat) === -1) catSet.push(t.cat) })

  var shown = tiles.filter(function(t) {
    if (t.folder_id) return false
    var cOk = filterCat === 'all' || t.cat === filterCat
    var sOk = !search || t.name.toLowerCase().indexOf(search.toLowerCase()) !== -1
    return cOk && sOk
  }).sort(function(a, b) { return (a.position || 0) - (b.position || 0) })

  var hour = new Date().getHours()
  var greet = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon apres-midi' : 'Bonsoir'

  var inputStyle = { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#e0e0e0', fontSize: 13, fontFamily: 'inherit', outline: 'none' }
  var labelStyle = { display: 'block', fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }

  if (page === 'tools') return React.createElement(ToolsPage, { onBack: function() { setPage('home') } })

  if (openFolder) {
    var folderTiles = tiles.filter(function(t) { return t.folder_id === openFolder.id }).sort(function(a, b) { return (a.position || 0) - (b.position || 0) })
    return React.createElement(FolderPage, {
      folder: openFolder, tiles: folderTiles,
      onBack: function() { setOpenFolder(null) },
      editMode: editMode,
      onEdit: function(t) { setEditingTile(t); setModalOpen(true) },
      onDelete: handleDelete,
      onLongPressActivate: function() { setEditMode(true) },
      onAddTile: function() { setEditingTile(null); setModalOpen(true) },
      onReorder: handleFolderReorder,
      onRemoveFromFolder: handleRemoveFromFolder,
    })
  }

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808' } },

    // HEADER
    React.createElement('header', { style: { background: '#0a0a0a', borderBottom: '1px solid #1c1c1c', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 } },

      // LEFT — titre centré
      React.createElement('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 } },
        React.createElement('h1', { style: { fontSize: 24, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center' } },
          React.createElement('span', { style: { color: '#fff' } }, 'GROUPE\u00a0'),
          React.createElement('span', { style: { color: '#CC0000' } }, 'LINEAR')
        ),
        React.createElement('p', { style: { fontSize: 12, color: '#666', letterSpacing: '0.03em' } }, greet + ', let\'s go !')
      ),

      // RIGHT — météo + horloges
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 } },
        React.createElement(Weather, null),

        // Horloges
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 } },
          // Date
          React.createElement('div', { style: { fontSize: 10, color: '#444', letterSpacing: '0.05em', textTransform: 'capitalize' } }, clock.date || ''),
          // FR + CN
          React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'center' } },
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
              React.createElement('span', { style: { fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums' } }, clock.fr || ''),
              React.createElement('span', { style: { fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'France')
            ),
            React.createElement('div', { style: { width: 1, height: 28, background: '#222' } }),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
              React.createElement('span', { style: { fontSize: 22, fontWeight: 700, color: '#cc4400', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums' } }, clock.cn || ''),
              React.createElement('span', { style: { fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'Canton')
            ),
            !hasSupabase ? React.createElement('span', { style: { fontSize: 9, color: '#333', textTransform: 'uppercase', marginLeft: 4 } }, 'local') : null
          )
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
            tiles: shown, allTiles: tiles, editMode: editMode,
            onAdd: function() { setEditingTile(null); setModalOpen(true) },
            onAddFolder: function() { setFolderModalOpen(true) },
            onEdit: function(t) { setEditingTile(t); setModalOpen(true) },
            onDelete: handleDelete,
            onLongPressActivate: function() { setEditMode(true) },
            onOpenTools: function() { setPage('tools') },
            onOpenFolder: function(f) { setOpenFolder(f) },
            filterCat: filterCat,
            dragging: dragging, dragOver: dragOver,
            onDragStart: handleDragStart, onDragOver: handleDragOver,
            onDrop: handleDrop, onDragEnd: handleDragEnd,
          })
    ),
    modalOpen ? React.createElement(Modal, { tile: editingTile, onSave: editingTile ? handleUpdate : handleAdd, onClose: function() { setModalOpen(false) } }) : null,
    folderModalOpen ? React.createElement('div', {
      onClick: function(e) { if (e.target === e.currentTarget) setFolderModalOpen(false) },
      style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }
    },
      React.createElement('div', { style: { background: '#111', border: '1px solid #252525', borderRadius: 16, padding: 28, width: 360, maxWidth: '95vw' } },
        React.createElement('h2', { style: { fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 22 } }, 'Nouveau dossier'),
        React.createElement('div', { style: { marginBottom: 14 } },
          React.createElement('label', { style: labelStyle }, 'Nom'),
          React.createElement('input', { value: folderForm.name, onChange: function(e) { setFolderForm(function(f) { return Object.assign({}, f, { name: e.target.value }) }) }, placeholder: 'Ex : Groupe Linear', style: inputStyle, autoFocus: true })
        ),
        React.createElement('div', { style: { marginBottom: 14 } },
          React.createElement('label', { style: labelStyle }, 'Icone'),
          React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 4 } },
            EMOJIS_FOLDER.map(function(em) {
              return React.createElement('button', { key: em, onClick: function() { setFolderForm(function(f) { return Object.assign({}, f, { icon: em }) }) }, style: { width: 34, height: 34, background: folderForm.icon === em ? '#CC000025' : '#161616', border: folderForm.icon === em ? '1px solid #CC0000' : '1px solid transparent', borderRadius: 6, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, em)
            })
          )
        ),
        React.createElement('div', { style: { marginBottom: 22 } },
          React.createElement('label', { style: labelStyle }, 'Couleur'),
          React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
            COLORS_F.map(function(c) { return React.createElement('div', { key: c, onClick: function() { setFolderForm(function(f) { return Object.assign({}, f, { color: c }) }) }, style: { width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: folderForm.color === c ? '2px solid #fff' : '2px solid transparent', transform: folderForm.color === c ? 'scale(1.15)' : 'none' } }) })
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10 } },
          React.createElement('button', { onClick: function() { setFolderModalOpen(false) }, style: { flex: 1, padding: 11, background: 'transparent', border: '1px solid #252525', borderRadius: 8, color: '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Annuler'),
          React.createElement('button', { onClick: handleCreateFolder, style: { flex: 2, padding: 11, background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Creer')
        )
      )
    ) : null
  )
}
