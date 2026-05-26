import React from 'react'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Tile from './Tile'
import IdeasPage from './IdeasPage'
import { MemberStickyWidget } from './StickyNotes'
import CantonWeatherTooltip from './CantonWeatherTooltip'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(function(w) { return w[0] || '' }).join('').toUpperCase().slice(0, 2)
}

var EMOJIS_SMALL = ['🔗','🏠','⚡','📊','💼','🎙️','📷','🛒','🔧','🌱','🎬','📡','💡','🔌','🚗','🎯','💻','🗂️','📋','🔐','💰','📈','🎵','✅','🔍','⚙️','🏢','🚀','💎','🌐','🛠️']
var COLORS_SMALL = ['#CC0000','#1a6fc4','#1a8f5c','#9b3ccf','#d97316','#0891b2','#374151','#b45309']

var QL_KEY_PREFIX = 'userpage_ql_'
var DEFAULT_QL = [
  { name: 'Gmail', url: 'https://mail.google.com', icon: '📧' },
  { name: 'Outlook', url: 'https://outlook.cloud.microsoft/', icon: '📨' },
]
function loadQL(slug) { try { var r = localStorage.getItem(QL_KEY_PREFIX + slug); return r ? JSON.parse(r) : DEFAULT_QL } catch(e) { return DEFAULT_QL } }
function saveQL(slug, ql) { try { localStorage.setItem(QL_KEY_PREFIX + slug, JSON.stringify(ql)) } catch(e) {} }

var WEATHER_ICONS = {0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'🌨️',73:'🌨️',75:'❄️',80:'🌦️',81:'🌧️',82:'⛈️',95:'⛈️'}
var WEATHER_DAYS = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
var ST_ETIENNE = { lat: 45.4397, lon: 4.3872 }

function useWeather() {
  var dataS = useState(null); var data = dataS[0]; var setData = dataS[1]
  useEffect(function() {
    function fetchW(lat, lon) {
      fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=7')
        .then(function(r) { return r.json() })
        .then(function(d) { setData({ temp: Math.round(d.current.temperature_2m), code: d.current.weathercode, daily: d.daily }) })
        .catch(function() {})
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(pos) { fetchW(pos.coords.latitude, pos.coords.longitude) },
        function() { fetchW(ST_ETIENNE.lat, ST_ETIENNE.lon) },
        { timeout: 5000 }
      )
    } else { fetchW(ST_ETIENNE.lat, ST_ETIENNE.lon) }
  }, [])
  return data
}

function WeatherTooltip(props) {
  var data = props.data
  if (!data || !data.daily) return null
  return React.createElement('div', {
    style: { position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)', background: '#111', border: '1px solid #252525', borderRadius: 12, padding: 14, zIndex: 200, minWidth: 220, boxShadow: '0 8px 32px rgba(0,0,0,0.8)' }
  },
    React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 } }, 'Météo locale · 7j'),
    data.daily.time.map(function(dateStr, i) {
      var d = new Date(dateStr)
      return React.createElement('div', { key: dateStr, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: i < 6 ? '1px solid #1a1a1a' : 'none' } },
        React.createElement('span', { style: { fontSize: 11, color: '#666', width: 28 } }, WEATHER_DAYS[d.getDay()]),
        React.createElement('span', { style: { fontSize: 16 } }, WEATHER_ICONS[data.daily.weathercode[i]] || '🌡️'),
        React.createElement('span', { style: { fontSize: 13, fontWeight: 700, color: '#ddd', marginLeft: 'auto' } }, Math.round(data.daily.temperature_2m_max[i]) + 'C'),
        React.createElement('span', { style: { fontSize: 11, color: '#555' } }, Math.round(data.daily.temperature_2m_min[i]) + 'C')
      )
    })
  )
}

function PinGate(props) {
  var pinS = useState(''); var pin = pinS[0]; var setPin = pinS[1]
  var errS = useState(false); var err = errS[0]; var setErr = errS[1]
  function check() {
    if (pin === props.correctPin) { props.onUnlock(); return }
    setErr(true); setPin('')
    setTimeout(function() { setErr(false) }, 1500)
  }
  return React.createElement('div', { style: { minHeight: props.mini ? 'auto' : '100vh', background: props.mini ? 'transparent' : '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 } },
    React.createElement('div', { style: { background: '#111', border: '1px solid ' + (err ? '#CC0000' : '#1e1e1e'), borderRadius: 16, padding: 28, width: '100%', maxWidth: 340, textAlign: 'center' } },
      React.createElement('div', { style: { fontSize: 32, marginBottom: 12 } }, props.icon || '🔐'),
      React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: '#ddd', marginBottom: 6 } }, props.title || 'Accès protégé'),
      React.createElement('div', { style: { fontSize: 12, color: '#444', marginBottom: 20 } }, props.desc || "Entrez le code d'accès"),
      React.createElement('input', { type: 'password', value: pin, onChange: function(e) { setPin(e.target.value) }, onKeyDown: function(e) { if (e.key === 'Enter') check() }, placeholder: 'Code PIN', autoFocus: true, style: { width: '100%', background: '#0a0a0a', border: '1px solid ' + (err ? '#CC0000' : '#2a2a2a'), borderRadius: 8, padding: '11px 14px', color: '#e0e0e0', fontSize: 15, fontFamily: 'inherit', outline: 'none', textAlign: 'center', letterSpacing: '0.2em', marginBottom: 12 } }),
      err ? React.createElement('div', { style: { fontSize: 12, color: '#CC0000', marginBottom: 8 } }, 'Code incorrect') : null,
      React.createElement('button', { onClick: check, style: { width: '100%', padding: 12, background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Accéder')
    )
  )
}

function UserFolder(props) {
  var onBack = props.onBack
  var TOOLS = [
    { id: 'waze', name: 'Waze', icon: '🗺️', color: '#33ccff', url: 'https://www.waze.com/fr/live-map/' },
    { id: 'flights', name: 'Google Flights', icon: '✈️', color: '#4285f4', url: 'https://www.google.com/travel/flights' },
    { id: 'maps', name: 'Google Maps', icon: '📍', color: '#34a853', url: 'https://maps.google.com' },
    { id: 'translate', name: 'Traducteur', icon: '🌐', color: '#9b3ccf', url: 'https://translate.google.com' },
    { id: 'meteo', name: 'Météo France', icon: '🌦️', color: '#0891b2', url: 'https://www.meteofrance.com' },
    { id: 'calendar', name: 'Agenda', icon: '📅', color: '#CC0000', url: 'https://calendar.google.com' },
  ]
  var activeS = useState(null); var active = activeS[0]; var setActive = activeS[1]

  if (active) {
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#080808' } },
      React.createElement('div', { style: { padding: '10px 16px', background: '#0d0d0d', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: 10 } },
        React.createElement('button', { onClick: function() { setActive(null) }, style: { background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 6, color: '#aaa', fontSize: 12, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' } }, '<- Outils'),
        React.createElement('span', { style: { fontSize: 13, color: '#ccc', fontWeight: 600 } }, active.name),
        React.createElement('a', { href: active.url, target: '_blank', rel: 'noopener noreferrer', style: { marginLeft: 'auto', fontSize: 11, color: '#555', textDecoration: 'none', border: '1px solid #222', borderRadius: 5, padding: '4px 10px' } }, 'Ouvrir dans onglet')
      ),
      React.createElement('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 } },
        React.createElement('div', { style: { fontSize: 48 } }, active.icon),
        React.createElement('div', { style: { fontSize: 13, color: '#555' } }, active.name + ' bloque les iframes.'),
        React.createElement('a', { href: active.url, target: '_blank', rel: 'noopener noreferrer', style: { padding: '11px 28px', background: '#CC0000', color: '#fff', textDecoration: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700 } }, 'Ouvrir dans un nouvel onglet')
      )
    )
  }

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808' } },
    React.createElement('header', { style: { background: '#0a0a0a', borderBottom: '1px solid #1c1c1c', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 } },
      React.createElement('button', { onClick: onBack, style: { background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 8, color: '#aaa', fontSize: 13, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' } }, '<- Retour'),
      React.createElement('h1', { style: { fontSize: 15, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' } }, '🛠️ Outils'),
      React.createElement('span', { style: { fontSize: 11, color: '#333', marginLeft: 8 } }, 'certains sites bloquent les iframes')
    ),
    React.createElement('main', { style: { flex: 1, padding: 24 } },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 } },
        TOOLS.map(function(tool) {
          return React.createElement('div', {
            key: tool.id, onClick: function() { setActive(tool) },
            style: { background: '#1a1a1a', border: '1px solid #282828', borderRadius: 14, padding: '20px 12px 14px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
            onMouseEnter: function(e) { e.currentTarget.style.background = '#222' },
            onMouseLeave: function(e) { e.currentTarget.style.background = '#1a1a1a' }
          },
            React.createElement('div', { style: { width: 52, height: 52, borderRadius: 12, background: tool.color + '18', border: '1px solid ' + tool.color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 } }, tool.icon),
            React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color: '#ddd' } }, tool.name)
          )
        })
      )
    )
  )
}

function UserCustomFolder(props) {
  var folder = props.folder; var tiles = props.tiles; var onBack = props.onBack
  var onAddTile = props.onAddTile; var onDeleteTile = props.onDeleteTile

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808' } },
    React.createElement('header', { style: { background: '#0a0a0a', borderBottom: '1px solid #1c1c1c', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 } },
      React.createElement('button', { onClick: onBack, style: { background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 8, color: '#aaa', fontSize: 13, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' } }, '<- Retour'),
      React.createElement('span', { style: { fontSize: 20 } }, folder.icon || '📁'),
      React.createElement('h1', { style: { fontSize: 15, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' } }, folder.name),
      React.createElement('button', { onClick: onAddTile, style: { marginLeft: 'auto', padding: '6px 16px', background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, '+ Ajouter')
    ),
    React.createElement('main', { style: { flex: 1, padding: 24 } },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 } },
        tiles.map(function(t, i) {
          return React.createElement('div', { key: t.id, style: { position: 'relative' } },
            React.createElement('button', { onClick: function() { onDeleteTile(t.id) }, style: { position: 'absolute', top: -6, right: -6, width: 20, height: 20, background: '#CC0000', border: '2px solid #080808', borderRadius: '50%', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 10 } }, 'x'),
            React.createElement(Tile, { tile: t, editMode: false, index: i })
          )
        }),
        React.createElement('div', { onClick: onAddTile, style: { background: '#0f0f0f', border: '1px dashed #2a2a2a', borderRadius: 12, padding: 20, cursor: 'pointer', textAlign: 'center', color: '#333', fontSize: 12 }, onMouseEnter: function(e) { e.currentTarget.style.borderColor = '#CC0000'; e.currentTarget.style.color = '#CC0000' }, onMouseLeave: function(e) { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#333' } }, '+ Ajouter')
      )
    )
  )
}

export default function UserPage(props) {
  var slug = props.slug
  var pageS = useState(null); var page = pageS[0]; var setPage = pageS[1]
  var tilesS = useState([]); var tiles = tilesS[0]; var setTiles = tilesS[1]
  var userTilesS = useState([]); var userTiles = userTilesS[0]; var setUserTiles = userTilesS[1]
  var foldersS = useState([]); var folders = foldersS[0]; var setFolders = foldersS[1]
  var folderTilesS = useState({}); var folderTiles = folderTilesS[0]; var setFolderTiles = folderTilesS[1]
  var loadS = useState(true); var load = loadS[0]; var setLoad = loadS[1]
  var notFoundS = useState(false); var notFound = notFoundS[0]; var setNotFound = notFoundS[1]
  var pageUnlockedS = useState(false); var pageUnlocked = pageUnlockedS[0]; var setPageUnlocked = pageUnlockedS[1]
  var ideasUnlockedS = useState(false); var ideasUnlocked = ideasUnlockedS[0]; var setIdeasUnlocked = ideasUnlockedS[1]
  var ideasPinModalS = useState(false); var ideasPinModal = ideasPinModalS[0]; var setIdeasPinModal = ideasPinModalS[1]
  var addModalS = useState(false); var addModal = addModalS[0]; var setAddModal = addModalS[1]
  var addFolderModalS = useState(false); var addFolderModal = addFolderModalS[0]; var setAddFolderModal = addFolderModalS[1]
  var addToFolderS = useState(null); var addToFolder = addToFolderS[0]; var setAddToFolder = addToFolderS[1]
  var openFolderS = useState(null); var openFolder = openFolderS[0]; var setOpenFolder = openFolderS[1]
  var showIdeasS = useState(false); var showIdeas = showIdeasS[0]; var setShowIdeas = showIdeasS[1]
  var showToolsS = useState(false); var showTools = showToolsS[0]; var setShowTools = showToolsS[1]
  var editModeS = useState(false); var editMode = editModeS[0]; var setEditMode = editModeS[1]
  var googleSearchS = useState(''); var googleSearch = googleSearchS[0]; var setGoogleSearch = googleSearchS[1]
  var qlS = useState([]); var quickLinks = qlS[0]; var setQuickLinks = qlS[1]
  var qlEditS = useState(false); var qlEdit = qlEditS[0]; var setQlEdit = qlEditS[1]
  var qlFormS = useState([]); var qlForm = qlFormS[0]; var setQlForm = qlFormS[1]
  var formS = useState({ name: '', url: '', icon: '🔗', color: '#CC0000' }); var form = formS[0]; var setForm = formS[1]
  var folderFormS = useState({ name: '', icon: '📁', color: '#1a6fc4', pin: '' }); var folderForm = folderFormS[0]; var setFolderForm = folderFormS[1]
  var folderPinS = useState({}); var folderPinUnlocked = folderPinS[0]; var setFolderPinUnlocked = folderPinS[1]
  var clockFrS = useState(''); var clockFr = clockFrS[0]; var setClockFr = clockFrS[1]
  var clockCnS = useState(''); var clockCn = clockCnS[0]; var setClockCn = clockCnS[1]
  var frHoverS = useState(false); var frHover = frHoverS[0]; var setFrHover = frHoverS[1]
  var cnHoverS = useState(false); var cnHover = cnHoverS[0]; var setCnHover = cnHoverS[1]
  var weather = useWeather()

  useEffect(function() {
    function tick() {
      var n = new Date()
      setClockFr(n.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
      setClockCn(n.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Shanghai' }))
    }
    tick(); var id = setInterval(tick, 10000)
    return function() { clearInterval(id) }
  }, [])

  useEffect(function() {
    if (!slug) return
    setLoad(true)
    supabase.from('user_pages').select('*').eq('slug', slug).single().then(function(res) {
      if (res.error || !res.data) { setNotFound(true); setLoad(false); return }
      var p = res.data
      setPage(p)
      setQuickLinks(loadQL(p.slug))
      if (!p.page_pin) setPageUnlocked(true)
      if (!p.ideas_pin) setIdeasUnlocked(true)
      var promises = []
      if (p.show_tiles && p.imposed_tile_ids && p.imposed_tile_ids.length > 0) {
        promises.push(supabase.from('tiles').select('*').in('id', p.imposed_tile_ids).then(function(r) { if (!r.error && r.data) setTiles(r.data) }))
      }
      promises.push(supabase.from('user_page_tiles').select('*').eq('page_id', p.id).order('position').then(function(r) {
        if (!r.error && r.data) {
          var foldersData = r.data.filter(function(t) { return t.type === 'folder' })
          var rootTiles = r.data.filter(function(t) { return t.type !== 'folder' && !t.folder_id })
          setUserTiles(rootTiles)
          setFolders(foldersData)
          var ftMap = {}
          foldersData.forEach(function(f) { ftMap[f.id] = r.data.filter(function(t) { return t.folder_id === f.id }) })
          setFolderTiles(ftMap)
        }
      }))
      Promise.all(promises).then(function() { setLoad(false) })
    })
  }, [slug])

  function handleAddTile(folderId) {
    if (!form.name.trim() || !page) return
    var url = form.url.trim()
    if (url && url.indexOf('http') !== 0) url = 'https://' + url
    var data = { page_id: page.id, name: form.name.trim(), url: url || '#', icon: form.icon, color: form.color, position: 0, folder_id: folderId || null, type: 'link' }
    supabase.from('user_page_tiles').insert([data]).select().then(function(res) {
      if (!res.error && res.data) {
        var newTile = res.data[0]
        if (folderId) {
          setFolderTiles(function(prev) { var u = Object.assign({}, prev); u[folderId] = (u[folderId] || []).concat([newTile]); return u })
        } else {
          setUserTiles(function(prev) { return prev.concat([newTile]) })
        }
        setForm({ name: '', url: '', icon: '🔗', color: '#CC0000' })
        setAddModal(false); setAddToFolder(null)
      }
    })
  }

  function handleDeleteTile(id, folderId) {
    if (!confirm('Supprimer ?')) return
    supabase.from('user_page_tiles').delete().eq('id', id).then(function() {
      if (folderId) {
        setFolderTiles(function(prev) { var u = Object.assign({}, prev); u[folderId] = (u[folderId] || []).filter(function(t) { return t.id !== id }); return u })
      } else {
        setUserTiles(function(prev) { return prev.filter(function(t) { return t.id !== id }) })
      }
    })
  }

  function handleDeleteFolder(folderId) {
    if (!confirm('Supprimer ce dossier et son contenu ?')) return
    supabase.from('user_page_tiles').delete().eq('folder_id', folderId).then(function() {
      supabase.from('user_page_tiles').delete().eq('id', folderId).then(function() {
        setFolders(function(prev) { return prev.filter(function(f) { return f.id !== folderId }) })
        setFolderTiles(function(prev) { var u = Object.assign({}, prev); delete u[folderId]; return u })
      })
    })
  }

  function handleCreateFolder() {
    if (!folderForm.name.trim() || !page) return
    var data = { page_id: page.id, name: folderForm.name.trim(), icon: folderForm.icon, color: folderForm.color, type: 'folder', url: '#', position: 0, folder_pin: folderForm.pin.trim() }
    supabase.from('user_page_tiles').insert([data]).select().then(function(res) {
      if (!res.error && res.data) {
        var newFolder = res.data[0]
        setFolders(function(prev) { return prev.concat([newFolder]) })
        setFolderTiles(function(prev) { var u = Object.assign({}, prev); u[newFolder.id] = []; return u })
        setFolderForm({ name: '', icon: '📁', color: '#1a6fc4', pin: '' })
        setAddFolderModal(false)
      }
    })
  }

  var inp = { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#e0e0e0', fontSize: 13, fontFamily: 'inherit', outline: 'none' }
  var lbl = { display: 'block', fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }

  if (load) return React.createElement('div', { style: { minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 13 } }, 'Chargement...')
  if (notFound || !page) return React.createElement('div', { style: { minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 } },
    React.createElement('div', { style: { fontSize: 40 } }, '404'),
    React.createElement('div', { style: { fontSize: 14, color: '#444' } }, 'Page introuvable'),
    React.createElement('a', { href: '/', style: { fontSize: 12, color: '#CC0000', textDecoration: 'none' } }, 'Retour')
  )
  if (page.page_pin && !pageUnlocked) return React.createElement(PinGate, { correctPin: page.page_pin, onUnlock: function() { setPageUnlocked(true) }, icon: page.avatar || '🔐', title: 'Espace de ' + page.display_name, desc: "Entrez votre code d'accès" })
  if (showIdeas) return React.createElement(IdeasPage, { onBack: function() { setShowIdeas(false) }, pageId: page ? page.id : null })
  if (showTools) return React.createElement(UserFolder, { onBack: function() { setShowTools(false) } })

  if (openFolder) {
    var folderUnlocked = folderPinUnlocked[openFolder.id]
    if (openFolder.folder_pin && !folderUnlocked) return React.createElement(PinGate, {
      correctPin: openFolder.folder_pin,
      onUnlock: function() { var u = Object.assign({}, folderPinUnlocked); u[openFolder.id] = true; setFolderPinUnlocked(u) },
      icon: openFolder.icon || '📁', title: openFolder.name, desc: 'Entrez le code du dossier'
    })
    return React.createElement(UserCustomFolder, {
      folder: openFolder, tiles: folderTiles[openFolder.id] || [],
      onBack: function() { setOpenFolder(null) },
      onAddTile: function() { setAddToFolder(openFolder.id); setAddModal(true) },
      onDeleteTile: function(id) { handleDeleteTile(id, openFolder.id) }
    })
  }

  var hour = new Date().getHours()
  var greet = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  var firstName = page.display_name.split(' ')[0]

  var allGrid = []
  tiles.forEach(function(t) { allGrid.push({ tile: t, type: 'imposed' }) })
  userTiles.forEach(function(t) { allGrid.push({ tile: t, type: 'user' }) })
  folders.forEach(function(f) { allGrid.push({ tile: f, type: 'folder' }) })
  if (page.show_tools) allGrid.push({ tile: { id: '__tools__', name: 'Outils', icon: '🛠️', color: '#CC0000' }, type: 'tools' })
  allGrid.push({ tile: { id: '__stickies__', name: 'Notes', icon: '🗒️', color: '#b45309' }, type: 'stickies' })
  if (page.show_ideas) allGrid.push({ tile: { id: '__ideas__', name: 'Boite à idées', icon: '💡', color: '#b45309' }, type: 'ideas' })

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808' } },

    React.createElement('header', { style: { background: '#0a0a0a', borderBottom: '1px solid #1c1c1c', padding: '0 20px' } },

      React.createElement('div', { style: { display: 'flex', alignItems: 'center', padding: '10px 0', gap: 10 } },

        // GAUCHE : avatar + prénom + quick links
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            React.createElement('div', { style: { width: 38, height: 38, borderRadius: '50%', background: (page.color || '#1a6fc4') + '22', border: '2px solid ' + (page.color || '#1a6fc4') + '66', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: page.avatar ? 18 : 12, fontWeight: 700, color: page.color || '#1a6fc4', flexShrink: 0 } }, page.avatar || getInitials(page.display_name)),
            React.createElement('div', null,
              React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color: '#ddd' } }, page.display_name),
              React.createElement('div', { style: { fontSize: 10, color: '#555' } }, greet + ', ' + firstName + ' !')
            )
          ),
          quickLinks.map(function(ql) {
            return React.createElement('a', {
              key: ql.name, href: ql.url, target: '_blank', rel: 'noopener noreferrer',
              style: { display: 'flex', alignItems: 'center', gap: 5, background: '#141414', border: '1px solid #222', borderRadius: 7, padding: '5px 10px', textDecoration: 'none', color: '#ccc', fontSize: 12, fontWeight: 600 }
            },
              React.createElement('span', { style: { fontSize: 15 } }, ql.icon || '🔗'),
              React.createElement('span', null, ql.name)
            )
          }),
          editMode ? React.createElement('button', {
            onClick: function() { setQlForm(quickLinks.slice()); setQlEdit(true) },
            style: { background: 'transparent', border: '1px dashed #333', borderRadius: 7, padding: '5px 10px', color: '#444', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }
          }, '✏️') : null
        ),

        // CENTRE : titre
        React.createElement('div', { style: { flex: 1, display: 'flex', justifyContent: 'center' } },
          React.createElement('h1', { style: { fontSize: 20, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center' } },
            React.createElement('span', { style: { color: '#fff' } }, 'GROUPE\u00a0'),
            React.createElement('span', { style: { color: '#CC0000' } }, 'LINEAR')
          )
        ),

        // DROITE : bouton éditer
        React.createElement('div', { style: { flexShrink: 0, display: 'flex', justifyContent: 'flex-end' } },
          React.createElement('button', {
            onClick: function() { setEditMode(function(v) { return !v }) },
            style: { padding: '5px 14px', background: editMode ? '#1a0000' : 'transparent', border: editMode ? '1px solid #CC0000' : '1px solid #2a2a2a', borderRadius: 7, color: editMode ? '#CC0000' : '#555', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' }
          }, editMode ? 'Terminer' : 'Éditer')
        )
      ),

      // ROW 2 : météo + horloges
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '8px 0 12px', flexWrap: 'wrap' } },
        weather ? React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, background: '#141414', border: '1px solid #222', borderRadius: 8, padding: '5px 12px' } },
          React.createElement('span', { style: { fontSize: 16 } }, WEATHER_ICONS[weather.code] || '🌡️'),
          React.createElement('span', { style: { fontSize: 14, fontWeight: 700, color: '#ddd' } }, weather.temp + 'C')
        ) : null,
        React.createElement('div', { style: { width: 1, height: 24, background: '#1c1c1c' } }),
        React.createElement('div', {
          style: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', cursor: 'default' },
          onMouseEnter: function() { setFrHover(true) },
          onMouseLeave: function() { setFrHover(false) }
        },
          React.createElement('span', { style: { fontSize: 22, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' } }, clockFr),
          React.createElement('span', { style: { fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'France'),
          frHover && weather ? React.createElement(WeatherTooltip, { data: weather }) : null
        ),
        page.show_clock_cn ? React.createElement('div', { style: { width: 1, height: 24, background: '#1c1c1c' } }) : null,
        page.show_clock_cn ? React.createElement('div', {
          style: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', cursor: 'default' },
          onMouseEnter: function() { setCnHover(true) },
          onMouseLeave: function() { setCnHover(false) }
        },
          React.createElement('span', { style: { fontSize: 22, fontWeight: 700, color: '#cc4400', fontVariantNumeric: 'tabular-nums' } }, clockCn),
          React.createElement('span', { style: { fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'Canton'),
          cnHover ? React.createElement(CantonWeatherTooltip, null) : null
        ) : null
      )
    ),

    // BARRE GOOGLE SEARCH
    React.createElement('div', { style: { background: '#0d0d0d', borderBottom: '1px solid #181818', padding: '10px 20px' } },
      React.createElement('form', {
        onSubmit: function(e) {
          e.preventDefault()
          if (!googleSearch.trim()) return
          window.open('https://www.google.com/search?q=' + encodeURIComponent(googleSearch.trim()), '_blank')
          setGoogleSearch('')
        },
        style: { display: 'flex', alignItems: 'center' }
      },
        React.createElement('input', {
          value: googleSearch,
          onChange: function(e) { setGoogleSearch(e.target.value) },
          placeholder: '🔍  Rechercher sur Google...',
          style: { flex: 1, background: '#161616', border: '1px solid #2a2a2a', borderRight: 'none', borderRadius: '8px 0 0 8px', padding: '9px 16px', color: '#ddd', fontSize: 13, fontFamily: 'inherit', outline: 'none' }
        }),
        React.createElement('button', {
          type: 'submit',
          style: { background: '#CC0000', border: 'none', borderRadius: '0 8px 8px 0', padding: '9px 20px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
        }, 'Go')
      )
    ),

    React.createElement('main', { style: { flex: 1, padding: 24 } },
      editMode ? React.createElement('div', { style: { fontSize: 11, color: '#CC000088', letterSpacing: '0.06em', marginBottom: 14, padding: '6px 12px', background: '#1a0000', border: '1px solid #CC000033', borderRadius: 8, display: 'inline-block' } }, '✏️ Mode édition — × pour supprimer · + pour ajouter') : null,
      React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 } }, allGrid.length + ' liens'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 } },

        allGrid.map(function(item, i) {
          var t = item.tile

          if (item.type === 'stickies') {
            return React.createElement(MemberStickyWidget, { key: '__stickies__', pageId: page.id })
          }

          if (item.type === 'folder') {
            var childCount = folderTiles[t.id] ? folderTiles[t.id].length : 0
            return React.createElement('div', { key: t.id, style: { position: 'relative' } },
              editMode ? React.createElement('button', {
                onClick: function() { handleDeleteFolder(t.id) },
                style: { position: 'absolute', top: -6, right: -6, width: 20, height: 20, background: '#CC0000', border: '2px solid #080808', borderRadius: '50%', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 10 }
              }, 'x') : null,
              React.createElement('div', {
                onClick: function() { if (!editMode) setOpenFolder(t) },
                style: { background: '#1a1a1a', border: '1px solid ' + (t.color || '#1a6fc4') + '33', borderRadius: 12, padding: '16px 10px 12px', cursor: editMode ? 'default' : 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: editMode ? 0.7 : 1 },
                onMouseEnter: function(e) { if (!editMode) e.currentTarget.style.background = '#222' },
                onMouseLeave: function(e) { e.currentTarget.style.background = '#1a1a1a' }
              },
                React.createElement('div', { style: { width: 50, height: 50, borderRadius: 12, background: (t.color || '#1a6fc4') + '18', border: '1px solid ' + (t.color || '#1a6fc4') + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 } }, t.icon || '📁'),
                React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color: '#ddd' } }, t.name),
                React.createElement('div', { style: { fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', border: '1px solid #2a2a2a', borderRadius: 20 } }, childCount + ' lien' + (childCount > 1 ? 's' : ''))
              )
            )
          }

          if (item.type === 'tools' || item.type === 'ideas') {
            return React.createElement('div', {
              key: t.id,
              onClick: function() {
                if (item.type === 'tools') setShowTools(true)
                else if (item.type === 'ideas') {
                  if (page.ideas_pin && !ideasUnlocked) setIdeasPinModal(true)
                  else setShowIdeas(true)
                }
              },
              style: { background: '#1a1a1a', border: '1px solid ' + (t.color || '#CC0000') + '33', borderRadius: 12, padding: '16px 10px 12px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
              onMouseEnter: function(e) { e.currentTarget.style.background = '#222' },
              onMouseLeave: function(e) { e.currentTarget.style.background = '#1a1a1a' }
            },
              React.createElement('div', { style: { width: 50, height: 50, borderRadius: 12, background: (t.color || '#CC0000') + '18', border: '1px solid ' + (t.color || '#CC0000') + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 } }, t.icon),
              React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color: '#ddd' } }, t.name),
              React.createElement('div', { style: { fontSize: 9, color: item.type === 'ideas' && page.ideas_pin && !ideasUnlocked ? '#b45309' : '#555', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', border: '1px solid #2a2a2a', borderRadius: 20 } },
                item.type === 'ideas' && page.ideas_pin && !ideasUnlocked ? '🔐 Protégé' : item.type === 'tools' ? '6 liens' : ''
              )
            )
          }

          return React.createElement('div', { key: t.id, style: { position: 'relative' } },
            editMode && item.type === 'user' ? React.createElement('button', {
              onClick: function() { handleDeleteTile(t.id, null) },
              style: { position: 'absolute', top: -6, right: -6, width: 20, height: 20, background: '#CC0000', border: '2px solid #080808', borderRadius: '50%', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 10 }
            }, 'x') : null,
            React.createElement(Tile, { tile: t, editMode: false, index: i })
          )
        }),

        editMode ? React.createElement('div', {
          onClick: function() { setAddToFolder(null); setAddModal(true) },
          style: { background: '#0f0f0f', border: '1px dashed #2a2a2a', borderRadius: 12, padding: '16px 10px 12px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#444' },
          onMouseEnter: function(e) { e.currentTarget.style.borderColor = '#CC0000'; e.currentTarget.style.color = '#CC0000'; e.currentTarget.style.background = '#0b0000' },
          onMouseLeave: function(e) { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#444'; e.currentTarget.style.background = '#0f0f0f' }
        },
          React.createElement('div', { style: { width: 50, height: 50, borderRadius: 12, background: '#161616', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: 'inherit' } }, '+'),
          React.createElement('div', { style: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'inherit' } }, 'Ajouter')
        ) : null,

        editMode ? React.createElement('div', {
          onClick: function() { setAddFolderModal(true) },
          style: { background: '#0f0f0f', border: '1px dashed #1a6fc444', borderRadius: 12, padding: '16px 10px 12px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#1a6fc455' },
          onMouseEnter: function(e) { e.currentTarget.style.borderColor = '#1a6fc4'; e.currentTarget.style.color = '#1a6fc4'; e.currentTarget.style.background = '#001a2a' },
          onMouseLeave: function(e) { e.currentTarget.style.borderColor = '#1a6fc444'; e.currentTarget.style.color = '#1a6fc455'; e.currentTarget.style.background = '#0f0f0f' }
        },
          React.createElement('div', { style: { width: 50, height: 50, borderRadius: 12, background: '#161616', border: '1px solid #1a6fc433', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: 'inherit' } }, '📁'),
          React.createElement('div', { style: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'inherit' } }, 'Dossier')
        ) : null
      )
    ),

    // MODAL LIENS RAPIDES
    qlEdit ? React.createElement('div', {
      onClick: function(e) { if (e.target === e.currentTarget) setQlEdit(false) },
      style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }
    },
      React.createElement('div', { style: { background: '#111', border: '1px solid #252525', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 } },
        React.createElement('h2', { style: { fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 18 } }, '🔗 Liens rapides'),
        qlForm.map(function(ql, i) {
          return React.createElement('div', { key: i, style: { display: 'flex', gap: 6, marginBottom: 8 } },
            React.createElement('input', { value: ql.icon || '', onChange: function(e) { var f = qlForm.slice(); f[i] = Object.assign({}, f[i], { icon: e.target.value }); setQlForm(f) }, placeholder: '🔗', style: { width: 40, background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 6, padding: '7px 4px', color: '#ddd', fontSize: 18, fontFamily: 'inherit', outline: 'none', textAlign: 'center' } }),
            React.createElement('input', { value: ql.name, onChange: function(e) { var f = qlForm.slice(); f[i] = Object.assign({}, f[i], { name: e.target.value }); setQlForm(f) }, placeholder: 'Nom', style: { flex: 1, background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 6, padding: '7px 10px', color: '#ddd', fontSize: 12, fontFamily: 'inherit', outline: 'none' } }),
            React.createElement('input', { value: ql.url, onChange: function(e) { var f = qlForm.slice(); f[i] = Object.assign({}, f[i], { url: e.target.value }); setQlForm(f) }, placeholder: 'https://...', style: { flex: 2, background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 6, padding: '7px 10px', color: '#ddd', fontSize: 12, fontFamily: 'inherit', outline: 'none' } }),
            React.createElement('button', { onClick: function() { setQlForm(qlForm.filter(function(_, j) { return j !== i })) }, style: { background: '#CC0000', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, cursor: 'pointer', padding: '0 10px', fontWeight: 700 } }, 'x')
          )
        }),
        React.createElement('button', { onClick: function() { setQlForm(qlForm.concat([{ name: '', url: '', icon: '🔗' }])) }, style: { width: '100%', padding: 8, background: 'transparent', border: '1px dashed #333', borderRadius: 8, color: '#555', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 14 } }, '+ Ajouter'),
        React.createElement('div', { style: { display: 'flex', gap: 10 } },
          React.createElement('button', { onClick: function() { setQlEdit(false) }, style: { flex: 1, padding: 10, background: 'transparent', border: '1px solid #252525', borderRadius: 8, color: '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Annuler'),
          React.createElement('button', { onClick: function() { saveQL(page.slug, qlForm); setQuickLinks(qlForm); setQlEdit(false) }, style: { flex: 2, padding: 10, background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Enregistrer')
        )
      )
    ) : null,

    // MODAL PIN IDÉES
    ideasPinModal ? React.createElement('div', {
      onClick: function(e) { if (e.target === e.currentTarget) setIdeasPinModal(false) },
      style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
    },
      React.createElement(PinGate, { correctPin: page.ideas_pin, onUnlock: function() { setIdeasUnlocked(true); setIdeasPinModal(false); setShowIdeas(true) }, icon: '💡', title: 'Boite à idées protégée', desc: 'Entrez le code pour accéder' })
    ) : null,

    // MODAL AJOUT LIEN
    addModal ? React.createElement('div', {
      onClick: function(e) { if (e.target === e.currentTarget) { setAddModal(false); setAddToFolder(null) } },
      style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }
    },
      React.createElement('div', { style: { background: '#111', border: '1px solid #252525', borderRadius: 16, padding: 24, width: '100%', maxWidth: 380 } },
        React.createElement('h2', { style: { fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 18 } }, addToFolder ? 'Ajouter dans le dossier' : 'Nouveau lien'),
        React.createElement('div', { style: { marginBottom: 10 } }, React.createElement('input', { value: form.name, onChange: function(e) { setForm(Object.assign({}, form, { name: e.target.value })) }, placeholder: 'Nom', style: inp, autoFocus: true })),
        React.createElement('div', { style: { marginBottom: 12 } }, React.createElement('input', { value: form.url, onChange: function(e) { setForm(Object.assign({}, form, { url: e.target.value })) }, placeholder: 'https://...', style: inp })),
        React.createElement('div', { style: { display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 } },
          EMOJIS_SMALL.slice(0, 16).map(function(e) { return React.createElement('button', { key: e, onClick: function() { setForm(Object.assign({}, form, { icon: e })) }, style: { width: 32, height: 32, fontSize: 16, background: form.icon === e ? '#CC000025' : '#161616', border: form.icon === e ? '1px solid #CC0000' : '1px solid transparent', borderRadius: 6, cursor: 'pointer' } }, e) })
        ),
        React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 } },
          COLORS_SMALL.map(function(c) { return React.createElement('div', { key: c, onClick: function() { setForm(Object.assign({}, form, { color: c })) }, style: { width: 26, height: 26, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '2px solid #fff' : '2px solid transparent' } }) })
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10 } },
          React.createElement('button', { onClick: function() { setAddModal(false); setAddToFolder(null) }, style: { flex: 1, padding: 11, background: 'transparent', border: '1px solid #252525', borderRadius: 8, color: '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Annuler'),
          React.createElement('button', { onClick: function() { handleAddTile(addToFolder) }, style: { flex: 2, padding: 11, background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Ajouter')
        )
      )
    ) : null,

    // MODAL CRÉER DOSSIER
    addFolderModal ? React.createElement('div', {
      onClick: function(e) { if (e.target === e.currentTarget) setAddFolderModal(false) },
      style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }
    },
      React.createElement('div', { style: { background: '#111', border: '1px solid #252525', borderRadius: 16, padding: 24, width: '100%', maxWidth: 360 } },
        React.createElement('h2', { style: { fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 18 } }, 'Nouveau dossier'),
        React.createElement('div', { style: { marginBottom: 10 } }, React.createElement('input', { value: folderForm.name, onChange: function(e) { setFolderForm(Object.assign({}, folderForm, { name: e.target.value })) }, placeholder: 'Nom du dossier', style: inp, autoFocus: true })),
        React.createElement('div', { style: { marginBottom: 12 } },
          React.createElement('label', { style: lbl }, 'PIN dossier (optionnel)'),
          React.createElement('input', { value: folderForm.pin, onChange: function(e) { setFolderForm(Object.assign({}, folderForm, { pin: e.target.value })) }, placeholder: 'Vide = pas de PIN', type: 'password', style: inp })
        ),
        React.createElement('div', { style: { display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 } },
          ['📁','📂','⭐','💼','🎯','🔧','🌱','🎬','🚀','💡'].map(function(e) { return React.createElement('button', { key: e, onClick: function() { setFolderForm(Object.assign({}, folderForm, { icon: e })) }, style: { width: 34, height: 34, fontSize: 18, background: folderForm.icon === e ? '#CC000025' : '#161616', border: folderForm.icon === e ? '1px solid #CC0000' : '1px solid transparent', borderRadius: 6, cursor: 'pointer' } }, e) })
        ),
        React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 } },
          COLORS_SMALL.map(function(c) { return React.createElement('div', { key: c, onClick: function() { setFolderForm(Object.assign({}, folderForm, { color: c })) }, style: { width: 26, height: 26, borderRadius: '50%', background: c, cursor: 'pointer', border: folderForm.color === c ? '2px solid #fff' : '2px solid transparent' } }) })
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10 } },
          React.createElement('button', { onClick: function() { setAddFolderModal(false) }, style: { flex: 1, padding: 11, background: 'transparent', border: '1px solid #252525', borderRadius: 8, color: '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Annuler'),
          React.createElement('button', { onClick: handleCreateFolder, style: { flex: 2, padding: 11, background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Créer')
        )
      )
    ) : null
  )
}
