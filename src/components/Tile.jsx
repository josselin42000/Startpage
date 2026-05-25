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
  var dragging = props.dragging
  var dragOver = props.dragOver

  var timer = useRef(null)
  var longPressed = useRef(false)

  useEffect(function() {
    if (injected) return; injected = true
    var s = document.createElement('style')
    s.textContent = '@keyframes wobble{0%{transform:rotate(-1.5deg) scale(1.01)}100%{transform:rotate(1.5deg) scale(1.01)}}'
    document.head.appendChild(s)
  }, [])

  function onPressStart() {
    longPressed.current = false
    timer.current = setTimeout(function() { longPressed.current = true; props.onLongPressActivate && props.onLongPressActivate() }, 600)
  }
  function onPressEnd() { clearTimeout(timer.current) }
  function onClick(e) {
    if (longPressed.current) { e.preventDefault(); return }
    if (editMode) { e.preventDefault(); props.onEdit && props.onEdit(tile); return }
    if (!tile.url || tile.url === '#') e.preventDefault()
  }

  var isDragging = dragging === tile.id
  var isOver = dragOver === tile.id
  var isEmoji = tile.icon && tile.icon.charCodeAt(0) > 127
  var anim = editMode && !isDragging ? ('wobble 0.5s ease ' + String((index % 5) * 70) + 'ms infinite alternate') : 'none'

  var linkProps = {
    rel: 'noopener noreferrer',
    onClick: onClick,
    onMouseDown: onPressStart, onMouseUp: onPressEnd, onMouseLeave: onPressEnd,
    onTouchStart: onPressStart, onTouchEnd: onPressEnd, onTouchMove: onPressEnd,
    draggable: editMode,
    onDragStart: function(e) { props.onDragStart && props.onDragStart(e, tile.id) },
    onDragOver: function(e) { props.onDragOver && props.onDragOver(e, tile.id) },
    onDrop: function(e) { props.onDrop && props.onDrop(e, tile.id) },
    onDragEnd: props.onDragEnd,
    style: {
      background: isOver ? '#1e2a1e' : '#1a1a1a',
      border: isOver ? '1px solid #1a8f5c' : editMode ? '1px solid rgba(204,0,0,0.3)' : '1px solid #282828',
      borderRadius: 14, padding: '22px 14px 16px', cursor: editMode ? 'grab' : 'pointer',
      textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11,
      textDecoration: 'none', position: 'relative',
      opacity: isDragging ? 0.4 : 1,
      userSelect: 'none', WebkitUserSelect: 'none', animation: anim,
    }
  }

  if (!editMode && tile.url && tile.url !== '#') { linkProps.href = tile.url; linkProps.target = '_blank' }

  return React.createElement('a', linkProps,
    editMode ? React.createElement('button', {
      onClick: function(e) { e.preventDefault(); e.stopPropagation(); props.onDelete && props.onDelete(tile.id) },
      style: { position: 'absolute', top: -8, left: -8, width: 24, height: 24, background: '#CC0000', border: '2px solid #0d0d0d', borderRadius: '50%', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 10 }
    }, 'x') : null,
    React.createElement('div', { style: { width: 58, height: 58, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(128,128,128,0.2)', background: 'rgba(128,128,128,0.1)' } },
      tile.logo
        ? React.createElement('img', { src: tile.logo, alt: tile.name, style: { width: '100%', height: '100%', objectFit: 'contain', padding: 6 } })
        : isEmoji
          ? React.createElement('span', { style: { fontSize: 28 } }, tile.icon)
          : React.createElement('span', { style: { fontSize: 14, fontWeight: 700, color: tile.color || '#888' } }, getInitials(tile.name))
    ),
    React.createElement('div', { style: { fontSize: 12, fontWeight: 600, color: '#ddd', lineHeight: 1.3, wordBreak: 'break-word' } }, tile.name),
    tile.cat ? React.createElement('div', { style: { fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 8px', border: '1px solid #2a2a2a', borderRadius: 20 } }, tile.cat) : null
  )
}
