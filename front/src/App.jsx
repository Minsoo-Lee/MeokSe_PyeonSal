import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import MenuListPage from './pages/MenuListPage'
import MenuDetailPage from './pages/MenuDetailPage'
import IngredientCheckPage from './pages/IngredientCheckPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<MenuListPage />} />
          <Route path="/menu/:menuId" element={<MenuDetailPage />} />
          <Route path="/ingredients" element={<IngredientCheckPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
