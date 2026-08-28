import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchDailyMenus } from '../api/menu'
import { getMainIngredientSummary } from '../utils/mainIngredientSummary'

const PAGE_SIZE = 8

export default function MenuListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const [menus, setMenus] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'done'

  useEffect(() => {
    let ignore = false
    setStatus('loading')

    fetchDailyMenus({ page, limit: PAGE_SIZE })
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

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">일별 메뉴</h1>
        <p className="mt-1 text-sm text-stone-500">
          하루에 하나씩, 오늘은 어떤 메뉴인지 확인해보세요.
        </p>
      </div>

      {status === 'error' ? (
        <p className="py-12 text-center text-sm text-red-500">
          메뉴를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
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
            <p className="py-12 text-center text-sm text-stone-400">등록된 메뉴가 없습니다.</p>
          )}

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
        </>
      )}
    </section>
  )
}
