import React from 'react'
import { useState } from 'react'
import Tile from './Tile'

export default function FolderPage(props) {
  var folder = props.folder
  var tiles = props.tiles
  var onBack = props.onBack
  var editMode = props.editMode
  var onEdit = props.onEdit
  var onDelete = props.onDelete
  var onLongPressActivate = props.onLongPressActivate
  var onAddTile = props.onAddTile
  var onReorder = props.onReorder
  var onRemoveFromFolder = props.onRemoveFromFolder
  var isAdmin = props.isAdmin
  var ownerId = props.ownerId
  function isLocked(t) { return !isAdmin && t.owner_id !== ownerId }

  var draggingState = useState(null); var dragging = draggingState[0]; var setDragging = draggingState[1]
  var dragOverState = useState(null); var dragOver = dragOverState[0]; var setDragOver = dragOverState[1]

  function handleDragStart(e, id) { setDragging(id); e.dataTransfer.effectAllowed = 'move' }
  function handleDragOver(e, id) { e.preventDefault(); if (id !== dragging) setDragOver(id) }
  function handleDrop(e, targetId) {
    e.preventDefault()
    if (dragging && targetId && dragging !== targetId) onReorder && onReorder(dragging, targetId)
    setDragging(null); setDragOver(null)
  }
  function handleDragEnd() { setDragging(null); setDragOver(null) }

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808' } },
    React.createElement('header', { style: { background: '#0a0a0a', borderBottom: '1px solid #1c1c1c', padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 12 } },
      React.createElement('button', { onClick: onBack, style: { background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 8, color: '#aaa', fontSize: 13, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' } }, '<- Retour'),
      React.createElement('span', { style: { fontSize: 20 } }, folder.icon || '📁'),
      React.createElement('h1', { style: { fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase' } }, folder.name),
      React.createElement('button', { onClick: onAddTile, style: { marginLeft: 'auto', background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 700, padding: '6px 16px', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, '+ Ajouter')
    ),
    React.createElement('main', { style: { flex: 1, padding: 28 } },
      editMode ? React.createElement('p', { style: { fontSize: 10, color: '#444', marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' } }, 'Glisser pour reordonner · fleche pour retirer du dossier') : null,
      tiles.length === 0 ? React.createElement('div', { style: { textAlign: 'center', paddingTop: 60, color: '#333', fontSize: 13 } }, 'Dossier vide') : null,
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 } },
        tiles.map(function(t, i) {
          var locked = isLocked(t)
          return React.createElement('div', { key: t.id, style: { position: 'relative' } },
            editMode && !locked ? React.createElement('button', {
              onClick: function() { onRemoveFromFolder && onRemoveFromFolder(t.id) },
              title: 'Retirer du dossier',
              style: { position: 'absolute', top: -8, right: -8, width: 22, height: 22, background: '#374151', border: '2px solid #080808', borderRadius: '50%', color: '#ddd', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 11 }
            }, '↗') : null,
            React.createElement(Tile, {
              tile: t, editMode: editMode, index: i, locked: locked,
              dragging: dragging, dragOver: dragOver,
              onEdit: onEdit, onDelete: onDelete,
              onLongPressActivate: onLongPressActivate,
              onDragStart: handleDragStart, onDragOver: handleDragOver,
              onDrop: handleDrop, onDragEnd: handleDragEnd,
            })
          )
        })
      )
    )
  )
}
