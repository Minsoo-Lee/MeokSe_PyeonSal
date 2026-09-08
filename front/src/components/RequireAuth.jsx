import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SIGNUP_PATH = '/user/signup'

/**
 * 로그인 안 된 상태로 보호된 라우트에 접근하면 /login으로 돌려보낸다.
 * loading 중(토큰은 있는데 /auth/me 응답을 기다리는 중)에는 잠깐 로딩 문구만 보여주고,
 * 섣불리 리다이렉트하지 않는다 (안 그러면 새로고침할 때마다 로그인 페이지가 깜빡임).
 *
 * 로그인은 됐지만 아직 닉네임을 안 정한 사람(user.nicknameSet === false)은 /user/signup으로
 * 보낸다. 지금 이미 /user/signup에 있다면 또 리다이렉트하면 무한루프가 나니까 그건 제외.
 */
export default function RequireAuth() {
  const { token, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="py-12 text-center text-sm text-stone-400">불러오는 중…</p>
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (user && !user.nicknameSet && location.pathname !== SIGNUP_PATH) {
    return <Navigate to={SIGNUP_PATH} replace />
  }

  return <Outlet />
}
