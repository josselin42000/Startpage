import React from 'react'
import { useState } from 'react'
import { supabase } from '../supabase'

export default function AuthPage(props) {
  var onAuth = props.onAuth
  var emailS = useState(''); var email = emailS[0]; var setEmail = emailS[1]
  var passS = useState(''); var pass = passS[0]; var setPass = passS[1]
  var errS = useState(''); var err = errS[0]; var setErr = errS[1]
  var loadS = useState(false); var load = loadS[0]; var setLoad = loadS[1]
  var modeS = useState('login'); var mode = modeS[0]; var setMode = modeS[1]

  function handleSubmit() {
    if (!email.trim() || !pass.trim()) { setErr('Email et mot de passe requis'); return }
    setLoad(true); setErr('')
    var p = mode === 'login'
      ? supabase.auth.signInWithPassword({ email: email.trim(), password: pass.trim() })
      : supabase.auth.signUp({ email: email.trim(), password: pass.trim() })
    p.then(function(res) {
      setLoad(false)
      if (res.error) { setErr(res.error.message); return }
      if (res.data && res.data.user) onAuth(res.data.user)
    })
  }

  var inp = { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '11px 14px', color: '#e0e0e0', fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 12 }

  return React.createElement('div', {
    style: { minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
  },
    React.createElement('div', { style: { width: '100%', maxWidth: 380 } },
      React.createElement('div', { style: { textAlign: 'center', marginBottom: 40 } },
        React.createElement('h1', { style: { fontSize: 26, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
          React.createElement('span', { style: { color: '#fff' } }, 'GROUPE\u00a0'),
          React.createElement('span', { style: { color: '#CC0000' } }, 'LINEAR')
        ),
        React.createElement('p', { style: { fontSize: 12, color: '#555', marginTop: 6 } },
          mode === 'login' ? 'Connexion à votre espace' : 'Créer un compte'
        )
      ),
      React.createElement('div', { style: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: 28 } },
        React.createElement('input', {
          value: email, onChange: function(e) { setEmail(e.target.value) },
          placeholder: 'Email', type: 'email', style: inp, autoFocus: true,
          onKeyDown: function(e) { if (e.key === 'Enter') handleSubmit() }
        }),
        React.createElement('input', {
          value: pass, onChange: function(e) { setPass(e.target.value) },
          placeholder: 'Mot de passe', type: 'password', style: inp,
          onKeyDown: function(e) { if (e.key === 'Enter') handleSubmit() }
        }),
        err ? React.createElement('div', {
          style: { fontSize: 12, color: '#CC0000', marginBottom: 12, padding: '8px 12px', background: '#1a0000', borderRadius: 6, border: '1px solid #CC000033' }
        }, err) : null,
        React.createElement('button', {
          onClick: handleSubmit,
          style: { width: '100%', padding: 13, background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: load ? 'wait' : 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: load ? 0.7 : 1, marginBottom: 12 }
        }, load ? 'Connexion...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'),
        React.createElement('button', {
          onClick: function() { setMode(mode === 'login' ? 'signup' : 'login'); setErr('') },
          style: { width: '100%', padding: 10, background: 'transparent', border: '1px solid #222', borderRadius: 8, color: '#555', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }
        }, mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter')
      )
    )
  )
}
