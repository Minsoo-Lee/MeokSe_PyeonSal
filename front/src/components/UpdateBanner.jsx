import { useAuth } from '../context/AuthContext'
import { markVersionSeen } from '../api/user'

/**
 * 새 버전이 나왔을 때 한 번만 보여주는 업데이트 안내 모달.
 *
 * /auth/me(AuthContext의 user)가 내려주는 appVersion(서버가 아는 "현재 앱 버전")과
 * lastSeenVersion(이 사용자가 마지막으로 확인 누른 버전)을 비교해서, 다르면(= 새 버전이거나
 * 한 번도 안 본 상태) 보여준다. localStorage가 아니라 users 테이블에 저장하므로 기기를
 * 바꾸거나 브라우저 데이터를 지워도 "이미 봤음" 상태가 유지된다.
 *
 * 확인/배경 클릭 시 낙관적으로 먼저 닫고, 서버 저장은 실패해도 조용히 무시한다
 * (최악의 경우 다음 로그인 때 모달이 한 번 더 뜨는 정도라 사용자 흐름을 막을 정도는 아님).
 */
export default function UpdateBanner() {
  const { user, updateUser } = useAuth()

  if (!user?.appVersion || !user.updateNote) return null
  if (user.lastSeenVersion === user.appVersion) return null

  function handleDismiss() {
    const version = user.appVersion
    updateUser({ lastSeenVersion: version })
    markVersionSeen(version).catch(() => {})
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-4"
      onClick={handleDismiss}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-stone-900">🎉 새로운 업데이트! 🎉</h2>
        <p className="mt-4 whitespace-pre-line text-sm leading-loose text-stone-600">
          {user.updateNote}
        </p>

        <button
          type="button"
          onClick={handleDismiss}
          className="mt-6 w-full rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          확인
        </button>
      </div>
    </div>
  )
}
