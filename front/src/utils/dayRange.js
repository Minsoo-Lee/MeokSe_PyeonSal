/**
 * "1-3, 5" 같은 프린터식 페이지 범위 문자열을 파싱해서
 * 정렬되고 중복 제거된 일차 배열로 반환합니다. 예) "1-3, 5" -> [1, 2, 3, 5]
 *
 * 잘못된 형식이 섞여 있으면 에러 메시지를 던집니다.
 */
export function parseDayRanges(input) {
  const trimmed = (input ?? '').trim()
  if (!trimmed) {
    throw new Error('일차를 입력해주세요. 예: 1-3, 5')
  }

  const days = new Set()
  const tokens = trimmed.split(',').map((t) => t.trim()).filter(Boolean)

  if (tokens.length === 0) {
    throw new Error('일차를 입력해주세요. 예: 1-3, 5')
  }

  for (const token of tokens) {
    const rangeMatch = token.match(/^(\d+)\s*-\s*(\d+)$/)
    const singleMatch = token.match(/^(\d+)$/)

    if (rangeMatch) {
      const start = Number(rangeMatch[1])
      const end = Number(rangeMatch[2])
      if (start < 1 || end < 1) {
        throw new Error(`"${token}"은(는) 1 이상의 숫자여야 합니다.`)
      }
      if (start > end) {
        throw new Error(`"${token}"의 범위가 올바르지 않습니다. (시작 <= 끝)`)
      }
      for (let d = start; d <= end; d++) days.add(d)
    } else if (singleMatch) {
      const day = Number(singleMatch[1])
      if (day < 1) {
        throw new Error(`"${token}"은(는) 1 이상의 숫자여야 합니다.`)
      }
      days.add(day)
    } else {
      throw new Error(`"${token}"을(를) 이해할 수 없어요. "1-3" 또는 "5" 형식으로 입력해주세요.`)
    }
  }

  return Array.from(days).sort((a, b) => a - b)
}
