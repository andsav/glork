import { useState, useCallback } from 'react'

/**
 * Custom hook for HTTP requests
 */
export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (method, url, data = null) => {
    setLoading(true)
    setError(null)

    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        }
      }

      if (data) {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(response.statusText || 'Request failed')
      }

      const result = await response.json()
      setLoading(false)
      return result
    } catch (err) {
      setLoading(false)
      setError(err.message)
      throw err
    }
  }, [])

  const get = useCallback((url) => request('GET', url), [request])
  const post = useCallback((url, data) => request('POST', url, data), [request])
  const put = useCallback((url, data) => request('PUT', url, data), [request])
  const del = useCallback((url) => request('DELETE', url), [request])

  return { get, post, put, del, loading, error, setError }
}

/**
 * Custom hook for WebSocket connections
 */
export function useWebSocket() {
  const [ws, setWs] = useState(null)
  const [connected, setConnected] = useState(false)

  const connect = useCallback((endpoint, onMessage, initialData = null, onClose = null) => {
    // Close existing connection
    if (ws) {
      ws.onclose = null
      ws.close()
    }

    const socket = new WebSocket(endpoint)

    socket.onopen = () => {
      setConnected(true)
      if (initialData) {
        socket.send(JSON.stringify(initialData))
      }
    }

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data)
      onMessage(data)
    }

    socket.onclose = () => {
      setConnected(false)
      if (onClose) onClose()
    }

    socket.onerror = () => {
      setConnected(false)
    }

    setWs(socket)
    return socket
  }, [ws])

  const send = useCallback((data) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
    }
  }, [ws])

  const close = useCallback(() => {
    if (ws) {
      ws.onclose = null
      ws.close()
      setWs(null)
      setConnected(false)
    }
  }, [ws])

  return { connect, send, close, connected }
}
