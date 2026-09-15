const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
const TOKENS_KEY = 'domora_tokens'

function getTokens() {
  const raw = localStorage.getItem(TOKENS_KEY)
  return raw ? JSON.parse(raw) : null
}

function setTokens(tokens) {
  if (tokens) {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
  } else {
    localStorage.removeItem(TOKENS_KEY)
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const tokens = getTokens()
    if (tokens?.access) {
      headers.Authorization = `Bearer ${tokens.access}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.detail || Object.values(data || {})[0]?.[0] || 'Something went wrong.'
    throw new Error(message)
  }

  return data
}

export const api = {
  register: (payload) => request('/accounts/register/', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/accounts/login/', { method: 'POST', body: payload, auth: false }),
  me: () => request('/accounts/me/'),
  listStaff: () => request('/accounts/staff/'),
  addStaff: (payload) => request('/accounts/staff/', { method: 'POST', body: payload }),
  getTokens,
  setTokens,
}