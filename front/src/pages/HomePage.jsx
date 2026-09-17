import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchIngredientCheck } from '../api/ingredient'
import { fetchFavoriteMenus } from '../api/menu'
import { getMainIngredientSummary } from '../utils/mainIngredientSummary'
import { useAuth } from '../context/AuthContext'

const FAVORITES_PREVIEW_LIMIT = 3

/**
 * 홈 화면. 새 API를 만들지 않고 기존 두 엔드포인트를 조합해서 구성한다:
 *  - GET /menu/ingredients (fetchIngredientCheck): 페이지네이션 없이 전체 메뉴를
 *    day/checked까지 포함해서 내려주므로, 진행 현황(체크 개수)과 "다음 메뉴"
 *    (day가 가장 빠른 미체크 메뉴)를 여기서 클라이언트 계산으로 뽑아낸다.
 *  - GET /menu/favorites (fetchFavoriteMenus): 즐겨찾기 미리보기 3개만 limit으로 요청.
 */
export default function HomePage() {
  const { user } = useAuth()

  const [allMenus, setAllMenus] = useState([])
  const [favorites, setFavorites] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'done'

  useEffect(() => {
    let ignore = false
    setStatus('loading')

    Promise.all([
      fetchIngredientCheck(),
      fetchFavoriteMenus({ page: 1, limit: FAVORITES_PREVIEW_LIMIT }),
    ])
      .then(([menus, favoritesData]) => {
        if (ignore) return
        setAllMenus(menus ?? [])
        setFavorites(favoritesData.menuInfos ?? [])
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

  const totalCount = allMenus.length
  const checkedCount = allMenus.filter((m) => m.checked).length
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

  // "다음 메뉴"는 단순히 day가 가장 빠른 미체크 메뉴가 아니라, 마지막으로 체크한 날 "이후"의
  // 미체크 메뉴를 우선한다 (중간에 별로여서 건너뛴 메뉴를 다시 추천하지 않기 위해).
  // 마지막 체크가 최종일(예: 61일차)이라 이후 메뉴가 없으면, 그제서야 건너뛴 메뉴 중
  // day가 가장 작은(1에 가까운) 것을 보여준다. 미체크 메뉴 자체가 없으면 전부 완료.
  const checkedDays = allMenus.filter((m) => m.checked).map((m) => m.day)
  const lastCheckedDay = checkedDays.length > 0 ? Math.max(...checkedDays) : null
  const uncheckedMenusByDay = [...allMenus].filter((m) => !m.checked).sort((a, b) => a.day - b.day)
  const afterLastChecked =
    lastCheckedDay !== null ? uncheckedMenusByDay.filter((m) => m.day > lastCheckedDay) : uncheckedMenusByDay
  const nextMenu = afterLastChecked[0] ?? uncheckedMenusByDay[0] ?? null
  const nextMenuIngredientNames = nextMenu
    ? (nextMenu.ingredientInfos ?? []).map((ing) => ing.name)
    : []

  if (status === 'loading') {
    return (
      <section>
        <p className="py-12 text-center text-sm text-stone-400">불러오는 중…</p>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section>
        <p className="py-12 text-center text-sm text-red-500">
          정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>
      </section>
    )
  }

  return (
    <section>
      {/* 인사말 + 진행 현황 */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900">
            {user?.name ? `${user.name}님, 안녕하세요 👋` : '안녕하세요 👋'}
          </h1>
          <p className="mt-1 text-sm text-stone-500">오늘은 뭘 만들어볼까요?</p>
        </div>

        {totalCount > 0 && (
          <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 sm:min-w-[240px]">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-semibold text-stone-600">진행 현황</span>
              <span className="font-bold text-orange-600">
                {checkedCount} / {totalCount}일 완료
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-orange-400 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 다음 메뉴 하이라이트 */}
      {nextMenu ? (
        <Link
          to={`/menu/${nextMenu.menuId}`}
          className="mb-8 flex flex-col gap-4 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5 transition hover:border-orange-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-orange-700">
              다음 메뉴
            </p>
            <span className="mb-2 inline-block rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
              {nextMenu.day}일차
            </span>
            <p className="text-lg font-bold text-stone-900">{nextMenu.name}</p>
            <p className="mt-1 text-sm text-stone-500">
              {getMainIngredientSummary(nextMenuIngredientNames) || '아직 안 만들어본 메뉴예요.'}
            </p>
          </div>
          <span className="inline-block flex-shrink-0 rounded-lg bg-orange-500 px-5 py-2.5 text-center text-sm font-bold text-white">
            레시피 보기 →
          </span>
        </Link>
      ) : totalCount > 0 ? (
        <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <p className="text-sm font-semibold text-emerald-700">
            🎉 등록된 메뉴를 전부 만들어봤어요!
          </p>
        </div>
      ) : null}

      {/* 즐겨찾기 미리보기 + 바로가기 */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900">즐겨찾기</h2>
            <Link
              to="/favorites"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              전체보기 →
            </Link>
          </div>

          {favorites.length > 0 ? (
            <ul className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:overflow-visible">
              {favorites.map((menu) => (
                <li key={menu.menuId} className="w-32 flex-shrink-0 lg:w-auto">
                  <Link
                    to={`/menu/${menu.menuId}`}
                    className="block rounded-xl border border-stone-200 bg-white p-3 transition hover:border-orange-200 hover:shadow-md"
                  >
                    <span className="mb-1.5 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                      {menu.day}일차
                    </span>
                    <p className="truncate text-sm font-semibold text-stone-900">{menu.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-stone-200 bg-white py-8 text-center text-sm text-stone-400">
              아직 즐겨찾기한 메뉴가 없습니다.
            </p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:mt-0 lg:grid-cols-1">
          <Link
            to="/menus"
            className="rounded-xl border border-stone-200 bg-white p-4 transition hover:border-orange-200 hover:shadow-md"
          >
            <span className="mb-1.5 block text-lg">📅</span>
            <p className="text-sm font-bold text-stone-900">일별 메뉴</p>
            <p className="text-xs text-stone-500">전체 목록 보기</p>
          </Link>
          <Link
            to="/ingredients"
            className="rounded-xl border border-stone-200 bg-white p-4 transition hover:border-orange-200 hover:shadow-md"
          >
            <span className="mb-1.5 block text-lg">🧺</span>
            <p className="text-sm font-bold text-stone-900">재료 모아보기</p>
            <p className="text-xs text-stone-500">여러 날 한번에</p>
          </Link>
        </div>
      </div>
    </section>
  )
}
