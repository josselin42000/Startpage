import React from 'react'
import { useWeatherCanton, WEATHER_ICONS, WEATHER_DAYS } from '../hooks/useWeather'

export default function CantonWeatherTooltip() {
  var data = useWeatherCanton()

  if (!data || !data.daily) return React.createElement('div', {
    style: { position: 'absolute', top: 36, right: 0, background: '#111', border: '1px solid #252525', borderRadius: 12, padding: 16, zIndex: 200, minWidth: 220, boxShadow: '0 8px 32px rgba(0,0,0,0.8)' }
  }, React.createElement('div', { style: { fontSize: 11, color: '#444' } }, 'Chargement...'))

  return React.createElement('div', {
    style: { position: 'absolute', top: 36, right: 0, background: '#111', border: '1px solid #cc440044', borderRadius: 12, padding: 16, zIndex: 200, minWidth: 240, boxShadow: '0 8px 32px rgba(0,0,0,0.8)' }
  },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 } },
      React.createElement('span', { style: { fontSize: 16 } }, '🇨🇳'),
      React.createElement('span', { style: { fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' } }, 'Canton · 7 jours'),
      React.createElement('span', { style: { marginLeft: 'auto', fontSize: 20 } }, WEATHER_ICONS[data.code] || '🌡️'),
      React.createElement('span', { style: { fontSize: 15, fontWeight: 700, color: '#cc4400' } }, data.temp + 'C')
    ),
    data.daily.time.map(function(dateStr, i) {
      var d = new Date(dateStr)
      return React.createElement('div', { key: dateStr, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < 6 ? '1px solid #1a1a1a' : 'none' } },
        React.createElement('span', { style: { fontSize: 11, color: '#666', width: 30 } }, WEATHER_DAYS[d.getDay()]),
        React.createElement('span', { style: { fontSize: 18 } }, WEATHER_ICONS[data.daily.weathercode[i]] || '🌡️'),
        React.createElement('span', { style: { fontSize: 13, fontWeight: 700, color: '#cc4400', marginLeft: 'auto' } }, Math.round(data.daily.temperature_2m_max[i]) + 'C'),
        React.createElement('span', { style: { fontSize: 11, color: '#555' } }, Math.round(data.daily.temperature_2m_min[i]) + 'C')
      )
    })
  )
}
