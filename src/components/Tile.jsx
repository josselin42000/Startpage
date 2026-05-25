import React, { useRef } from 'react'

function getInitials(name) {
  return (name || '').split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function Tile({ tile, editMode, onEdit, onDelete, onLongPressActivate, index }) {
  const isEmoji = tile.icon && /\p{Emoji}/u.test(tile.icon)
  const pressTimer = useRef(null)
  const didLongPress = useRef(false)

  const startPress = () => {
    didLongPress.current = false
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true
      onLongPressActivate()
    }, 600)
  }

  const cancelPress = () => clearTimeout(pressTimer.current)

  const handleClick = (e) => {
    if (didLongPress.current) { e.preventDefault(); return }
    if (editMode) { e.preventDefault(); onEdit(tile); return }
    if (!tile.url || tile.url === '#') e.preventDefault()
  }

  const wobbleStyle = editMode ? {
    animation: `wobble 0.5s ease ${(index % 5) * 0.07}s infinite alternate`,
  } : {}

  return (
    <>
      <style>{`
        @keyframes wobble {
          0%   { transform: rotate(-1.5deg) scale(1.01); }
          100% { transform: rotate(1.5deg) scale(1.01); }
        }
      `}</style>
      
        href={tile.url && tile.url !== '#' ? tile.url : undefined}
        target={tile.url && tile.url !== '#' ? '_blank' : undefined}
        rel="noopener noreferrer"
        onClick={handleClick}
        onMouseDown={startPress} onMouseUp={cancelPress} onMouseLeave={cancelPress}
        onTouchStart={startPress} onTouchEnd={cancelPress} onTouchMove={cancelPress}
        style={{
          background: '#1a1a1a', border: editMode ? '1px solid #CC000055' : '1px solid #282828',
          borderRadius: 14, padding: '22px 14px 16px', cursor: 'pointer', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11,
          textDecoration: 'none', position: 'relative',
          transition: editMode ? 'none' : 'all .18s',
          userSelect: 'none', WebkitUserSelect: 'none',
          ...wobbleStyle,
        }}
      >
        {editMode && (
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(tile.id) }}
            style={{
              position: 'absolute', top: -8, left: -8, width: 24, height: 24,
              background: '#CC0000', border: '2px solid #0d0d0d', borderRadius: '50%',
              color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 700,
              lineHeight: 1, zIndex: 10,
            }}
          >×</button>
        )}
        <div style={{
          width: 58, height: 58, borderRadius: 14, display: 'flex',
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          border: `1px solid ${tile.color}44`, background: `${tile.color}18`,
          flexShrink: 0,
        }}>
          {tile.logo ? (
            <img src={tile.logo} alt={tile.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} />
          ) : isEmoji ? (
            <span style={{ fontSize: 28 }}>{tile.icon}</span>
          ) : (
            <span style={{ fontSize: 14, fontWeight: 700, color: tile.color }}>{getInitials(tile.name)}</span>
          )}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#ddd', letterSpacing: '0.02em', lineHeight: 1.3, wordBreak: 'break-word' }}>
          {tile.name}
        </div>
        {tile.cat && (
          <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 8px', border: '1px solid #2a2a2a', borderRadius: 20 }}>
            {tile.cat}
          </div>
        )}
      </a>
    </>
  )
}
