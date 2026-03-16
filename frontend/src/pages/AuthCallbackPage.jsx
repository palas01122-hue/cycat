import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const { setUserFromToken } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      navigate('/login?error=google')
      return
    }

    if (token) {
      localStorage.setItem('cycat_token', token)
      // Decodificar el token para obtener el usuario
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUserFromToken({ id: payload.id, username: payload.username, email: payload.email, avatar: payload.avatar })
        navigate('/')
      } catch {
        navigate('/login?error=token')
      }
    } else {
      navigate('/login')
    }
  }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', flexDirection: 'column', gap: '16px'
    }}>
      <div style={{
        width: 40, height: 40, border: '3px solid #ff6b35',
        borderTopColor: 'transparent', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: '#9b93b8', fontSize: 14 }}>Iniciando sesión con Google...</p>
    </div>
  )
}
