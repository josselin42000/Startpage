import React, { useState } from 'react'

export default function Toolbar({ cats, filterCat, setFilterCat, search, setSearch, editMode, setEditMode, onEditCat, onDeleteCat }) {
  const [editingCat, setEditingCat] = useState(null)
  const [catValue, setCatValue] = useState('')

  const startEditCat = (cat) => { setEditingCat(cat); setCatValue(cat) }

  const saveCat = () => {
    if (catValue.trim() && catValue.trim() !== editingCat) {
      onEditCat(editingCat, catValue.trim())
      if (filterCat === editingCat) setFilterCat(catValue.trim())
    }
    setEditingCat(null)
  }

  return (
    <div style={{ background: '#0d0d0d', borderBottom: '1px solid #181818', padding: '10px 28px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', position: 'sticky', top: 57, zIndex: 40 }}>
      {cats.map(c => (
        <div key={c} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {editMode && editingCat === c ? (
            <input autoFocus value={catValue} onChange={e => setCatValue(e.target.value)}
              onBlur={saveCat} onKeyDown={e => { if (e.key === 'Enter') saveCat(); if (e.key === 'Escape') setEditingCat(null) }}
              style={{ background: '#1a0000', border: '1px solid #CC0000', borderRadius: 20, padding: '4px 12px', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'inherit', outline: 'none', width: 120 }}
            />
          ) : (
            <button onClick={() => setFilterCat(c)} onDoubleClick={() => editMode && c !== 'all' && startEditCat(c)}
              style={{ padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', cursor: 'pointer', textTransform: 'uppercase', fontFamily: 'inherit', transition: 'all .15s', border: filterCat === c ? '1px solid #CC0000' : '1px solid #2a2a2a', background: filterCat === c ? '#CC0000' : 'transparent', color: filterCat === c ? '#fff' : '#888' }}
            >{c === 'all' ? 'Tous' : c}</button>
          )}
          {editMode && c !== 'all' && editingCat !== c && (
            <button onClick={() => onDeleteCat(c)}
              style={{ marginLeft: 2, width: 16, height: 16, borderRadius: '50%', background: '#CC0000', border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
            >×</button>
          )}
        </div>
      ))}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
          style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: 7, padding: '7px 14px', color: '#ddd', fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 200 }}
        />
        <button onClick={() => setEditMode(v => !v)}
          style={{ padding: '6px 18px', background: editMode ? '#1a0000' : 'transparent', border: editMode ? '1px solid #CC0000' : '1px solid #2a2a2a', borderRadius: 6, color: editMode ? '#CC0000' : '#888', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
        >{editMode ? 'Terminer' : 'Éditer'}</button>
      </div>
    </div>
  )
}
