import { useEffect, useRef } from 'react'
import io from 'socket.io-client'

const API_BASE = import.meta.env.VITE_BACKEND_URL
export default function useWebSocket(socketHandlersRef) {
  const socketRef = useRef(null)

  useEffect(() => {
    try {
      socketRef.current = io(API_BASE)

      socketRef.current.on('connect', () => {
        const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
        if (userId) socketRef.current.emit('join-user', userId)
        if (socketHandlersRef && socketHandlersRef.current && socketHandlersRef.current.onConnect) socketHandlersRef.current.onConnect()
      })

      socketRef.current.on('activity-added', (data) => {
        if (socketHandlersRef && socketHandlersRef.current && socketHandlersRef.current.onActivityAdded)
          socketHandlersRef.current.onActivityAdded(data)
      })

      socketRef.current.on('goal-updated', (data) => {
        if (socketHandlersRef && socketHandlersRef.current && socketHandlersRef.current.onGoalUpdated)
          socketHandlersRef.current.onGoalUpdated(data)
      })

      socketRef.current.on('progress-updated', (data) => {
        if (socketHandlersRef && socketHandlersRef.current && socketHandlersRef.current.onProgressUpdated)
          socketHandlersRef.current.onProgressUpdated(data)
      })

      socketRef.current.on('disconnect', () => {
        console.log('WebSocket disconnected')
      })
    } catch (err) {
      console.error('WebSocket init error', err)
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
