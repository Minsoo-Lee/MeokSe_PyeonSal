import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * 백엔드 OAuth2LoginSuccessHandler가 로그인 성공 후 이 경로(/oauth/callback)로 리다이렉트시킨다.
 * 토큰은 URL 프래그먼트(#token=...)에 들어있다 - 서버 로그/Referer에 안 남기려고 쿼리
 * 파라미터 대신 프래그먼트를 쓴 것이므로, 여기서도 location.hash로 직접 읽는다
 * (react-router의 useSearchParams는 쿼리 문자열만 보고 프래그먼트는 못 봄).
 *
 * StrictMode에서 effect가 두 번 실행되는 걸 대비해 ref로 한 번만 처리하도록 막는다.
 */
export default function OAuthCallbackPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const token = new URLSearchParams(window.location.hash.slice(1)).get('token')

    if (token) {
      login(token)
      navigate('/', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [login, navigate])

  return <p className="py-12 text-center text-sm text-stone-400">로그인 처리 중…</p>
}
