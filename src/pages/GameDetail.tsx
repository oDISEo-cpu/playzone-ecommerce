import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Shield, Download, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store';

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { games, addToCart, currentUser } = useStore();
  const game = games.find(g => g.id === id);

  if (!game) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#2D2D2D]">Juego no encontrado</h1>
        <Link to="/games" className="text-[#0070D1] mt-4 inline-block hover:underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const discountedPrice = game.discount > 0
    ? game.price * (1 - game.discount / 100)
    : game.price;
  const isOutOfStock = game.stock === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-[#0070D1] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Volver</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative rounded-2xl overflow-hidden aspect-[16/10]"
        >
          <img
            src={game.imageUrl}
            alt={game.title}
            className="w-full h-full object-cover"
          />
          {game.discount > 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
              -{game.discount}% OFF
            </span>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="text-[#0070D1] text-sm font-semibold uppercase tracking-wide">{game.category}</span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2D2D2D] mt-2">{game.title}</h1>
          
          <div className="flex items-center gap-2 mt-3">
            <span className="bg-[#003791] text-white text-xs font-medium px-3 py-1 rounded-full">{game.platform}</span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">{game.stock > 0 ? `${game.stock} disponibles` : 'Sin stock'}</span>
          </div>

          <p className="text-gray-600 mt-6 leading-relaxed">{game.description}</p>

          {/* Price */}
          <div className="mt-8 p-6 bg-[#E8F1FB] rounded-xl">
            <div className="flex items-center gap-4">
              {game.discount > 0 && (
                <span className="text-gray-400 line-through text-xl">${game.price.toFixed(2)}</span>
              )}
              <span className="text-4xl font-bold text-[#2D2D2D]">${discountedPrice.toFixed(2)}</span>
              {game.discount > 0 && (
                <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-md">
                  Ahorras ${(game.price - discountedPrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => addToCart(game)}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg transition-all ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-[#003791] text-white hover:bg-[#0070D1] hover:shadow-lg'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {isOutOfStock ? 'Sin Stock' : 'Agregar al Carrito'}
            </button>
            {!isOutOfStock && (
              <button
                onClick={() => {
                  addToCart(game);
                  if (!currentUser) {
                    navigate('/login');
                  } else {
                    navigate('/checkout');
                  }
                }}
                className="px-6 py-4 bg-[#0070D1] text-white font-semibold rounded-xl hover:bg-[#003791] transition-all"
              >
                Comprar
              </button>
            )}
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-[#E5E5E5]">
              <Download className="w-6 h-6 text-[#0070D1] mb-2" />
              <span className="text-xs text-gray-600">Entrega Digital</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-[#E5E5E5]">
              <Shield className="w-6 h-6 text-[#0070D1] mb-2" />
              <span className="text-xs text-gray-600">Compra Segura</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-[#E5E5E5]">
              <Star className="w-6 h-6 text-[#0070D1] mb-2" />
              <span className="text-xs text-gray-600">Licencia Oficial</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
