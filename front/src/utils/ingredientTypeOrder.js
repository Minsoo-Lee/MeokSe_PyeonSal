/**
 * 재료 타입 표시 순서: 주재료(단백질/해물) -> 채소 -> 곡류 -> 기타 -> 양념(맨 뒤).
 * 재료를 타입별로 묶거나 정렬해서 보여주는 화면(재료 모아보기, 메뉴 상세 등)에서 공통으로 쓴다.
 * (재료 모아보기 쪽은 애초에 양념이 안 내려오므로 이 순서 변경의 영향이 없고, 메뉴 상세에서만 체감됨.)
 */
export const INGREDIENT_TYPE_ORDER = ['육류', '해산물', '채소', '곡류', '기타', '양념']

/**
 * 정렬용 순위. 못 알아본 타입(오타 등)이 오면 목록 맨 뒤로 보낸다.
 */
export function ingredientTypeRank(type) {
  const idx = INGREDIENT_TYPE_ORDER.indexOf(type)
  return idx === -1 ? INGREDIENT_TYPE_ORDER.length : idx
}
