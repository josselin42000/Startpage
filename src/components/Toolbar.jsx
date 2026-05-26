import React from 'react'
import { useState } from 'react'

export default function Toolbar(props) {
  var cats = props.cats
  var filterCat = props.filterCat
  var setFilterCat = props.setFilterCat
  var search = props.search
  var setSearch = props.setSearch
  var editMode = props.editMode
  var setEditMode = props.setEditMode
  var onEditCat = props.onEditCat
  var onDeleteCat = props.onDeleteCat
  var googleSearch = props.googleSearch
  var setGoogleSearch = props.setGoogleSearch

  var editingCatState = useState(null); var editingCat = editingCatState[0]; var setEditingCat = editingCatState[1]
  var catValueState = useState(''); var catValue = catValueState[0]; var setCatValue = catValueState[1]

  function saveCat() {
    if (catValue.trim() && catValue.trim() !== editingCat) {
      onEditCat(editingCat, catValue.trim())
      if (filterCat === editingCat) setFilterCat(catValue.trim())
    }
    setEditingCat(null)
  }

  function handleGoogleSearch(e) {
    e.preventDefault()
    if (!googleSearch.trim()) return
    window.open('https://www.google.com/search?q=' + encodeURIComponent(googleSearch.trim()), '_blank')
    setGoogleSearch('')
  }

  return React.createElement('div', { style: { background: '#0d0d0d', borderBottom: '1px solid #181818', position: 'sticky', top: 57, zIndex: 40 } },

    // ROW 1 : filtre texte + recherche google
    React.createElement('div', { style: { padding: '8px 20px 6px', display: 'flex', alignItems: 'center', gap: 8 } },

      // FILTRE TEXTE (déplacé en haut)
      React.createElement('input', {
        value: search,
        onChange: function(e) { setSearch(e.target.value) },
        placeholder: 'Filtrer les liens...',
        style: { background: '#161616', border: '1px solid #2a2a2a', borderRadius: 7, padding: '7px 12px', color: '#ddd', fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 160 }
      }),

      // SEARCH GOOGLE (élargie)
      React.createElement('form', { onSubmit: handleGoogleSearch, style: { flex: 1, display: 'flex', alignItems: 'center' } },
        React.createElement('input', {
          value: googleSearch,
          onChange: function(e) { setGoogleSearch(e.target.value) },
          placeholder: '🔍  Rechercher sur Google...',
          style: { flex: 1, background: '#161616', border: '1px solid #2a2a2a', borderRight: 'none', borderRadius: '7px 0 0 7px', padding: '7px 14px', color: '#ddd', fontSize: 13, fontFamily: 'inherit', outline: 'none' }
        }),
        React.createElement('button', {
          type: 'submit',
          style: { background: '#CC0000', border: 'none', borderRadius: '0 7px 7px 0', padding: '7px 16px', color: '#fff', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }
        }, 'Go')
      )
    ),

    // ROW 2 : catégories
    React.createElement('div', { style: { padding: '4px 20px 8px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
      cats.map(function(c) {
        var isActive = filterCat === c
        if (editMode && editingCat === c) {
          return React.createElement('input', {
            key: c, autoFocus: true, value: catValue,
            onChange: function(e) { setCatValue(e.target.value) },
            onBlur: saveCat,
            onKeyDown: function(e) { if (e.key === 'Enter') saveCat(); if (e.key === 'Escape') setEditingCat(null) },
            style: { background: '#1a0000', border: '1px solid #CC0000', borderRadius: 20, padding: '4px 12px', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'inherit', outline: 'none', width: 120 }
          })
        }
        return React.createElement('div', { key: c, style: { display: 'flex', alignItems: 'center', gap: 2 } },
          React.createElement('button', {
            onClick: function() { setFilterCat(c) },
            onDoubleClick: function() { if (editMode && c !== 'all') { setEditingCat(c); setCatValue(c) } },
            style: { padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', textTransform: 'uppercase', fontFamily: 'inherit', border: isActive ? '1px solid #CC0000' : '1px solid #333', background: isActive ? '#CC0000' : 'transparent', color: isActive ? '#fff' : '#aaa' }
          }, c === 'all' ? 'Tous' : c),
          editMode && c !== 'all' ? React.createElement('button', {
            onClick: function() { onDeleteCat(c) },
            style: { width: 16, height: 16, borderRadius: '50%', background: '#CC0000', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }
          }, 'x') : null
        )
      })
    )
  )
}
