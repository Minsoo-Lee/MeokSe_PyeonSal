/**
 * 메뉴 카드/상세에서 쓰는 "만들어봤어요" 체크, "즐겨찾기" 하트 뱃지 버튼.
 *
 * 카드 목록(MenuListPage)에서는 <Link> 안쪽에 얹어 쓰므로, 클릭 시 카드 이동을
 * 막기 위한 e.preventDefault()/e.stopPropagation()은 호출하는 쪽(onToggle)에서
 * 처리한다. 이 컴포넌트는 순수하게 표시 + 클릭 위임만 담당.
 *
 * CommentBadge는 위 둘과 달리 토글이 아니라 "코멘트가 있다"는 표시 전용이다.
 * 코멘트가 없으면 배지 자체를 렌더링하지 않는다.
 */

export function CheckBadge({ checked, onToggle, className = '' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      aria-label={checked ? '만들어본 메뉴' : '아직 안 만들어본 메뉴'}
      title="만들어봤어요"
      className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold shadow-sm transition ${
        checked
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : 'border-stone-200 bg-white text-stone-300 hover:border-emerald-300 hover:text-emerald-400'
      } ${className}`}
    >
      ✓
    </button>
  )
}

export function FavoriteBadge({ favorite, onToggle, className = '' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={favorite}
      aria-label={favorite ? '즐겨찾기 취소' : '즐겨찾기 추가'}
      title="즐겨찾기"
      className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm shadow-sm transition ${
        favorite
          ? 'border-rose-300 bg-rose-50 text-rose-500'
          : 'border-stone-200 bg-white text-stone-300 hover:border-rose-200 hover:text-rose-400'
      } ${className}`}
    >
      {favorite ? '♥' : '♡'}
    </button>
  )
}

export function CommentBadge({ comment, className = '' }) {
  // 백엔드에서 코멘트가 내려오면(문자열이면 공백 제외 내용이 있을 때) 배지를 보여주고,
  // null/undefined/빈 문자열이면 아무것도 그리지 않는다.
  const hasComment = typeof comment === 'string' ? comment.trim().length > 0 : !!comment
  if (!hasComment) return null

  return (
    <span
      role="img"
      aria-label="코멘트가 있는 메뉴"
      title="코멘트가 있어요"
      className={`flex h-7 w-7 items-center justify-center rounded-full border border-blue-500 bg-blue-500 text-xs font-bold text-white shadow-sm ${className}`}
    >
      c
    </span>
  )
}
