import { motion } from 'framer-motion';
import { DollarSign, Users, ShoppingBag, Gamepad2, TrendingUp } from 'lucide-react';
import { useStore } from '../../store';

export default function AdminDashboard() {
  const { users, orders, games } = useStore();

  const totalRevenue = orders.filter(o => o.paymentStatus === 'COMPLETED').reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalUsers = users.filter(u => u.role === 'USER').length;
  const totalGames = games.length;

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const stats = [
    { label: 'Ingresos Totales', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Órdenes', value: totalOrders.toString(), icon: ShoppingBag, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Usuarios', value: totalUsers.toString(), icon: Users, color: 'bg-purple-50', iconColor: 'text-purple-500' },
    { label: 'Juegos', value: totalGames.toString(), icon: Gamepad2, color: 'bg-orange-50', iconColor: 'text-orange-500' },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl border border-[#E5E5E5] p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-[#2D2D2D] mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
        <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between">
          <h2 className="font-bold text-[#2D2D2D]">Órdenes Recientes</h2>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay órdenes aún
          </div>
        ) : (
          <div className="divide-y divide-[#E5E5E5]">
            {recentOrders.map(order => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#2D2D2D] text-sm">{order.userName}</p>
                  <p className="text-xs text-gray-500">{order.items.map(i => i.game.title).join(', ')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#2D2D2D]">${order.total.toFixed(2)}</p>
                  <p className={`text-xs ${
                    order.paymentStatus === 'COMPLETED' ? 'text-green-600' :
                    order.paymentStatus === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {order.paymentStatus === 'COMPLETED' ? '✓ Completado' :
                     order.paymentStatus === 'PENDING' ? '⏳ Pendiente' : '✗ Fallido'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
