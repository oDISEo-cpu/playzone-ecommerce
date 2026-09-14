import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store';

export default function Dashboard() {
  const { currentUser, orders } = useStore();

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#2D2D2D] mb-4">Debes iniciar sesión</h1>
        <Link to="/login" className="text-[#0070D1] font-medium hover:underline">
          Ir a Iniciar Sesión
        </Link>
      </div>
    );
  }

  const userOrders = orders.filter(o => o.userId === currentUser.id);
  const totalSpent = userOrders.filter(o => o.paymentStatus === 'COMPLETED').reduce((sum, o) => sum + o.total, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-xs font-medium">Completado</span>;
      case 'PENDING': return <span className="text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full text-xs font-medium">Pendiente</span>;
      case 'FAILED': return <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded-full text-xs font-medium">Fallido</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-[#2D2D2D] mb-2">Mi Panel</h1>
      <p className="text-gray-500 mb-8">Hola, {currentUser.name} 👋</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-[#E5E5E5] p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E8F1FB] rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-[#0070D1]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2D2D2D]">{userOrders.length}</p>
              <p className="text-sm text-gray-500">Órdenes</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-[#E5E5E5] p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2D2D2D]">${totalSpent.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Total gastado</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-[#E5E5E5] p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2D2D2D]">
                {userOrders.filter(o => o.paymentStatus === 'PENDING').length}
              </p>
              <p className="text-sm text-gray-500">Pendientes</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Orders */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
        <div className="p-6 border-b border-[#E5E5E5]">
          <h2 className="font-bold text-[#2D2D2D]">Historial de Compras</h2>
        </div>
        {userOrders.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aún no tienes compras</p>
            <Link to="/games" className="text-[#0070D1] text-sm font-medium hover:underline mt-2 inline-block">
              Explorar juegos
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E5E5]">
            {userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
              <div key={order.id} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Orden #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusLabel(order.paymentStatus)}
                    <span className="text-lg font-bold text-[#2D2D2D]">${order.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.items.map(item => (
                    <span key={item.id} className="text-xs bg-[#E8F1FB] text-[#003791] px-2 py-1 rounded-md">
                      {item.game.title} x{item.quantity}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                  {getStatusIcon(order.paymentStatus)}
                  <span>Pago: {order.paymentMethod === 'PAYPAL' ? 'PayPal' : 'Binance (USDT)'}</span>
                  {order.transactionId && (
                    <span className="text-gray-400">• TX: {order.transactionId.slice(0, 12)}...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
