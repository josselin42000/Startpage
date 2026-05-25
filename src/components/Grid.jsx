import React from 'react'
import Tile from './Tile'

export default function Grid({ tiles, editMode, onAdd, onEdit, onDelete, filterCat }) {
  return (
    <>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#2a2a2a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
        {filterCat === 'all' ? `${tiles.length} liens` : `${filterCat} · ${tiles.length} lien${tiles.length > 1 ? 's' : ''}`}
      </div>

      {tiles.length === 0 && (
        <div style={{ textAlign: 'center', paddingTop: 60, color: '#2a2a2a', fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
          Aucun lien trouvé
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 14,
      }}>
        {tiles.map((t, i) => (
          <Tile key={t.id} tile={t} editMode={editMode} onEdit={onEdit} onDelete={onDelete} index={i} />
        ))}

        {/* ADD BUTTON */}
        <div
          onClick={onAdd}
          style={{
            background: '#0f0f0f', border: '1px dashed #232323', borderRadius: 12,
            padding: '22px 14px 16px', cursor: 'pointer', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11,
            transition: 'all .18s', color: '#333',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#CC0000'
            e.currentTarget.style.color = '#CC0000'
            e.currentTarget.style.background = '#0b0000'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#232323'
            e.currentTarget.style.color = '#333'
            e.currentTarget.style.background = '#0f0f0f'
          }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: 12, background: '#161616',
            border: '1px solid #232323', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 28, color: 'inherit',
          }}>+</div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'inherit' }}>
            Ajouter
          </div>
        </div>
      </div>
    </>
  )
}
