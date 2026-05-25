import React from 'react'
import Tile from './Tile'
import FolderTile from './FolderTile'

export default function Grid(props) {
  var tiles = props.tiles
  var allTiles = props.allTiles
  var editMode = props.editMode
  var onAdd = props.onAdd
  var onAddFolder = props.onAddFolder
  var onEdit = props.onEdit
  var onDelete = props.onDelete
  var onLongPressActivate = props.onLongPressActivate
  var onOpenTools = props.onOpenTools
  var onOpenFolder = props.onOpenFolder
  var filterCat = props.filterCat
  var dragging = props.dragging
  var dragOver = props.dragOver
  var onDragStart = props.onDragStart
  var onDragOver = props.onDragOver
  var onDrop = props.onDrop
  var onDragEnd = props.onDragEnd

  var label = filterCat === 'all'
    ? (tiles.length + ' liens')
    : (filterCat + ' · ' + tiles.length + ' lien' + (tiles.length > 1 ? 's' : ''))

  var elements = tiles.map(function(t, i) {
    if (t.type === 'folder') {
      var children = (allTiles || []).filter(function(x) { return x.folder_id === t.id })
      return React.createElement(FolderTile, {
        key: t.id, tile: t, editMode: editMode, index: i,
        childTiles: children, dragging: dragging, dragOver: dragOver,
        onEdit: onEdit, onDelete: onDelete,
        onLongPressActivate: onLongPressActivate,
        onOpen: onOpenFolder,
        onDragStart: onDragStart, onDragOver: onDragOver, onDrop: onDrop, onDragEnd: onDragEnd,
      })
    }
    return React.createElement(Tile, {
      key: t.id, tile: t, editMode: editMode, index: i,
      dragging: dragging, dragOver: dragOver,
      onEdit: onEdit, onDelete: onDelete,
      onLongPressActivate: onLongPressActivate,
      onDragStart: onDragStart, onDragOver: onDragOver, onDrop: onDrop, onDragEnd: onDragEnd,
    })
  })

  var toolsBtn = React.createElement('div', {
    key: 'tools', onClick: onOpenTools,
    style: { background: '#1a1a1a', border: '1px solid #CC000033', borderRadius: 14, padding: '22px 14px 16px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11 },
    onMouseEnter: function(e) { e.currentTarget.style.background = '#200000'; e.currentTarget.style.borderColor = '#CC000066' },
    onMouseLeave: function(e) { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#CC000033' },
  },
    React.createElement('div', { style: { width: 58, height: 58, borderRadius: 14, background: '#CC000018', border: '1px solid #CC000044', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 } }, '🛠️'),
    React.createElement('div', { style: { fontSize: 12, fontWeight: 600, color: '#ddd' } }, 'Outils'),
    React.createElement('div', { style: { fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 8px', border: '1px solid #2a2a2a', borderRadius: 20 } }, 'Apps')
  )

  var addFolderBtn = editMode ? React.createElement('div', {
    key: 'addfolder', onClick: onAddFolder,
    style: { background: '#111', border: '1px dashed #CC000044', borderRadius: 14, padding: '22px 14px 16px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11, color: '#CC000066' },
    onMouseEnter: function(e) { e.currentTarget.style.borderColor = '#CC0000'; e.currentTarget.style.color = '#CC0000' },
    onMouseLeave: function(e) { e.currentTarget.style.borderColor = '#CC000044'; e.currentTarget.style.color = '#CC000066' },
  },
    React.createElement('div', { style: { width: 58, height: 58, borderRadius: 14, background: '#161616', border: '1px solid #CC000033', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'inherit' } }, '📁'),
    React.createElement('div', { style: { fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'inherit' } }, 'Dossier')
  ) : null

  var addBtn = React.createElement('div', {
    key: 'add', onClick: onAdd,
    style: { background: '#111', border: '1px dashed #2a2a2a', borderRadius: 14, padding: '22px 14px 16px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11, color: '#444' },
    onMouseEnter: function(e) { e.currentTarget.style.borderColor = '#CC0000'; e.currentTarget.style.color = '#CC0000'; e.currentTarget.style.background = '#0b0000' },
    onMouseLeave: function(e) { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#444'; e.currentTarget.style.background = '#111' },
  },
    React.createElement('div', { style: { width: 58, height: 58, borderRadius: 14, background: '#161616', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'inherit' } }, '+'),
    React.createElement('div', { style: { fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'inherit' } }, 'Ajouter')
  )

  return React.createElement('div', null,
    React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 } }, label),
    editMode ? React.createElement('p', { style: { fontSize: 10, color: '#444', marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' } }, 'Glisser pour reordonner · Deposer sur un dossier pour y ajouter') : null,
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 } },
      elements, toolsBtn, addFolderBtn, addBtn
    )
  )
}
