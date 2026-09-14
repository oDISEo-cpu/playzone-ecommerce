import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, CreditCard, Wallet } from 'lucide-react';
import { useStore } from '../../store';

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useStore();

  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> Completado
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" /> Fallido
          </span>
        );
      default:
        return null;
    }
  };

  const handleStatusChange = (orderId: string, newStatus: 'COMPLETED' | 'FAILED') => {
    updateOrderStatus(orderId, newStatus);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#2D2D2D]">Historial de Ventas ({orders.length})</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
          <p className="text-sm text-gray-500">Completadas</p>
          <p className="text-xl font-bold text-green-600">{orders.filter(o => o.paymentStatus === 'COMPLETED').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="text-xl font-bold text-yellow-600">{orders.filter(o => o.paymentStatus === 'PENDING').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
          <p className="text-sm text-gray-500">Ingresos Completados</p>
          <p className="text-xl font-bold text-[#2D2D2D]">
            ${orders.filter(o => o.paymentStatus === 'COMPLETED').reduce((sum, o) => sum + o.total, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Orders List */}
      {sortedOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-8 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay órdenes aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl border border-[#E5E5E5] p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#2D2D2D]">#{order.id.slice(0, 8)}</span>
                    {getStatusBadge(order.paymentStatus)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{order.userName}</span>
                    <span>•</span>
                    <span>{order.userEmail}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    {order.paymentMethod === 'PAYPAL' ? (
                      <CreditCard className="w-4 h-4" />
                    ) : (
                      <Wallet className="w-4 h-4" />
                    )}
                    <span>{order.paymentMethod === 'PAYPAL' ? 'PayPal' : 'Binance'}</span>
                  </div>
                  <span className="text-xl font-bold text-[#2D2D2D]">${order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Items */}
              <div className="flex flex-wrap gap-2 mb-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-2 bg-[#E8F1FB] rounded-lg px-3 py-1.5">
                    <img src={item.game.imageUrl} alt="" className="w-6 h-6 rounded object-cover" />
                    <span className="text-xs text-[#003791] font-medium">{item.game.title}</span>
                    <span className="text-xs text-gray-500">x{item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#E5E5E5]">
                <div className="text-xs text-gray-500">
                  <p>Fecha: {new Date(order.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  {order.transactionId && (
                    <p className="mt-1">TX: <code className="bg-gray-100 px-1 rounded">{order.transactionId}</code></p>
                  )}
                </div>
                {order.paymentStatus === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                      className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
                    >
                      ✓ Marcar Pagado
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.id, 'FAILED')}
                      className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                    >
                      ✗ Rechazar
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
