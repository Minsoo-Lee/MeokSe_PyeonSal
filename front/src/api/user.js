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

/**
 * 업데이트 배너를 닫았을 때, 지금 본 버전을 서버(users.last_seen_version)에 기록.
 * 백엔드: POST /user/version
 * Request Body: { version: string }
 */
export async function markVersionSeen(version) {
  return apiFetch('/user/version', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ version }),
  })
}
