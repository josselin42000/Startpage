import React from 'react'
import { useState } from 'react'

var DEFAULT_TOOLS = [
  { id: '1', name: 'Waze', icon: '🗺️', color: '#33ccff', desc: 'Itineraire temps reel', url: 'https://www.waze.com/fr/live-map/', mode: 'tab' },
  { id: '2', name: 'Google Flights', icon: '✈️', color: '#4285f4', desc: 'Recherche de vols', url: 'https://www.google.com/travel/flights', mode: 'tab' },
  { id: '3', name: 'Google Maps', icon: '📍', color: '#34a853', desc: 'Cartes et itineraires', url: 'https://maps.google.com', mode: 'tab' },
  { id: '4', name: 'Traducteur', icon: '🌐', color: '#9b3ccf', desc: 'Google Translate', url: 'https://translate.google.com', mode: 'tab' },
  { id: '5', name: 'Meteo France', icon: '🌦️', color: '#0891b2', desc: 'Previsions completes', url: 'https://www.meteofrance.com', mode: 'tab' },
  { id: '6', name: 'Agenda', icon: '📅', color: '#CC0000', desc: 'Google Calendar', url: 'https://calendar.google.com', mode: 'tab' },
]

var EMOJIS = ['🗺️','✈️','📍','🌐','🌦️','📅','🔧','💡','📊','🎯','🔗','🏠','⚡','💼','🎙️','📷','🛒','🌱','🎬','📡','🔌','🚗','💻','🗂️','📋','🔐','💰','📈','🎵','✅','🔍','⚙️','🏢','🎤','🚀','💎','🌍','🛠️','🧩','📻']
var COLORS = ['#CC0000','#1a6fc4','#1a8f5c','#9b3ccf','#d97316','#0891b2','#be185d','#4f46e5','#374151','#b45309','#33ccff','#34a853','#4285f4']

var LS_KEY = 'startpage_tools_v1'

function loadTools() {
  try { var raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : DEFAULT_TOOLS } catch(e) { return DEFAULT_TOOLS }
}
function saveTools(tools) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(tools)) } catch(e) {}
}

var EMPTY_FORM = { name: '', url: '', icon: '🔗', color: '#1a6fc4', desc: '', mode: 'tab' }

export default function ToolsPage(props) {
  var onBack = props.onBack
  var toolsState = useState(loadTools()); var tools = toolsState[0]; var setTools = toolsState[1]
  var activeState = useState(null); var active = activeState[0]; var setActive = activeState[1]
  var editModeState = useState(false); var editMode = editModeState[0]; var setEditMode = editModeState[1]
  var modalState = useState(false); var modalOpen = modalState[0]; var setModalOpen = modalState[1]
  var editingState = useState(null); var editingTool = editingState[0]; var setEditingTool = editingState[1]
  var formState = useState(EMPTY_FORM); var form = formState[0]; var setForm = formState[1]

  function updateField(key, val) { setForm(function(f) { return Object.assign({}, f, { [key]: val }) }) }

  function openAdd() { setEditingTool(null); setForm(EMPTY_FORM); setModalOpen(true) }
  function openEdit(tool) { setEditingTool(tool); setForm({ name: tool.name, url: tool.url, icon: tool.icon, color: tool.color, desc: tool.desc || '', mode: tool.mode || 'tab' }); setModalOpen(true) }

  function handleSave() {
    if (!form.name.trim() || !form.url.trim()) return
    var url = form.url.trim()
    if (url !== '#' && url.indexOf('http') !== 0) url = 'https://' + url
    var newTool = Object.assign({}, form, { url: url, name: form.name.trim(), desc: form.desc.trim() })
    var updated = editingTool
      ? tools.map(function(t) { return t.id === editingTool.id ? Object.assign({}, t, newTool) : t })
      : tools.concat([Object.assign({}, newTool, { id: String(Date.now()) })])
    saveTools(updated); setTools(updated); setModalOpen(false)
  }

  function handleDelete(id) {
    if (!confirm('Supprimer cet outil ?')) return
    var updated = tools.filter(function(t) { return t.id !== id })
    saveTools(updated); setTools(updated)
  }

  function openTool(tool) {
    if (editMode) { openEdit(tool); return }
    if (tool.mode === 'iframe') { setActive(tool) } else { window.open(tool.url, '_blank') }
  }

  var inputStyle = { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#e0e0e0', fontSize: 13, fontFamily: 'inherit', outline: 'none' }
  var labelStyle = { display: 'block', fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }

  if (active) {
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#080808' } },
      React.createElement('div', { style: { padding: '10px 20px', background: '#0d0d0d', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 } },
        React.createElement('button', { onClick: function() { setActive(null) }, style: { background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 6, color: '#aaa', fontSize: 12, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' } }, '<- Outils'),
        React.createElement('span', { style: { fontSize: 18 } }, active.icon),
        React.createElement('span', { style: { fontSize: 13, color: '#ccc', fontWeight: 600 } }, active.name),
        React.createElement('a', { href: active.url, target: '_blank', rel: 'noopener noreferrer', style: { marginLeft: 'auto', fontSize: 11, color: '#555', textDecoration: 'none', border: '1px solid #222', borderRadius: 5, padding: '4px 10px' } }, 'Ouvrir dans onglet')
      ),
      React.createElement('iframe', { src: active.url, style: { flex: 1, border: 'none', width: '100%' }, allow: 'geolocation' })
    )
  }

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808' } },
    React.createElement('header', { style: { background: '#0a0a0a', borderBottom: '1px solid #1c1c1c', padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 12 } },
      React.createElement('button', { onClick: onBack, style: { background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 8, color: '#aaa', fontSize: 13, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' } }, '<- Retour'),
      React.createElement('h1', { style: { fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' } }, 'OUTILS'),
      React.createElement('div', { style: { marginLeft: 'auto', display: 'flex', gap: 8 } },
        React.createElement('button', { onClick: openAdd, style: { background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 700, padding: '6px 16px', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.06em' } }, '+ Ajouter'),
        React.createElement('button', { onClick: function() { setEditMode(function(v) { return !v }) }, style: { background: editMode ? '#1a0000' : 'transparent', border: editMode ? '1px solid #CC0000' : '1px solid #2a2a2a', borderRadius: 8, color: editMode ? '#CC0000' : '#888', fontSize: 11, fontWeight: 700, padding: '6px 16px', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.06em' } }, editMode ? 'Terminer' : 'Editer')
      )
    ),
    React.createElement('main', { style: { flex: 1, padding: 28 } },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 } },
        tools.map(function(tool) {
          return React.createElement('div', {
            key: tool.id, onClick: function() { openTool(tool) },
            style: { background: '#1a1a1a', border: editMode ? '1px solid #CC000044' : '1px solid #282828', borderRadius: 14, padding: '22px 14px 16px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative' },
            onMouseEnter: function(e) { e.currentTarget.style.background = '#222' },
            onMouseLeave: function(e) { e.currentTarget.style.background = '#1a1a1a' },
          },
            editMode ? React.createElement('button', { onClick: function(e) { e.stopPropagation(); handleDelete(tool.id) }, style: { position: 'absolute', top: -8, left: -8, width: 22, height: 22, background: '#CC0000', border: '2px solid #080808', borderRadius: '50%', color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 10 } }, 'x') : null,
            React.createElement('div', { style: { width: 58, height: 58, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: (tool.color || '#444') + '18', border: '1px solid ' + (tool.color || '#444') + '44', fontSize: 28 } }, tool.icon),
            React.createElement('div', { style: { fontSize: 12, fontWeight: 600, color: '#ddd', lineHeight: 1.3 } }, tool.name),
            tool.desc ? React.createElement('div', { style: { fontSize: 10, color: '#666', lineHeight: 1.3 } }, tool.desc) : null,
            React.createElement('div', { style: { fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', border: '1px solid #222', borderRadius: 20 } }, tool.mode === 'iframe' ? 'Dans la page' : 'Nouvel onglet')
          )
        })
      )
    ),
    modalOpen ? React.createElement('div', { onClick: function(e) { if (e.target === e.currentTarget) setModalOpen(false) }, style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      React.createElement('div', { style: { background: '#111', border: '1px solid #252525', borderRadius: 16, padding: 28, width: 400, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' } },
        React.createElement('h2', { style: { fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 22 } }, editingTool ? 'Modifier' : 'Nouvel outil'),
        React.createElement('div', { style: { marginBottom: 14 } }, React.createElement('label', { style: labelStyle }, 'Nom'), React.createElement('input', { value: form.name, onChange: function(e) { updateField('name', e.target.value) }, placeholder: 'Ex : Waze', style: inputStyle, autoFocus: true })),
        React.createElement('div', { style: { marginBottom: 14 } }, React.createElement('label', { style: labelStyle }, 'URL'), React.createElement('input', { value: form.url, onChange: function(e) { updateField('url', e.target.value) }, placeholder: 'https://...', style: inputStyle })),
        React.createElement('div', { style: { marginBottom: 14 } }, React.createElement('label', { style: labelStyle }, 'Description'), React.createElement('input', { value: form.desc, onChange: function(e) { updateField('desc', e.target.value) }, placeholder: 'Optionnel', style: inputStyle })),
        React.createElement('div', { style: { marginBottom: 14 } },
          React.createElement('label', { style: labelStyle }, 'Mode d\'ouverture'),
          React.createElement('div', { style: { display: 'flex', gap: 8 } },
            React.createElement('button', { onClick: function() { updateField('mode', 'tab') }, style: { flex: 1, padding: 10, borderRadius: 8, border: form.mode === 'tab' ? '1px solid #CC0000' : '1px solid #2a2a2a', background: form.mode === 'tab' ? '#1a0000' : '#0a0a0a', color: form.mode === 'tab' ? '#CC0000' : '#666', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, 'Nouvel onglet'),
            React.createElement('button', { onClick: function() { updateField('mode', 'iframe') }, style: { flex: 1, padding: 10, borderRadius: 8, border: form.mode === 'iframe' ? '1px solid #1a6fc4' : '1px solid #2a2a2a', background: form.mode === 'iframe' ? '#001a2a' : '#0a0a0a', color: form.mode === 'iframe' ? '#1a6fc4' : '#666', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, 'Dans la page')
          ),
          form.mode === 'iframe' ? React.createElement('p', { style: { fontSize: 10, color: '#444', marginTop: 6 } }, 'Attention : certains sites bloquent les iframes. Tester apres enregistrement.') : null
        ),
        React.createElement('div', { style: { marginBottom: 14 } },
          React.createElement('label', { style: labelStyle }, 'Icone'),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 4, maxHeight: 90, overflowY: 'auto' } },
            EMOJIS.map(function(e) { return React.createElement('button', { key: e, onClick: function() { updateField('icon', e) }, style: { width: 32, height: 32, background: form.icon === e ? '#CC000025' : '#161616', border: form.icon === e ? '1px solid #CC0000' : '1px solid transparent', borderRadius: 6, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, e) })
          )
        ),
        React.createElement('div', { style: { marginBottom: 22 } },
          React.createElement('label', { style: labelStyle }, 'Couleur'),
          React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
            COLORS.map(function(c) { return React.createElement('div', { key: c, onClick: function() { updateField('color', c) }, style: { width: 26, height: 26, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '2px solid #fff' : '2px solid transparent', transform: form.color === c ? 'scale(1.15)' : 'none' } }) })
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10 } },
          React.createElement('button', { onClick: function() { setModalOpen(false) }, style: { flex: 1, padding: 11, background: 'transparent', border: '1px solid #252525', borderRadius: 8, color: '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Annuler'),
          React.createElement('button', { onClick: handleSave, style: { flex: 2, padding: 11, background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Enregistrer')
        )
      )
    ) : null
  )
}
