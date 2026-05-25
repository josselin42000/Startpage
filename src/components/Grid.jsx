import React from 'react'
import Tile from './Tile'
import FolderTile from './FolderTile'

export default function Grid(props) {
  var tiles = props.tiles; var allTiles = props.allTiles; var editMode = props.editMode
  var onAdd = props.onAdd; var onAddFolder = props.onAddFolder; var onEdit = props.onEdit
  var onDelete = props.onDelete; var onLongPressActivate = props.onLongPressActivate
  var onOpenTools = props.onOpenTools; var onOpenFolder = props.onOpenFolder
  var filterCat = props.filterCat; var dragging = props.dragging; var dragOver = props.dragOver
  var onDragStart = props.onDragStart; var onDragOver = props.onDragOver
  var onDrop = props.onDrop; var onDragEnd = props.onDragEnd

  var label = filterCat === 'all' ? (tiles.length + ' liens') : (filterCat + ' · ' + tiles.length + ' lien' + (tiles.length > 1 ? 's' : ''))

  var elements = tiles.map(function(t, i) {
    if (t.type === 'folder') {
      var children = (allTiles || []).filter(function(x) { return x.folder_id === t.id })
      return React.createElement(FolderTile, { key: t.id, tile: t, editMode: editMode, index: i, childTiles: children, dragging: dragging, dragOver: dragOver, onEdit: onEdit, onDelete: onDelete, onLongPressActivate: onLongPressActivate, onOpen: onOpenFolder, onDragStart: onDragStart, onDragOver: onDragOver, onDrop: onDrop, onDragEnd: onDragEnd })
    }
    return React.createElement(Tile, { key: t.id, tile: t, editMode: editMode, index: i, dragging: dragging, dragOver: dragOver, onEdit: onEdit, onDelete: onDelete, onLongPressActivate: onLongPressActivate, onDragStart: onDragStart, onDragOver: onDragOver, onDrop: onDrop, onDragEnd: onDragEnd })
  })

  var toolsBtn = React.createElement('div', {
    key: 'tools', onClick: onOpenTools,
    style: { background: '#1a1a1a', border: '1px solid #CC000033', borderRadius: 12, padding: '16px 10px 12px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
    onMouseEnter: function(e) { e.currentTarget.style.background = '#200000'; e.currentTarget.style.borderColor = '#CC000066' },
    onMouseLeave: function(e) { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#CC000033' },
  },
    React.createElement('div', { style: { width: 50, height: 50, borderRadius: 12, background: '#CC000018', border: '1px solid #CC000044', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 } }, '🛠️'),
    React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: '#ddd' } }, 'Outils'),
    React.createElement('div', { style: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', border: '1px solid #2a2a2a', borderRadius: 20 } }, 'Apps')
  )

  var addFolderBtn = editMode ? React.createElement('div', {
    key: 'addfolder', onClick: onAddFolder,
    style: { background: '#111', border: '1px dashed #CC000044', borderRadius: 12, padding: '16px 10px 12px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#CC000066' },
    onMouseEnter: function(e) { e.currentTarget.style.borderColor = '#CC0000'; e.currentTarget.style.color = '#CC0000' },
    onMouseLeave: function(e) { e.currentTarget.style.borderColor = '#CC000044'; e.currentTarget.style.color = '#CC000066' },
  },
    React.createElement('div', { style: { width: 50, height: 50, borderRadius: 12, background: '#161616', border: '1px solid #CC000033', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'inherit' } }, '📁'),
    React.createElement('div', { style: { fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'inherit' } }, 'Dossier')
  ) : null

  var addBtn = React.createElement('div', {
    key: 'add', onClick: onAdd,
    style: { background: '#111', border: '1px dashed #2a2a2a', borderRadius: 12, padding: '16px 10px 12px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#555' },
    onMouseEnter: function(e) { e.currentTarget.style.borderColor = '#CC0000'; e.currentTarget.style.color = '#CC0000'; e.currentTarget.style.background = '#0b0000' },
    onMouseLeave: function(e) { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#555'; e.currentTarget.style.background = '#111' },
  },
    React.createElement('div', { style: { width: 50, height: 50, borderRadius: 12, background: '#161616', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: 'inherit' } }, '+'),
    React.createElement('div', { style: { fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'inherit' } }, 'Ajouter')
  )

  return React.createElement('div', null,
    React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 } }, label),
    editMode ? React.createElement('p', { style: { fontSize: 11, color: '#555', marginBottom: 14 } }, 'Glisser pour reordonner · Deposer sur un dossier pour y ajouter') : null,
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 } },
      elements, toolsBtn, addFolderBtn, addBtn
    )
  )
}
