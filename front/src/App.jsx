import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import ErrorPage from './pages/ErrorPage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import MenuListPage from './pages/MenuListPage'
import MenuDetailPage from './pages/MenuDetailPage'
import IngredientCheckPage from './pages/IngredientCheckPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

          {/*
            TODO: 백엔드에 JWT 발급 붙이면 아래 Route를 <Route element={<RequireAuth />}>로
            한 번 더 감싸기. 지금은 OAuth2SuccessHandler가 토큰 없이 그냥 "/"로만 리다이렉트하는
            임시 버전이라, RequireAuth를 씌워두면 로그인에 성공해도 토큰이 없어서 다시 /login으로
            튕겨나가 버림.
          */}
          <Route element={<Layout />}>
            <Route path="/" element={<MenuListPage />} />
            <Route path="/menu/:menuId" element={<MenuDetailPage />} />
            <Route path="/ingredients" element={<IngredientCheckPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
