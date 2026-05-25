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
var CANTON = { lat: 23.1291, lon: 113.2644 }

function fetchWeather(lat, lon, cb) {
  fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=7')
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

export var WEATHER_ICONS = ICONS
export var WEATHER_DAYS = DAYS

export function useWeatherLocal() {
  var state = useState(null); var data = state[0]; var setData = state[1]
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
  return data
}

export function useWeatherCanton() {
  var state = useState(null); var data = state[0]; var setData = state[1]
  useEffect(function() {
    fetchWeather(CANTON.lat, CANTON.lon, setData)
  }, [])
  return data
}
