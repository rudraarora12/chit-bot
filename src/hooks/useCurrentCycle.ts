import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const API_BASE = 'http://127.0.0.1:5050/api'
const SOCKET_URL = 'http://127.0.0.1:5050'

const CYCLE_REFRESH_EVENTS = [
  'memberCreated',
  'memberUpdated',
  'memberDeleted',
  'paymentUpdated',
  'contributionCreated',
  'auctionCreated',
  'auctionUpdated',
  'riskUpdated',
]

/**
 * Resolve the current cycle from the backend dashboard endpoint so every page
 * shares the same single source of truth, kept up to date via Socket.IO events.
 */
export function useCurrentCycle() {
  const [currentCycle, setCurrentCycle] = useState<number | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const response = await fetch(`${API_BASE}/dashboard`)
        if (!response.ok) return
        const payload = await response.json()
        if (active) setCurrentCycle(payload.data?.currentCycle ?? null)
      } catch {
        // Backend offline: keep the previous resolved cycle.
      }
    }

    load()

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    CYCLE_REFRESH_EVENTS.forEach((event) => socket.on(event, load))

    return () => {
      active = false
      socket.disconnect()
    }
  }, [])

  return currentCycle
}