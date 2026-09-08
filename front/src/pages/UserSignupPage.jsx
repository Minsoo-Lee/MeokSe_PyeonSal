import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signup } from '../api/user'
import { useAuth } from '../context/AuthContext'

/**
 * 구글 로그인 성공했지만 아직 닉네임을 안 정한 사람(user.nicknameSet === false)이
 * RequireAuth에 의해 강제로 오게 되는 화면. 제출하면 POST /user/signup 호출하고,
 * 응답이 userId만 주므로 name/nicknameSet은 여기서 직접 로컬 상태에 반영한다.
 */
export default function UserSignupPage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()

    if (!trimmed) {
      setError('이름을 입력해주세요.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await signup(trimmed)
      updateUser({ ...user, name: trimmed, nicknameSet: true })
      navigate('/', { replace: true })
    } catch {
      setError('저장하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-lg font-semibold text-stone-900">닉네임 설정</p>
        <p className="mt-1 text-sm text-stone-500">먹세편살에서 사용할 이름을 정해주세요.</p>

        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            maxLength={20}
            autoFocus
            className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-900 focus:border-orange-300 focus:outline-none"
          />

          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting ? '저장 중…' : '시작하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
