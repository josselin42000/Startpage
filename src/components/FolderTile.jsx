import React from 'react'
import { useRef, useEffect } from 'react'

var injected2 = false

export default function FolderTile(props) {
  var tile = props.tile
  var editMode = props.editMode
  var index = props.index
  var dragging = props.dragging
  var dragOver = props.dragOver
  var childTiles = props.childTiles || []
  var locked = !!props.locked

  var timer = useRef(null)
  var longPressed = useRef(false)

  useEffect(function() {
    if (injected2) return; injected2 = true
    var s = document.createElement('style')
    s.textContent = '@keyframes wobble2{0%{transform:rotate(-1.5deg) scale(1.01)}100%{transform:rotate(1.5deg) scale(1.01)}}'
    document.head.appendChild(s)
  }, [])

  function onPressStart() {
    longPressed.current = false
    timer.current = setTimeout(function() { longPressed.current = true; props.onLongPressActivate && props.onLongPressActivate() }, 600)
  }
  function onPressEnd() { clearTimeout(timer.current) }
  function onClick(e) {
    e.preventDefault()
    if (longPressed.current) return
    if (editMode && locked) return
    if (editMode) { props.onEdit && props.onEdit(tile); return }
    props.onOpen && props.onOpen(tile)
  }

  var isDragging = dragging === tile.id
  var isOver = dragOver === tile.id
  var color = tile.color || '#CC0000'
  var previews = childTiles.slice(0, 4)
  var anim = editMode && !isDragging && !locked ? ('wobble2 0.5s ease ' + String((index % 5) * 70) + 'ms infinite alternate') : 'none'

  return React.createElement('div', {
    onClick: onClick,
    onMouseDown: onPressStart, onMouseUp: onPressEnd,
    draggable: editMode && !locked,
    onDragStart: function(e) { props.onDragStart && props.onDragStart(e, tile.id) },
    onDragOver: function(e) { props.onDragOver && props.onDragOver(e, tile.id) },
    onDrop: function(e) { props.onDrop && props.onDrop(e, tile.id) },
    onDragEnd: props.onDragEnd,
    style: {
      background: isOver ? (color + '22') : '#1a1a1a',
      border: isOver ? ('2px solid ' + color) : editMode ? '1px solid rgba(204,0,0,0.3)' : ('1px solid ' + color + '33'),
      borderRadius: 14, padding: '16px 14px 14px', cursor: editMode ? (locked ? 'not-allowed' : 'grab') : 'pointer',
      textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      position: 'relative', opacity: isDragging ? 0.4 : (editMode && locked ? 0.55 : 1),
      userSelect: 'none', WebkitUserSelect: 'none', animation: anim,
    }
  },
    editMode && !locked ? React.createElement('button', {
      onClick: function(e) { e.preventDefault(); e.stopPropagation(); props.onDelete && props.onDelete(tile.id) },
      style: { position: 'absolute', top: -8, left: -8, width: 24, height: 24, background: '#CC0000', border: '2px solid #0d0d0d', borderRadius: '50%', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 10 }
    }, 'x') : null,
    editMode && locked ? React.createElement('span', {
      title: 'Gérée par l\'admin',
      style: { position: 'absolute', top: -8, left: -8, width: 24, height: 24, background: '#1a1a1a', border: '2px solid #0d0d0d', borderRadius: '50%', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }
    }, '🔒') : null,
    React.createElement('div', { style: { width: 64, height: 64, borderRadius: 16, background: color + '18', border: '1px solid ' + color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 } },
      previews.length > 0
        ? React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 6, width: '100%', height: '100%' } },
            previews.map(function(c) {
              return React.createElement('div', { key: c.id, style: { background: '#222', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, overflow: 'hidden' } },
                c.logo
                  ? React.createElement('img', { src: c.logo, style: { width: '100%', height: '100%', objectFit: 'contain' } })
                  : React.createElement('span', null, c.icon && c.icon.charCodeAt(0) > 127 ? c.icon : '🔗')
              )
            })
          )
        : React.createElement('span', { style: { fontSize: 28 } }, tile.icon || '📁')
    ),
    React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color: '#ddd' } }, tile.name),
    React.createElement('div', { style: { fontSize: 9, color: color, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 8px', border: '1px solid ' + color + '33', borderRadius: 20 } },
      childTiles.length + ' lien' + (childTiles.length > 1 ? 's' : '')
    )
  )
}
