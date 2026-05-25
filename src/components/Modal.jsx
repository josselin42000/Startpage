import React, { useState, useEffect, useRef } from 'react'

const EMOJIS = ['🔗','🏠','⚡','📊','💼','🎙️','📷','🛒','🔧','🌱','🎬','📡','💡','🔌','🚗','🎯','🏗️','📱','💻','🗂️','📋','🔐','📣','🌍','💰','📈','🎵','✅','🔍','⚙️','🏢','🎤','🎧','📻','🎞️','🖥️','🔑','🗺️','🚀','💎','🌐','🔭','🛠️','🧩']
const COLORS = ['#CC0000','#1a6fc4','#1a8f5c','#9b3ccf','#d97316','#0891b2','#be185d','#4f46e5','#374151','#b45309','#0d9488','#7c3aed']

const inputStyle = {
  width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8,
  padding: '10px 14px', color: '#e0e0e0', fontSize: 14, fontFamily: 'inherit', outline: 'none',
}

const labelStyle = {
  display: 'block', fontSize: 10, fontWeight: 700, color: '#444',
  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7,
}

export default function Modal({ tile, onSave, onClose }) {
  const [name, setName] = useState(tile?.name || '')
  const [url, setUrl] = useState(tile?.url || '')
  const [cat, setCat] = useState(tile?.cat || '')
  const [icon, setIcon] = useState(tile?.icon || '🔗')
  const [color, setColor] = useState(tile?.color || COLORS[0])
  const [logo, setLogo] = useState(tile?.logo || '')
  const fileRef = useRef()

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') handleSave()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [name, url, cat, icon, color, logo])

 const handleSave = () => {
  if (!name.trim()) return
  let finalUrl = url.trim() || '#'
  if (finalUrl !== '#' && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
    finalUrl = 'https://' + finalUrl
  }
  onSave({ name: name.trim(), url: finalUrl, cat: cat.trim(), icon, color, logo })
}

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const r = new FileReader()
    r.onload = (ev) => setLogo(ev.target.result)
    r.readAsDataURL(file)
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        background: '#111', border: '1px solid #252525', borderRadius: 16,
        padding: 30, width: 420, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          ● <span style={{ color: '#CC0000' }}>{tile ? 'Modifier' : 'Nouveau lien'}</span>
        </h2>

        {/* NAME */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nom affiché</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex : HubCommerce" style={inputStyle} autoFocus />
        </div>

        {/* URL */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>URL</label>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." style={inputStyle} />
        </div>

        {/* CAT */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Catégorie</label>
          <input value={cat} onChange={e => setCat(e.target.value)} placeholder="Groupe Linear, SaaS, Outils…" style={inputStyle} />
        </div>

        <div style={{ height: 1, background: '#1a1a1a', margin: '6px 0 18px' }} />

        {/* LOGO UPLOAD */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Logo (image)</label>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#CC0000' }}
            onDragLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a' }}
            onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#2a2a2a'; handleFile(e.dataTransfer.files[0]) }}
            style={{
              width: '100%', height: 90, background: '#0a0a0a', border: '1px dashed #2a2a2a',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', gap: 10, flexDirection: 'column', position: 'relative', overflow: 'hidden',
            }}
          >
            {logo ? (
              <>
                <img src={logo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: 10 }} />
                <button
                  onClick={e => { e.stopPropagation(); setLogo('') }}
                  style={{
                    position: 'absolute', top: 6, right: 6, background: '#CC0000', color: '#fff',
                    border: 'none', borderRadius: '50%', width: 22, height: 22, fontSize: 14,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                  }}
                >×</button>
              </>
            ) : (
              <>
                <span style={{ fontSize: 22, color: '#2a2a2a' }}>🖼️</span>
                <span style={{ fontSize: 11, color: '#333', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700 }}>
                  Cliquer ou glisser une image
                </span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          <span style={{ display: 'block', fontSize: 10, color: '#333', marginTop: 5, letterSpacing: '0.03em' }}>
            PNG, SVG, JPG · Stockée en base de données
          </span>
        </div>

        {/* EMOJI */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>— ou icône emoji</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4, maxHeight: 90, overflowY: 'auto' }}>
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setIcon(e)}
                style={{
                  width: 32, height: 32, background: icon === e ? '#CC000025' : '#161616',
                  border: icon === e ? '1px solid #CC0000' : '1px solid transparent',
                  borderRadius: 6, cursor: 'pointer', fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >{e}</button>
            ))}
          </div>
        </div>

        {/* COLOR */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Couleur d'accentuation</label>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <div
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: color === c ? '2px solid #fff' : '2px solid transparent',
                  transform: color === c ? 'scale(1.18)' : 'none',
                  transition: 'all .12s',
                }}
              />
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: 11, background: 'transparent', border: '1px solid #252525',
              borderRadius: 8, color: '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.07em',
            }}
          >Annuler</button>
          <button
            onClick={handleSave}
            style={{
              flex: 2, padding: 11, background: '#CC0000', border: 'none',
              borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.07em',
            }}
          >Enregistrer</button>
        </div>
      </div>
    </div>
  )
}
