import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Gamepad2, Users, ShoppingBag, ArrowLeft, Settings } from 'lucide-react';
import { useStore } from '../../store';

export default function AdminLayout() {
  const { currentUser } = useStore();
  const location = useLocation();

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#2D2D2D] mb-4">Acceso Denegado</h1>
        <p className="text-gray-500 mb-4">No tienes permisos para acceder a esta sección.</p>
        <Link to="/" className="text-[#0070D1] font-medium hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/games', label: 'Juegos', icon: Gamepad2 },
    { path: '/admin/users', label: 'Usuarios', icon: Users },
    { path: '/admin/orders', label: 'Órdenes', icon: ShoppingBag },
    { path: '/admin/settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-[#0070D1] mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Volver a la tienda</span>
      </Link>

      <h1 className="text-3xl font-bold text-[#2D2D2D] mb-6">Panel de Administración</h1>

      {/* Nav Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-[#E5E5E5] p-1 mb-8 overflow-x-auto">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              location.pathname === item.path
                ? 'bg-[#003791] text-white'
                : 'text-gray-600 hover:bg-[#E8F1FB]'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
