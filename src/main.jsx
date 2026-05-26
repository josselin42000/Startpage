import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import UserPage from './components/UserPage.jsx'
import './index.css'

var path = window.location.pathname
var match = path.match(/^\/([a-zA-Z0-9-]+)\/?$/)

if (match && match[1] !== 'index' && match[1] !== 'favicon') {
  ReactDOM.createRoot(document.getElementById('root')).render(
    React.createElement(UserPage, { slug: match[1] })
  )
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    React.createElement(App, null)
  )
}
