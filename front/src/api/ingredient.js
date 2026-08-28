import { apiFetch } from './client'

/**
 * 다중 일 재료 확인 메인 화면 조회.
 * API 명세(Notion "API 명세" 문서): GET /ingredients/check
 *
 * 응답 자체가 메뉴 목록 배열이다(확정) - {menuInfos: [...]}처럼 감싸져 있지 않고
 * [{menuId, day, name, ingredientInfos}, ...] 형태로 바로 내려온다. 각 항목 안의
 * ingredientInfos로 그 메뉴의 재료가 뭔지 알 수 있다.
 *
 * Request Param 없음 - 카드 선택/재료 합산은 전부 프론트에서 처리하므로 전체 데이터를
 * 한 번에 받아온다.
 */
export async function fetchIngredientCheck() {
  return apiFetch('/ingredients/check')
}
