import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RequireAuth from './components/RequireAuth'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import ErrorPage from './pages/ErrorPage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import UserSignupPage from './pages/UserSignupPage'
import MenuListPage from './pages/MenuListPage'
import MenuDetailPage from './pages/MenuDetailPage'
import IngredientCheckPage from './pages/IngredientCheckPage'
import FavoritesPage from './pages/FavoritesPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

          <Route element={<RequireAuth />}>
            {/* Layout(상단 네비) 없이 단독으로 보여주는 화면 - 온보딩 단계라 메인 네비가 아직 안 어울림 */}
            <Route path="/user/signup" element={<UserSignupPage />} />

            <Route element={<Layout />}>
              <Route path="/" element={<MenuListPage />} />
              <Route path="/menu/:menuId" element={<MenuDetailPage />} />
              <Route path="/ingredients" element={<IngredientCheckPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
