import { useSearchParams } from 'react-router-dom'

/**
 * 백엔드 SecurityConfig의 oauth2Login failureHandler가 리다이렉트하는 경로.
 * (화이트리스트에 없는 계정으로 로그인 시도했을 때 등) /error?message=... 형태로 옴.
 */
export default function ErrorPage() {
  const [searchParams] = useSearchParams()
  const message = searchParams.get('message')

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-stone-900">로그인 실패</p>
        <p className="mt-2 text-sm text-stone-500">
          {message ?? '알 수 없는 오류가 발생했습니다.'}
        </p>
        <a
          href="/login"
          className="mt-6 inline-block rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-orange-200 hover:bg-orange-50"
        >
          다시 로그인하기
        </a>
      </div>
    </div>
  )
}
