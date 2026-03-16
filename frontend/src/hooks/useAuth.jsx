import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('cycat_token')
    if (token) {
      authAPI.getProfile()
        .then(res => setUser(res.data.user))
        .catch(() => localStorage.removeItem('cycat_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login(email, password)
    localStorage.setItem('cycat_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }, [])

  const register = useCallback(async (username, email, password) => {
    const res = await authAPI.register(username, email, password)
    localStorage.setItem('cycat_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }, [])

  const logout = useCallback(async () => {
    try { await authAPI.logout() } catch {}
    localStorage.removeItem('cycat_token')
    setUser(null)
  }, [])

  // Para el callback de Google OAuth
  const setUserFromToken = useCallback((userData) => {
    setUser(userData)
  }, [])

  const loginWithGoogle = useCallback(() => {
    window.location.href = 'http://localhost:3001/api/auth/google'
  }, [])

  return (
    <AuthContext.Provider value={{
      user, loading, isAuthenticated: !!user,
      login, register, logout, setUserFromToken, loginWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
