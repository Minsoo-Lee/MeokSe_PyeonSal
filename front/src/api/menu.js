import { apiFetch } from './client'

/**
 * 일별 메뉴 목록 조회.
 * API 명세(Notion "API 명세" 문서): GET /daily?page=&limit=
 *
 * 응답 형태(확정):
 *  - menuInfos: List<MenuInfo>
 *  - totalCount: 전체 메뉴 개수 (페이지네이션 "다음" 버튼 활성화 여부 계산에 사용)
 *  - MenuInfo.ingredientNames: List<String> - 백엔드가 양념을 이미 제외하고 내려주는
 *    재료 이름 목록. 프론트는 추가 필터링 없이 앞에서부터 자르기만 하면 됨.
 */
export async function fetchDailyMenus({ page = 1, limit = 8 } = {}) {
  return apiFetch(`/daily?page=${page}&limit=${limit}`)
}

/**
 * 메뉴 상세 조회.
 * API 명세(Notion "API 명세" 문서): GET /daily/{id}
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
 */
export async function fetchMenuDetail(id) {
  return apiFetch(`/daily/${id}`)
}
