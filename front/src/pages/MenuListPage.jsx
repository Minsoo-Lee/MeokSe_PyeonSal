import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchDailyMenus, toggleChecked, toggleFavorite } from '../api/menu'
import { getMainIngredientSummary } from '../utils/mainIngredientSummary'
import { CheckBadge, CommentBadge, FavoriteBadge } from '../components/RecipeBadgeButtons'
import CommentModal from '../components/CommentModal'
import Pagination from '../components/Pagination'

const PAGE_SIZE = 8

export default function MenuListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const [menus, setMenus] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'done'
  const [commentMenu, setCommentMenu] = useState(null) // 코멘트 모달 대상 메뉴

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

  // 즐겨찾기/체크는 카드 클릭(상세 이동)과 겹치는 영역에 있어서, 먼저 로컬 상태를
  // 낙관적으로 뒤집어 반응성을 준다. 응답이 오면 서버가 돌려준 실제 값으로 다시
  // 맞춰서(단순 재반전이 아니라 덮어쓰기) 다른 기기에서 동시에 눌렀을 때도 서버
  // 기준으로 수렴하게 하고, 실패하면 원래대로 되돌린다.
  function handleToggleFavorite(e, menuId) {
    e.preventDefault()
    e.stopPropagation()
    setMenus((prev) =>
      prev.map((m) => (m.menuId === menuId ? { ...m, favorite: !m.favorite } : m))
    )
    toggleFavorite(menuId)
      .then(({ favorite }) => {
        setMenus((prev) =>
          prev.map((m) => (m.menuId === menuId ? { ...m, favorite } : m))
        )
      })
      .catch(() => {
        setMenus((prev) =>
          prev.map((m) => (m.menuId === menuId ? { ...m, favorite: !m.favorite } : m))
        )
      })
  }

  function handleToggleChecked(e, menuId) {
    e.preventDefault()
    e.stopPropagation()
    setMenus((prev) =>
      prev.map((m) => (m.menuId === menuId ? { ...m, checked: !m.checked } : m))
    )
    toggleChecked(menuId)
      .then(({ checked }) => {
        setMenus((prev) =>
          prev.map((m) => (m.menuId === menuId ? { ...m, checked } : m))
        )
      })
      .catch(() => {
        setMenus((prev) =>
          prev.map((m) => (m.menuId === menuId ? { ...m, checked: !m.checked } : m))
        )
      })
  }

  // 코멘트 저장 성공 시: 서버가 돌려준 값으로 해당 카드의 배지(파랑/흑백)를 갱신
  function handleCommentSaved(menuId, comment) {
    setMenus((prev) => prev.map((m) => (m.menuId === menuId ? { ...m, comment } : m)))
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
                  <div className="flex items-start justify-between">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                      {menu.day}일차
                    </span>
                    <div className="flex items-center gap-2">
                      <CheckBadge
                        checked={!!menu.checked}
                        onToggle={(e) => handleToggleChecked(e, menu.menuId)}
                      />
                      <FavoriteBadge
                        favorite={!!menu.favorite}
                        onToggle={(e) => handleToggleFavorite(e, menu.menuId)}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="min-w-0 text-lg font-semibold text-stone-900">{menu.name}</p>
                    <CommentBadge
                      className="shrink-0"
                      comment={menu.comment}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setCommentMenu(menu)
                      }}
                    />
                  </div>
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

          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </>
      )}
      <CommentModal
        menu={commentMenu}
        onClose={() => setCommentMenu(null)}
        onSaved={handleCommentSaved}
      />
    </section>
  )
}
