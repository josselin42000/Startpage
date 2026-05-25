import React from 'react'
import { useRef, useEffect } from 'react'

function getInitials(name) {
  if (!name) return ''
  return name.split(' ').map(function(w) { return w[0] || '' }).join('').toUpperCase().slice(0, 2)
}

var injected = false

export default function Tile(props) {
  var tile = props.tile
  var editMode = props.editMode
  var index = props.index

  var timer = useRef(null)
  var longPressed = useRef(false)

  useEffect(function() {
    if (injected) return
    injected = true
    var s = document.createElement('style')
    s.textContent = '@keyframes wobble{0%{transform:rotate(-1.5deg)}100%{transform:rotate(1.5deg)}}'
    document.head.appendChild(s)
  }, [])

  function onPressStart() {
    longPressed.current = false
    timer.current = setTimeout(function() {
      longPressed.current = true
      props.onLongPressActivate()
    }, 600)
  }

  function onPressEnd() { clearTimeout(timer.current) }

  function onClick(e) {
    if (longPressed.current) { e.preventDefault(); return }
    if (editMode) { e.preventDefault(); props.onEdit(tile); return }
    if (!tile.url || tile.url === '#') e.preventDefault()
  }

  var href = (tile.url && tile.url !== '#') ? tile.url : undefined
  var target = (tile.url && tile.url !== '#') ? '_blank' : undefined
  var anim = editMode ? ('wobble 0.5s ease ' + String((index % 5) * 70) + 'ms infinite alternate') : 'none'
  var isEmoji = tile.icon && tile.icon.charCodeAt(0) > 127

  return (
    
      href={href}
      target={target}
      rel="noopener noreferrer"
      onClick={onClick}
      onMouseDown={onPressStart}
      onMouseUp={onPressEnd}
      onMouseLeave={onPressEnd}
      onTouchStart={onPressStart}
      onTouchEnd={onPressEnd}
      onTouchMove={onPressEnd}
      style={{
        background: '#1a1a1a',
        border: editMode ? '1px solid rgba(204,0,0,0.3)' : '1px solid #282828',
        borderRadius: 14,
        padding: '22px 14px 16px',
        cursor: 'pointer',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 11,
        textDecoration: 'none',
        position: 'relative',
        userSelect: 'none',
        animation: anim,
      }}
    >
      {editMode && (
        <button
          onClick={function(e) { e.preventDefault(); e.stopPropagation(); props.onDelete(tile.id) }}
          style={{
            position: 'absolute', top: -8, left: -8, width: 24, height: 24,
            background: '#CC0000', border: '2px solid #0d0d0d', borderRadius: '50%',
            color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 10,
          }}
        >x</button>
      )}
      <div style={{
        width: 58, height: 58, borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', flexShrink: 0,
        border: '1px solid rgba(128,128,128,0.2)',
        background: 'rgba(128,128,128,0.1)',
      }}>
        {tile.logo ? (
          <img src={tile.logo} alt={tile.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} />
        ) : isEmoji ? (
          <span style={{ fontSize: 28 }}>{tile.icon}</span>
        ) : (
          <span style={{ fontSize: 14, fontWeight: 700, color: tile.color }}>{getInitials(tile.name)}</span>
        )}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#ddd', lineHeight: 1.3, wordBreak: 'break-word' }}>
        {tile.name}
      </div>
      {tile.cat ? (
        <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 8px', border: '1px solid #2a2a2a', borderRadius: 20 }}>
          {tile.cat}
        </div>
      ) : null}
    </a>
  )
}
