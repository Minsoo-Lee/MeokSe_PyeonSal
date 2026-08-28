/**
 * 메뉴 목록 카드에 보여줄 "주재료 요약" 문자열을 만듭니다.
 *
 * 백엔드(GET /daily)가 이미 양념을 제외한 재료 이름 목록(ingredientNames)을 내려주므로,
 * 프론트는 별도 필터링 없이 앞에서부터 maxCount개까지만 보여주고
 * 나머지 개수는 "외 N개"로 표시하기만 하면 된다.
 *
 * 예) getMainIngredientSummary(['돼지고기 앞다리살', '양파']) -> "돼지고기 앞다리살, 양파"
 *     getMainIngredientSummary(['돼지고기 앞다리살', '양파', '대파', '애호박']) -> "돼지고기 앞다리살, 양파, 대파 외 1개"
 */
export function getMainIngredientSummary(ingredientNames, maxCount = 3) {
  const names = ingredientNames ?? []
  if (names.length === 0) return ''

  const shown = names.slice(0, maxCount)
  const remaining = names.length - shown.length

  return remaining > 0 ? `${shown.join(', ')} 외 ${remaining}개` : shown.join(', ')
}
