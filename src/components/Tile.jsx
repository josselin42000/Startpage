import React from 'react'
import { useRef, useEffect, useState } from 'react'

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

  var iframeState = useState(false); var showIframe = iframeState[0]; var setShowIframe = iframeState[1]
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
    if (tile.openMode === 'iframe') { e.preventDefault(); setShowIframe(true); return }
    if (!tile.url || tile.url === '#') e.preventDefault()
  }

  var isDragging = dragging === tile.id
  var isOver = dragOver === tile.id
  var isEmoji = tile.icon && tile.icon.charCodeAt(0) > 127
  var anim = editMode && !isDragging ? ('wobble 0.5s ease ' + String((index % 5) * 70) + 'ms infinite alternate') : 'none'

  var linkProps = {
    rel: 'noopener noreferrer', onClick: onClick,
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
      borderRadius: 12, padding: '16px 10px 12px', cursor: editMode ? 'grab' : 'pointer',
      textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      textDecoration: 'none', position: 'relative', opacity: isDragging ? 0.4 : 1,
      userSelect: 'none', WebkitUserSelect: 'none', animation: anim,
    }
  }

  if (!editMode && tile.url && tile.url !== '#' && tile.openMode !== 'iframe') {
    linkProps.href = tile.url; linkProps.target = '_blank'
  }

  if (showIframe) {
    return React.createElement('div', { style: { position: 'fixed', inset: 0, background: '#080808', zIndex: 300, display: 'flex', flexDirection: 'column' } },
      React.createElement('div', { style: { padding: '10px 20px', background: '#0d0d0d', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 } },
        React.createElement('button', { onClick: function() { setShowIframe(false) }, style: { background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 6, color: '#aaa', fontSize: 12, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' } }, '<- Retour'),
        tile.logo ? React.createElement('img', { src: tile.logo, style: { width: 20, height: 20, objectFit: 'contain', borderRadius: 4 } }) : React.createElement('span', { style: { fontSize: 16 } }, tile.icon || '🔗'),
        React.createElement('span', { style: { fontSize: 13, color: '#ccc', fontWeight: 600 } }, tile.name),
        React.createElement('a', { href: tile.url, target: '_blank', rel: 'noopener noreferrer', style: { marginLeft: 'auto', fontSize: 11, color: '#555', textDecoration: 'none', border: '1px solid #222', borderRadius: 5, padding: '4px 10px' } }, 'Ouvrir dans onglet')
      ),
      React.createElement('iframe', { src: tile.url, style: { flex: 1, border: 'none', width: '100%' }, allow: 'geolocation' })
    )
  }

  return React.createElement('a', linkProps,
    editMode ? React.createElement('button', {
      onClick: function(e) { e.preventDefault(); e.stopPropagation(); props.onDelete && props.onDelete(tile.id) },
      style: { position: 'absolute', top: -8, left: -8, width: 22, height: 22, background: '#CC0000', border: '2px solid #0d0d0d', borderRadius: '50%', color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 10 }
    }, 'x') : null,
    React.createElement('div', { style: { width: 50, height: 50, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(128,128,128,0.2)', background: 'rgba(128,128,128,0.1)' } },
      tile.logo
        ? React.createElement('img', { src: tile.logo, alt: tile.name, style: { width: '100%', height: '100%', objectFit: 'contain', padding: 5 } })
        : isEmoji
          ? React.createElement('span', { style: { fontSize: 24 } }, tile.icon)
          : React.createElement('span', { style: { fontSize: 13, fontWeight: 700, color: tile.color || '#888' } }, getInitials(tile.name))
    ),
    React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: '#ddd', lineHeight: 1.3, wordBreak: 'break-word' } }, tile.name),
    tile.cat ? React.createElement('div', { style: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', border: '1px solid #333', borderRadius: 20 } }, tile.cat) : null,
    tile.openMode === 'iframe' && !editMode ? React.createElement('div', { style: { fontSize: 9, color: '#1a6fc4', textTransform: 'uppercase' } }, 'iframe') : null
  )
}
