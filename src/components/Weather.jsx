import React from 'react'
import { useState } from 'react'
import { useWeatherLocal, WEATHER_ICONS, WEATHER_DAYS } from '../hooks/useWeather'

export default function Weather(props) {
  var forceOpen = props && props.forceOpen
  var data = useWeatherLocal()
  var openState = useState(false); var open = openState[0]; var setOpen = openState[1]
  if (!data) return null

  var showPanel = forceOpen || open

  return React.createElement('div', { style: { position: 'relative' } },
    !forceOpen ? React.createElement('div', {
      onClick: function() { setOpen(function(v) { return !v }) },
      style: { display: 'flex', alignItems: 'center', gap: 6, background: '#141414', border: '1px solid #222', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }
    },
      React.createElement('span', { style: { fontSize: 18 } }, WEATHER_ICONS[data.code] || '🌡️'),
      React.createElement('span', { style: { fontSize: 15, fontWeight: 700, color: '#ddd' } }, data.temp + 'C')
    ) : null,
    showPanel && data.daily ? React.createElement('div', {
      style: {
        position: forceOpen ? 'absolute' : 'absolute',
        top: forceOpen ? 8 : 44,
        left: forceOpen ? '50%' : 'auto',
        right: forceOpen ? 'auto' : 0,
        transform: forceOpen ? 'translateX(-50%)' : 'none',
        background: '#111', border: '1px solid #252525', borderRadius: 12, padding: 16,
        zIndex: 100, minWidth: 260, boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
      }
    },
      React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 } }, 'Meteo Saint-Etienne · 7 jours'),
      data.daily.time.map(function(dateStr, i) {
        var d = new Date(dateStr)
        return React.createElement('div', { key: dateStr, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < 6 ? '1px solid #1a1a1a' : 'none' } },
          React.createElement('span', { style: { fontSize: 12, color: '#888', width: 32, fontWeight: 600 } }, WEATHER_DAYS[d.getDay()]),
          React.createElement('span', { style: { fontSize: 20 } }, WEATHER_ICONS[data.daily.weathercode[i]] || '🌡️'),
          React.createElement('span', { style: { fontSize: 14, fontWeight: 700, color: '#ddd', marginLeft: 'auto' } }, Math.round(data.daily.temperature_2m_max[i]) + 'C'),
          React.createElement('span', { style: { fontSize: 12, color: '#666', marginLeft: 6 } }, Math.round(data.daily.temperature_2m_min[i]) + 'C')
        )
      })
    ) : null
  )
}
