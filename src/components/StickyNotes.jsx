import React from 'react'
import { useState, useEffect, useRef } from 'react'

var LS_KEY = 'startpage_stickies_v1'

var COLORS = [
  { bg: '#1a1500', border: '#b4530966', text: '#d4a017', dot: '#d4a017', label: 'Jaune' },
  { bg: '#001a0e', border: '#1a8f5c66', text: '#1a8f5c', dot: '#1a8f5c', label: 'Vert' },
  { bg: '#001a2a', border: '#1a6fc466', text: '#1a6fc4', dot: '#1a6fc4', label: 'Bleu' },
  { bg: '#1a0000', border: '#CC000066', text: '#CC0000', dot: '#CC0000', label: 'Rouge' },
  { bg: '#0f0a1a', border: '#9b3ccf66', text: '#9b3ccf', dot: '#9b3ccf', label: 'Violet' },
  { bg: '#161616', border: '#55555566', text: '#999', dot: '#555', label: 'Gris' },
]

function loadNotes() {
  try { var r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : [] } catch(e) { return [] }
}
function saveNotes(n) { try { localStorage.setItem(LS_KEY, JSON.stringify(n)) } catch(e) {} }
function makeNote(color) {
  return { id: String(Date.now() + Math.random()), text: '', color: color || 0, label: '', created_at: new Date().toISOString(), pinned: false }
}

function SharePopup(props) {
  var note = props.note
  var onClose = props.onClose
  var c = COLORS[note.color] || COLORS[0]

  function copyText() { navigator.clipboard.writeText(note.text || '').then(function() { onClose('copied') }).catch(function() { onClose() }) }
  function shareWhatsapp() { window.open('https://wa.me/?text=' + encodeURIComponent(note.text || ''), '_blank'); onClose() }
  function shareEmail() { window.open('mailto:?subject=Note&body=' + encodeURIComponent(note.text || ''), '_blank'); onClose() }
  function shareNative() {
    if (navigator.share) navigator.share({ title: 'Note', text: note.text || '' }).then(function() { onClose() }).catch(function() {})
  }

  return React.createElement('div', {
    onClick: function(e) { if (e.target === e.currentTarget) onClose() },
    style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
  },
    React.createElement('div', { style: { background: '#111', border: '1px solid #252525', borderRadius: 16, padding: 22, width: '100%', maxWidth: 320 } },
      React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 } }, '📤 Partager'),
      note.text ? React.createElement('div', { style: { fontSize: 12, color: c.text, background: c.bg, border: '1px solid ' + c.border, borderRadius: 8, padding: '8px 12px', marginBottom: 16, lineHeight: 1.5, maxHeight: 70, overflow: 'hidden' } }, note.text.slice(0, 100) + (note.text.length > 100 ? '...' : '')) : null,
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        React.createElement('button', { onClick: copyText, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, cursor: 'pointer', color: '#ddd', fontSize: 13, fontFamily: 'inherit', textAlign: 'left' } },
          React.createElement('span', { style: { fontSize: 18 } }, '📋'), 'Copier le texte'
        ),
        React.createElement('button', { onClick: shareWhatsapp, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#001a0e', border: '1px solid #1a8f5c44', borderRadius: 10, cursor: 'pointer', color: '#ddd', fontSize: 13, fontFamily: 'inherit', textAlign: 'left' } },
          React.createElement('span', { style: { fontSize: 18 } }, '💬'), 'WhatsApp'
        ),
        React.createElement('button', { onClick: shareEmail, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#001a2a', border: '1px solid #1a6fc444', borderRadius: 10, cursor: 'pointer', color: '#ddd', fontSize: 13, fontFamily: 'inherit', textAlign: 'left' } },
          React.createElement('span', { style: { fontSize: 18 } }, '✉️'), 'Email'
        ),
        navigator.share ? React.createElement('button', { onClick: shareNative, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#0f0a1a', border: '1px solid #9b3ccf44', borderRadius: 10, cursor: 'pointer', color: '#ddd', fontSize: 13, fontFamily: 'inherit', textAlign: 'left' } },
          React.createElement('span', { style: { fontSize: 18 } }, '📤'), 'Autres apps'
        ) : null
      ),
      React.createElement('button', { onClick: function() { onClose() }, style: { width: '100%', marginTop: 14, padding: 9, background: 'transparent', border: '1px solid #252525', borderRadius: 8, color: '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Annuler')
    )
  )
}

function NotePopup(props) {
  var note = props.note
  var allNotes = props.allNotes
  var onSave = props.onSave
  var onClose = props.onClose
  var onDelete = props.onDelete
  var onSelectNote = props.onSelectNote

  var textS = useState(note ? note.text : ''); var text = textS[0]; var setText = textS[1]
  var colorS = useState(note ? note.color : 0); var color = colorS[0]; var setColor = colorS[1]
  var labelS = useState(note ? (note.label || '') : ''); var label = labelS[0]; var setLabel = labelS[1]
  var pinnedS = useState(note ? !!note.pinned : false); var pinned = pinnedS[0]; var setPinned = pinnedS[1]
  var shareOpenS = useState(false); var shareOpen = shareOpenS[0]; var setShareOpen = shareOpenS[1]
  var copiedS = useState(false); var copied = copiedS[0]; var setCopied = copiedS[1]
  var dropdownS = useState(false); var dropdown = dropdownS[0]; var setDropdown = dropdownS[1]
  var labelEditS = useState(false); var labelEdit = labelEditS[0]; var setLabelEdit = labelEditS[1]
  var textareaRef = useRef(null)

  useEffect(function() { if (textareaRef.current) textareaRef.current.focus() }, [])

  var c = COLORS[color] || COLORS[0]

  function handleSave() {
    if (!text.trim() && !note) { onClose(); return }
    onSave({ text: text, color: color, label: label, pinned: pinned })
  }

  function handleShareResult(result) {
    setShareOpen(false)
    if (result === 'copied') { setCopied(true); setTimeout(function() { setCopied(false) }, 2000) }
  }

  var currentNoteObj = { text: text, color: color, label: label, pinned: pinned }

  return React.createElement('div', {
    onClick: function(e) { if (e.target === e.currentTarget) { handleSave(); onClose() } },
    style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
  },
    React.createElement('div', { style: { background: c.bg, border: '2px solid ' + c.border, borderRadius: 16, padding: 20, width: '100%', maxWidth: 400 } },

      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 } },
        COLORS.map(function(col, i) {
          return React.createElement('button', {
            key: i, onClick: function() { setColor(i) }, title: col.label,
            style: { width: 18, height: 18, borderRadius: '50%', background: col.dot, border: color === i ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', transform: color === i ? 'scale(1.2)' : 'none', transition: 'all .15s', flexShrink: 0 }
          })
        }),
        React.createElement('div', { style: { flex: 1 } }),
        React.createElement('button', { onClick: function() { setPinned(!pinned) }, title: pinned ? 'Désépingler' : 'Épingler', style: { background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', opacity: pinned ? 1 : 0.3, padding: '0 4px' } }, '📌'),
        text.trim() ? React.createElement('button', {
          onClick: function() { setShareOpen(true) },
          style: { background: copied ? c.bg : 'transparent', border: copied ? '1px solid ' + c.border : 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', padding: '2px 8px', color: copied ? c.text : '#666', fontFamily: 'inherit', fontWeight: 700 }
        }, copied ? '✓' : '📤') : null,
        note ? React.createElement('button', { onClick: function() { onDelete(note.id); onClose() }, style: { background: 'none', border: 'none', color: '#444', fontSize: 18, cursor: 'pointer', padding: '0 4px' }, onMouseEnter: function(e) { e.currentTarget.style.color = '#CC0000' }, onMouseLeave: function(e) { e.currentTarget.style.color = '#444' } }, '×') : null
      ),

      React.createElement('div', { style: { marginBottom: 10 } },
        labelEdit
          ? React.createElement('input', { value: label, onChange: function(e) { setLabel(e.target.value) }, onBlur: function() { setLabelEdit(false) }, onKeyDown: function(e) { if (e.key === 'Enter') setLabelEdit(false) }, placeholder: 'Label (optionnel)...', autoFocus: true, style: { background: 'transparent', border: 'none', borderBottom: '1px solid ' + c.border, outline: 'none', color: c.text, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'inherit', width: '100%', paddingBottom: 4 } })
          : React.createElement('div', { onClick: function() { setLabelEdit(true) }, style: { fontSize: 11, fontWeight: 700, color: label ? c.text : '#333', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'text' } }, label || '+ Ajouter un label')
      ),

      React.createElement('textarea', {
        ref: textareaRef, value: text,
        onChange: function(e) { setText(e.target.value) },
        placeholder: 'Écrire une note rapide...',
        rows: 5,
        style: { width: '100%', background: 'transparent', border: 'none', outline: 'none', color: c.text, fontSize: 14, lineHeight: 1.7, fontFamily: 'inherit', resize: 'none', marginBottom: 14 }
      }),

      React.createElement('div', { style: { display: 'flex', gap: 8 } },
        React.createElement('div', { style: { position: 'relative', flex: 1 } },
          React.createElement('button', {
            onClick: function() { setDropdown(!dropdown) },
            style: { width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid ' + c.border, borderRadius: 8, color: c.text, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
          }, React.createElement('span', null, 'Notes (' + allNotes.length + ')'), React.createElement('span', null, dropdown ? '▲' : '▼')),
          dropdown ? React.createElement('div', { style: { position: 'absolute', bottom: '110%', left: 0, right: 0, background: '#111', border: '1px solid #252525', borderRadius: 10, maxHeight: 200, overflowY: 'auto', zIndex: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.8)' } },
            allNotes.length === 0
              ? React.createElement('div', { style: { padding: 14, fontSize: 12, color: '#444', textAlign: 'center' } }, 'Aucune note')
              : allNotes.map(function(n) {
                  var nc = COLORS[n.color] || COLORS[0]
                  return React.createElement('div', {
                    key: n.id,
                    onClick: function() { onSelectNote(n); setDropdown(false) },
                    style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid #1a1a1a', cursor: 'pointer' },
                    onMouseEnter: function(e) { e.currentTarget.style.background = '#1a1a1a' },
                    onMouseLeave: function(e) { e.currentTarget.style.background = 'transparent' }
                  },
                    React.createElement('div', { style: { width: 10, height: 10, borderRadius: '50%', background: nc.dot, flexShrink: 0 } }),
                    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                      n.label ? React.createElement('div', { style: { fontSize: 9, fontWeight: 700, color: nc.text, textTransform: 'uppercase', letterSpacing: '0.06em' } }, n.label) : null,
                      React.createElement('div', { style: { fontSize: 12, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, n.text || '(vide)')
                    ),
                    n.pinned ? React.createElement('span', { style: { fontSize: 11 } }, '📌') : null
                  )
                })
          ) : null
        ),
        React.createElement('button', {
          onClick: function() { handleSave(); onClose() },
          style: { padding: '8px 16px', background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' }
        }, note ? 'Modifier' : 'Ajouter')
      ),

      shareOpen ? React.createElement(SharePopup, { note: currentNoteObj, onClose: handleShareResult }) : null
    )
  )
}

function MiniCard(props) {
  var n = props.note
  var c = COLORS[n.color] || COLORS[0]
  return React.createElement('div', {
    onClick: props.onClick,
    style: { background: c.bg, border: '1px solid ' + c.border, borderRadius: 10, padding: 12, cursor: 'pointer', minHeight: 80 },
    onMouseEnter: function(e) { e.currentTarget.style.opacity = '0.85' },
    onMouseLeave: function(e) { e.currentTarget.style.opacity = '1' }
  },
    n.label ? React.createElement('div', { style: { fontSize: 9, fontWeight: 700, color: c.text, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 } }, n.label) : null,
    React.createElement('div', { style: { fontSize: 12, color: c.text, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }, n.text || React.createElement('span', { style: { color: '#333' } }, '(vide)')),
    n.pinned ? React.createElement('div', { style: { fontSize: 10, marginTop: 6, opacity: 0.5 } }, '📌') : null
  )
}

export function StickyTile(props) {
  var notes = props.notes
  var onClick = props.onClick
  return React.createElement('div', {
    onClick: onClick,
    style: { background: '#1a1500', border: '1px solid #b4530933', borderRadius: 12, padding: '16px 10px 12px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
    onMouseEnter: function(e) { e.currentTarget.style.background = '#1a1300'; e.currentTarget.style.borderColor = '#b4530966' },
    onMouseLeave: function(e) { e.currentTarget.style.background = '#1a1500'; e.currentTarget.style.borderColor = '#b4530933' },
  },
    React.createElement('div', { style: { width: 50, height: 50, borderRadius: 12, background: '#b4530918', border: '1px solid #b4530944', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, position: 'relative' } },
      '🗒️',
      notes.length > 0 ? React.createElement('div', { style: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, background: '#CC0000', borderRadius: '50%', fontSize: 10, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, notes.length > 9 ? '9+' : notes.length) : null
    ),
    React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: '#ddd' } }, 'Notes'),
    React.createElement('div', { style: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', border: '1px solid #2a2a2a', borderRadius: 20 } }, 'Rapides')
  )
}

export function StickyInlineWidget(props) {
  var notesS = useState(function() {
    var loaded = loadNotes()
    loaded.sort(function(a, b) { if (a.pinned && !b.pinned) return -1; if (!a.pinned && b.pinned) return 1; return new Date(b.created_at) - new Date(a.created_at) })
    return loaded
  })
  var notes = notesS[0]; var setNotes = notesS[1]
  var popupS = useState(null); var popup = popupS[0]; var setPopup = popupS[1]

  function saveNote(data) {
    if (popup && popup.id) {
      var updated = notes.map(function(n) { return n.id === popup.id ? Object.assign({}, n, data) : n })
      saveNotes(updated); setNotes(updated)
    } else {
      if (!data.text.trim()) return
      var newNote = Object.assign({}, data, { id: String(Date.now()), created_at: new Date().toISOString() })
      var all = [newNote].concat(notes); saveNotes(all); setNotes(all)
    }
    setPopup(null)
  }

  function deleteNote(id) {
    var updated = notes.filter(function(n) { return n.id !== id })
    saveNotes(updated); setNotes(updated); setPopup(null)
  }

  return React.createElement('div', null,
    React.createElement(StickyTile, { notes: notes, onClick: function() { setPopup('new') } }),
    popup !== null ? React.createElement(NotePopup, {
      note: popup === 'new' || !popup.id ? null : popup,
      allNotes: notes,
      onSave: saveNote,
      onClose: function() { setPopup(null) },
      onDelete: deleteNote,
      onSelectNote: function(n) { setPopup(n) },
    }) : null
  )
}

export default function StickyNotes(props) {
  var onBack = props.onBack
  var notesS = useState([]); var notes = notesS[0]; var setNotes = notesS[1]
  var popupS = useState(null); var popup = popupS[0]; var setPopup = popupS[1]
  var filterS = useState(''); var filter = filterS[0]; var setFilter = filterS[1]

  useEffect(function() {
    var loaded = loadNotes()
    loaded.sort(function(a, b) { if (a.pinned && !b.pinned) return -1; if (!a.pinned && b.pinned) return 1; return new Date(b.created_at) - new Date(a.created_at) })
    setNotes(loaded)
  }, [])

  function saveNote(data) {
    if (popup && popup !== 'new' && popup.id) {
      var updated = notes.map(function(n) { return n.id === popup.id ? Object.assign({}, n, data) : n })
      updated.sort(function(a, b) { if (a.pinned && !b.pinned) return -1; if (!a.pinned && b.pinned) return 1; return new Date(b.created_at) - new Date(a.created_at) })
      saveNotes(updated); setNotes(updated)
    } else {
      if (!data.text.trim()) return
      var newNote = Object.assign({}, data, { id: String(Date.now()), created_at: new Date().toISOString() })
      var all = [newNote].concat(notes); saveNotes(all); setNotes(all)
    }
    setPopup(null)
  }

  function deleteNote(id) {
    var updated = notes.filter(function(n) { return n.id !== id })
    saveNotes(updated); setNotes(updated); setPopup(null)
  }

  var shown = notes.filter(function(n) {
    return !filter || n.text.toLowerCase().indexOf(filter.toLowerCase()) !== -1 || (n.label || '').toLowerCase().indexOf(filter.toLowerCase()) !== -1
  })
  var pinned = shown.filter(function(n) { return n.pinned })
  var unpinned = shown.filter(function(n) { return !n.pinned })

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808' } },

    React.createElement('header', { style: { background: '#0a0a0a', borderBottom: '1px solid #1c1c1c', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
      React.createElement('button', { onClick: onBack, style: { background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 8, color: '#aaa', fontSize: 13, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' } }, '<- Retour'),
      React.createElement('h1', { style: { fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' } }, '🗒️ Notes rapides'),
      React.createElement('div', { style: { marginLeft: 'auto', display: 'flex', gap: 8 } },
        React.createElement('input', { value: filter, onChange: function(e) { setFilter(e.target.value) }, placeholder: 'Rechercher...', style: { background: '#161616', border: '1px solid #2a2a2a', borderRadius: 7, padding: '6px 12px', color: '#ddd', fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 160 } }),
        React.createElement('button', { onClick: function() { setPopup('new') }, style: { padding: '7px 16px', background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, '+ Note')
      )
    ),

    React.createElement('div', { style: { background: '#0d0d0d', borderBottom: '1px solid #181818', padding: '8px 24px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
      React.createElement('span', { style: { fontSize: 10, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' } }, 'Ajouter'),
      COLORS.map(function(c, i) {
        return React.createElement('button', {
          key: i, onClick: function() { setPopup({ color: i, text: '', label: '', pinned: false }) },
          style: { display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: c.bg, border: '1px solid ' + c.border, borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit' }
        },
          React.createElement('div', { style: { width: 9, height: 9, borderRadius: '50%', background: c.dot } }),
          React.createElement('span', { style: { fontSize: 11, fontWeight: 700, color: c.text } }, c.label)
        )
      }),
      notes.length > 0 ? React.createElement('span', { style: { marginLeft: 'auto', fontSize: 11, color: '#333' } }, notes.length + ' note' + (notes.length > 1 ? 's' : '')) : null
    ),

    React.createElement('main', { style: { flex: 1, padding: 24 } },
      notes.length === 0
        ? React.createElement('div', { style: { textAlign: 'center', paddingTop: 80, color: '#333', fontSize: 13 } },
            React.createElement('div', { style: { fontSize: 40, marginBottom: 16 } }, '🗒️'),
            'Aucune note — cliquez + Note ou choisissez une couleur'
          )
        : React.createElement('div', null,
            pinned.length > 0 ? React.createElement('div', { style: { marginBottom: 24 } },
              React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 } }, '📌 Épinglées (' + pinned.length + ')'),
              React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 } },
                pinned.map(function(n) { return React.createElement(MiniCard, { key: n.id, note: n, onClick: function() { setPopup(n) } }) })
              )
            ) : null,
            unpinned.length > 0 ? React.createElement('div', null,
              pinned.length > 0 ? React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 } }, 'Autres (' + unpinned.length + ')') : null,
              React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 } },
                unpinned.map(function(n) { return React.createElement(MiniCard, { key: n.id, note: n, onClick: function() { setPopup(n) } }) })
              )
            ) : null
          )
    ),

    popup !== null ? React.createElement(NotePopup, {
      note: popup === 'new' || !popup.id ? null : popup,
      allNotes: notes,
      onSave: saveNote,
      onClose: function() { setPopup(null) },
      onDelete: deleteNote,
      onSelectNote: function(n) { setPopup(n) },
    }) : null
  )
}
