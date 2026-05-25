import React from 'react'
import { useState } from 'react'
import { useWeatherLocal, WEATHER_ICONS, WEATHER_DAYS } from '../hooks/useWeather'

export default function Weather() {
  var data = useWeatherLocal()
  var openState = useState(false); var open = openState[0]; var setOpen = openState[1]
  if (!data) return null
  return React.createElement('div', { style: { position: 'relative' } },
    React.createElement('div', {
      onClick: function() { setOpen(function(v) { return !v }) },
      style: { display: 'flex', alignItems: 'center', gap: 6, background: '#141414', border: '1px solid #222', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }
    },
      React.createElement('span', { style: { fontSize: 18 } }, WEATHER_ICONS[data.code] || '🌡️'),
      React.createElement('span', { style: { fontSize: 15, fontWeight: 700, color: '#ddd' } }, data.temp + 'C')
    ),
    open && data.daily ? React.createElement('div', {
      style: { position: 'absolute', top: 44, right: 0, background: '#111', border: '1px solid #252525', borderRadius: 12, padding: 16, zIndex: 100, minWidth: 240, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }
    },
      React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 } }, '7 prochains jours'),
      data.daily.time.map(function(dateStr, i) {
        var d = new Date(dateStr)
        return React.createElement('div', { key: dateStr, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < 6 ? '1px solid #1a1a1a' : 'none' } },
          React.createElement('span', { style: { fontSize: 11, color: '#666', width: 30 } }, WEATHER_DAYS[d.getDay()]),
          React.createElement('span', { style: { fontSize: 18 } }, WEATHER_ICONS[data.daily.weathercode[i]] || '🌡️'),
          React.createElement('span', { style: { fontSize: 13, fontWeight: 700, color: '#ddd', marginLeft: 'auto' } }, Math.round(data.daily.temperature_2m_max[i]) + 'C'),
          React.createElement('span', { style: { fontSize: 11, color: '#555' } }, Math.round(data.daily.temperature_2m_min[i]) + 'C')
        )
      })
    ) : null
  )
}
