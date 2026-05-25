import React from 'react'
import { useState, useRef } from 'react'

var EMOJIS = ['🔗','🏠','⚡','📊','💼','🎙️','📷','🛒','🔧','🌱','🎬','📡','💡','🔌','🚗','🎯','🏗️','📱','💻','🗂️','📋','🔐','📣','🌍','💰','📈','🎵','✅','🔍','⚙️','🏢','🎤','🎧','📻','🎞️','🖥️','🔑','🗺️','🚀','💎','🌐','🔭','🛠️','🧩']
var COLORS = ['#CC0000','#1a6fc4','#1a8f5c','#9b3ccf','#d97316','#0891b2','#be185d','#4f46e5','#374151','#b45309','#33ccff','#34a853']

var inputStyle = { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#e0e0e0', fontSize: 13, fontFamily: 'inherit', outline: 'none' }
var labelStyle = { display: 'block', fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }

export default function Modal(props) {
  var tile = props.tile
  var nameState = useState(tile ? tile.name : ''); var name = nameState[0]; var setName = nameState[1]
  var urlState = useState(tile ? tile.url : ''); var url = urlState[0]; var setUrl = urlState[1]
  var catState = useState(tile ? tile.cat : ''); var cat = catState[0]; var setCat = catState[1]
  var iconState = useState(tile ? tile.icon : '🔗'); var icon = iconState[0]; var setIcon = iconState[1]
  var colorState = useState(tile ? tile.color : '#CC0000'); var color = colorState[0]; var setColor = colorState[1]
  var logoState = useState(tile ? tile.logo : ''); var logo = logoState[0]; var setLogo = logoState[1]
  var modeState = useState(tile ? (tile.openMode || 'tab') : 'tab'); var openMode = modeState[0]; var setOpenMode = modeState[1]
  var fileRef = useRef()

  function handleSave() {
    if (!name.trim()) return
    var finalUrl = url.trim() || '#'
    if (finalUrl !== '#' && finalUrl.indexOf('http') !== 0) finalUrl = 'https://' + finalUrl
    props.onSave({ name: name.trim(), url: finalUrl, cat: cat.trim(), icon: icon, color: color, logo: logo, openMode: openMode })
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    var r = new FileReader()
    r.onload = function(ev) { setLogo(ev.target.result) }
    r.readAsDataURL(file)
  }

  return React.createElement('div', {
    onClick: function(e) { if (e.target === e.currentTarget) props.onClose() },
    style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }
  },
    React.createElement('div', { style: { background: '#111', border: '1px solid #252525', borderRadius: 16, padding: 28, width: 420, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' } },
      React.createElement('h2', { style: { fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 22 } }, tile ? 'Modifier' : 'Nouveau lien'),

      React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('label', { style: labelStyle }, 'Nom'),
        React.createElement('input', { value: name, onChange: function(e) { setName(e.target.value) }, placeholder: 'Ex : HubCommerce', style: inputStyle, autoFocus: true })
      ),
      React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('label', { style: labelStyle }, 'URL'),
        React.createElement('input', { value: url, onChange: function(e) { setUrl(e.target.value) }, placeholder: 'https://...', style: inputStyle })
      ),
      React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('label', { style: labelStyle }, "Mode d'ouverture"),
        React.createElement('div', { style: { display: 'flex', gap: 8 } },
          React.createElement('button', { onClick: function() { setOpenMode('tab') }, style: { flex: 1, padding: 10, borderRadius: 8, border: openMode === 'tab' ? '1px solid #CC0000' : '1px solid #2a2a2a', background: openMode === 'tab' ? '#1a0000' : '#0a0a0a', color: openMode === 'tab' ? '#CC0000' : '#666', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, 'Nouvel onglet'),
          React.createElement('button', { onClick: function() { setOpenMode('iframe') }, style: { flex: 1, padding: 10, borderRadius: 8, border: openMode === 'iframe' ? '1px solid #1a6fc4' : '1px solid #2a2a2a', background: openMode === 'iframe' ? '#001a2a' : '#0a0a0a', color: openMode === 'iframe' ? '#1a6fc4' : '#666', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, 'Dans la page')
        ),
        openMode === 'iframe' ? React.createElement('p', { style: { fontSize: 10, color: '#444', marginTop: 6 } }, 'Certains sites bloquent les iframes.') : null
      ),
      React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('label', { style: labelStyle }, 'Categorie'),
        React.createElement('input', { value: cat, onChange: function(e) { setCat(e.target.value) }, placeholder: 'Groupe Linear, SaaS...', style: inputStyle })
      ),
      React.createElement('div', { style: { height: 1, background: '#1a1a1a', margin: '4px 0 14px' } }),
      React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('label', { style: labelStyle }, 'Logo / Image'),
        React.createElement('div', {
          onClick: function() { fileRef.current && fileRef.current.click() },
          onDragOver: function(e) { e.preventDefault() },
          onDrop: function(e) { e.preventDefault(); handleFile(e.dataTransfer.files[0]) },
          style: { width: '100%', height: 80, background: '#0a0a0a', border: '1px dashed #2a2a2a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' }
        },
          logo
            ? React.createElement(React.Fragment, null,
                React.createElement('img', { src: logo, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: 8 } }),
                React.createElement('button', { onClick: function(e) { e.stopPropagation(); setLogo('') }, style: { position: 'absolute', top: 4, right: 4, background: '#CC0000', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 } }, 'x')
              )
            : React.createElement('span', { style: { fontSize: 11, color: '#444', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700 } }, 'Cliquer ou glisser une image')
        ),
        React.createElement('input', { ref: fileRef, type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: function(e) { handleFile(e.target.files[0]) } })
      ),
      React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('label', { style: labelStyle }, '— ou icone emoji'),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 4, maxHeight: 90, overflowY: 'auto' } },
          EMOJIS.map(function(e) {
            return React.createElement('button', { key: e, onClick: function() { setIcon(e); setLogo('') }, style: { width: 32, height: 32, background: icon === e && !logo ? '#CC000025' : '#161616', border: icon === e && !logo ? '1px solid #CC0000' : '1px solid transparent', borderRadius: 6, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, e)
          })
        )
      ),
      React.createElement('div', { style: { marginBottom: 22 } },
        React.createElement('label', { style: labelStyle }, "Couleur d'accentuation"),
        React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
          COLORS.map(function(c) {
            return React.createElement('div', { key: c, onClick: function() { setColor(c) }, style: { width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: color === c ? '2px solid #fff' : '2px solid transparent', transform: color === c ? 'scale(1.15)' : 'none' } })
          })
        )
      ),
      React.createElement('div', { style: { display: 'flex', gap: 10 } },
        React.createElement('button', { onClick: props.onClose, style: { flex: 1, padding: 11, background: 'transparent', border: '1px solid #252525', borderRadius: 8, color: '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Annuler'),
        React.createElement('button', { onClick: handleSave, style: { flex: 2, padding: 11, background: '#CC0000', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' } }, 'Enregistrer')
      )
    )
  )
}
