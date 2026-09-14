import { Users, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';

export default function AdminUsers() {
  const { users, orders } = useStore();

  const regularUsers = users.filter(u => u.role === 'USER');

  const getUserStats = (userId: string) => {
    const userOrders = orders.filter(o => o.userId === userId);
    const totalSpent = userOrders.filter(o => o.paymentStatus === 'COMPLETED').reduce((sum, o) => sum + o.total, 0);
    return { totalOrders: userOrders.length, totalSpent };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#2D2D2D]">Usuarios Registrados ({regularUsers.length})</h2>
        <Users className="w-5 h-5 text-gray-400" />
      </div>

      {regularUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-8 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay usuarios registrados aún</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#E8F1FB]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] uppercase">Usuario</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] uppercase">Fecha Registro</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] uppercase">Órdenes</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] uppercase">Total Gastado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {regularUsers.map((user, idx) => {
                  const stats = getUserStats(user.id);
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#003791] rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="font-medium text-sm text-[#2D2D2D]">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{stats.totalOrders}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-green-500" />
                          <span className="text-sm font-medium text-[#2D2D2D]">${stats.totalSpent.toFixed(2)}</span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
