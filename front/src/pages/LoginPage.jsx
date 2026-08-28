import { useSearchParams } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/**
 * "구글로 로그인" 버튼은 fetch가 아니라 그냥 <a href>다 - 백엔드의
 * /oauth2/authorization/google로 브라우저가 직접 페이지 이동을 해야
 * Spring Security의 oauth2Login이 구글로 리다이렉트시켜준다.
 */
export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const isNotAllowed = searchParams.get('error') === 'not_allowed'

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-stone-900">먹세편살</p>
        <p className="mt-1 text-sm text-stone-500">가족 계정으로 로그인해주세요.</p>

        {isNotAllowed && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            허용되지 않은 계정입니다. 가족 계정으로 다시 시도해주세요.
          </p>
        )}

        <a
          href={`${API_BASE_URL}/oauth2/authorization/google`}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-orange-200 hover:bg-orange-50"
        >
          구글로 로그인
        </a>
      </div>
    </div>
  )
}
