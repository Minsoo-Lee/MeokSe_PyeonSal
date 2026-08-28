// Mock 데이터입니다. 실제 서비스에서는 백엔드 API 응답으로 교체하면 됩니다.
//
// 노션 DB 명세 기준 스키마:
//   Menu:            menu_id, day, recipe
//   Ingredient:      ingredient_id, name, type
//   Menu_Ingredient: menu_ingredient_id, menu_id, ingredient_id,
//                    amount_type('EXACT'|'APPROX'), amount_value, amount_unit, amount_text
//
// 주의: DB 명세의 Menu 테이블에는 "메뉴 이름" 컬럼이 없고 recipe(TEXT)만 있습니다.
// 하지만 기획 문서(기술 문서)의 "N일차 | 메뉴 이름" 카드 요구사항을 만족하려면
// 화면에 표시할 이름이 필요해서, 이 mock 데이터에는 편의상 `name` 필드를 추가해뒀습니다.
// 실제 DB/백엔드에 name 컬럼을 추가할지, recipe에서 파싱해서 쓸지는 확인이 필요합니다.

export const ingredients = [
  { ingredient_id: 1, name: '돼지고기 앞다리살', type: '육류' },
  { ingredient_id: 2, name: '닭가슴살', type: '육류' },
  { ingredient_id: 3, name: '대파', type: '채소' },
  { ingredient_id: 4, name: '양파', type: '채소' },
  { ingredient_id: 5, name: '마늘', type: '양념' },
  { ingredient_id: 6, name: '간장', type: '양념' },
  { ingredient_id: 7, name: '고추장', type: '양념' },
  { ingredient_id: 8, name: '두부', type: '기타' },
  { ingredient_id: 9, name: '애호박', type: '채소' },
  { ingredient_id: 10, name: '계란', type: '기타' },
  { ingredient_id: 11, name: '참기름', type: '양념' },
  { ingredient_id: 12, name: '김치', type: '기타' },
]

const byName = Object.fromEntries(ingredients.map((i) => [i.name, i.ingredient_id]))

export const menus = [
  { menu_id: 1, day: 1, name: '제육볶음', recipe: '돼지고기를 고추장 양념에 재운 뒤 볶아냅니다.' },
  { menu_id: 2, day: 2, name: '닭가슴살 야채볶음', recipe: '닭가슴살과 야채를 굴소스에 볶아냅니다.' },
  { menu_id: 3, day: 3, name: '두부조림', recipe: '두부를 간장 양념에 조려냅니다.' },
  { menu_id: 4, day: 4, name: '애호박전', recipe: '애호박을 계란물에 부쳐냅니다.' },
  { menu_id: 5, day: 5, name: '김치찌개', recipe: '김치와 돼지고기를 넣고 끓입니다.' },
  { menu_id: 6, day: 6, name: '계란말이', recipe: '계란과 대파를 섞어 말아냅니다.' },
  { menu_id: 7, day: 7, name: '닭볶음탕', recipe: '닭고기와 감자, 양파를 매콤하게 볶아 끓입니다.' },
  { menu_id: 8, day: 8, name: '제육볶음', recipe: '돼지고기를 고추장 양념에 재운 뒤 볶아냅니다.' },
  { menu_id: 9, day: 9, name: '두부김치', recipe: '데친 두부와 볶은 김치를 함께 냅니다.' },
  { menu_id: 10, day: 10, name: '애호박새우젓볶음', recipe: '애호박을 새우젓으로 간해 볶아냅니다.' },
  { menu_id: 11, day: 11, name: '닭가슴살 스테이크', recipe: '닭가슴살을 두드려 팬에 구워냅니다.' },
  { menu_id: 12, day: 12, name: '계란찜', recipe: '계란을 풀어 부드럽게 쪄냅니다.' },
  { menu_id: 13, day: 13, name: '돼지고기 김치볶음', recipe: '돼지고기와 김치를 함께 볶아냅니다.' },
  { menu_id: 14, day: 14, name: '두부부침', recipe: '두부를 부쳐 간장 양념장과 함께 냅니다.' },
]

// amount_type: EXACT면 amount_value + amount_unit, APPROX면 amount_text
export const menuIngredients = [
  // 1일차 - 제육볶음
  { menu_ingredient_id: 1, menu_id: 1, ingredient_id: byName['돼지고기 앞다리살'], amount_type: 'EXACT', amount_value: 300, amount_unit: 'g', amount_text: null },
  { menu_ingredient_id: 2, menu_id: 1, ingredient_id: byName['양파'], amount_type: 'EXACT', amount_value: 100, amount_unit: 'g', amount_text: null },
  { menu_ingredient_id: 3, menu_id: 1, ingredient_id: byName['고추장'], amount_type: 'APPROX', amount_value: null, amount_unit: null, amount_text: '2큰술' },
  { menu_ingredient_id: 4, menu_id: 1, ingredient_id: byName['마늘'], amount_type: 'APPROX', amount_value: null, amount_unit: null, amount_text: '적당량' },

  // 2일차 - 닭가슴살 야채볶음
  { menu_ingredient_id: 5, menu_id: 2, ingredient_id: byName['닭가슴살'], amount_type: 'EXACT', amount_value: 250, amount_unit: 'g', amount_text: null },
  { menu_ingredient_id: 6, menu_id: 2, ingredient_id: byName['애호박'], amount_type: 'EXACT', amount_value: 150, amount_unit: 'g', amount_text: null },
  { menu_ingredient_id: 7, menu_id: 2, ingredient_id: byName['대파'], amount_type: 'APPROX', amount_value: null, amount_unit: null, amount_text: '약간' },

  // 3일차 - 두부조림
  { menu_ingredient_id: 8, menu_id: 3, ingredient_id: byName['두부'], amount_type: 'EXACT', amount_value: 1, amount_unit: '모', amount_text: null },
  { menu_ingredient_id: 9, menu_id: 3, ingredient_id: byName['간장'], amount_type: 'APPROX', amount_value: null, amount_unit: null, amount_text: '3큰술' },
  { menu_ingredient_id: 10, menu_id: 3, ingredient_id: byName['대파'], amount_type: 'EXACT', amount_value: 20, amount_unit: 'g', amount_text: null },

  // 4일차 - 애호박전
  { menu_ingredient_id: 11, menu_id: 4, ingredient_id: byName['애호박'], amount_type: 'EXACT', amount_value: 200, amount_unit: 'g', amount_text: null },
  { menu_ingredient_id: 12, menu_id: 4, ingredient_id: byName['계란'], amount_type: 'EXACT', amount_value: 2, amount_unit: '개', amount_text: null },

  // 5일차 - 김치찌개
  { menu_ingredient_id: 13, menu_id: 5, ingredient_id: byName['김치'], amount_type: 'EXACT', amount_value: 300, amount_unit: 'g', amount_text: null },
  { menu_ingredient_id: 14, menu_id: 5, ingredient_id: byName['돼지고기 앞다리살'], amount_type: 'EXACT', amount_value: 200, amount_unit: 'g', amount_text: null },
  { menu_ingredient_id: 15, menu_id: 5, ingredient_id: byName['대파'], amount_type: 'APPROX', amount_value: null, amount_unit: null, amount_text: '약간' },

  // 6일차 - 계란말이
  { menu_ingredient_id: 16, menu_id: 6, ingredient_id: byName['계란'], amount_type: 'EXACT', amount_value: 4, amount_unit: '개', amount_text: null },
  { menu_ingredient_id: 17, menu_id: 6, ingredient_id: byName['대파'], amount_type: 'EXACT', amount_value: 30, amount_unit: 'g', amount_text: null },

  // 7일차 - 닭볶음탕
  { menu_ingredient_id: 18, menu_id: 7, ingredient_id: byName['닭가슴살'], amount_type: 'EXACT', amount_value: 400, amount_unit: 'g', amount_text: null },
  { menu_ingredient_id: 19, menu_id: 7, ingredient_id: byName['양파'], amount_type: 'EXACT', amount_value: 150, amount_unit: 'g', amount_text: null },
  { menu_ingredient_id: 20, menu_id: 7, ingredient_id: byName['고추장'], amount_type: 'APPROX', amount_value: null, amount_unit: null, amount_text: '3큰술' },

  // 8일차 - 제육볶음 (1일차와 동일 메뉴, 재료 동일)
  { menu_ingredient_id: 21, menu_id: 8, ingredient_id: byName['돼지고기 앞다리살'], amount_type: 'EXACT', amount_value: 300, amount_unit: 'g', amount_text: null },
  { menu_ingredient_id: 22, menu_id: 8, ingredient_id: byName['양파'], amount_type: 'EXACT', amount_value: 100, amount_unit: 'g', amount_text: null },
  { menu_ingredient_id: 23, menu_id: 8, ingredient_id: byName['고추장'], amount_type: 'APPROX', amount_value: null, amount_unit: null, amount_text: '2큰술' },

  // 9일차 - 두부김치
  { menu_ingredient_id: 24, menu_id: 9, ingredient_id: byName['두부'], amount_type: 'EXACT', amount_value: 1, amount_unit: '모', amount_text: null },
  { menu_ingredient_id: 25, menu_id: 9, ingredient_id: byName['김치'], amount_type: 'EXACT', amount_value: 200, amount_unit: 'g', amount_text: null },
  { menu_ingredient_id: 26, menu_id: 9, ingredient_id: byName['참기름'], amount_type: 'APPROX', amount_value: null, amount_unit: null, amount_text: '약간' },

  // 10일차 - 애호박새우젓볶음
  { menu_ingredient_id: 27, menu_id: 10, ingredient_id: byName['애호박'], amount_type: 'EXACT', amount_value: 200, amount_unit: 'g', amount_text: null },
  { menu_ingredient_id: 28, menu_id: 10, ingredient_id: byName['마늘'], amount_type: 'APPROX', amount_value: null, amount_unit: null, amount_text: '적당량' },

  // 11일차 - 닭가슴살 스테이크
  { menu_ingredient_id: 29, menu_id: 11, ingredient_id: byName['닭가슴살'], amount_type: 'EXACT', amount_value: 300, amount_unit: 'g', amount_text: null },
  { menu_ingredient_id: 30, menu_id: 11, ingredient_id: byName['마늘'], amount_type: 'APPROX', amount_value: null, amount_unit: null, amount_text: '적당량' },

  // 12일차 - 계란찜
  { menu_ingredient_id: 31, menu_id: 12, ingredient_id: byName['계란'], amount_type: 'EXACT', amount_value: 3, amount_unit: '개', amount_text: null },
  { menu_ingredient_id: 32, menu_id: 12, ingredient_id: byName['대파'], amount_type: 'APPROX', amount_value: null, amount_unit: null, amount_text: '약간' },

  // 13일차 - 돼지고기 김치볶음
  { menu_ingredient_id: 33, menu_id: 13, ingredient_id: byName['돼지고기 앞다리살'], amount_type: 'EXACT', amount_value: 250, amount_unit: 'g', amount_text: null },
  { menu_ingredient_id: 34, menu_id: 13, ingredient_id: byName['김치'], amount_type: 'EXACT', amount_value: 250, amount_unit: 'g', amount_text: null },

  // 14일차 - 두부부침
  { menu_ingredient_id: 35, menu_id: 14, ingredient_id: byName['두부'], amount_type: 'EXACT', amount_value: 1, amount_unit: '모', amount_text: null },
  { menu_ingredient_id: 36, menu_id: 14, ingredient_id: byName['간장'], amount_type: 'APPROX', amount_value: null, amount_unit: null, amount_text: '2큰술' },
]
