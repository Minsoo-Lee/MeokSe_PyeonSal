import { useEffect, useRef, useState } from 'react'
import { deleteComment, fetchComment, saveComment } from '../api/menu'

export const COMMENT_MAX_LENGTH = 500

/**
 * 메뉴 코멘트 보기/작성/수정/삭제 모달.
 *
 * 사용법: 페이지에서 `commentMenu`(null이면 닫힘, 아니면 { menuId, name }) 상태를 하나
 * 들고 있다가 <CommentModal menu={commentMenu} onClose=... onSaved=... /> 로 렌더링한다.
 * 카드(<Link>) 바깥, 페이지 맨 아래에 두는 게 안전하다(모달 클릭이 카드 이동으로 번지지 않게).
 *
 * 열릴 때 GET /menu/{id}/comment로 최신 코멘트를 가져온다(응답: { comment: string | null }).
 *  - 코멘트가 있으면: 내용을 입력칸에 채워서 보여주고, [수정하기] [삭제하기]
 *    (수정하기는 내용이 비었거나 안 바뀌었으면 비활성화)
 *  - 코멘트가 없으면: "작성된 코멘트가 없습니다" + 빈 입력칸, [저장하기]만 있다.
 * 저장/수정은 POST /menu/{id}/comment, 삭제는 DELETE /menu/{id}/comment.
 * 성공하면 onSaved(menuId, comment)로 결과(삭제면 null)를 넘기고 닫는다.
 *
 * menu.menuId가 바뀌면 key로 내부 상태를 새로 만든다.
 */
export default function CommentModal({ menu, onClose, onSaved }) {
  if (!menu) return null
  return <CommentModalBody key={menu.menuId} menu={menu} onClose={onClose} onSaved={onSaved} />
}

function CommentModalBody({ menu, onClose, onSaved }) {
  const [loadState, setLoadState] = useState('loading') // 'loading' | 'error' | 'done'
  const [original, setOriginal] = useState('') // 서버에 저장돼 있는 코멘트 ('' = 없음)
  const [value, setValue] = useState('')
  const [pending, setPending] = useState(null) // null | 'save' | 'delete'
  const [error, setError] = useState(false)
  const textareaRef = useRef(null)

  const saving = pending !== null
  const hasExisting = original.length > 0
  const trimmed = value.trim()
  // 비어 있으면 못 저장하고(삭제는 삭제하기로), 수정일 땐 안 바뀌었으면 못 누른다.
  const canSubmit = trimmed.length > 0 && (!hasExisting || trimmed !== original)

  // 열릴 때 서버에서 최신 코멘트를 가져온다
  useEffect(() => {
    let ignore = false
    fetchComment(menu.menuId)
      .then((data) => {
        if (ignore) return
        const text = data?.comment ?? ''
        setOriginal(text)
        setValue(text)
        setLoadState('done')
      })
      .catch(() => {
        if (ignore) return
        setLoadState('error')
      })
    return () => {
      ignore = true
    }
  }, [menu.menuId])

  // 코멘트가 없을 때만 바로 입력할 수 있게 포커스 (있을 땐 읽기 먼저라 키보드를 띄우지 않음)
  useEffect(() => {
    if (loadState === 'done' && !hasExisting) textareaRef.current?.focus()
  }, [loadState, hasExisting])

  // 뒤 화면 스크롤 잠금
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  // ESC로 닫기 (처리 중에는 막음)
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, saving])

  async function handleSubmit(e) {
    e.preventDefault()
    if (saving || !canSubmit) return
    setPending('save')
    setError(false)
    try {
      const res = await saveComment(menu.menuId, trimmed)
      onSaved(menu.menuId, res?.comment ?? trimmed)
      onClose()
    } catch {
      setError(true)
      setPending(null)
    }
  }

  async function handleDelete() {
    if (saving) return
    if (!window.confirm('이 코멘트를 삭제할까요?')) return
    setPending('delete')
    setError(false)
    try {
      await deleteComment(menu.menuId)
      onSaved(menu.menuId, null)
      onClose()
    } catch {
      setError(true)
      setPending(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => {
        if (!saving) onClose()
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-label={`${menu.name} 코멘트`}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <p className="min-w-0 truncate text-sm font-semibold text-stone-500">{menu.name}</p>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="닫기"
            className="-mt-1 -mr-1 px-2 text-xl leading-none text-stone-400 hover:text-stone-600"
          >
            ×
          </button>
        </div>

        {loadState === 'loading' && (
          <p className="py-10 text-center text-sm text-stone-400">불러오는 중…</p>
        )}

        {loadState === 'error' && (
          <p className="py-10 text-center text-sm text-red-500">
            코멘트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </p>
        )}

        {loadState === 'done' && (
          <>
            {!hasExisting && (
              <p className="mb-3 text-sm text-stone-400">작성된 코멘트가 없습니다</p>
            )}

            <label
              htmlFor="comment-input"
              className="mb-2 block text-base font-semibold text-stone-900"
            >
              {hasExisting ? '내 코멘트' : '코멘트를 입력하세요:'}
            </label>

            <div className="relative">
              <textarea
                id="comment-input"
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                maxLength={COMMENT_MAX_LENGTH}
                rows={6}
                placeholder="이 메뉴에 대한 코멘트를 남겨보세요."
                className="block w-full resize-none rounded-xl border border-stone-200 p-3 pb-7 text-sm leading-relaxed text-stone-800 outline-none transition focus:border-blue-400"
              />
              <span className="pointer-events-none absolute right-3 bottom-2 text-xs text-stone-400">
                ({value.length}/{COMMENT_MAX_LENGTH})
              </span>
            </div>

            {error && (
              <p className="mt-2 text-sm text-red-500">
                처리하지 못했어요. 잠시 후 다시 시도해주세요.
              </p>
            )}

            <div className="mt-4 flex gap-2">
              {hasExisting ? (
                <>
                  <button
                    type="submit"
                    disabled={saving || !canSubmit}
                    className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
                  >
                    {pending === 'save' ? '수정 중…' : '수정하기'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold text-red-500 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-60"
                  >
                    {pending === 'delete' ? '삭제 중…' : '삭제하기'}
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  disabled={saving || !canSubmit}
                  className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
                >
                  {pending === 'save' ? '저장 중…' : '저장하기'}
                </button>
              )}
            </div>
          </>
        )}
      </form>
    </div>
  )
}
