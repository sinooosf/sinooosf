export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export function apiUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${API_BASE}${path}`
}

export async function fetchPublicContent() {
  const response = await fetch(`${API_BASE}/api/public`)
  if (!response.ok) throw new Error('Could not load portfolio content')
  return response.json()
}

export async function sendContactMessage(payload) {
  const response = await fetch(`${API_BASE}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Could not send message')
  }
  return response.json()
}
