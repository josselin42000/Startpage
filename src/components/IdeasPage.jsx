import React from 'react'
import { useState, useEffect } from 'react'
import { supabase, hasSupabase } from '../supabase'

var LS_KEY = 'startpage_ideas_v1'
function loadLocal() { try { var r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : [] } catch(e) { return [] } }
function saveLocal(d) { try { localStorage.setItem(LS_KEY, JSON.stringify(d)) } catch(e) {} }

var PRIORITIES = ['', '🔴 Urgent', '🟠 Important', '🟡 Normal', '🟢 Bas']
var STATUSES = ['💡 Idée', '🔄 En cours', '✅ Terminé', '❌ Annulé']

function NoteCard(props) {
  var note = props.note
  var overdue = note.due_date && new Date(note.due_date) < new Date() && note.status !== '✅ Terminé'
  var done = (note.todos || []).filter(function(t) { return t.done }).length
  var total = (note.todos || []).length
  var isShared = props.isShared

  return React.createElement('div', {
    onClick: function() { props.onEdit(note) },
    style: { background: '#141414', border: '1px solid ' + (overdue ? '#CC000055' : isShared ? '#1a6fc433' : '#1e1e1e'), borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', position: 'relative' },
    onMouseEnter: function(e) { e.currentTarget.style.borderColor = overdue ? '#CC000088' : '#2a2a2a' },
    onMouseLeave: function(e) { e.currentTarget.style.borderColor = overdue ? '#CC000055' : isShared ? '#1a6fc433' : '#1e1e1e' },
  },
    isShared ? React.createElement('div', { style: { position: 'absolute', top: 8, right: 8, fontSize: 10, color: '#1a6fc4', background: '#1a6fc415', border: '1px solid #1a6fc433', borderRadius: 10, padding: '1px 8px' } }, '🔗 Partagée') : null,
    React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 8 } },
      React.createElement('div', { style: { flex: 1 } },
        React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: '#ddd', marginBottom: 3 } }, note.title),
        note.priority ? React.createElement('span', { style: { fontSize: 10, color: '#666' } }, note.priority) : null
      ),
      React.createElement('span', { style: { fontSize: 10, color: '#555', background: '#1a1a1a', border: '1px solid #252525', borderRadius: 20, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 } }, note.status || '💡 Idée'),
      !isShared ? React.createElement('button', {
        onClick: function(e) { e.stopPropagation(); props.onDelete(note.id) },
        style: { background: 'transparent', border: 'none', color: '#2a2a2a', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0, flexShrink: 0 },
        onMouseEnter: function(e) { e.currentTarget.style.color = '#CC0000' },
        onMouseLeave: function(e) { e.currentTarget.style.color = '#2a2a2a' }
      }, '×') : null
    ),
    note.content ? React.createElement('div', { style: { fontSize: 12, color: '#666', lineHeight: 1.6, whiteSpace: 'pre-wrap' } }, note.content.slice(0, 100) + (note.content.length > 100 ? '...' : '')) : null,
    total > 0 ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 3 } },
      (note.todos || []).slice(0, 3).map(function(todo, i) {
        return React.createElement('div', {
          key: i,
          onClick: function(e) { e.stopPropagation(); if (!isShared) props.onToggleTodo(note.id, i) },
          style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: isShared ? 'default' : 'pointer' }
        },
          React.createElement('span', { style: { fontSize: 13, color: todo.done ? '#1a8f5c' : '#333' } }, todo.done ? '✅' : '⬜'),
          React.createElement('span', { style: { color: todo.done ? '#444' : '#999', textDecoration: todo.done ? 'line-through' : 'none' } }, todo.text)
        )
      }),
      total > 3 ? React.createElement('span', { style: { fontSize: 10, color: '#444' } }, '+ ' + (total - 3) + ' autres') : null,
      React.createElement('div', { style: { height: 3, background: '#1a1a1a', borderRadius: 2, marginTop: 4, overflow: 'hidden' } },
        React.createElement('div', { style: { height: '100%', width: (total ? Math.round(done / total * 100) : 0) + '%', background: '#1a8f5c', borderRadius: 2 } })
      )
    ) : null,
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
      note.due_date ? React.createElement('span', { style: { fontSize: 10, color: overdue ? '#CC0000' : '#444', fontWeight: overdue ? 700 : 400 } }, '📅 ' + note.due_date) : null,
      note.tags && note.tags.length ? note.tags.map(function(t) { return React.createElement('span', { key: t, style: { fontSize: 9, color: '#444', border: '1px solid #252525', borderRadius: 10, padding: '1px 6px' } }, t) }) : null,
      props.shareCount > 0 ? React.createElement('span', { style: { fontSize: 9, color: '#1a6fc4', border: '1px solid #1a6fc433', borderRadius: 10, padding: '1px 6px', marginLeft: 'auto' } }, '🔗 ' + props.shareCount + ' personne' + (props.shareCount > 1 ? 's' : '')) : null
    )
  )
}

function AddCard(props) {
  return React.createElement('div', {
    onClick: props.onClick,
    style: { background: '#0f0f0f', border: '1px dashed #2a2a2a', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', minHeight: 120 },
    onMouseEnter: function(e) { e.currentTarget.style.borderColor = '#b45309'; e.currentTarget.style.background = '#1a1200' },
    onMouseLeave: function(e) { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.background = '#0f0f0f' },
  },
    React.createElement('div', { style: { width: 40, height: 40, borderRadius: 10, background: '#161616', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#444' } }, '+'),
    React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.05em' } }, 'Nouvelle fiche')
  )
}

function ShareModal(props) {
  var note = props.note
  var onClose = props.onClose
  var pagesS = useState([]); var pages = pagesS[0]; var setPages = pagesS[1]
  var sharesS = useState([]); var shares = sharesS[0]; var setShares = sharesS[1]
  var loadS = useState(true); var load = loadS[0]; var setLoad = loadS[1]

  useEffect(function() {
    Promise.all([
      supabase.from('user_pages').select('id,slug,display_name,avatar,color').order('display_name'),
      supabase.from('idea_shares').select('page_id').eq('idea_id', note.id)
    ]).then(function(results) {
      if (!results[0].error) setPages(results[0].data || [])
      if (!results[1].error) setShares((results[1].data || []).map(function(s) { return s.page_id }))
      setLoad(false)
    })
  }, [])

  function toggleShare(pageId) {
    var isShared = shares.indexOf(pageId) !== -1
    if (isShared) {
      supabase.from('idea_shares').delete().eq('idea_id', note.id).eq('page_id', pageId).then(function() {
        setShares(shares.filter(function(id) { return id !== pageId }))
      })
    } else {
      supabase.from('idea_shares').insert([{ idea_id: note.id, page_id: pageId }]).then(function() {
        setShares(shares.concat([pageId]))
      })
    }
  }

  return React.createElement('div', {
    onClick: function(e) { if (e.target === e.currentTarget) onClose() },
    style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }
  },
    React.createElement('div', { style: { background: '#111', border: '1px solid #252525', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 } },
      React.createElement('h2', { style: { fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 } }, '🔗 Partager la fiche'),
      React.createElement('div', { style: { fontSize: 12, color: '#555', marginBottom: 20 } }, '"' + note.title + '"'),
      load
        ? React.createElement('div', { style: { color: '#444', fontSize: 13, textAlign: 'center', padding: 20 } }, 'Chargement...')
        : pages.length === 0
          ? React.createElement('div', { style: { color: '#333', fontSize: 13, textAlign: 'center', padding: 20 } }, 'Aucun utilisateur créé')
          : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 } },
              pages.map(function(p) {
                var isShared = shares.indexOf(p.id) !== -1
                return React.createElement('div', {
                  key: p.id,
                  onClick: function() { toggleShare(p.id) },
                  style: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: isShared ? '#001a0e' : '#0a0a0a', border: '1px solid ' + (isShared ? '#1a8f5c55' : '#1e1e1e'), borderRadius: 10, cursor: 'pointer' }
                },
                  React.createElement('div', { style: { width: 34, height: 34, borderRadius: '50%', background: (p.color || '#1a6fc4') + '22', border: '2px solid ' + (p.color || '#1a6fc4') + '55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 } }, p.avatar || '👤'),
                  React.createElement('div', { style: { flex: 1 } },
                    React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: '#ddd' } }, p.display_name),
                    React.createElement('div', { style: { fontSize: 10, color: '#444' } }, '/' + p.slug)
                  ),
                  React.createElement('div', { style: { width: 24, height: 24, borderRadius: '50%', background: isShared ? '#1a8f5c' : '#1a1a1a', border: '1px solid ' + (isShared ? '#1a8f5c' : '#333'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', flexShrink: 0 } }, isShared ? '✓' : '')
                )
              })
            ),
      React.createElement('button', { onClick: onClose, style: { width: '100%', padding: 11, background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Fermer')
    )
  )
}

function NoteModal(props) {
  var note = props.note
  var onClose = props.onClose
  var onSave = props.onSave
  var onShare = props.onShare
  var isReadOnly = props.isReadOnly

  var titleS = useState(note ? note.title : ''); var title = titleS[0]; var setTitle = titleS[1]
  var contentS = useState(note ? note.content : ''); var content = contentS[0]; var setContent = contentS[1]
  var statusS = useState(note ? (note.status || '💡 Idée') : '💡 Idée'); var status = statusS[0]; var setStatus = statusS[1]
  var priorityS = useState(note ? (note.priority || '') : ''); var priority = priorityS[0]; var setPriority = priorityS[1]
  var dueDateS = useState(note ? (note.due_date || '') : ''); var dueDate = dueDateS[0]; var setDueDate = dueDateS[1]
  var tagsS = useState(note ? (note.tags || []).join(', ') : ''); var tags = tagsS[0]; var setTags = tagsS[1]
  var todosS = useState(note ? (note.todos || []) : []); var todos = todosS[0]; var setTodos = todosS[1]
  var newTodoS = useState(''); var newTodo = newTodoS[0]; var setNewTodo = newTodoS[1]

  function addTodo() { if (!newTodo.trim()) return; setTodos(todos.concat([{ text: newTodo.trim(), done: false }])); setNewTodo('') }
  function toggleTodo(i) { setTodos(todos.map(function(t, j) { return j === i ? Object.assign({}, t, { done: !t.done }) : t })) }
  function removeTodo(i) { setTodos(todos.filter(function(_, j) { return j !== i })) }
  function handleSave() {
    if (!title.trim()) return
    onSave({ title: title.trim(), content: content.trim(), status: status, priority: priority, due_date: dueDate, todos: todos, tags: tags.split(',').map(function(t) { return t.trim() }).filter(Boolean) })
  }

  var inp = { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#e0e0e0', fontSize: 13, fontFamily: 'inherit', outline: 'none' }
  var lbl = { display: 'block', fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }

  return React.createElement('div', {
    onClick: function(e) { if (e.target === e.currentTarget) onClose() },
    style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }
  },
    React.createElement('div', { style: { background: '#111', border: '1px solid #252525', borderRadius: 16, padding: 24, width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 } },
        React.createElement('h2', { style: { fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' } }, isReadOnly ? '👁 Fiche partagée' : note ? 'Modifier' : 'Nouvelle fiche'),
        !isReadOnly && note && hasSupabase
          ? React.createElement('button', { onClick: function() { onShare(note) }, style: { padding: '5px 14px', background: 'transparent', border: '1px solid #1a6fc444', borderRadius: 6, color: '#1a6fc4', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, '🔗 Partager')
          : null
      ),

      React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('label', { style: lbl }, 'Titre'),
        React.createElement('input', { value: title, onChange: function(e) { if (!isReadOnly) setTitle(e.target.value) }, readOnly: isReadOnly, placeholder: 'Titre...', style: Object.assign({}, inp, { opacity: isReadOnly ? 0.6 : 1 }), autoFocus: !isReadOnly })
      ),
      React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('label', { style: lbl }, 'Notes'),
        React.createElement('textarea', { value: content, onChange: function(e) { if (!isReadOnly) setContent(e.target.value) }, readOnly: isReadOnly, placeholder: 'Contenu...', rows: 4, style: Object.assign({}, inp, { resize: 'vertical', lineHeight: 1.6, opacity: isReadOnly ? 0.6 : 1 }) })
      ),

      !isReadOnly ? React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 } },
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
      ) : null,

      !isReadOnly ? React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 } },
        React.createElement('div', null,
          React.createElement('label', { style: lbl }, 'Date butoire'),
          React.createElement('input', { type: 'date', value: dueDate, onChange: function(e) { setDueDate(e.target.value) }, style: inp })
        ),
        React.createElement('div', null,
          React.createElement('label', { style: lbl }, 'Tags'),
          React.createElement('input', { value: tags, onChange: function(e) { setTags(e.target.value) }, placeholder: 'marketing, urgent...', style: inp })
        )
      ) : null,

      React.createElement('div', { style: { marginBottom: 10 } },
        React.createElement('label', { style: lbl }, 'To-do list'),
        todos.map(function(todo, i) {
          return React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 } },
            React.createElement('button', { onClick: function() { if (!isReadOnly) toggleTodo(i) }, style: { background: 'none', border: 'none', fontSize: 18, cursor: isReadOnly ? 'default' : 'pointer', padding: 0, flexShrink: 0 } }, todo.done ? '✅' : '⬜'),
            React.createElement('span', { style: { flex: 1, fontSize: 13, color: todo.done ? '#444' : '#ccc', textDecoration: todo.done ? 'line-through' : 'none' } }, todo.text),
            !isReadOnly ? React.createElement('button', { onClick: function() { removeTodo(i) }, style: { background: 'none', border: 'none', color: '#333', fontSize: 16, cursor: 'pointer' } }, '×') : null
          )
        }),
        !isReadOnly ? React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 6 } },
          React.createElement('input', { value: newTodo, onChange: function(e) { setNewTodo(e.target.value) }, onKeyDown: function(e) { if (e.key === 'Enter') { e.preventDefault(); addTodo() } }, placeholder: 'Ajouter une tâche...', style: Object.assign({}, inp, { flex: 1 }) }),
          React.createElement('button', { onClick: addTodo, style: { padding: '0 16px', background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 20, cursor: 'pointer' } }, '+')
        ) : null
      ),

      React.createElement('div', { style: { display: 'flex', gap: 10, marginTop: 20 } },
        React.createElement('button', { onClick: onClose, style: { flex: 1, padding: 11, background: 'transparent', border: '1px solid #252525', borderRadius: 8, color: '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, isReadOnly ? 'Fermer' : 'Annuler'),
        !isReadOnly ? React.createElement('button', { onClick: handleSave, style: { flex: 2, padding: 11, background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Enregistrer') : null
      )
    )
  )
}

export default function IdeasPage(props) {
  var onBack = props.onBack
  var pageId = props.pageId

  var notesS = useState([]); var notes = notesS[0]; var setNotes = notesS[1]
  var sharedNotesS = useState([]); var sharedNotes = sharedNotesS[0]; var setSharedNotes = sharedNotesS[1]
  var shareCountsS = useState({}); var shareCounts = shareCountsS[0]; var setShareCounts = shareCountsS[1]
  var loadS = useState(true); var load = loadS[0]; var setLoad = loadS[1]
  var modalS = useState(false); var modalOpen = modalS[0]; var setModalOpen = modalS[1]
  var editingS = useState(null); var editing = editingS[0]; var setEditing = editingS[1]
  var readOnlyS = useState(false); var readOnly = readOnlyS[0]; var setReadOnly = readOnlyS[1]
  var shareModalS = useState(null); var shareModal = shareModalS[0]; var setShareModal = shareModalS[1]
  var filterS = useState(''); var filter = filterS[0]; var setFilter = filterS[1]
  var statusFilterS = useState(''); var statusFilter = statusFilterS[0]; var setStatusFilter = statusFilterS[1]

  useEffect(function() { loadNotes() }, [])

  function loadNotes() {
    setLoad(true)
    if (hasSupabase) {
      var p1 = supabase.from('ideas').select('*').order('created_at', { ascending: false })
      var p2 = pageId
        ? supabase.from('idea_shares').select('idea_id').eq('page_id', pageId).then(function(res) {
            if (res.error || !res.data || res.data.length === 0) return []
            var ids = res.data.map(function(s) { return s.idea_id })
            return supabase.from('ideas').select('*').in('id', ids).then(function(r) { return r.data || [] })
          })
        : Promise.resolve(null)
      var p3 = !pageId
        ? supabase.from('idea_shares').select('idea_id')
        : Promise.resolve(null)

      Promise.all([p1, p2, p3]).then(function(results) {
        var myNotes = results[0].data || []
        setNotes(myNotes)
        if (pageId && results[1]) {
          var myIds = myNotes.map(function(n) { return n.id })
          setSharedNotes((results[1]).filter(function(n) { return myIds.indexOf(n.id) === -1 }))
        }
        if (!pageId && results[2] && !results[2].error) {
          var counts = {}
          ;(results[2].data || []).forEach(function(s) { counts[s.idea_id] = (counts[s.idea_id] || 0) + 1 })
          setShareCounts(counts)
        }
        setLoad(false)
      })
    } else {
      setNotes(loadLocal()); setLoad(false)
    }
  }

  function handleSave(data) {
    if (editing) {
      var updated = notes.map(function(n) { return n.id === editing.id ? Object.assign({}, n, data) : n })
      if (hasSupabase) supabase.from('ideas').update(data).eq('id', editing.id)
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

  var shownShared = sharedNotes.filter(function(n) {
    return !filter || (n.title || '').toLowerCase().indexOf(filter.toLowerCase()) !== -1
  })

  var counts = {}
  STATUSES.forEach(function(s) { counts[s] = notes.filter(function(n) { return n.status === s }).length })

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808' } },

    React.createElement('header', { style: { background: '#0a0a0a', borderBottom: '1px solid #1c1c1c', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
      React.createElement('button', { onClick: onBack, style: { background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 8, color: '#aaa', fontSize: 13, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' } }, '<- Retour'),
      React.createElement('h1', { style: { fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' } }, '💡 Boite à idées'),
      React.createElement('input', { value: filter, onChange: function(e) { setFilter(e.target.value) }, placeholder: 'Rechercher...', style: { marginLeft: 'auto', background: '#161616', border: '1px solid #2a2a2a', borderRadius: 7, padding: '6px 12px', color: '#ddd', fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 180 } })
    ),

    !pageId ? React.createElement('div', { style: { background: '#0d0d0d', borderBottom: '1px solid #181818', padding: '8px 24px', display: 'flex', gap: 8, flexWrap: 'wrap' } },
      React.createElement('button', { onClick: function() { setStatusFilter('') }, style: { padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: !statusFilter ? '1px solid #CC0000' : '1px solid #2a2a2a', background: !statusFilter ? '#CC0000' : 'transparent', color: !statusFilter ? '#fff' : '#888', textTransform: 'uppercase' } }, 'Toutes (' + notes.length + ')'),
      STATUSES.map(function(s) {
        return React.createElement('button', { key: s, onClick: function() { setStatusFilter(statusFilter === s ? '' : s) }, style: { padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: statusFilter === s ? '1px solid #CC0000' : '1px solid #2a2a2a', background: statusFilter === s ? '#CC0000' : 'transparent', color: statusFilter === s ? '#fff' : '#888' } }, s + ' (' + (counts[s] || 0) + ')')
      })
    ) : null,

    React.createElement('main', { style: { flex: 1, padding: 24 } },
      load ? React.createElement('div', { style: { textAlign: 'center', paddingTop: 60, color: '#444' } }, 'Chargement...') :
      React.createElement('div', null,
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: shownShared.length > 0 ? 32 : 0 } },
          !pageId ? React.createElement(AddCard, { onClick: function() { setEditing(null); setReadOnly(false); setModalOpen(true) } }) : null,
          shown.map(function(n) {
            return React.createElement(NoteCard, { key: n.id, note: n, isShared: false, shareCount: shareCounts[n.id] || 0, onEdit: function(note) { setEditing(note); setReadOnly(false); setModalOpen(true) }, onDelete: handleDelete, onToggleTodo: handleToggleTodo })
          })
        ),
        shownShared.length > 0 ? React.createElement('div', null,
          React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: '#1a6fc4', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, paddingTop: 8, borderTop: '1px solid #1a2a3a' } }, '🔗 Partagées avec moi (' + shownShared.length + ')'),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 } },
            shownShared.map(function(n) {
              return React.createElement(NoteCard, { key: n.id, note: n, isShared: true, shareCount: 0, onEdit: function(note) { setEditing(note); setReadOnly(true); setModalOpen(true) }, onDelete: function() {}, onToggleTodo: function() {} })
            })
          )
        ) : null
      )
    ),

    modalOpen ? React.createElement(NoteModal, { note: editing, isReadOnly: readOnly, onSave: handleSave, onClose: function() { setModalOpen(false); setEditing(null) }, onShare: function(note) { setShareModal(note); setModalOpen(false) } }) : null,
    shareModal ? React.createElement(ShareModal, { note: shareModal, onClose: function() { setShareModal(null); loadNotes() } }) : null
  )
}
