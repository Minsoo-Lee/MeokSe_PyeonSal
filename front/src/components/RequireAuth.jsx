import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * 로그인 안 된 상태로 보호된 라우트에 접근하면 /login으로 돌려보낸다.
 * loading 중(토큰은 있는데 /auth/me 응답을 기다리는 중)에는 잠깐 로딩 문구만 보여주고,
 * 섣불리 리다이렉트하지 않는다 (안 그러면 새로고침할 때마다 로그인 페이지가 깜빡임).
 */
export default function RequireAuth() {
  const { token, loading } = useAuth()

  if (loading) {
    return <p className="py-12 text-center text-sm text-stone-400">불러오는 중…</p>
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
