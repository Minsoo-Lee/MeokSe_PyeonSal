import { apiFetch } from './client'

/**
 * 닉네임(이름) 설정 완료.
 * 백엔드: POST /user/signup
 * Request Body: { name: string }
 * Response: { userId: number } - user 전체가 아니라 userId만 내려오므로,
 * 호출한 쪽에서 AuthContext.updateUser로 로컬 user 상태를 직접 갱신해줘야 한다.
 */
export async function signup(name) {
  return apiFetch('/user/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
}
