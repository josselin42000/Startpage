import React from 'react'
import { useState, useEffect } from 'react'

var ICONS = {
  0:'☀️',1:'🌤️',2:'⛅',3:'☁️',
  45:'🌫️',48:'🌫️',
  51:'🌦️',53:'🌦️',55:'🌧️',
  61:'🌧️',63:'🌧️',65:'🌧️',
  71:'🌨️',73:'🌨️',75:'❄️',
  80:'🌦️',81:'🌧️',82:'⛈️',
  95:'⛈️',96:'⛈️',99:'⛈️',
}

var DAYS = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']

var ST_ETIENNE = { lat: 45.4397, lon: 4.3872 }

function fetchWeather(lat, lon, cb) {
  fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe%2FParis&forecast_days=7')
    .then(function(r) { return r.json() })
    .then(function(d) {
      cb({
        temp: Math.round(d.current.temperature_2m),
        code: d.current.weathercode,
        daily: d.daily,
      })
    })
    .catch(function() {})
}

export default function Weather() {
  var dataState = useState(null); var data = dataState[0]; var setData = dataState[1]
  var openState = useState(false); var open = openState[0]; var setOpen = openState[1]

  useEffect(function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(pos) { fetchWeather(pos.coords.latitude, pos.coords.longitude, setData) },
        function() { fetchWeather(ST_ETIENNE.lat, ST_ETIENNE.lon, setData) },
        { timeout: 5000 }
      )
    } else {
      fetchWeather(ST_ETIENNE.lat, ST_ETIENNE.lon, setData)
    }
  }, [])

  if (!data) return null

  return React.createElement('div', { style: { position: 'relative' } },
    React.createElement('div', {
      onClick: function() { setOpen(function(v) { return !v }) },
      style: { display: 'flex', alignItems: 'center', gap: 6, background: '#141414', border: '1px solid #222', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }
    },
      React.createElement('span', { style: { fontSize: 18 } }, ICONS[data.code] || '🌡️'),
      React.createElement('span', { style: { fontSize: 15, fontWeight: 700, color: '#ddd' } }, data.temp + 'C')
    ),
    open && data.daily ? React.createElement('div', {
      style: { position: 'absolute', top: 44, right: 0, background: '#111', border: '1px solid #252525', borderRadius: 12, padding: 16, zIndex: 100, minWidth: 240, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }
    },
      React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 } }, '7 prochains jours'),
      data.daily.time.map(function(dateStr, i) {
        var d = new Date(dateStr)
        var dayName = DAYS[d.getDay()]
        var max = Math.round(data.daily.temperature_2m_max[i])
        var min = Math.round(data.daily.temperature_2m_min[i])
        var code = data.daily.weathercode[i]
        return React.createElement('div', {
          key: dateStr,
          style: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < 6 ? '1px solid #1a1a1a' : 'none' }
        },
          React.createElement('span', { style: { fontSize: 11, color: '#666', width: 30 } }, dayName),
          React.createElement('span', { style: { fontSize: 18 } }, ICONS[code] || '🌡️'),
          React.createElement('span', { style: { fontSize: 13, fontWeight: 700, color: '#ddd', marginLeft: 'auto' } }, max + 'C'),
          React.createElement('span', { style: { fontSize: 11, color: '#555' } }, min + 'C')
        )
      })
    ) : null
  )
}
