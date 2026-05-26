import React from 'react'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

var COLORS = ['#CC0000','#1a6fc4','#1a8f5c','#9b3ccf','#d97316','#0891b2','#374151','#b45309']
var EMOJIS = ['👤','👑','🎯','💼','🎙️','🔧','📊','🌱','🚗','🏗️','💡','🎬']

function UserPageForm(props) {
  var page = props.page
  var allTiles = props.allTiles
  var onSave = props.onSave
  var onClose = props.onClose

  var slugS = useState(page ? page.slug : ''); var slug = slugS[0]; var setSlug = slugS[1]
  var nameS = useState(page ? page.display_name : ''); var name = nameS[0]; var setName = nameS[1]
  var avatarS = useState(page ? page.avatar : '👤'); var avatar = avatarS[0]; var setAvatar = avatarS[1]
  var colorS = useState(page ? page.color : '#1a6fc4'); var color = colorS[0]; var setColor = colorS[1]
  var pagePinS = useState(page ? (page.page_pin || '') : ''); var pagePin = pagePinS[0]; var setPagePin = pagePinS[1]
  var ideasPinS = useState(page ? (page.ideas_pin || '') : ''); var ideasPin = ideasPinS[0]; var setIdeasPin = ideasPinS[1]
  var showTilesS = useState(page ? page.show_tiles : true); var showTiles = showTilesS[0]; var setShowTiles = showTilesS[1]
  var showIdeasS = useState(page ? page.show_ideas : false); var showIdeas = showIdeasS[0]; var setShowIdeas = showIdeasS[1]
  var showToolsS = useState(page ? page.show_tools : false); var showTools = showToolsS[0]; var setShowTools = showToolsS[1]
  var canAddS = useState(page ? page.can_add_tiles : false); var canAdd = canAddS[0]; var setCanAdd = canAddS[1]
  var imposedS = useState(page ? (page.imposed_tile_ids || []) : []); var imposed = imposedS[0]; var setImposed = imposedS[1]
  var errS = useState(''); var err = errS[0]; var setErr = errS[1]
  var showPinsS = useState(false); var showPins = showPinsS[0]; var setShowPins = showPinsS[1]

  function toggleImposed(id) {
    if (imposed.indexOf(id) === -1) setImposed(imposed.concat([id]))
    else setImposed(imposed.filter(function(x) { return x !== id }))
  }

  function handleSave() {
    if (!name.trim() || !slug.trim()) { setErr('Nom et slug requis'); return }
    var cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
    onSave({
      slug: cleanSlug, display_name: name.trim(), avatar: avatar, color: color,
      show_tiles: showTiles, show_ideas: showIdeas, show_tools: showTools,
      can_add_tiles: canAdd, imposed_tile_ids: imposed,
      page_pin: pagePin.trim(), ideas_pin: ideasPin.trim()
    })
  }

  var inp = { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#e0e0e0', fontSize: 13, fontFamily: 'inherit', outline: 'none' }
  var lbl = { display: 'block', fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }

  function Toggle(tprops) {
    return React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1a1a1a' } },
      React.createElement('div', null,
        React.createElement('div', { style: { fontSize: 13, color: '#ccc', fontWeight: 600 } }, tprops.label),
        tprops.desc ? React.createElement('div', { style: { fontSize: 11, color: '#444', marginTop: 2 } }, tprops.desc) : null
      ),
      React.createElement('div', {
        onClick: function() { tprops.onChange(!tprops.value) },
        style: { width: 44, height: 24, borderRadius: 12, background: tprops.value ? '#CC0000' : '#222', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }
      },
        React.createElement('div', { style: { width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: tprops.value ? 23 : 3, transition: 'left .2s' } })
      )
    )
  }

  return React.createElement('div', {
    onClick: function(e) { if (e.target === e.currentTarget) onClose() },
    style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }
  },
    React.createElement('div', { style: { background: '#111', border: '1px solid #252525', borderRadius: 16, padding: 24, width: '100%', maxWidth: 500, maxHeight: '92vh', overflowY: 'auto' } },
      React.createElement('h2', { style: { fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 } },
        page ? 'Modifier la page' : 'Nouvelle page utilisateur'
      ),

      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 } },
        React.createElement('div', null,
          React.createElement('label', { style: lbl }, 'Nom complet'),
          React.createElement('input', { value: name, onChange: function(e) { setName(e.target.value); if (!page) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-')) }, placeholder: 'Philippe Servant', style: inp, autoFocus: true })
        ),
        React.createElement('div', null,
          React.createElement('label', { style: lbl }, 'Slug URL'),
          React.createElement('input', { value: slug, onChange: function(e) { setSlug(e.target.value) }, placeholder: 'philippe', style: inp }),
          React.createElement('div', { style: { fontSize: 10, color: '#444', marginTop: 4 } }, window.location.origin + '/' + (slug || 'slug'))
        )
      ),

      React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('label', { style: lbl }, 'Avatar'),
        React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
          EMOJIS.map(function(e) {
            return React.createElement('button', { key: e, onClick: function() { setAvatar(e) }, style: { width: 36, height: 36, fontSize: 20, background: avatar === e ? '#CC000025' : '#161616', border: avatar === e ? '1px solid #CC0000' : '1px solid transparent', borderRadius: 8, cursor: 'pointer' } }, e)
          })
        )
      ),

      React.createElement('div', { style: { marginBottom: 20 } },
        React.createElement('label', { style: lbl }, 'Couleur'),
        React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
          COLORS.map(function(c) {
            return React.createElement('div', { key: c, onClick: function() { setColor(c) }, style: { width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: color === c ? '2px solid #fff' : '2px solid transparent', transform: color === c ? 'scale(1.15)' : 'none' } })
          })
        )
      ),

      React.createElement('div', { style: { marginBottom: 20 } },
        React.createElement('label', { style: lbl }, 'Accès'),
        React.createElement(Toggle, { label: 'Voir les liens', desc: 'Liens imposés par l\'admin', value: showTiles, onChange: setShowTiles }),
        React.createElement(Toggle, { label: 'Ajouter ses propres liens', desc: 'L\'utilisateur peut ajouter ses liens', value: canAdd, onChange: setCanAdd }),
        React.createElement(Toggle, { label: 'Boite à idées', value: showIdeas, onChange: setShowIdeas }),
        React.createElement(Toggle, { label: 'Outils', value: showTools, onChange: setShowTools })
      ),

      React.createElement('div', { style: { marginBottom: 20 } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 } },
          React.createElement('label', { style: lbl }, 'Sécurité (optionnel)'),
          React.createElement('button', { onClick: function() { setShowPins(!showPins) }, style: { fontSize: 10, color: '#555', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontFamily: 'inherit' } }, showPins ? 'Masquer' : 'Voir les codes')
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontSize: 11, color: '#555', marginBottom: 6 } }, '🔐 PIN page entière'),
            React.createElement('input', { value: pagePin, onChange: function(e) { setPagePin(e.target.value) }, placeholder: 'Vide = pas de PIN', type: showPins ? 'text' : 'password', style: inp }),
            pagePin ? React.createElement('div', { style: { fontSize: 10, color: '#b45309', marginTop: 4 } }, 'Code : ' + (showPins ? pagePin : '••••••')) : React.createElement('div', { style: { fontSize: 10, color: '#333', marginTop: 4 } }, 'Pas de PIN')
          ),
          React.createElement('div', null,
            React.createElement('div', { style: { fontSize: 11, color: '#555', marginBottom: 6 } }, '💡 PIN boite à idées'),
            React.createElement('input', { value: ideasPin, onChange: function(e) { setIdeasPin(e.target.value) }, placeholder: 'Vide = pas de PIN', type: showPins ? 'text' : 'password', style: inp }),
            ideasPin ? React.createElement('div', { style: { fontSize: 10, color: '#b45309', marginTop: 4 } }, 'Code : ' + (showPins ? ideasPin : '••••••')) : React.createElement('div', { style: { fontSize: 10, color: '#333', marginTop: 4 } }, 'Pas de PIN')
          )
        )
      ),

      showTiles && allTiles.length > 0 ? React.createElement('div', { style: { marginBottom: 20 } },
        React.createElement('label', { style: lbl }, 'Liens imposés (' + imposed.length + ' sélectionnés)'),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, maxHeight: 200, overflowY: 'auto' } },
          allTiles.filter(function(t) { return t.type !== 'folder' }).map(function(t) {
            var sel = imposed.indexOf(t.id) !== -1
            return React.createElement('div', {
              key: t.id, onClick: function() { toggleImposed(t.id) },
              style: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: sel ? '#CC000015' : '#0a0a0a', border: sel ? '1px solid #CC000055' : '1px solid #1e1e1e', borderRadius: 8, cursor: 'pointer' }
            },
              React.createElement('span', { style: { fontSize: 16, flexShrink: 0 } }, t.logo ? '🖼️' : (t.icon || '🔗')),
              React.createElement('span', { style: { fontSize: 12, color: sel ? '#ddd' : '#666', fontWeight: sel ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, t.name),
              sel ? React.createElement('span', { style: { marginLeft: 'auto', color: '#CC0000', fontSize: 14, flexShrink: 0 } }, '✓') : null
            )
          })
        )
      ) : null,

      err ? React.createElement('div', { style: { color: '#CC0000', fontSize: 12, marginBottom: 12 } }, err) : null,

      React.createElement('div', { style: { display: 'flex', gap: 10 } },
        React.createElement('button', { onClick: onClose, style: { flex: 1, padding: 11, background: 'transparent', border: '1px solid #252525', borderRadius: 8, color: '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Annuler'),
        React.createElement('button', { onClick: handleSave, style: { flex: 2, padding: 11, background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Enregistrer')
      )
    )
  )
}

export default function AdminPage(props) {
  var onBack = props.onBack
  var currentUser = props.currentUser

  var usersS = useState([]); var users = usersS[0]; var setUsers = usersS[1]
  var pagesS = useState([]); var pages = pagesS[0]; var setPages = pagesS[1]
  var allTilesS = useState([]); var allTiles = allTilesS[0]; var setAllTiles = allTilesS[1]
  var loadS = useState(true); var load = loadS[0]; var setLoad = loadS[1]
  var tabS = useState('pages'); var tab = tabS[0]; var setTab = tabS[1]
  var formOpenS = useState(false); var formOpen = formOpenS[0]; var setFormOpen = formOpenS[1]
  var editingPageS = useState(null); var editingPage = editingPageS[0]; var setEditingPage = editingPageS[1]

  useEffect(function() { loadAll() }, [])

  function loadAll() {
    setLoad(true)
    Promise.all([
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('user_pages').select('*').order('created_at'),
      supabase.from('tiles').select('id,name,icon,logo,type,cat').order('position')
    ]).then(function(results) {
      if (!results[0].error) setUsers(results[0].data || [])
      if (!results[1].error) setPages(results[1].data || [])
      if (!results[2].error) setAllTiles(results[2].data || [])
      setLoad(false)
    })
  }

  function handleSavePage(data) {
    if (editingPage) {
      supabase.from('user_pages').update(data).eq('id', editingPage.id).select().then(function(res) {
        if (!res.error && res.data) { setPages(pages.map(function(p) { return p.id === editingPage.id ? res.data[0] : p })); setFormOpen(false); setEditingPage(null) }
      })
    } else {
      supabase.from('user_pages').insert([data]).select().then(function(res) {
        if (!res.error && res.data) { setPages(pages.concat([res.data[0]])); setFormOpen(false) }
      })
    }
  }

  function deletePage(id) {
    if (!confirm('Supprimer cette page ?')) return
    supabase.from('user_pages').delete().eq('id', id).then(function() { setPages(pages.filter(function(p) { return p.id !== id })) })
  }

  function changeRole(userId, newRole) {
    supabase.from('profiles').update({ role: newRole }).eq('id', userId).then(function(res) {
      if (!res.error) setUsers(users.map(function(u) { return u.id === userId ? Object.assign({}, u, { role: newRole }) : u }))
    })
  }

  var inp = { background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#e0e0e0', fontSize: 13, fontFamily: 'inherit', outline: 'none' }
  var baseUrl = window.location.origin

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808' } },

    React.createElement('header', { style: { background: '#0a0a0a', borderBottom: '1px solid #1c1c1c', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 } },
      React.createElement('button', { onClick: onBack, style: { background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 8, color: '#aaa', fontSize: 13, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' } }, '<- Retour'),
      React.createElement('h1', { style: { fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' } }, '⚙️ Administration'),
      React.createElement('button', { onClick: function() { setEditingPage(null); setFormOpen(true) }, style: { marginLeft: 'auto', padding: '7px 18px', background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, '+ Nouvelle page')
    ),

    React.createElement('div', { style: { background: '#0d0d0d', borderBottom: '1px solid #181818', padding: '0 24px', display: 'flex' } },
      ['pages', 'membres'].map(function(t) {
        return React.createElement('button', { key: t, onClick: function() { setTab(t) }, style: { padding: '12px 20px', background: 'transparent', border: 'none', borderBottom: tab === t ? '2px solid #CC0000' : '2px solid transparent', color: tab === t ? '#fff' : '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.06em' } },
          t === 'pages' ? 'Pages utilisateurs' : 'Membres'
        )
      })
    ),

    React.createElement('main', { style: { flex: 1, padding: 24, maxWidth: 800, margin: '0 auto', width: '100%' } },
      load ? React.createElement('div', { style: { color: '#444', fontSize: 13, textAlign: 'center', paddingTop: 40 } }, 'Chargement...') :

      tab === 'pages' ? React.createElement('div', null,
        pages.length === 0 ? React.createElement('div', { style: { textAlign: 'center', paddingTop: 40, color: '#333', fontSize: 13 } }, 'Aucune page') :
        pages.map(function(p) {
          return React.createElement('div', { key: p.id, style: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 18, marginBottom: 12 } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
              React.createElement('div', { style: { width: 44, height: 44, borderRadius: '50%', background: (p.color || '#1a6fc4') + '22', border: '2px solid ' + (p.color || '#1a6fc4') + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 } }, p.avatar || '👤'),
              React.createElement('div', { style: { flex: 1, minWidth: 120 } },
                React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: '#ddd' } }, p.display_name),
                React.createElement('a', { href: baseUrl + '/' + p.slug, target: '_blank', rel: 'noopener noreferrer', style: { fontSize: 11, color: '#CC0000', textDecoration: 'none' } }, baseUrl + '/' + p.slug)
              ),
              React.createElement('div', { style: { display: 'flex', gap: 5, flexWrap: 'wrap' } },
                p.show_tiles ? React.createElement('span', { style: { fontSize: 9, color: '#888', border: '1px solid #252525', borderRadius: 10, padding: '2px 8px' } }, '🔗 Liens') : null,
                p.can_add_tiles ? React.createElement('span', { style: { fontSize: 9, color: '#888', border: '1px solid #252525', borderRadius: 10, padding: '2px 8px' } }, '✏️ Peut ajouter') : null,
                p.show_ideas ? React.createElement('span', { style: { fontSize: 9, color: '#888', border: '1px solid #252525', borderRadius: 10, padding: '2px 8px' } }, '💡 Idées') : null,
                p.show_tools ? React.createElement('span', { style: { fontSize: 9, color: '#888', border: '1px solid #252525', borderRadius: 10, padding: '2px 8px' } }, '🛠️ Outils') : null,
                p.page_pin ? React.createElement('span', { style: { fontSize: 9, color: '#b45309', border: '1px solid #b4530933', borderRadius: 10, padding: '2px 8px' } }, '🔐 PIN page') : null,
                p.ideas_pin ? React.createElement('span', { style: { fontSize: 9, color: '#b45309', border: '1px solid #b4530933', borderRadius: 10, padding: '2px 8px' } }, '💡 PIN idées') : null
              ),
              React.createElement('div', { style: { display: 'flex', gap: 8, flexShrink: 0 } },
                React.createElement('button', { onClick: function() { setEditingPage(p); setFormOpen(true) }, style: { padding: '6px 14px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 6, color: '#aaa', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' } }, 'Modifier'),
                React.createElement('button', { onClick: function() { deletePage(p.id) }, style: { padding: '6px 10px', background: 'transparent', border: '1px solid #CC000033', borderRadius: 6, color: '#CC0000', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' } }, '×')
              )
            )
          )
        })
      ) :

      React.createElement('div', null,
        users.length === 0 ? React.createElement('div', { style: { textAlign: 'center', paddingTop: 40, color: '#333', fontSize: 13 } }, 'Aucun membre') :
        users.map(function(u) {
          var isSelf = currentUser && u.id === currentUser.id
          return React.createElement('div', { key: u.id, style: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid #1a1a1a' } },
            React.createElement('div', { style: { width: 38, height: 38, borderRadius: '50%', background: u.role === 'admin' ? '#CC000022' : '#1a1a1a', border: '1px solid ' + (u.role === 'admin' ? '#CC000055' : '#252525'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 } }, u.role === 'admin' ? '👑' : '👤'),
            React.createElement('div', { style: { flex: 1, minWidth: 0 } },
              React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: '#ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                u.email || u.id,
                isSelf ? React.createElement('span', { style: { fontSize: 10, color: '#CC0000', marginLeft: 8 } }, '(vous)') : null
              ),
              React.createElement('div', { style: { fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 } }, u.role || 'user')
            ),
            React.createElement('select', {
              value: u.role || 'user', onChange: function(e) { changeRole(u.id, e.target.value) }, disabled: isSelf,
              style: Object.assign({}, inp, { width: 130, fontSize: 12, opacity: isSelf ? 0.4 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' })
            },
              React.createElement('option', { value: 'user' }, 'Utilisateur'),
              React.createElement('option', { value: 'admin' }, 'Admin')
            )
          )
        })
      )
    ),

    formOpen ? React.createElement(UserPageForm, { page: editingPage, allTiles: allTiles, onSave: handleSavePage, onClose: function() { setFormOpen(false); setEditingPage(null) } }) : null
  )
}
