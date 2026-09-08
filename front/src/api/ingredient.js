import { apiFetch } from './client'

/**
 * 다중 일 재료 확인 메인 화면 조회.
 * GET /menu/ingredients (구 /ingredients/check에서 이름 변경 - "check"가 방금 만든
 * 체크 기능이랑 이름이 겹쳐서 애매했고, menu 리소스의 재료-상세 버전이라는 의미로 정리)
 *
 * 응답 자체가 메뉴 목록 배열이다(확정) - {menuInfos: [...]}처럼 감싸져 있지 않고
 * [{menuId, day, name, checked, ingredientInfos}, ...] 형태로 바로 내려온다. 각 항목 안의
 * ingredientInfos로 그 메뉴의 재료가 뭔지 알 수 있다.
 *
 * checked: 로그인한 사용자 기준 "만들어봤어요" 체크 여부 (checks 테이블 조회 결과, N+1
 * 없이 배치 조회해서 내려줌). 이 화면 자체는 체크를 토글하는 화면이 아니라 날짜를
 * 골라 재료를 합산해서 보는 화면이라, 이미 만들어본 날짜를 참고용으로만 표시한다.
 *
 * Request Param 없음 - 카드 선택/재료 합산은 전부 프론트에서 처리하므로 전체 데이터를
 * 한 번에 받아온다.
 */
export async function fetchIngredientCheck() {
  return apiFetch('/menu/ingredients')
}
