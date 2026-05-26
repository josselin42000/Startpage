import React from 'react'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Tile from './Tile'
import ToolsPage from './ToolsPage'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(function(w) { return w[0] || '' }).join('').toUpperCase().slice(0, 2)
}

var EMOJIS_SMALL = ['🔗','🏠','⚡','📊','💼','🎙️','📷','🛒','🔧','🌱','🎬','📡','💡','🔌','🚗','🎯','💻','🗂️','📋','🔐','💰','📈','🎵','✅','🔍','⚙️','🏢','🚀','💎','🌐','🛠️']
var COLORS_SMALL = ['#CC0000','#1a6fc4','#1a8f5c','#9b3ccf','#d97316','#0891b2','#374151','#b45309']
var WEATHER_ICONS = {0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'🌨️',73:'🌨️',75:'❄️',80:'🌦️',81:'🌧️',82:'⛈️',95:'⛈️'}
var ST_ETIENNE = { lat: 45.4397, lon: 4.3872 }

function useWeather() {
  var dataS = useState(null); var data = dataS[0]; var setData = dataS[1]
  useEffect(function() {
    function fetchW(lat, lon) {
      fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,weathercode&timezone=auto')
        .then(function(r) { return r.json() })
        .then(function(d) { setData({ temp: Math.round(d.current.temperature_2m), code: d.current.weathercode }) })
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
      React.createElement('div', { style: { fontSize: 12, color: '#444', marginBottom: 20 } }, props.desc || 'Entrez le code d\'accès'),
      React.createElement('input', {
        type: 'password', value: pin,
        onChange: function(e) { setPin(e.target.value) },
        onKeyDown: function(e) { if (e.key === 'Enter') check() },
        placeholder: 'Code PIN', autoFocus: true,
        style: { width: '100%', background: '#0a0a0a', border: '1px solid ' + (err ? '#CC0000' : '#2a2a2a'), borderRadius: 8, padding: '11px 14px', color: '#e0e0e0', fontSize: 15, fontFamily: 'inherit', outline: 'none', textAlign: 'center', letterSpacing: '0.2em', marginBottom: 12 }
      }),
      err ? React.createElement('div', { style: { fontSize: 12, color: '#CC0000', marginBottom: 8 } }, 'Code incorrect') : null,
      React.createElement('button', { onClick: check, style: { width: '100%', padding: 12, background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Accéder')
    )
  )
}

export default function UserPage(props) {
  var slug = props.slug
  var pageS = useState(null); var page = pageS[0]; var setPage = pageS[1]
  var tilesS = useState([]); var tiles = tilesS[0]; var setTiles = tilesS[1]
  var userTilesS = useState([]); var userTiles = userTilesS[0]; var setUserTiles = userTilesS[1]
  var loadS = useState(true); var load = loadS[0]; var setLoad = loadS[1]
  var notFoundS = useState(false); var notFound = notFoundS[0]; var setNotFound = notFoundS[1]
  var pageUnlockedS = useState(false); var pageUnlocked = pageUnlockedS[0]; var setPageUnlocked = pageUnlockedS[1]
  var ideasUnlockedS = useState(false); var ideasUnlocked = ideasUnlockedS[0]; var setIdeasUnlocked = ideasUnlockedS[1]
  var addModalS = useState(false); var addModal = addModalS[0]; var setAddModal = addModalS[1]
  var showToolsPageS = useState(false); var showToolsPage = showToolsPageS[0]; var setShowToolsPage = showToolsPageS[1]
  var formS = useState({ name: '', url: '', icon: '🔗', color: '#CC0000' })
  var form = formS[0]; var setForm = formS[1]
  var clockFrS = useState(''); var clockFr = clockFrS[0]; var setClockFr = clockFrS[1]
  var clockCnS = useState(''); var clockCn = clockCnS[0]; var setClockCn = clockCnS[1]
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
      if (!p.page_pin) setPageUnlocked(true)
      if (!p.ideas_pin) setIdeasUnlocked(true)
      var promises = []
      if (p.show_tiles && p.imposed_tile_ids && p.imposed_tile_ids.length > 0) {
        promises.push(supabase.from('tiles').select('*').in('id', p.imposed_tile_ids).then(function(r) {
          if (!r.error && r.data) setTiles(r.data)
        }))
      }
      if (p.can_add_tiles) {
        promises.push(supabase.from('user_page_tiles').select('*').eq('page_id', p.id).order('position').then(function(r) {
          if (!r.error && r.data) setUserTiles(r.data)
        }))
      }
      Promise.all(promises).then(function() { setLoad(false) })
    })
  }, [slug])

  function handleAddTile() {
    if (!form.name.trim() || !page) return
    var url = form.url.trim()
    if (url && url.indexOf('http') !== 0) url = 'https://' + url
    supabase.from('user_page_tiles').insert([{
      page_id: page.id, name: form.name.trim(), url: url || '#',
      icon: form.icon, color: form.color, position: userTiles.length
    }]).select().then(function(res) {
      if (!res.error && res.data) {
        setUserTiles(userTiles.concat([res.data[0]]))
        setForm({ name: '', url: '', icon: '🔗', color: '#CC0000' })
        setAddModal(false)
      }
    })
  }

  function handleDeleteUserTile(id) {
    if (!confirm('Supprimer ?')) return
    supabase.from('user_page_tiles').delete().eq('id', id).then(function() {
      setUserTiles(userTiles.filter(function(t) { return t.id !== id }))
    })
  }

  var inp = { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#e0e0e0', fontSize: 13, fontFamily: 'inherit', outline: 'none' }

  if (load) return React.createElement('div', { style: { minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 13 } }, 'Chargement...')
  if (notFound || !page) return React.createElement('div', { style: { minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 } },
    React.createElement('div', { style: { fontSize: 40 } }, '404'),
    React.createElement('div', { style: { fontSize: 14, color: '#444' } }, 'Page introuvable'),
    React.createElement('a', { href: '/', style: { fontSize: 12, color: '#CC0000', textDecoration: 'none' } }, 'Retour')
  )
  if (page.page_pin && !pageUnlocked) return React.createElement(PinGate, {
    correctPin: page.page_pin, onUnlock: function() { setPageUnlocked(true) },
    icon: page.avatar || '🔐', title: 'Espace de ' + page.display_name, desc: 'Entrez votre code d\'accès'
  })
  if (showToolsPage) return React.createElement(ToolsPage, { onBack: function() { setShowToolsPage(false) } })

  var hour = new Date().getHours()
  var greet = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  var firstName = page.display_name.split(' ')[0]

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808' } },

    React.createElement('header', { style: { background: '#0a0a0a', borderBottom: '1px solid #1c1c1c', padding: '0 20px' } },

      React.createElement('div', { style: { display: 'flex', alignItems: 'center', padding: '12px 0', gap: 12 } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 } },
          React.createElement('div', { style: { width: 40, height: 40, borderRadius: '50%', background: (page.color || '#1a6fc4') + '22', border: '2px solid ' + (page.color || '#1a6fc4') + '66', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: page.avatar ? 20 : 13, fontWeight: 700, color: page.color || '#1a6fc4', flexShrink: 0 } },
            page.avatar || getInitials(page.display_name)
          ),
          React.createElement('div', null,
            React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: '#ddd' } }, page.display_name),
            React.createElement('div', { style: { fontSize: 11, color: '#555' } }, greet + ', ' + firstName + ' !')
          )
        ),
        React.createElement('div', { style: { flex: 1, display: 'flex', justifyContent: 'center' } },
          React.createElement('h1', { style: { fontSize: 20, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center' } },
            React.createElement('span', { style: { color: '#fff' } }, 'GROUPE\u00a0'),
            React.createElement('span', { style: { color: '#CC0000' } }, 'LINEAR')
          )
        ),
        React.createElement('div', { style: { flexShrink: 0, width: 120 } })
      ),

      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '8px 0 12px', flexWrap: 'wrap' } },
        weather ? React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, background: '#141414', border: '1px solid #222', borderRadius: 8, padding: '5px 12px' } },
          React.createElement('span', { style: { fontSize: 16 } }, WEATHER_ICONS[weather.code] || '🌡️'),
          React.createElement('span', { style: { fontSize: 14, fontWeight: 700, color: '#ddd' } }, weather.temp + 'C')
        ) : null,
        React.createElement('div', { style: { width: 1, height: 24, background: '#1c1c1c' } }),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
          React.createElement('span', { style: { fontSize: 22, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' } }, clockFr),
          React.createElement('span', { style: { fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'France')
        ),
        page.show_clock_cn ? React.createElement('div', { style: { width: 1, height: 24, background: '#1c1c1c' } }) : null,
        page.show_clock_cn ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
          React.createElement('span', { style: { fontSize: 22, fontWeight: 700, color: '#cc4400', fontVariantNumeric: 'tabular-nums' } }, clockCn),
          React.createElement('span', { style: { fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'Canton')
        ) : null
      )
    ),

    React.createElement('main', { style: { flex: 1, padding: 24 } },

      page.show_tiles && tiles.length > 0 ? React.createElement('div', { style: { marginBottom: 28 } },
        React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 } }, 'Liens'),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 } },
          tiles.map(function(t, i) { return React.createElement(Tile, { key: t.id, tile: t, editMode: false, index: i }) })
        )
      ) : null,

      page.can_add_tiles ? React.createElement('div', { style: { marginBottom: 28 } },
        React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 } }, 'Mes liens'),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 } },
          userTiles.map(function(t, i) {
            return React.createElement('div', { key: t.id, style: { position: 'relative' } },
              React.createElement('button', { onClick: function() { handleDeleteUserTile(t.id) }, style: { position: 'absolute', top: -6, right: -6, width: 20, height: 20, background: '#CC0000', border: '2px solid #080808', borderRadius: '50%', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 10 } }, 'x'),
              React.createElement(Tile, { tile: t, editMode: false, index: i })
            )
          }),
          React.createElement('div', {
            onClick: function() { setAddModal(true) },
            style: { background: '#0f0f0f', border: '1px dashed #2a2a2a', borderRadius: 12, padding: '16px 10px 12px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#444' },
            onMouseEnter: function(e) { e.currentTarget.style.borderColor = '#CC0000'; e.currentTarget.style.color = '#CC0000'; e.currentTarget.style.background = '#0b0000' },
            onMouseLeave: function(e) { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#444'; e.currentTarget.style.background = '#0f0f0f' }
          },
            React.createElement('div', { style: { width: 50, height: 50, borderRadius: 12, background: '#161616', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: 'inherit' } }, '+'),
            React.createElement('div', { style: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'inherit' } }, 'Ajouter')
          )
        )
      ) : null,

      page.show_ideas ? React.createElement('div', { style: { marginBottom: 28 } },
        React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 } }, '💡 Boite à idées'),
        page.ideas_pin && !ideasUnlocked
          ? React.createElement(PinGate, { mini: true, correctPin: page.ideas_pin, onUnlock: function() { setIdeasUnlocked(true) }, icon: '💡', title: 'Boite à idées protégée', desc: 'Entrez le code pour accéder' })
          : React.createElement('div', { style: { background: '#141414', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, color: '#555', fontSize: 13 } }, 'Boite à idées — bientôt disponible')
      ) : null,

      page.show_tools ? React.createElement('div', null,
        React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 } }, '🛠️ Outils'),
        React.createElement('div', {
          onClick: function() { setShowToolsPage(true) },
          style: { display: 'inline-flex', alignItems: 'center', gap: 10, background: '#1a1a1a', border: '1px solid #CC000033', borderRadius: 12, padding: '14px 20px', cursor: 'pointer', color: '#ddd', fontSize: 13, fontWeight: 600 },
          onMouseEnter: function(e) { e.currentTarget.style.background = '#200000'; e.currentTarget.style.borderColor = '#CC000066' },
          onMouseLeave: function(e) { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#CC000033' }
        },
          React.createElement('span', { style: { fontSize: 22 } }, '🛠️'),
          'Accéder aux outils'
        )
      ) : null
    ),

    addModal ? React.createElement('div', {
      onClick: function(e) { if (e.target === e.currentTarget) setAddModal(false) },
      style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }
    },
      React.createElement('div', { style: { background: '#111', border: '1px solid #252525', borderRadius: 16, padding: 24, width: '100%', maxWidth: 380 } },
        React.createElement('h2', { style: { fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 18 } }, 'Nouveau lien'),
        React.createElement('div', { style: { marginBottom: 10 } },
          React.createElement('input', { value: form.name, onChange: function(e) { setForm(Object.assign({}, form, { name: e.target.value })) }, placeholder: 'Nom', style: inp, autoFocus: true })
        ),
        React.createElement('div', { style: { marginBottom: 12 } },
          React.createElement('input', { value: form.url, onChange: function(e) { setForm(Object.assign({}, form, { url: e.target.value })) }, placeholder: 'https://...', style: inp })
        ),
        React.createElement('div', { style: { display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 } },
          EMOJIS_SMALL.slice(0, 16).map(function(e) {
            return React.createElement('button', { key: e, onClick: function() { setForm(Object.assign({}, form, { icon: e })) }, style: { width: 32, height: 32, fontSize: 16, background: form.icon === e ? '#CC000025' : '#161616', border: form.icon === e ? '1px solid #CC0000' : '1px solid transparent', borderRadius: 6, cursor: 'pointer' } }, e)
          })
        ),
        React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 } },
          COLORS_SMALL.map(function(c) {
            return React.createElement('div', { key: c, onClick: function() { setForm(Object.assign({}, form, { color: c })) }, style: { width: 26, height: 26, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '2px solid #fff' : '2px solid transparent' } })
          })
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10 } },
          React.createElement('button', { onClick: function() { setAddModal(false) }, style: { flex: 1, padding: 11, background: 'transparent', border: '1px solid #252525', borderRadius: 8, color: '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Annuler'),
          React.createElement('button', { onClick: handleAddTile, style: { flex: 2, padding: 11, background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Ajouter')
        )
      )
    ) : null
  )
}
