import React from 'react'
import { useState, useEffect } from 'react'

var ICONS = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '❄️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
}

export default function Weather() {
  var dataState = useState(null)
  var data = dataState[0]; var setData = dataState[1]

  useEffect(function() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(function(pos) {
      var lat = pos.coords.latitude.toFixed(4)
      var lon = pos.coords.longitude.toFixed(4)
      fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,weathercode')
        .then(function(r) { return r.json() })
        .then(function(d) {
          setData({ temp: Math.round(d.current.temperature_2m), code: d.current.weathercode })
        })
        .catch(function() {})
    }, function() {})
  }, [])

  if (!data) return null

  return React.createElement('div', {
    style: { display: 'flex', alignItems: 'center', gap: 6, background: '#141414', border: '1px solid #222', borderRadius: 8, padding: '6px 12px' }
  },
    React.createElement('span', { style: { fontSize: 18 } }, ICONS[data.code] || '🌡️'),
    React.createElement('span', { style: { fontSize: 15, fontWeight: 700, color: '#ddd' } }, data.temp + 'C')
  )
}
