import React from 'react'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function AdminPage(props) {
  var onBack = props.onBack
  var currentUser = props.currentUser

  var usersS = useState([]); var users = usersS[0]; var setUsers = usersS[1]
  var loadS = useState(true); var load = loadS[0]; var setLoad = loadS[1]
  var inviteEmailS = useState(''); var inviteEmail = inviteEmailS[0]; var setInviteEmail = inviteEmailS[1]
  var inviteRoleS = useState('user'); var inviteRole = inviteRoleS[0]; var setInviteRole = inviteRoleS[1]
  var msgS = useState(''); var msg = msgS[0]; var setMsg = msgS[1]

  useEffect(function() { loadUsers() }, [])

  function loadUsers() {
    setLoad(true)
    supabase.from('profiles').select('*').order('created_at').then(function(res) {
      if (!res.error && res.data) setUsers(res.data)
      setLoad(false)
    })
  }

  function changeRole(userId, newRole) {
    supabase.from('profiles').update({ role: newRole }).eq('id', userId).then(function(res) {
      if (!res.error) setUsers(users.map(function(u) { return u.id === userId ? Object.assign({}, u, { role: newRole }) : u }))
    })
  }

  function inviteUser() {
    if (!inviteEmail.trim()) return
    setMsg('')
    supabase.auth.admin.inviteUserByEmail(inviteEmail.trim()).then(function(res) {
      if (res.error) { setMsg('Erreur : ' + res.error.message) }
      else { setMsg('Invitation envoyée à ' + inviteEmail); setInviteEmail('') }
    })
  }

  var inp = { background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#e0e0e0', fontSize: 13, fontFamily: 'inherit', outline: 'none' }

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808' } },

    React.createElement('header', { style: { background: '#0a0a0a', borderBottom: '1px solid #1c1c1c', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 } },
      React.createElement('button', { onClick: onBack, style: { background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 8, color: '#aaa', fontSize: 13, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' } }, '<- Retour'),
      React.createElement('h1', { style: { fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' } }, '⚙️ Administration')
    ),

    React.createElement('main', { style: { flex: 1, padding: 24, maxWidth: 700, margin: '0 auto', width: '100%' } },

      // INVITE
      React.createElement('div', { style: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 20 } },
        React.createElement('h2', { style: { fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 } }, 'Inviter un utilisateur'),
        React.createElement('div', { style: { display: 'flex', gap: 10, flexWrap: 'wrap' } },
          React.createElement('input', {
            value: inviteEmail, onChange: function(e) { setInviteEmail(e.target.value) },
            placeholder: 'Email...', type: 'email',
            style: Object.assign({}, inp, { flex: 2, minWidth: 180 }),
            onKeyDown: function(e) { if (e.key === 'Enter') inviteUser() }
          }),
          React.createElement('select', {
            value: inviteRole, onChange: function(e) { setInviteRole(e.target.value) },
            style: Object.assign({}, inp, { flex: 1 })
          },
            React.createElement('option', { value: 'user' }, 'Utilisateur'),
            React.createElement('option', { value: 'admin' }, 'Admin')
          ),
          React.createElement('button', {
            onClick: inviteUser,
            style: { padding: '9px 18px', background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' }
          }, 'Inviter')
        ),
        msg ? React.createElement('div', {
          style: { marginTop: 10, fontSize: 12, color: msg.startsWith('Erreur') ? '#CC0000' : '#1a8f5c', padding: '6px 10px', background: msg.startsWith('Erreur') ? '#1a0000' : '#001a0e', borderRadius: 6 }
        }, msg) : null
      ),

      // USERS LIST
      React.createElement('div', { style: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20 } },
        React.createElement('h2', { style: { fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 } }, 'Membres (' + users.length + ')'),
        load
          ? React.createElement('div', { style: { color: '#444', fontSize: 13 } }, 'Chargement...')
          : users.length === 0
            ? React.createElement('div', { style: { color: '#333', fontSize: 13 } }, 'Aucun membre')
            : users.map(function(u) {
                var isSelf = currentUser && u.id === currentUser.id
                return React.createElement('div', {
                  key: u.id,
                  style: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #1a1a1a' }
                },
                  React.createElement('div', {
                    style: { width: 36, height: 36, borderRadius: '50%', background: u.role === 'admin' ? '#CC000022' : '#1a1a1a', border: '1px solid ' + (u.role === 'admin' ? '#CC000055' : '#252525'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }
                  }, u.role === 'admin' ? '👑' : '👤'),
                  React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                    React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: '#ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                      u.email || u.id,
                      isSelf ? React.createElement('span', { style: { fontSize: 10, color: '#CC0000', marginLeft: 8 } }, '(vous)') : null
                    ),
                    React.createElement('div', { style: { fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 } }, u.role || 'user')
                  ),
                  React.createElement('select', {
                    value: u.role || 'user',
                    onChange: function(e) { changeRole(u.id, e.target.value) },
                    disabled: isSelf,
                    style: Object.assign({}, inp, { width: 130, fontSize: 12, opacity: isSelf ? 0.4 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' })
                  },
                    React.createElement('option', { value: 'user' }, 'Utilisateur'),
                    React.createElement('option', { value: 'admin' }, 'Admin')
                  )
                )
              })
      )
    )
  )
}
