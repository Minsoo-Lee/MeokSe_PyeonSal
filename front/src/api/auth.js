import { apiFetch } from './client'

/**
 * 현재 로그인된 사용자 정보 조회.
 * 백엔드: GET /auth/me - Authorization 헤더의 JWT로 사용자를 식별해서 내려준다
 * (apiFetch가 헤더를 자동으로 붙여주므로 여기선 그냥 호출만 하면 됨).
 */
export async function fetchMe() {
  return apiFetch('/auth/me')
}
