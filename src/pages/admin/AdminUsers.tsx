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
        <h2 className="text-xl font-bold text-[#2D2D2D] dark:text-[#F1F5F9]">Usuarios Registrados ({regularUsers.length})</h2>
        <Users className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </div>

      {regularUsers.length === 0 ? (
        <div className="bg-white dark:bg-[#151E32] rounded-xl border border-[#E5E5E5] dark:border-[#1E293B] p-8 text-center transition-colors">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No hay usuarios registrados aún</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#151E32] rounded-xl border border-[#E5E5E5] dark:border-[#1E293B] overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#E8F1FB] dark:bg-[#1E293B] transition-colors">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] dark:text-[#0070D1] uppercase">Usuario</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] dark:text-[#0070D1] uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] dark:text-[#0070D1] uppercase">Fecha Registro</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] dark:text-[#0070D1] uppercase">Órdenes</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] dark:text-[#0070D1] uppercase">Total Gastado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#1E293B]">
                {regularUsers.map((user, idx) => {
                  const stats = getUserStats(user.id);
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-[#1E293B]/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#003791] dark:bg-[#0070D1] rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="font-medium text-sm text-[#2D2D2D] dark:text-[#F1F5F9]">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{stats.totalOrders}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-green-500 dark:text-green-400" />
                          <span className="text-sm font-medium text-[#2D2D2D] dark:text-[#F1F5F9]">${stats.totalSpent.toFixed(2)}</span>
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