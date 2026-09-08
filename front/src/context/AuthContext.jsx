import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { fetchMe } from '../api/auth'
import { clearToken, getToken, setToken as persistToken } from '../api/authToken'

const AuthContext = createContext(null)

/**
 * 로그인 상태(JWT + 유저 정보)를 앱 전체에서 공유하기 위한 컨텍스트.
 *
 * 토큰 자체는 localStorage(authToken.js)에 저장하고, 여기서는 그 토큰이 유효한지
 * /auth/me로 확인해서 user 정보를 채운다. 토큰이 만료/무효면 apiFetch가 401을 받아
 * 알아서 로그인 페이지로 보내지만, 여기서도 fetchMe 실패 시 토큰을 지워 상태를 맞춘다.
 */
export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken())
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    setLoading(true)
    fetchMe()
      .then((data) => {
        if (ignore) return
        setUser(data)
      })
      .catch(() => {
        if (ignore) return
        clearToken()
        setTokenState(null)
        setUser(null)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [token])

  const login = useCallback((newToken) => {
    persistToken(newToken)
    setTokenState(newToken)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setTokenState(null)
    setUser(null)
  }, [])

  // /user/signup처럼 서버 응답이 user 전체가 아니라 일부(userId 등)만 내려줄 때,
  // 새로고침 없이 로컬 user 상태만 즉시 갱신하려고 노출해둠 (RequireAuth가 이 값을 보고 분기함).
  const updateUser = useCallback((partialOrNewUser) => {
    setUser((prev) => ({ ...prev, ...partialOrNewUser }))
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.')
  }
  return ctx
}
