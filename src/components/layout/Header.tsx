import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, LogOut, LayoutDashboard, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { useTheme } from '../../hooks/useTheme'; // ✅ Asegúrate de tener este hook creado

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { currentUser, cart, logout } = useStore();
  const { theme, toggleTheme } = useTheme(); // ✅ Hook de tema
  const navigate = useNavigate();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/games?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md shadow-sm border-b border-[#E5E5E5] dark:border-[#1E293B] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-[#003791] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-[#003791] dark:text-white font-bold text-xl hidden sm:block transition-colors">PlayZone</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Buscar juegos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#E8F1FB] dark:bg-[#151E32] border border-[#E5E5E5] dark:border-[#1E293B] rounded-full text-sm text-[#2D2D2D] dark:text-[#F1F5F9] placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0070D1] focus:border-transparent transition-colors"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-[#E8F1FB] dark:hover:bg-[#151E32] rounded-full transition-colors"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-[#003791]" />
              )}
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-[#E8F1FB] dark:hover:bg-[#151E32] rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5 text-[#2D2D2D] dark:text-[#F1F5F9]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-[#E8F1FB] dark:hover:bg-[#151E32] rounded-full transition-colors"
                >
                  <User className="w-5 h-5 text-[#2D2D2D] dark:text-[#F1F5F9]" />
                  <span className="text-sm text-[#2D2D2D] dark:text-[#F1F5F9] font-medium">{currentUser.name.split(' ')[0]}</span>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#151E32] rounded-xl shadow-lg border border-[#E5E5E5] dark:border-[#1E293B] py-2 transition-colors"
                    >
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#2D2D2D] dark:text-[#F1F5F9] hover:bg-[#E8F1FB] dark:hover:bg-[#1E293B] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Mi Panel
                      </Link>
                      {currentUser.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-[#2D2D2D] dark:text-[#F1F5F9] hover:bg-[#E8F1FB] dark:hover:bg-[#1E293B] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-[#003791] dark:bg-[#0070D1] text-white text-sm font-medium rounded-full hover:bg-[#0070D1] dark:hover:bg-[#005BB5] transition-colors"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-[#E8F1FB] dark:hover:bg-[#151E32] rounded-full transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-[#003791]" />}
            </button>
            <Link to="/cart" className="relative p-2">
              <ShoppingCart className="w-5 h-5 text-[#2D2D2D] dark:text-[#F1F5F9]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#2D2D2D] dark:text-[#F1F5F9]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Buscar juegos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#E8F1FB] dark:bg-[#151E32] border border-[#E5E5E5] dark:border-[#1E293B] rounded-full text-sm text-[#2D2D2D] dark:text-[#F1F5F9] placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0070D1] transition-colors"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white dark:bg-[#0B1120] border-t border-[#E5E5E5] dark:border-[#1E293B] overflow-hidden transition-colors"
          >
            <div className="px-4 py-4 space-y-3">
              {currentUser ? (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hola, {currentUser.name}</p>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-[#2D2D2D] dark:text-[#F1F5F9] hover:text-[#0070D1]">
                    Mi Panel
                  </Link>
                  {currentUser.role === 'ADMIN' && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-[#2D2D2D] dark:text-[#F1F5F9] hover:text-[#0070D1]">
                      Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="block py-2 text-sm text-red-600 hover:text-red-500">
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm text-[#003791] dark:text-[#0070D1] font-medium"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}