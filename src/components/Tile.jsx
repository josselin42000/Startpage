import React from 'react'
import { useRef, useEffect, useState } from 'react'

function getInitials(name) {
  if (!name) return ''
  return name.split(' ').map(function(w) { return w[0] || '' }).join('').toUpperCase().slice(0, 2)
}

var injected = false

export default function Tile(props) {
  var tile = props.tile
  var editMode = props.editMode
  var index = props.index
  var dragging = props.dragging
  var dragOver = props.dragOver

  var iframeState = useState(false); var showIframe = iframeState[0]; var setShowIframe = iframeState[1]
  var timer = useRef(null)
  var longPressed = useRef(false)

  useEffect(function() {
    if (injected) return; injected = true
    var s = document.createElement('style')
    s.textContent = '@keyframes wobble{0%{transform:rotate(-1.5deg) scale(1.01)}100%{transform:rotate(1.5deg) scale(1.01)}}'
    document.head.appendChild(s)
  }, [])

  function onPressStart() {
    longPressed.current = false
    timer.current = setTimeout(function() { longPressed.current = true; props.onLongPressActivate && props.onLongPressActivate() }, 600)
  }
  function onPressEnd() { clearTimeout(timer.current) }

  function o
