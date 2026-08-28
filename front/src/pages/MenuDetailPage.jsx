import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchMenuDetail } from '../api/menu'

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

  const rows = menu.ingredientInfos ?? []

  return (
    <section>
      <Link
        to={`/?page=${menu.page ?? 1}`}
        className="mb-5 inline-block text-sm font-medium text-stone-500 hover:text-orange-600"
      >
        ← 목록으로
      </Link>

      <div className="mb-5">
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          {menu.day}일차
        </span>
        <h1 className="mt-5 text-2xl font-bold text-stone-900">{menu.name}</h1>
      </div>

      <div className="mb-5 overflow-hidden rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100 text-stone-600">
            <tr>
              <th className="px-4 py-3 font-medium">재료 이름</th>
              <th className="px-4 py-3 font-medium">분류</th>
              <th className="px-4 py-3 font-medium">양</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3 font-medium text-stone-900">{row.name}</td>
                <td className="px-4 py-3 text-stone-500">{row.type}</td>
                <td className="px-4 py-3 text-stone-700">{row.amount}</td>
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
    </section>
  )
}
