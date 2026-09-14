import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Game } from '../../types';
import { useStore } from '../../store';

interface GameCardProps {
  game: Game;
  index?: number;
}

export default function GameCard({ game, index = 0 }: GameCardProps) {
  const { addToCart } = useStore();

  const discountedPrice = game.discount > 0
    ? game.price * (1 - game.discount / 100)
    : game.price;

  const isOutOfStock = game.stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group bg-white rounded-xl border border-[#E5E5E5] overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <Link to={`/games/${game.id}`} className="relative overflow-hidden aspect-[3/2]">
        <img
          src={game.imageUrl}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {game.discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            -{game.discount}%
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-lg">SIN STOCK</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="bg-[#003791] text-white text-xs font-medium px-2 py-1 rounded-md">
            {game.platform}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <span className="text-xs text-[#0070D1] font-medium uppercase tracking-wide">{game.category}</span>
        <Link to={`/games/${game.id}`}>
          <h3 className="font-bold text-[#2D2D2D] mt-1 group-hover:text-[#0070D1] transition-colors line-clamp-1">
            {game.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{game.description}</p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            {game.discount > 0 && (
              <span className="text-sm text-gray-400 line-through">${game.price.toFixed(2)}</span>
            )}
            <span className="text-lg font-bold text-[#2D2D2D]">${discountedPrice.toFixed(2)}</span>
          </div>
          <button
            onClick={() => !isOutOfStock && addToCart(game)}
            disabled={isOutOfStock}
            className={`p-2 rounded-full transition-colors ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#003791] text-white hover:bg-[#0070D1]'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
