import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { hasSupabase, supabase } from './supabase'
import { loadTiles, addTile, updateTile, deleteTile } from './storage'
import Toolbar from './components/Toolbar'
import Grid from './components/Grid'
import Modal from './components/Modal'
import ToolsPage from './components/ToolsPage'
import FolderPage from './components/FolderPage'
import Weather from './components/Weather'
import CantonWeatherTooltip from './components/CantonWeatherTooltip'
import IdeasPage from './components/IdeasPage'
import AuthPage from './components/AuthPage'
import AdminPage from './components/AdminPage'

var EMOJIS_FOLDER = ['📁','📂','⭐','🔴','🟠','🟡','🟢','🔵','🟣','🏠','💼','🎯','🔧','📊','🎙️','🌱','🚀','💎','🎬','🌍']
var COLORS_F = ['#CC0000','#1a6fc4','#1a8f5c','#9b3ccf','#d97616','#0891b2','#374151','#b45309']

var DEFAULT_QUICK_LINKS = [
  { name: 'Gmail', url: 'https://mail.google.com', icon: '📧' },
  { name: 'Outlook', url: 'https://outlook.cloud.microsoft/', icon: '📨' },
]

var QL_KEY = 'startpage_quicklinks_v1'
function loadQL() {
  try { var r = localStorage.getItem(QL_KEY); return r ? JSON.parse(r) : DEFAULT_QUICK_LINKS } catch(e) { return DEFAULT_QUICK_LINKS }
}
function saveQL(ql) { try { localStorage.setItem(QL_KEY, JSON.stringify(ql)) } catch(e) {} }

function useClock() {
  var state = useState({ fr: '', cn: '', date: '' })
  var clock = state[0]; var setClock = state[1]
  useEffect(function() {
    function tick() {
      var n = new Date()
      setClock({
        fr: n.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        cn: n.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Shanghai' }),
        date: n.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }),
      })
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
  var googleSearchState = useState(''); var googleSearch = googleSearchState[0]; var setGoogleSearch = googleSearchState[1]
  var modalOpenState = useState(false); var modalOpen = modalOpenState[0]; var setModalOpen = modalOpenState[1]
  var editingTileState = useState(null); var editingTile = editingTileState[0]; var setEditingTile = editingTileState[1]
  var pageState = useState('home'); var page = pageState[0]; var setPage = pageState[1]
  var folderState = useState(null); var openFolder = folderState[0]; var setOpenFolder = folderState[1]
  var draggingState = useState(null); var dragging = draggingState[0]; var setDragging = draggingState[1]
  var dragOverState = useState(null); var dragOver = dragOverState[0]; var setDragOver = dragOverState[1]
  var folderModalState = useState(false); var folderModalOpen = folderModalState[0]; var setFolderModalOpen = folderModalState[1]
  var folderFormState = useState({ name: '', icon: '📁', color: '#CC0000' })
  var folderForm = folderFormState[0]; var setFolderForm = folderFormState[1]
  var cantonHoverState = useState(false); var cantonHover = cantonHoverState[0]; var setCantonHover = cantonHoverState[1]
  var frHoverState = useState(false); var frHover = frHoverState[0]; var setFrHover = frHoverState[1]
  var qlState = useState(loadQL()); var quickLinks = qlState[0]; var setQuickLinks = qlState[1]
  var qlModalState = useState(false); var qlModalOpen = qlModalState[0]; var setQlModalOpen = qlModalState[1]
  var qlFormState = useState(loadQL()); var qlForm = qlFormState[0]; var setQlForm = qlFormState[1]
  var userS = useState(null); var currentUser = userS[0]; var setCurrentUser = userS[1]
  var profileS = useState(null); var profile = profileS[0]; var setProfile = profileS[1]
  var authLoadS = useState(true); var authLoad = authLoadS[0]; var setAuthLoad = authLoadS[1]

  useEffect(function() {
    if (!supabase || !supabase.auth) { setAuthLoad(false); return }
    supabase.auth.getSession().then(function(res) {
      if (res.data && res.data.session && res.data.session.user) {
        var u = res.data.session.user
        setCurrentUser(u)
        supabase.from('profiles').select('*').eq('id', u.id).single().then(function(pr) {
          if (pr.data) setProfile(pr.data)
        })
      }
      setAuthLoad(false)
    })
    supabase.auth.onAuthStateChange(function(event, session) {
      if (session && session.user) { setCurrentUser(session.user) }
      else { setCurrentUser(null); setProfile(null) }
    })
  }, [])

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
  function saveQlModal() { saveQL(qlForm); setQuickLinks(qlForm); setQlModalOpen(false) }

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
  var labelStyle = { display: 'block', fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }

  if (hasSupabase && authLoad) return React.createElement('div', { style: { minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 13 } }, 'Chargement...')
  if (hasSupabase && !currentUser) return React.createElement(AuthPage, {
    onAuth: function(u) {
      setCurrentUser(u)
      supabase.from('profiles').select('*').eq('id', u.id).single().then(function(pr) { if (pr.data) setProfile(pr.data) })
    }
  })

  if (page === 'admin' && profile && profile.role === 'admin') return React.createElement(AdminPage, { onBack: function() { setPage('home') }, currentUser: currentUser, profile: profile })
  if (page === 'tools') return React.createElement(ToolsPage, { onBack: function() { setPage('home') } })
  if (page === 'ideas') return React.createElement(IdeasPage, { onBack: function() { setPage('home') } })
  if (openFolder) {
    var folderTiles = tiles.filter(function(t) { return t.folder_id === openFolder.id }).sort(function(a, b) { return (a.position || 0) - (b.position || 0) })
    return React.createElement(FolderPage, {
      folder: openFolder, tiles: folderTiles,
      onBack: function() { setOpenFolder(null) },
      editMode: editMode,
      onEdit: function(t) { setEdit
