import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Stock from './pages/Stock'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'

const ProtectedLayout = () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    return <Navigate to="/" replace />
  }
  return <MainLayout><Outlet /></MainLayout>
}

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
