/**
 * 번호 클릭형 페이지네이션. "이전"/"다음"은 한 페이지씩 이동하고(맨 처음/끝에서 비활성화),
 * 가운데엔 현재 페이지가 속한 10개 단위 구간의 번호만 보여준다.
 * 예) 23페이지 중 14페이지에 있으면 11~20이 보이고, 21페이지로 넘어가면 21~23으로 구간이 바뀐다.
 */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const groupStart = Math.floor((page - 1) / 10) * 10 + 1
  const groupEnd = Math.min(groupStart + 9, totalPages)
  const pageNumbers = []
  for (let p = groupStart; p <= groupEnd; p++) pageNumbers.push(p)

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        이전
      </button>

      {pageNumbers.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`min-w-[2rem] rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
            p === page
              ? 'bg-orange-500 text-white'
              : 'text-stone-600 hover:bg-orange-100 hover:text-orange-700'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        다음
      </button>
    </div>
  )
}
