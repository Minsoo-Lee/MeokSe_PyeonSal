import { clearToken, getToken } from './authToken'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/**
 * 공통 API 호출 래퍼.
 * 실패하면 에러를 던지므로, 호출하는 쪽(페이지 컴포넌트)에서 loading/error 상태로 잡아서 처리한다.
 *
 * 로그인 토큰이 있으면 Authorization: Bearer 헤더를 자동으로 붙인다. 참고: Authorization
 * 헤더는 CORS "단순 요청" 허용 헤더 목록에 없어서, 이 헤더를 붙이는 순간부터는 GET이어도
 * 브라우저가 프리플라이트(OPTIONS)를 보낸다 - 백엔드 SecurityConfig의 CORS 설정에서
 * Authorization을 허용 헤더에, OPTIONS를 허용 메서드에 포함해둔 이유가 이것.
 *
 * 401이 오면(토큰 없음/만료/무효) 저장된 토큰을 지우고 로그인 페이지로 보낸다.
 */
export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = { ...options.headers }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    window.location.href = '/login'
    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.')
  }

  if (!res.ok) {
    throw new Error(`API 요청 실패 (${res.status}): ${path}`)
  }

  return res.json()
}
