import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/Client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tokens = api.getTokens()
    if (!tokens?.access) {
      setLoading(false)
      return
    }

    api
      .me()
      .then((data) => {
        setUser(data.user)
        setOrganization(data.organization)
        setRole(data.role)
      })
      .catch(() => {
        api.setTokens(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(credentials) {
    const tokens = await api.login(credentials)
    api.setTokens(tokens)
    const data = await api.me()
    setUser(data.user)
    setOrganization(data.organization)
    setRole(data.role)
  }

  async function register(payload) {
    const data = await api.register(payload)
    api.setTokens({ access: data.access, refresh: data.refresh })
    setUser(data.user)
    setOrganization(data.organization)
    setRole('owner')
  }

  function logout() {
    api.setTokens(null)
    setUser(null)
    setOrganization(null)
    setRole(null)
  }

  const value = { user, organization, role, loading, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}