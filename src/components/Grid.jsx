import React from 'react'
import Tile from './Tile'

export default function Grid({ tiles, editMode, onAdd, onEdit, onDelete, onLongPressActivate, filterCat }) {
  return (
    <>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
        {filterCat === 'all' ? `${tiles.length} liens` : `${filterCat} · ${tiles.length} lien${tiles.length > 1 ? 's' : ''}`}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
        {tiles.map((t, i) => (
          <Tile key={t.id} tile={t} editMode={editMode} onEdit={onEdit} onDelete={onDelete} onLongPressActivate={onLongPressActivate} index={i} />
        ))}
        <div
          onClick={onAdd}
          style={{ background: '#111', border: '1px dashed #2a2a2a', borderRadius: 14, padding: '22px 14px 16px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11, transition: 'all .18s', color: '#444' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#CC0000'; e.currentTarget.style.color = '#CC0000'; e.currentTarget.style.background = '#0b0000' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#444'; e.currentTarget.style.background = '#111' }}
        >
          <div style={{ width: 58, height: 58, borderRadius: 14, background: '#161616', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'inherit' }}>+</div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'inherit' }}>Ajouter</div>
        </div>
      </div>
    </>
  )
}
