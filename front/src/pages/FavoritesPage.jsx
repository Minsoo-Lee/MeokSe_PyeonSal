import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchFavoriteMenus, toggleFavorite } from '../api/menu'
import { getMainIngredientSummary } from '../utils/mainIngredientSummary'
import { FavoriteBadge } from '../components/RecipeBadgeButtons'

const PAGE_SIZE = 8

export default function FavoritesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const [menus, setMenus] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'done'

  useEffect(() => {
    let ignore = false
    setStatus('loading')

    fetchFavoriteMenus({ page, limit: PAGE_SIZE })
      .then((data) => {
        if (ignore) return
        setMenus(data.menuInfos ?? [])
        setTotalCount(data.totalCount ?? 0)
        setStatus('done')
      })
      .catch(() => {
        if (ignore) return
        setStatus('error')
      })

    return () => {
      ignore = true
    }
  }, [page])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  function goToPage(nextPage) {
    setSearchParams(nextPage === 1 ? {} : { page: String(nextPage) })
  }

  // 여기는 "즐겨찾기만" 모아보는 화면이라, 하트를 눌러 취소하면 다른 화면처럼
  // 배지만 바뀌는 게 아니라 목록에서 바로 빠져야 한다. 그래서 먼저 목록에서
  // 낙관적으로 제거해두고, 실패하면 다시 넣어서 롤백한다. (성공 시 totalCount도
  // 같이 줄여준다 - 다음 페이지 여부 계산에 쓰이니까)
  function handleUnfavorite(e, menu) {
    e.preventDefault()
    e.stopPropagation()
    setMenus((prev) => prev.filter((m) => m.menuId !== menu.menuId))
    setTotalCount((prev) => Math.max(0, prev - 1))
    toggleFavorite(menu.menuId).catch(() => {
      setMenus((prev) => (prev.some((m) => m.menuId === menu.menuId) ? prev : [...prev, menu]))
      setTotalCount((prev) => prev + 1)
    })
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">즐겨찾기</h1>
        <p className="mt-1 text-sm text-stone-500">하트를 눌러 즐겨찾기한 메뉴들만 모아봤어요.</p>
      </div>

      {status === 'error' ? (
        <p className="py-12 text-center text-sm text-red-500">
          즐겨찾기 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>
      ) : status === 'loading' ? (
        <p className="py-12 text-center text-sm text-stone-400">불러오는 중…</p>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {menus.map((menu) => (
              <li key={menu.menuId}>
                <Link
                  to={`/menu/${menu.menuId}`}
                  className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                      {menu.day}일차
                    </span>
                    <FavoriteBadge favorite onToggle={(e) => handleUnfavorite(e, menu)} />
                  </div>
                  <p className="mt-3 text-lg font-semibold text-stone-900">{menu.name}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {getMainIngredientSummary(menu.ingredientNames)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {menus.length === 0 && (
            <p className="py-12 text-center text-sm text-stone-400">
              아직 즐겨찾기한 메뉴가 없습니다.
            </p>
          )}

          {menus.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-sm text-stone-500">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
