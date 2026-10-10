import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { useStore } from './store';
import Layout from './components/layout/Layout';
import AdminLayout from './pages/admin/AdminLayout';
import Home from './pages/Home';
import Games from './pages/Games';
import GameDetail from './pages/GameDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminGames from './pages/admin/AdminGames';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  const { theme } = useTheme();
  const { loadGames } = useStore();

  // Cargar juegos desde Supabase al iniciar
  useEffect(() => {
    loadGames();
  }, [loadGames]);

  return (
    <div className={theme || 'light'}>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas con Layout principal */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="games" element={<Games />} />
            <Route path="games/category/:category" element={<Games />} />
            <Route path="games/:id" element={<GameDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>

          {/* Rutas de Admin con AdminLayout (incluye navegación) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/games" replace />} />
            <Route path="games" element={<AdminGames />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;