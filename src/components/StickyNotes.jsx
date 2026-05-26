import React from 'react'
import { useState, useEffect } from 'react'

var LS_KEY = 'startpage_stickies_v1'

var COLORS = [
  { bg: '#1a1500', border: '#b4530966', text: '#d4a017', label: 'Jaune' },
  { bg: '#001a0e', border: '#1a8f5c66', text: '#1a8f5c', label: 'Vert' },
  { bg: '#001a2a', border: '#1a6fc466', text: '#1a6fc4', label: 'Bleu' },
  { bg: '#1a0000', border: '#CC000066', text: '#CC0000', label: 'Rouge' },
  { bg: '#0f0a1a', border: '#9b3ccf66', text: '#9b3ccf', label: 'Violet' },
  { bg: '#161616', border: '#44444466', text: '#888', label: 'Gris' },
]

function loadNotes() {
  try { var r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : [] } catch(e) { return [] }
}
function saveNotes(n) { try { localStorage.setItem(LS_KEY, JSON.stringify(n)) } catch(e) {} }
function newNote(color) {
  return { id: String(Date.now() + Math.random()), text: '', color: color || 0, created_at: new Date().toISOString(), pinned: false }
}

function SharePopup(props) {
  var note = props.note
  var onClose = props.onClose

  function shareText() {
    var text = note.text || '(note vide)'
    if (navigator.share) {
      navigator.share({ title: 'Note rapide', text: text }).then(onClose).catch(function() {})
    } else {
      navigator.clipboard.writeText(text).then(function() {
        onClose('copied')
      }).catch(function() {
        onClose()
      })
    }
  }

  function copyText() {
    navigator.clipboard.writeText(note.text || '').then(function() { onClose('copied') }).catch(function() { onClose() })
  }

  function shareWhatsapp() {
    window.open('https://wa.me/?text=' + encodeURIComponent(note.text || ''), '_blank')
    onClose()
  }

  function shareEmail() {
    window.open('mailto:?subject=Note&body=' + encodeURIComponent(note.text || ''), '_blank')
    onClose()
  }

  var c = COLORS[note.color] || COLORS[0]

  return React.createElement('div', {
    onClick: function(e) { if (e.target === e.currentTarget) onClose() },
    style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
  },
    React.createElement('div', { style: { background: '#111', border: '1px solid #252525', borderRadius: 16, padding: 24, width: '100%', maxWidth: 340 } },
      React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 } }, '📤 Partager la note'),
      note.text ? React.createElement('div', { style: { fontSize: 12, color: c.text, background: c.bg, border: '1px solid ' + c.border, borderRadius: 8, padding: '10px 12px', marginBottom: 18, lineHeight: 1.5, maxHeight: 80, overflow: 'hidden' } }, note.text.slice(0, 120) + (note.text.length > 120 ? '...' : '')) : React.createElement('div', { style: { fontSize: 12, color: '#333', marginBottom: 18 } }, 'Note vide'),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        React.createElement('button', { onClick: copyText, style: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, cursor: 'pointer', color: '#ddd', fontSize: 13, fontFamily: 'inherit', textAlign: 'left' } },
          React.createElement('span', { style: { fontSize: 20 } }, '📋'),
          React.createElement('div', null,
            React.createElement('div', { style: { fontWeight: 700 } }, 'Copier le texte'),
            React.createElement('div', { style: { fontSize: 11, color: '#555', marginTop: 2 } }, 'Dans le presse-papier')
          )
        ),
        React.createElement('button', { onClick: shareWhatsapp, style: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#001a0e', border: '1px solid #1a8f5c44', borderRadius: 10, cursor: 'pointer', color: '#ddd', fontSize: 13, fontFamily: 'inherit', textAlign: 'left' } },
          React.createElement('span', { style: { fontSize: 20 } }, '💬'),
          React.createElement('div', null,
            React.createElement('div', { style: { fontWeight: 700 } }, 'WhatsApp'),
            React.createElement('div', { style: { fontSize: 11, color: '#555', marginTop: 2 } }, 'Ouvrir dans WhatsApp')
          )
        ),
        React.createElement('button', { onClick: shareEmail, style: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#001a2a', border: '1px solid #1a6fc444', borderRadius: 10, cursor: 'pointer', color: '#ddd', fontSize: 13, fontFamily: 'inherit', textAlign: 'left' } },
          React.createElement('span', { style: { fontSize: 20 } }, '✉️'),
          React.createElement('div', null,
            React.createElement('div', { style: { fontWeight: 700 } }, 'Email'),
            React.createElement('div', { style: { fontSize: 11, color: '#555', marginTop: 2 } }, 'Ouvrir dans la messagerie')
          )
        ),
        navigator.share ? React.createElement('button', { onClick: shareText, style: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#0f0a1a', border: '1px solid #9b3ccf44', borderRadius: 10, cursor: 'pointer', color: '#ddd', fontSize: 13, fontFamily: 'inherit', textAlign: 'left' } },
          React.createElement('span', { style: { fontSize: 20 } }, '📤'),
          React.createElement('div', null,
            React.createElement('div', { style: { fontWeight: 700 } }, 'Autres apps'),
            React.createElement('div', { style: { fontSize: 11, color: '#555', marginTop: 2 } }, 'Partager via le système')
          )
        ) : null
      ),
      React.createElement('button', { onClick: onClose, style: { width: '100%', marginTop: 16, padding: 10, background: 'transparent', border: '1px solid #252525', borderRadius: 8, color: '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Annuler')
    )
  )
}

function StickyCard(props) {
  var note = props.note
  var c = COLORS[note.color] || COLORS[0]
  var editingS = useState(false); var editing = editingS[0]; var setEditing = editingS[1]
  var textS = useState(note.text); var text = textS[0]; var setText = textS[1]
  var copiedS = useState(false); var copied = copiedS[0]; var setCopied = copiedS[1]
  var shareOpenS = useState(false); var shareOpen = shareOpenS[0]; var setShareOpen = shareOpenS[1]

  function save() { setEditing(false); props.onChange(note.id, { text: text }) }

  function handleShare(result) {
    setShareOpen(false)
    if (result === 'copied') {
      setCopied(true)
      setTimeout(function() { setCopied(false) }, 2000)
    }
  }

  return React.createElement('div', {
    style: { background: c.bg, border: '1px solid ' + c.border, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 120, position: 'relative' }
  },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 5 } },
      COLORS.map(function(col, i) {
        return React.createElement('div', {
          key: i, onClick: function() { props.onChange(note.id, { color: i }) },
          style: { width: 13, height: 13, borderRadius: '50%', background: col.text, cursor: 'pointer', opacity: note.color === i ? 1 : 0.25, transform: note.color === i ? 'scale(1.25)' : 'none', transition: 'all .15s' }
        })
      }),
      React.createElement('div', { style: { marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center' } },
        // BOUTON PARTAGE RAPIDE
        React.createElement('button', {
          onClick: function(e) { e.stopPropagation(); setShareOpen(true) },
          title: 'Partager',
          style: { background: copied ? '#1a8f5c22' : 'transparent', border: copied ? '1px solid #1a8f5c66' : 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', padding: '2px 6px', color: copied ? '#1a8f5c' : '#444', transition: 'all .2s', fontFamily: 'inherit', fontWeight: 700 },
          onMouseEnter: function(e) { if (!copied) e.currentTarget.style.color = c.text },
          onMouseLeave: function(e) { if (!copied) e.currentTarget.style.color = '#444' }
        }, copied ? '✓ Copié' : '📤'),
        React.createElement('button', {
          onClick: function() { props.onChange(note.id, { pinned: !note.pinned }) },
          style: { background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', opacity: note.pinned ? 1 : 0.25, padding: 0 }
        }, '📌'),
        React.createElement('button', {
          onClick: function() { props.onDelete(note.id) },
          style: { background: 'none', border: 'none', color: '#333', fontSize: 16, cursor: 'pointer', padding: 0, lineHeight: 1 },
          onMouseEnter: function(e) { e.currentTarget.style.color = '#CC0000' },
          onMouseLeave: function(e) { e.currentTarget.style.color = '#333' }
        }, '×')
      )
    ),
    editing
      ? React.createElement('textarea', { value: text, onChange: function(e) { setText(e.target.value) }, onBlur: save, autoFocus: true, placeholder: 'Note rapide...', style: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: c.text, fontSize: 13, lineHeight: 1.6, fontFamily: 'inherit', resize: 'none', minHeight: 80 } })
      : React.createElement('div', { onClick: function() { setEditing(true) }, style: { flex: 1, fontSize: 13, color: text ? c.text : '#333', lineHeight: 1.6, cursor: 'text', whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: 80 } }, text || 'Cliquer pour écrire...'),
    shareOpen ? React.createElement(SharePopup, { note: Object.assign({}, note, { text: text }), onClose: handleShare }) : null
  )
}

export default function StickyNotes(props) {
  var onBack = props.onBack
  var notesS = useState([]); var notes = notesS[0]; var setNotes = notesS[1]
  var filterS = useState(''); var filter = filterS[0]; var setFilter = filterS[1]

  useEffect(function() {
    var loaded = loadNotes()
    loaded.sort(function(a, b) {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.created_at) - new Date(a.created_at)
    })
    setNotes(loaded)
  }, [])

  function addNote(colorIdx) {
    var n = newNote(colorIdx || 0)
    var updated = [n].concat(notes)
    saveNotes(updated); setNotes(updated)
  }

  function onChange(id, patch) {
    var updated = notes.map(function(n) { return n.id === id ? Object.assign({}, n, patch) : n })
    if (patch.pinned !== undefined) {
      updated.sort(function(a, b) {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return new Date(b.created_at) - new Date(a.created_at)
      })
    }
    saveNotes(updated); setNotes(updated)
  }

  function onDelete(id) {
    var updated = notes.filter(function(n) { return n.id !== id })
    saveNotes(updated); setNotes(updated)
  }

  var shown = notes.filter(function(n) {
    return !filter || n.text.toLowerCase().indexOf(filter.toLowerCase()) !== -1
  })
  var pinned = shown.filter(function(n) { return n.pinned })
  var unpinned = shown.filter(function(n) { return !n.pinned })

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808' } },

    React.createElement('header', { style: { background: '#0a0a0a', borderBottom: '1px solid #1c1c1c', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
      React.createElement('button', { onClick: onBack, style: { background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 8, color: '#aaa', fontSize: 13, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' } }, '<- Retour'),
      React.createElement('h1', { style: { fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' } }, '🗒️ Notes rapides'),
      React.createElement('input', { value: filter, onChange: function(e) { setFilter(e.target.value) }, placeholder: 'Rechercher...', style: { marginLeft: 'auto', background: '#161616', border: '1px solid #2a2a2a', borderRadius: 7, padding: '6px 12px', color: '#ddd', fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 180 } })
    ),

    React.createElement('div', { style: { background: '#0d0d0d', borderBottom: '1px solid #181818', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
      React.createElement('span', { style: { fontSize: 10, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' } }, 'Ajouter'),
      COLORS.map(function(c, i) {
        return React.createElement('button', {
          key: i, onClick: function() { addNote(i) },
          style: { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: c.bg, border: '1px solid ' + c.border, borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit' }
        },
          React.createElement('div', { style: { width: 10, height: 10, borderRadius: '50%', background: c.text } }),
          React.createElement('span', { style: { fontSize: 11, fontWeight: 700, color: c.text } }, c.label)
        )
      }),
      notes.length > 0 ? React.createElement('span', { style: { marginLeft: 'auto', fontSize: 11, color: '#333' } }, notes.length + ' note' + (notes.length > 1 ? 's' : '')) : null
    ),

    React.createElement('main', { style: { flex: 1, padding: 24 } },
      notes.length === 0
        ? React.createElement('div', { style: { textAlign: 'center', paddingTop: 80, color: '#333', fontSize: 13 } },
            React.createElement('div', { style: { fontSize: 40, marginBottom: 16 } }, '🗒️'),
            'Aucune note — choisissez une couleur pour commencer'
          )
        : React.createElement('div', null,
            pinned.length > 0 ? React.createElement('div', { style: { marginBottom: 28 } },
              React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 } }, '📌 Épinglées (' + pinned.length + ')'),
              React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 } },
                pinned.map(function(n) { return React.createElement(StickyCard, { key: n.id, note: n, onChange: onChange, onDelete: onDelete }) })
              )
            ) : null,
            unpinned.length > 0 ? React.createElement('div', null,
              pinned.length > 0 ? React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 } }, 'Autres (' + unpinned.length + ')') : null,
              React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 } },
                unpinned.map(function(n) { return React.createElement(StickyCard, { key: n.id, note: n, onChange: onChange, onDelete: onDelete }) })
              )
            ) : null
          )
    )
  )
}
