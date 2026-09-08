import { apiFetch } from './client'

/**
 * 일별 메뉴 목록 조회.
 * GET /menu/daily?page=&limit= (구 /daily에서 이름 변경. 컨트롤러가 @RequestMapping("/menu")
 * 밑에 @GetMapping("/daily")로 확정해서 plain /menu가 아니라 /menu/daily로 감)
 *
 * 응답 형태(확정):
 *  - menuInfos: List<MenuInfo>
 *  - totalCount: 전체 메뉴 개수 (페이지네이션 "다음" 버튼 활성화 여부 계산에 사용)
 *  - MenuInfo.ingredientNames: List<String> - 백엔드가 양념을 이미 제외하고 내려주는
 *    재료 이름 목록. 프론트는 추가 필터링 없이 앞에서부터 자르기만 하면 됨.
 *  - MenuInfo.favorite / MenuInfo.checked: 로그인한 사용자 기준 즐겨찾기/체크 여부
 *    (favorite/checks 테이블 조인 결과)
 *    Lombok boolean 필드(favorite/checked) → 게터 isFavorite()/isChecked() → Jackson이
 *    'is' 떼고 JSON 키는 favorite/checked로 내려오므로 프론트도 그대로 그 이름을 씀.
 */
export async function fetchDailyMenus({ page = 1, limit = 8 } = {}) {
  return apiFetch(`/menu/daily?page=${page}&limit=${limit}`)
}

/**
 * 메뉴 상세 조회.
 * GET /menu/{id} (구 /daily/{id}에서 이름 변경)
 *
 * 응답에 이 메뉴가 속한 목록 page 번호가 함께 내려온다(확정) - "목록으로" 클릭 시
 * 원래 보고 있던 페이지로 돌아가기 위해 사용.
 *
 * ingredientInfos의 amount는 API가 이미 "30g"/"적당량" 형태로 포맷해서 내려주므로
 * 프론트에서 추가로 가공하지 않고 그대로 표시한다.
 *
 * videoId: 원본 유튜브 영상의 id (예: "tX5SNYKF2Ow"). 프론트에서 이 값으로
 * 원본 링크(https://www.youtube.com/watch?v={videoId})와 썸네일
 * (https://img.youtube.com/vi/{videoId}/hqdefault.jpg)을 직접 만들어 쓴다.
 *
 * favorite / checked: 목록과 동일
 */
export async function fetchMenuDetail(id) {
  return apiFetch(`/menu/${id}`)
}

/**
 * 즐겨찾기 토글 (POST /menu/{id}/favorite). 이미 즐겨찾기한 상태면 취소, 아니면
 * 등록 - 백엔드가 favorite 테이블에 (user_id, menu_id) 행이 있는지로 판단해서
 * 토글 처리.
 *
 * 응답(확정, AddFavoriteResponse): { favorite: boolean } - 토글 후의 실제 상태.
 * 낙관적 업데이트로 먼저 반전시켜두더라도, 응답이 오면 이 값으로 다시 맞춰서
 * 여러 기기에서 동시에 눌렀을 때도 서버 기준 상태로 수렴하게 한다.
 */
export async function toggleFavorite(id) {
  return apiFetch(`/menu/${id}/favorite`, { method: 'POST' })
}

/**
 * "만들어봤어요" 체크 토글 (POST /menu/{id}/check). checks 테이블 기준으로 토글.
 *
 * 응답(확정, AddCheckResponse): { checked: boolean } - 토글 후의 실제 상태.
 */
export async function toggleChecked(id) {
  return apiFetch(`/menu/${id}/check`, { method: 'POST' })
}

/**
 * 즐겨찾기한 메뉴만 모아보기.
 * GET /menu/favorites?page=&limit= (확정 - FavoritesGetResponse)
 *
 * 응답 형태(확정): /menu/daily랑 동일하게 페이지네이션 있음.
 *  - menuInfos: List<MenuInfo>
 *  - totalCount: 즐겨찾기한 메뉴 전체 개수
 *  - MenuInfo: { menuId, day, name, ingredientNames, favorite }
 *
 * 이 쿼리 자체가 "즐겨찾기한 메뉴만" 가져오는 거라 favorite은 항상 true로 내려온다.
 * 이 화면은 체크 표시를 보여주지 않기로 해서 checked는 아예 안 씀(FavoritesPage 참고).
 */
export async function fetchFavoriteMenus({ page = 1, limit = 8 } = {}) {
  return apiFetch(`/menu/favorites?page=${page}&limit=${limit}`)
}
