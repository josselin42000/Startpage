import React from 'react'

var TOOLS = [
  { id: 'waze', name: 'Waze', icon: '🗺️', color: '#33ccff', desc: 'Itineraire temps reel', url: 'https://www.waze.com/fr/live-map/' },
  { id: 'flights', name: 'Google Flights', icon: '✈️', color: '#4285f4', desc: 'Recherche de vols', url: 'https://www.google.com/travel/flights' },
  { id: 'maps', name: 'Google Maps', icon: '📍', color: '#34a853', desc: 'Cartes et itineraires', url: 'https://maps.google.com' },
  { id: 'translate', name: 'Traducteur', icon: '🌐', color: '#9b3ccf', desc: 'Google Translate', url: 'https://translate.google.com' },
  { id: 'meteo', name: 'Meteo France', icon: '🌦️', color: '#0891b2', desc: 'Previsions completes', url: 'https://www.meteofrance.com' },
  { id: 'calendar', name: 'Agenda', icon: '📅', color: '#CC0000', desc: 'Google Calendar', url: 'https://calendar.google.com' },
]

export default function ToolsPage(props) {
  var onBack = props.onBack

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808' } },
    React.createElement('header', {
      style: { background: '#0a0a0a', borderBottom: '1px solid #1c1c1c', padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 16 }
    },
      React.createElement('button', {
        onClick: onBack,
        style: { background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 8, color: '#aaa', fontSize: 13, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' }
      }, '<- Retour'),
      React.createElement('h1', { style: { fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' } }, 'OUTILS')
    ),
    React.createElement('main', { style: { flex: 1, padding: 28 } },
      React.createElement('p', { style: { fontSize: 11, color: '#444', marginBottom: 24, letterSpacing: '0.05em', textTransform: 'uppercase' } }, 'Cliquer pour ouvrir dans un nouvel onglet'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 } },
        TOOLS.map(function(tool) {
          return React.createElement('div', {
            key: tool.id,
            onClick: function() { window.open(tool.url, '_blank') },
            style: { background: '#1a1a1a', border: '1px solid #282828', borderRadius: 14, padding: '22px 14px 16px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11 },
            onMouseEnter: function(e) { e.currentTarget.style.background = '#222'; e.currentTarget.style.borderColor = '#333' },
            onMouseLeave: function(e) { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#282828' },
          },
            React.createElement('div', { style: { width: 58, height: 58, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tool.color + '18', border: '1px solid ' + tool.color + '44', fontSize: 28 } }, tool.icon),
            React.createElement('div', { style: { fontSize: 12, fontWeight: 600, color: '#ddd', lineHeight: 1.3 } }, tool.name),
            React.createElement('div', { style: { fontSize: 10, color: '#666', lineHeight: 1.3 } }, tool.desc)
          )
        })
      )
    )
  )
}
