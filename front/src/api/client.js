const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8082'

/**
 * 공통 API 호출 래퍼.
 * 실패하면 에러를 던지므로, 호출하는 쪽(페이지 컴포넌트)에서 loading/error 상태로 잡아서 처리한다.
 *
 * GET 요청은 body가 없어서 Content-Type 헤더가 필요 없고, 오히려 이 헤더가 있으면
 * 브라우저가 CORS 프리플라이트(OPTIONS)를 강제로 보내게 된다. 그래서 기본 헤더를 강제하지 않고,
 * body가 있는 요청(POST/PUT 등)을 만들 때 호출하는 쪽에서 필요하면 options.headers로 넘기게 한다.
 */
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options)

  if (!res.ok) {
    throw new Error(`API 요청 실패 (${res.status}): ${path}`)
  }

  return res.json()
}
