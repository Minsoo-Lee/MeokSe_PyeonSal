import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchMenuDetail, toggleChecked, toggleFavorite } from '../api/menu'
import { CheckBadge, FavoriteBadge } from '../components/RecipeBadgeButtons'
import { ingredientTypeRank } from '../utils/ingredientTypeOrder'

export default function MenuDetailPage() {
  const { menuId } = useParams()
  const [menu, setMenu] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'done'

  useEffect(() => {
    let ignore = false
    setStatus('loading')
    setMenu(null)

    fetchMenuDetail(menuId)
      .then((data) => {
        if (ignore) return
        setMenu(data)
        setStatus('done')
      })
      .catch(() => {
        if (ignore) return
        setStatus('error')
      })

    return () => {
      ignore = true
    }
  }, [menuId])

  // 목록 페이지와 동일하게 낙관적 업데이트 후, 응답이 오면 서버가 돌려준 실제 값으로
  // 덮어쓰고, 실패하면 롤백.
  function handleToggleFavorite() {
    setMenu((prev) => (prev ? { ...prev, favorite: !prev.favorite } : prev))
    toggleFavorite(menuId)
      .then(({ favorite }) => {
        setMenu((prev) => (prev ? { ...prev, favorite } : prev))
      })
      .catch(() => {
        setMenu((prev) => (prev ? { ...prev, favorite: !prev.favorite } : prev))
      })
  }

  function handleToggleChecked() {
    setMenu((prev) => (prev ? { ...prev, checked: !prev.checked } : prev))
    toggleChecked(menuId)
      .then(({ checked }) => {
        setMenu((prev) => (prev ? { ...prev, checked } : prev))
      })
      .catch(() => {
        setMenu((prev) => (prev ? { ...prev, checked: !prev.checked } : prev))
      })
  }

  if (status === 'loading') {
    return (
      <section>
        <p className="text-sm text-stone-400">불러오는 중…</p>
      </section>
    )
  }

  if (status === 'error' || !menu) {
    return (
      <section>
        <p className="text-sm text-stone-500">메뉴를 찾을 수 없습니다.</p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          ← 목록으로
        </Link>
      </section>
    )
  }

  // 재료 타입 순서(육류 > 해산물 > 채소 > 곡류 > 양념 > 기타)대로, 같은 타입 안에서는 이름 가나다순.
  const rows = [...(menu.ingredientInfos ?? [])].sort(
    (a, b) => ingredientTypeRank(a.type) - ingredientTypeRank(b.type) || a.name.localeCompare(b.name)
  )

  return (
    <section>
      <Link
        to={`/?page=${menu.page ?? 1}`}
        className="mb-5 inline-block text-sm font-medium text-stone-500 hover:text-orange-600"
      >
        ← 목록으로
      </Link>

      <div className="mb-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
            {menu.day}일차
          </span>
          <div className="flex items-center gap-2">
            <CheckBadge checked={!!menu.checked} onToggle={handleToggleChecked} />
            <FavoriteBadge favorite={!!menu.favorite} onToggle={handleToggleFavorite} />
          </div>
        </div>
        <h1 className="mt-5 text-2xl font-bold text-stone-900">{menu.name}</h1>
      </div>

      <div className="mb-5 overflow-hidden rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100 text-stone-600">
            <tr>
              <th className="px-4 py-3 font-medium">재료 이름</th>
              <th className="px-4 py-3 font-medium">양</th>
              <th className="px-4 py-3 font-medium">분류</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3 font-medium text-stone-900">{row.name}</td>
                <td className="px-4 py-3 text-stone-700">{row.amount}</td>
                <td className="px-4 py-3 text-stone-500">{row.type}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-stone-400">
                  등록된 재료가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold text-stone-700">레시피</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600">
          {menu.recipe}
        </p>
      </div>

      {menu.videoId && (
        <a
          href={`https://www.youtube.com/watch?v=${menu.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:border-orange-200 hover:shadow-md"
        >
          <div className="flex min-w-0 flex-1 flex-col justify-center p-4">
            <p className="text-sm font-semibold text-stone-900">원본 영상 보기</p>
            <p className="mt-1 truncate text-xs text-stone-400">
              {`https://www.youtube.com/watch?v=${menu.videoId}`}
            </p>
          </div>
          <img
            src={`https://img.youtube.com/vi/${menu.videoId}/hqdefault.jpg`}
            alt="원본 영상 썸네일"
            className="h-24 w-40 flex-shrink-0 object-cover"
          />
        </a>
      )}

      {/* day 기준 이전/다음 메뉴 이동. 0일차(만능양념장 같은 준비용 레시피)도 순환에 포함시킨다. */}
      <div className="mt-5 flex items-center justify-between gap-2">
        {menu.prevMenuId ? (
          <Link
            to={`/menu/${menu.prevMenuId}`}
            className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 transition hover:border-orange-200 hover:text-orange-600"
          >
            <span className="block text-xs text-stone-400">← {menu.prevDay}일차</span>
            <span className="block truncate font-medium">{menu.prevName}</span>
          </Link>
        ) : (
          <span className="flex-1 rounded-lg border border-stone-100 px-4 py-2 text-sm text-stone-300">
            ← 이전 없음
          </span>
        )}
        {menu.nextMenuId ? (
          <Link
            to={`/menu/${menu.nextMenuId}`}
            className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-4 py-2 text-right text-sm text-stone-600 transition hover:border-orange-200 hover:text-orange-600"
          >
            <span className="block text-xs text-stone-400">{menu.nextDay}일차 →</span>
            <span className="block truncate font-medium">{menu.nextName}</span>
          </Link>
        ) : (
          <span className="flex-1 rounded-lg border border-stone-100 px-4 py-2 text-right text-sm text-stone-300">
            다음 없음 →
          </span>
        )}
      </div>
    </section>
  )
}
