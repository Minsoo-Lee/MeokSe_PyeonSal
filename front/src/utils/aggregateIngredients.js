/**
 * 선택된 일차들(selectedDays)에 해당하는 메뉴들의 재료를 재료 단위로 묶어서 반환합니다.
 *
 * menuInfos: GET /ingredients/check 응답의 menuInfos 그대로 (각 항목에 day, name,
 * ingredientInfos가 들어있음). 재료가 어느 메뉴 것인지는 이 중첩 구조로 구분합니다.
 *
 * 같은 재료가 여러 날 동일한 양(같은 amountType/Value/Unit/Text)으로 등장하면 한 줄로 합치고,
 * 서로 다른 양으로 등장하면 날짜별로 줄을 나눠서 보여줍니다.
 * EXACT + 같은 단위인 항목들은 합계도 함께 계산합니다.
 */
export function aggregateIngredients(selectedDays, menuInfos) {
  const selectedDaySet = new Set(selectedDays)
  const relevantMenus = menuInfos.filter((menu) => selectedDaySet.has(menu.day))

  // ingredientId -> { name, type, lines: Map<lineKey, { amountType, amountValue, amountUnit, amountText, days: Set }> }
  const grouped = new Map()

  for (const menu of relevantMenus) {
    for (const ing of menu.ingredientInfos ?? []) {
      if (!grouped.has(ing.ingredientId)) {
        grouped.set(ing.ingredientId, { name: ing.name, type: ing.type, lines: new Map() })
      }
      const lines = grouped.get(ing.ingredientId).lines

      const lineKey =
        ing.amountType === 'EXACT'
          ? `EXACT:${ing.amountValue}:${ing.amountUnit}`
          : `APPROX:${ing.amountText}`

      if (!lines.has(lineKey)) {
        lines.set(lineKey, {
          amountType: ing.amountType,
          amountValue: ing.amountValue,
          amountUnit: ing.amountUnit,
          amountText: ing.amountText,
          days: new Set(),
        })
      }
      lines.get(lineKey).days.add(menu.day)
    }
  }

  const result = []
  for (const [ingredientId, { name, type, lines }] of grouped.entries()) {
    const lineList = Array.from(lines.values()).sort((a, b) => Math.min(...a.days) - Math.min(...b.days))

    const displayLines = lineList.map((line) => {
      const dayLabel = Array.from(line.days)
        .sort((a, b) => a - b)
        .map((d) => `${d}일차`)
        .join(', ')
      const amountLabel =
        line.amountType === 'EXACT' ? `${line.amountValue}${line.amountUnit}` : line.amountText
      return { amountLabel, dayLabel }
    })

    // 모든 줄이 EXACT이고 단위가 같으면 합계를 계산 (amount_value는 API에서 int로 내려옴)
    const exactLines = lineList.filter((l) => l.amountType === 'EXACT')
    let totalLabel = null
    if (exactLines.length === lineList.length && exactLines.length > 0) {
      const units = new Set(exactLines.map((l) => l.amountUnit))
      if (units.size === 1) {
        const sum = exactLines.reduce((acc, l) => acc + l.amountValue, 0)
        totalLabel = `${sum}${exactLines[0].amountUnit}`
      }
    }

    result.push({ ingredientId, name, type, lines: displayLines, totalLabel })
  }

  // 분류(type) 기준으로 정렬 후 이름순
  return result.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
}
