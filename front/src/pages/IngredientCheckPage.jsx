import { useEffect, useState } from 'react'
import { fetchIngredientCheck } from '../api/ingredient'
import { aggregateIngredients } from '../utils/aggregateIngredients'

export default function IngredientCheckPage() {
  const [menuInfos, setMenuInfos] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'done'

  const [selectedDays, setSelectedDays] = useState(new Set())
  const [anchorDay, setAnchorDay] = useState(null)

  useEffect(() => {
    let ignore = false
    setStatus('loading')

    fetchIngredientCheck()
      .then((data) => {
        if (ignore) return
        setMenuInfos(data ?? [])
        setStatus('done')
      })
      .catch(() => {
        if (ignore) return
        setStatus('error')
      })

    return () => {
      ignore = true
    }
  }, [])

  const sortedMenus = [...menuInfos].sort((a, b) => a.day - b.day)

  /**
   * 카드 클릭 규칙 (날짜 범위 피커랑 동일한 방식):
   *  - 아무것도 선택 안 된 상태에서 누르면: 그 날짜 하나만 선택 + 기준점(anchor)으로 저장
   *  - 이미 기준점이 있는 상태에서 "선택 안 된" 다른 날짜를 누르면: 기준점~그 날짜 사이를 전부 선택
   *  - 이미 "선택된" 날짜를 다시 누르면: 그 날짜 하나만 개별적으로 선택 해제
   */
  function toggleDay(day) {
    setSelectedDays((prev) => {
      const next = new Set(prev)

      if (next.has(day)) {
        next.delete(day)
        if (day === anchorDay) setAnchorDay(null)
        return next
      }

      if (anchorDay === null) {
        setAnchorDay(day)
        next.add(day)
        return next
      }

      const [start, end] = anchorDay < day ? [anchorDay, day] : [day, anchorDay]
      for (let d = start; d <= end; d++) next.add(d)
      return next
    })
  }

  function selectAll() {
    setSelectedDays(new Set(sortedMenus.map((m) => m.day)))
    setAnchorDay(null)
  }

  function clearAll() {
    setSelectedDays(new Set())
    setAnchorDay(null)
  }

  const sortedSelectedDays = Array.from(selectedDays).sort((a, b) => a - b)
  const rows = sortedSelectedDays.length ? aggregateIngredients(sortedSelectedDays, menuInfos) : []

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">다중 일 재료 확인</h1>
        <p className="mt-1 text-sm text-stone-500">
          카드를 눌러 확인할 날짜를 골라보세요. 이어서 다른 카드를 누르면 그 사이 구간이 한 번에 선택돼요.
        </p>
      </div>

      {status === 'error' ? (
        <p className="py-12 text-center text-sm text-red-500">
          메뉴를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>
      ) : status === 'loading' ? (
        <p className="py-12 text-center text-sm text-stone-400">불러오는 중…</p>
      ) : (
        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-stone-500">
                {sortedSelectedDays.length > 0 ? `${sortedSelectedDays.length}일 선택됨` : '선택된 날짜가 없습니다.'}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:border-orange-200 hover:text-orange-600"
                >
                  전체 선택
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:border-orange-200 hover:text-orange-600"
                >
                  선택 해제
                </button>
              </div>
            </div>

            <ul className="grid grid-cols-2 gap-2">
              {sortedMenus.map((menu) => {
                const isSelected = selectedDays.has(menu.day)
                return (
                  <li key={menu.menuId}>
                    <button
                      type="button"
                      onClick={() => toggleDay(menu.day)}
                      aria-pressed={isSelected}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-stone-200 bg-white hover:border-orange-200'
                      }`}
                    >
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isSelected ? 'bg-orange-200 text-orange-800' : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {menu.day}일차
                      </span>
                      <p className="mt-1 truncate text-sm font-medium text-stone-900">{menu.name}</p>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="mt-8 lg:mt-0">
            <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100 text-stone-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">재료 이름</th>
                    <th className="px-4 py-3 font-medium">필요한 양</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {rows.map((row) => (
                    <tr key={row.ingredientId}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-900">{row.name}</p>
                        <span className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-700">
                        {row.lines.map((line, idx) => (
                          <div key={idx}>
                            {line.amountLabel}
                            <span className="ml-1 text-xs text-stone-400">({line.dayLabel})</span>
                          </div>
                        ))}
                        {row.totalLabel && (
                          <div className="mt-1 text-xs font-semibold text-orange-600">합계 {row.totalLabel}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-10 text-center text-stone-400">
                        날짜를 선택하면 필요한 재료가 여기에 표시됩니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
