import React from 'react'
import { useState, useEffect } from 'react'
import { supabase, hasSupabase } from '../supabase'

var LS_KEY = 'startpage_ideas_v1'

function loadLocal() {
  try { var r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : [] } catch(e) { return [] }
}
function saveLocal(d) { try { localStorage.setItem(LS_KEY, JSON.stringify(d)) } catch(e) {} }

var PRIORITIES = ['', '🔴 Urgent', '🟠 Important', '🟡 Normal', '🟢 Bas']
var STATUSES = ['💡 Idée', '🔄 En cours', '✅ Terminé', '❌ Annulé']

function NoteCard(props) {
  var note = props.note
  var overdue = note.due_date && new Date(note.due_date) < new Date() && note.status !== '✅ Terminé'

  return React.createElement('div', {
    onClick: function() { props.onEdit(note) },
    style: { background: '#141414', border: '1px solid ' + (overdue ? '#CC000055' : '#1e1e1e'), borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer' }
  },
    React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 10 } },
      React.createElement('div', { style: { flex: 1 } },
        React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: '#ddd', marginBottom: 4 } }, note.title),
        note.priority ? React.createElement('span', { style: { fontSize: 10, color: '#666' } }, note.priority) : null
      ),
      React.createElement('span', { style: { fontSize: 11, color: '#555', background: '#1a1a1a', border: '1px solid #252525', borderRadius: 20, padding: '2px 10px', whiteSpace: 'nowrap' } }, note.status || '💡 Idée'),
      React.createElement('button', { onClick: function(e) { e.stopPropagation(); props.onDelete(note.id) }, style: { background: 'transparent', border: 'none', color: '#333', fontSize: 18, cursor: 'pointer', lineHeight: 1 } }, '×')
    ),
    note.content ? React.createElement('div', { style: { fontSize: 12, color: '#666', lineHeight: 1.6, whiteSpace: 'pre-wrap' } }, note.content.slice(0, 120) + (note.content.length > 120 ? '...' : '')) : null,
    note.todos && note.todos.length > 0 ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
      note.todos.slice(0, 3).map(function(todo, i) {
        return React.createElement('div', {
          key: i,
          onClick: function(e) { e.stopPropagation(); props.onToggleTodo(note.id, i) },
          style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }
        },
          React.createElement('span', { style: { fontSize: 14, color: todo.done ? '#1a8f5c' : '#444' } }, todo.done ? '✅' : '⬜'),
          React.createElement('span', { style: { color: todo.done ? '#444' : '#aaa', textDecoration: todo.done ? 'line-through' : 'none' } }, todo.text)
        )
      }),
      note.todos.length > 3 ? React.createElement('div', { style: { fontSize: 10, color: '#444' } }, '+ ' + (note.todos.length - 3) + ' autres') : null
    ) : null,
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
      note.due_date ? React.createElement('span', { style: { fontSize: 10, color: overdue ? '#CC0000' : '#555', fontWeight: overdue ? 700 : 400 } }, '📅 ' + note.due_date) : null,
      note.tags && note.tags.length ? React.createElement('div', { style: { display: 'flex', gap: 4, flexWrap: 'wrap' } },
        note.tags.map(function(t) { return React.createElement('span', { key: t, style: { fontSize: 9, color: '#555', border: '1px solid #252525', borderRadius: 10, padding: '1px 6px' } }, t) })
      ) : null
    )
  )
}

function NoteModal(props) {
  var note = props.note
  var titleS = useState(note ? note.title : ''); var title = titleS[0]; var setTitle = titleS[1]
  var contentS = useState(note ? note.content : ''); var content = contentS[0]; var setContent = contentS[1]
  var statusS = useState(note ? note.status : '💡 Idée'); var status = statusS[0]; var setStatus = statusS[1]
  var priorityS = useState(note ? note.priority : ''); var priority = priorityS[0]; var setPriority = priorityS[1]
  var dueDateS = useState(note ? note.due_date : ''); var dueDate = dueDateS[0]; var setDueDate = dueDateS[1]
  var tagsS = useState(note ? (note.tags || []).join(', ') : ''); var tags = tagsS[0]; var setTags = tagsS[1]
  var todosS = useState(note ? (note.todos || []) : []); var todos = todosS[0]; var setTodos = todosS[1]
  var newTodoS = useState(''); var newTodo = newTodoS[0]; var setNewTodo = newTodoS[1]

  function addTodo() {
    if (!newTodo.trim()) return
    setTodos(todos.concat([{ text: newTodo.trim(), done: false }]))
    setNewTodo('')
  }
  function toggleTodo(i) { setTodos(todos.map(function(t, j) { return j === i ? Object.assign({}, t, { done: !t.done }) : t })) }
  function removeTodo(i) { setTodos(todos.filter(function(_, j) { return j !== i })) }

  function handleSave() {
    if (!title.trim()) return
    props.onSave({
      title: title.trim(), content: content.trim(),
      status: status, priority: priority,
      due_date: dueDate, todos: todos,
      tags: tags.split(',').map(function(t) { return t.trim() }).filter(Boolean)
    })
  }

  var inp = { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#e0e0e0', fontSize: 13, fontFamily: 'inherit', outline: 'none' }
  var lbl = { display: 'block', fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }

  return React.createElement('div', {
    onClick: function(e) { if (e.target === e.currentTarget) props.onClose() },
    style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }
  },
    React.createElement('div', { style: { background: '#111', border: '1px solid #252525', borderRadius: 16, padding: 24, width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto' } },
      React.createElement('h2', { style: { fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 } }, note ? 'Modifier' : 'Nouvelle fiche'),

      React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('label', { style: lbl }, 'Titre'),
        React.createElement('input', { value: title, onChange: function(e) { setTitle(e.target.value) }, placeholder: 'Titre...', style: inp, autoFocus: true })
      ),

      React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('label', { style: lbl }, 'Notes'),
        React.createElement('textarea', { value: content, onChange: function(e) { setContent(e.target.value) }, placeholder: 'Contenu, idées, notes...', rows: 5, style: Object.assign({}, inp, { resize: 'vertical', lineHeight: 1.6 }) })
      ),

      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 } },
        React.createElement('div', null,
          React.createElement('label', { style: lbl }, 'Statut'),
          React.createElement('select', { value: status, onChange: function(e) { setStatus(e.target.value) }, style: Object.assign({}, inp, { cursor: 'pointer' }) },
            STATUSES.map(function(s) { return React.createElement('option', { key: s, value: s }, s) })
          )
        ),
        React.createElement('div', null,
          React.createElement('label', { style: lbl }, 'Priorité'),
          React.createElement('select', { value: priority, onChange: function(e) { setPriority(e.target.value) }, style: Object.assign({}, inp, { cursor: 'pointer' }) },
            PRIORITIES.map(function(p) { return React.createElement('option', { key: p, value: p }, p || 'Aucune') })
          )
        )
      ),

      React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('label', { style: lbl }, 'Date butoire'),
        React.createElement('input', { type: 'date', value: dueDate, onChange: function(e) { setDueDate(e.target.value) }, style: inp })
      ),

      React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('label', { style: lbl }, 'Tags (séparés par virgule)'),
        React.createElement('input', { value: tags, onChange: function(e) { setTags(e.target.value) }, placeholder: 'ex: marketing, urgent', style: inp })
      ),

      React.createElement('div', { style: { marginBottom: 20 } },
        React.createElement('label', { style: lbl }, 'To-do list'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 } },
          todos.map(function(todo, i) {
            return React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 8 } },
              React.createElement('button', { onClick: function() { toggleTodo(i) }, style: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 0, flexShrink: 0 } }, todo.done ? '✅' : '⬜'),
              React.createElement('span', { style: { flex: 1, fontSize: 13, color: todo.done ? '#444' : '#ccc', textDecoration: todo.done ? 'line-through' : 'none' } }, todo.text),
              React.createElement('button', { onClick: function() { removeTodo(i) }, style: { background: 'none', border: 'none', color: '#333', fontSize: 16, cursor: 'pointer' } }, '×')
            )
          })
        ),
        React.createElement('div', { style: { display: 'flex', gap: 8 } },
          React.createElement('input', {
            value: newTodo, onChange: function(e) { setNewTodo(e.target.value) },
            onKeyDown: function(e) { if (e.key === 'Enter') { e.preventDefault(); addTodo() } },
            placeholder: 'Ajouter une tâche...', style: Object.assign({}, inp, { flex: 1 })
          }),
          React.createElement('button', { onClick: addTodo, style: { padding: '0 16px', background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 18, cursor: 'pointer' } }, '+')
        )
      ),

      React.createElement('div', { style: { display: 'flex', gap: 10 } },
        React.createElement('button', { onClick: props.onClose, style: { flex: 1, padding: 11, background: 'transparent', border: '1px solid #252525', borderRadius: 8, color: '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Annuler'),
        React.createElement('button', { onClick: handleSave, style: { flex: 2, padding: 11, background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Enregistrer')
      )
    )
  )
}

export default function IdeasPage(props) {
  var onBack = props.onBack
  var notesS = useState([]); var notes = notesS[0]; var setNotes = notesS[1]
  var loadingS = useState(true); var loading = loadingS[0]; var setLoading = loadingS[1]
  var modalS = useState(false); var modalOpen = modalS[0]; var setModalOpen = modalS[1]
  var editingS = useState(null); var editing = editingS[0]; var setEditing = editingS[1]
  var filterS = useState(''); var filter = filterS[0]; var setFilter = filterS[1]
  var statusFilterS = useState(''); var statusFilter = statusFilterS[0]; var setStatusFilter = statusFilterS[1]

  useEffect(function() { loadNotes() }, [])

  function loadNotes() {
    setLoading(true)
    if (hasSupabase) {
      supabase.from('ideas').select('*').order('created_at', { ascending: false }).then(function(res) {
        if (!res.error && res.data) { setNotes(res.data); setLoading(false) }
        else { setNotes(loadLocal()); setLoading(false) }
      })
    } else { setNotes(loadLocal()); setLoading(false) }
  }

  function handleSave(data) {
    if (editing) {
      var updated = notes.map(function(n) { return n.id === editing.id ? Object.assign({}, n, data) : n })
      if (hasSupabase) { supabase.from('ideas').update(data).eq('id', editing.id) }
      saveLocal(updated); setNotes(updated)
    } else {
      if (hasSupabase) {
        supabase.from('ideas').insert([data]).select().then(function(res) {
          if (!res.error && res.data) setNotes([res.data[0]].concat(notes))
        })
      } else {
        var newNote = Object.assign({}, data, { id: String(Date.now()), created_at: new Date().toISOString() })
        var all = [newNote].concat(notes); saveLocal(all); setNotes(all)
      }
    }
    setModalOpen(false); setEditing(null)
  }

  function handleDelete(id) {
    if (!confirm('Supprimer cette fiche ?')) return
    var updated = notes.filter(function(n) { return n.id !== id })
    if (hasSupabase) supabase.from('ideas').delete().eq('id', id)
    saveLocal(updated); setNotes(updated)
  }

  function handleToggleTodo(noteId, todoIdx) {
    var updated = notes.map(function(n) {
      if (n.id !== noteId) return n
      var todos = (n.todos || []).map(function(t, i) { return i === todoIdx ? Object.assign({}, t, { done: !t.done }) : t })
      if (hasSupabase) supabase.from('ideas').update({ todos: todos }).eq('id', noteId)
      return Object.assign({}, n, { todos: todos })
    })
    saveLocal(updated); setNotes(updated)
  }

  var shown = notes.filter(function(n) {
    var sOk = !statusFilter || n.status === statusFilter
    var fOk = !filter || (n.title || '').toLowerCase().indexOf(filter.toLowerCase()) !== -1 || (n.content || '').toLowerCase().indexOf(filter.toLowerCase()) !== -1
    return sOk && fOk
  })

  var counts = {}
  STATUSES.forEach(function(s) { counts[s] = notes.filter(function(n) { return n.status === s }).length })

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808' } },

    React.createElement('header', { style: { background: '#0a0a0a', borderBottom: '1px solid #1c1c1c', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
      React.createElement('button', { onClick: onBack, style: { background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 8, color: '#aaa', fontSize: 13, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' } }, '<- Retour'),
      React.createElement('h1', { style: { fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' } }, '💡 Boite a idees'),
      React.createElement('div', { style: { marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' } },
        React.createElement('input', { value: filter, onChange: function(e) { setFilter(e.target.value) }, placeholder: 'Rechercher...', style: { background: '#161616', border: '1px solid #2a2a2a', borderRadius: 7, padding: '6px 12px', color: '#ddd', fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 160 } }),
        React.createElement('button', { onClick: function() { setEditing(null); setModalOpen(true) }, style: { background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, padding: '7px 18px', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, '+ Nouvelle fiche')
      )
    ),

    React.createElement('div', { style: { background: '#0d0d0d', borderBottom: '1px solid #181818', padding: '8px 24px', display: 'flex', gap: 8, flexWrap: 'wrap' } },
      React.createElement('button', { onClick: function() { setStatusFilter('') }, style: { padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: !statusFilter ? '1px solid #CC0000' : '1px solid #2a2a2a', background: !statusFilter ? '#CC0000' : 'transparent', color: !statusFilter ? '#fff' : '#888', textTransform: 'uppercase' } }, 'Toutes (' + notes.length + ')'),
      STATUSES.map(function(s) {
        return React.createElement('button', { key: s, onClick: function() { setStatusFilter(statusFilter === s ? '' : s) }, style: { padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: statusFilter === s ? '1px solid #CC0000' : '1px solid #2a2a2a', background: statusFilter === s ? '#CC0000' : 'transparent', color: statusFilter === s ? '#fff' : '#888' } }, s + ' (' + (counts[s] || 0) + ')')
      })
    ),

    React.createElement('main', { style: { flex: 1, padding: 24 } },
      loading ? React.createElement('div', { style: { textAlign: 'center', paddingTop: 60, color: '#444' } }, 'Chargement...') :
      shown.length === 0 ? React.createElement('div', { style: { textAlign: 'center', paddingTop: 60, color: '#333', fontSize: 13 } }, 'Aucune fiche') :
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 } },
        shown.map(function(n) {
          return React.createElement(NoteCard, { key: n.id, note: n, onEdit: function(note) { setEditing(note); setModalOpen(true) }, onDelete: handleDelete, onToggleTodo: handleToggleTodo })
        })
      )
    ),

    modalOpen ? React.createElement(NoteModal, { note: editing, onSave: handleSave, onClose: function() { setModalOpen(false); setEditing(null) } }) : null
  )
}
