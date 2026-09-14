import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store';

export default function Login() {
  const navigate = useNavigate();
  const { login, addToast } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Completa todos los campos');
      return;
    }

    const result = login(email, password);
    if (result.success) {
      addToast(result.message, 'success');
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#003791] rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <h1 className="text-2xl font-bold text-[#2D2D2D]">Bienvenido de vuelta</h1>
            <p className="text-gray-500 mt-1">Inicia sesión en tu cuenta</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#003791] text-white font-semibold rounded-lg hover:bg-[#0070D1] transition-colors"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-[#0070D1] font-medium hover:underline">
                Regístrate
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
            <p className="text-xs text-gray-400 text-center">
              <strong>Admin demo:</strong> admin@playzone.com / AdminMaster2026!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
