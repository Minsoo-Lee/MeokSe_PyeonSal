import { NavLink, Outlet } from 'react-router-dom'

const navLinkClass = ({ isActive }) =>
  [
    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
    isActive
      ? 'bg-orange-500 text-white'
      : 'text-stone-600 hover:bg-orange-100 hover:text-orange-700',
  ].join(' ')

export default function Layout() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-lg font-semibold text-stone-900">먹세편살</p>
            <p className="text-xs text-stone-500">레시피 &amp; 재료 확인</p>
          </div>
          <nav className="flex gap-2">
            <NavLink to="/" end className={navLinkClass}>
              일별 메뉴
            </NavLink>
            <NavLink to="/ingredients" className={navLinkClass}>
              재료 확인
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
