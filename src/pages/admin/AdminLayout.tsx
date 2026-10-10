import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Gamepad2, Users, ShoppingBag, ArrowLeft, Settings } from 'lucide-react';
import { useStore } from '../../store';

export default function AdminLayout() {
  const { currentUser } = useStore();
  const location = useLocation();

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#2D2D2D] dark:text-[#F1F5F9] mb-4">Acceso Denegado</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">No tienes permisos para acceder a esta sección.</p>
        <Link to="/" className="text-[#0070D1] font-medium hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const navItems = [
    { path: '/admin/games', label: 'Juegos', icon: Gamepad2 },
    { path: '/admin/orders', label: 'Órdenes', icon: ShoppingBag },
    { path: '/admin/users', label: 'Usuarios', icon: Users },
    { path: '/admin/settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Volver a la tienda */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#0070D1] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver a la tienda</span>
        </Link>

        {/* Título */}
        <h1 className="text-3xl font-bold text-[#2D2D2D] dark:text-[#F1F5F9] mb-6">
          Panel de Administración
        </h1>

        {/* Navegación con tabs */}
        <div className="flex gap-1 bg-white dark:bg-[#151E32] rounded-xl border border-[#E5E5E5] dark:border-[#1E293B] p-1 mb-8 overflow-x-auto transition-colors">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#003791] dark:bg-[#0070D1] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-[#E8F1FB] dark:hover:bg-[#1E293B]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Contenido de la página */}
        <Outlet />
      </div>
    </div>
  );
}