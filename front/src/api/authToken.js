const TOKEN_KEY = 'msps_token'

/**
 * JWT를 localStorage에 저장/조회/삭제하는 아주 작은 헬퍼.
 * api/client.js(요청에 헤더 붙이기)와 context/AuthContext.jsx(로그인/로그아웃 상태 관리)가
 * 같은 저장소 키를 공유해야 해서 별도 파일로 뺐다.
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}
