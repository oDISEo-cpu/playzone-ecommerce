import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store';

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity } = useStore();

  const subtotal = cart.reduce((sum, item) => {
    const price = item.game.discount > 0
      ? item.game.price * (1 - item.game.discount / 100)
      : item.game.price;
    return sum + price * item.quantity;
  }, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#2D2D2D] mb-2">Tu carrito está vacío</h1>
          <p className="text-gray-500 mb-6">¡Explora nuestro catálogo y encuentra tu próximo juego!</p>
          <Link
            to="/games"
            className="inline-block px-6 py-3 bg-[#003791] text-white font-semibold rounded-full hover:bg-[#0070D1] transition-colors"
          >
            Ver Catálogo
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/games" className="flex items-center gap-2 text-gray-500 hover:text-[#0070D1] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Seguir comprando</span>
      </Link>

      <h1 className="text-3xl font-bold text-[#2D2D2D] mb-8">Mi Carrito ({cart.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, idx) => {
            const price = item.game.discount > 0
              ? item.game.price * (1 - item.game.discount / 100)
              : item.game.price;

            return (
              <motion.div
                key={item.game.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex gap-4 p-4 bg-white rounded-xl border border-[#E5E5E5]"
              >
                <Link to={`/games/${item.game.id}`} className="shrink-0">
                  <img
                    src={item.game.imageUrl}
                    alt={item.game.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/games/${item.game.id}`}>
                    <h3 className="font-semibold text-[#2D2D2D] hover:text-[#0070D1] transition-colors truncate">
                      {item.game.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">{item.game.platform}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-[#2D2D2D]">${price.toFixed(2)}</span>
                    {item.game.discount > 0 && (
                      <span className="text-sm text-gray-400 line-through">${item.game.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.game.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 bg-[#E8F1FB] rounded-lg">
                    <button
                      onClick={() => updateCartQuantity(item.game.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-[#0070D1] hover:text-white rounded-l-lg transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.game.id, item.quantity + 1)}
                      disabled={item.quantity >= item.game.stock}
                      className="p-1.5 hover:bg-[#0070D1] hover:text-white rounded-r-lg transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-xl border border-[#E5E5E5] p-6">
            <h2 className="text-lg font-bold text-[#2D2D2D] mb-4">Resumen</h2>
            <div className="space-y-3 border-b border-[#E5E5E5] pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-[#2D2D2D]">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Impuestos</span>
                <span className="text-[#2D2D2D]">$0.00</span>
              </div>
            </div>
            <div className="flex justify-between mt-4 mb-6">
              <span className="font-bold text-[#2D2D2D]">Total</span>
              <span className="font-bold text-xl text-[#2D2D2D]">${subtotal.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              className="block w-full text-center py-3 bg-[#003791] text-white font-semibold rounded-xl hover:bg-[#0070D1] transition-colors"
            >
              Proceder al Pago
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
