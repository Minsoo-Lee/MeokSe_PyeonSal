import { useAuth } from '../context/AuthContext'
import { markVersionSeen } from '../api/user'

/**
 * 새 버전이 나왔을 때 한 번만 보여주는 업데이트 배너.
 *
 * /auth/me(AuthContext의 user)가 내려주는 appVersion(서버가 아는 "현재 앱 버전")과
 * lastSeenVersion(이 사용자가 마지막으로 닫기 누른 버전)을 비교해서, 다르면(= 새 버전이거나
 * 한 번도 안 닫아본 상태) 보여준다. localStorage가 아니라 users 테이블에 저장하므로 기기를
 * 바꾸거나 브라우저 데이터를 지워도 "이미 봤음" 상태가 유지된다.
 *
 * 닫기를 누르면 낙관적으로 먼저 숨기고, 서버 저장은 실패해도 조용히 무시한다
 * (최악의 경우 다음 로그인 때 배너가 한 번 더 뜨는 정도라 사용자 흐름을 막을 정도는 아님).
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
    <div className="border-b border-orange-200 bg-orange-50">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
        <p className="text-sm text-orange-800">
          <span className="mr-1.5 font-semibold">🎉 새로운 업데이트!</span>
          {user.updateNote}
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium text-orange-600 transition hover:bg-orange-100"
        >
          닫기
        </button>
      </div>
    </div>
  )
}
