import React from 'react'

export default function Toolbar({ cats, filterCat, setFilterCat, search, setSearch, editMode, setEditMode }) {
  return (
    <div style={{
      background: '#0d0d0d', borderBottom: '1px solid #181818',
      padding: '10px 28px', display: 'flex', alignItems: 'center',
      gap: 8, flexWrap: 'wrap', position: 'sticky', top: 57, zIndex: 40
    }}>
      {cats.map(c => (
        <button
          key={c}
          onClick={() => setFilterCat(c)}
          style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.07em', cursor: 'pointer', textTransform: 'uppercase',
            fontFamily: 'inherit', transition: 'all .15s',
            border: filterCat === c ? '1px solid #CC0000' : '1px solid #222',
            background: filterCat === c ? '#CC0000' : 'transparent',
            color: filterCat === c ? '#fff' : '#444',
          }}
        >
          {c === 'all' ? 'Tous' : c}
        </button>
      ))}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher…"
          style={{
            background: '#111', border: '1px solid #1e1e1e', borderRadius: 7,
            padding: '7px 14px', color: '#aaa', fontSize: 13, fontFamily: 'inherit',
            outline: 'none', width: 200,
          }}
        />
        <button
          onClick={() => setEditMode(v => !v)}
          style={{
            padding: '6px 18px', background: editMode ? '#0f0000' : 'transparent',
            border: editMode ? '1px solid #CC0000' : '1px solid #252525',
            borderRadius: 6,
            color: editMode ? '#CC0000' : '#555',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all .15s',
          }}
        >
          {editMode ? 'Terminer' : 'Éditer'}
        </button>
      </div>
    </div>
  )
}
