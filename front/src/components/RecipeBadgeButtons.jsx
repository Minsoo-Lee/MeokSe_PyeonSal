/**
 * 메뉴 카드/상세에서 쓰는 "만들어봤어요" 체크, "즐겨찾기" 하트 뱃지 버튼.
 *
 * 카드 목록(MenuListPage)에서는 <Link> 안쪽에 얹어 쓰므로, 클릭 시 카드 이동을
 * 막기 위한 e.preventDefault()/e.stopPropagation()은 호출하는 쪽(onToggle)에서
 * 처리한다. 이 컴포넌트는 순수하게 표시 + 클릭 위임만 담당.
 *
 * CommentBadge는 토글이 아니라 코멘트 작성/수정 모달을 여는 버튼이다. 모든 메뉴에 항상
 * 보이고, 코멘트가 있으면 파란색, 없으면 흑백으로 표시한다.
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

export function CommentBadge({ comment, onClick, className = '' }) {
  // 코멘트가 있으면(공백 제외 내용이 있을 때) 파란색, 없으면 체크/하트처럼 흑백.
  // 눌러서 코멘트 작성/수정 모달을 연다.
  const hasComment = typeof comment === 'string' ? comment.trim().length > 0 : !!comment

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={hasComment ? '코멘트 보기·수정' : '코멘트 작성'}
      title="코멘트"
      className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold shadow-sm transition ${
        hasComment
          ? 'border-blue-500 bg-blue-500 text-white'
          : 'border-stone-200 bg-white text-stone-300 hover:border-blue-300 hover:text-blue-400'
      } ${className}`}
    >
      c
    </button>
  )
}
