import React from 'react'

function getInitials(name) {
  return (name || '').split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function Tile({ tile, editMode, onEdit, onDelete, index }) {
  const isEmoji = tile.icon && /\p{Emoji}/u.test(tile.icon)

  const handleClick = (e) => {
    if (editMode) { e.preventDefault(); onEdit(tile); return }
    if (!tile.url || tile.url === '#') e.preventDefault()
  }

  return (
    <a
      href={tile.url && tile.url !== '#' ? tile.url : undefined}
      target={tile.url && tile.url !== '#' ? '_blank' : undefined}
      rel="noopener noreferrer"
      onClick={handleClick}
      style={{
        background: '#111', border: '1px solid #1e1e1e', borderRadius: 12,
        padding: '22px 14px 16px', cursor: 'pointer', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11,
        textDecoration: 'none', position: 'relative',
        animation: `fadeUp .2s ease ${index * 20}ms both`,
        transition: 'all .18s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#161616'
        e.currentTarget.style.borderColor = '#2e2e2e'
        e.currentTarget.style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#111'
        e.currentTarget.style.borderColor = '#1e1e1e'
        e.currentTarget.style.transform = 'none'
      }}
    >
      {/* DELETE BTN */}
      {editMode && (
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(tile.id) }}
          style={{
            position: 'absolute', top: 7, right: 7, width: 22, height: 22,
            background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '50%',
            color: '#555', fontSize: 15, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontWeight: 700,
            lineHeight: 1, zIndex: 2,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#CC0000'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#555' }}
        >×</button>
      )}

      {/* ICON */}
      <div style={{
        width: 56, height: 56, borderRadius: 12, display: 'flex',
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        border: `1px solid ${tile.color}33`, background: `${tile.color}11`,
        flexShrink: 0, position: 'relative',
      }}>
        {tile.logo ? (
          <img src={tile.logo} alt={tile.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} />
        ) : isEmoji ? (
          <span style={{ fontSize: 26 }}>{tile.icon}</span>
        ) : (
          <span style={{ fontSize: 14, fontWeight: 700, color: tile.color, letterSpacing: '0.04em' }}>
            {getInitials(tile.name)}
          </span>
        )}

        {/* EDIT overlay */}
        {editMode && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 11, fontSize: 20,
          }}>🖊️</div>
        )}
      </div>

      {/* LABEL */}
      <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc', letterSpacing: '0.03em', lineHeight: 1.3, wordBreak: 'break-word' }}>
        {tile.name}
      </div>

      {/* CAT BADGE */}
      {tile.cat && (
        <div style={{
          fontSize: 9, color: '#333', textTransform: 'uppercase', letterSpacing: '0.08em',
          padding: '2px 8px', border: '1px solid #1e1e1e', borderRadius: 20,
        }}>
          {tile.cat}
        </div>
      )}
    </a>
  )
}
