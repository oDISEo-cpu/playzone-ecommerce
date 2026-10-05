import { Link } from 'react-router-dom';
import { Game } from '../../types';
import { useStore } from '../../store';

interface GameCardProps {
  game: Game;
  index: number;
}

export default function GameCard({ game, index }: GameCardProps) {
  const { addToCart } = useStore();

  const discountedPrice = game.discount > 0 
    ? game.price * (1 - game.discount / 100) 
    : game.price;

  return (
    <div 
      className="group bg-white dark:bg-[#151E32] border border-[#E5E5E5] dark:border-[#1E293B] rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Link to={`/games/${game.id}`} className="block relative aspect-[3/4] overflow-hidden">
        <img 
          src={game.imageUrl} 
          alt={game.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {game.discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              -{game.discount}%
            </span>
          )}
          {game.isPreOrder && (
            <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              Pre-Venta
            </span>
          )}
        </div>

        {game.isNewRelease && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-[#2D2D2D] text-xs font-bold px-2 py-1 rounded-md">
            NUEVO
          </span>
        )}
      </Link>

      <div className="p-4">
        <Link to={`/games/${game.id}`}>
          <h3 className="font-bold text-[#2D2D2D] dark:text-[#F1F5F9] text-sm mb-1 line-clamp-1 group-hover:text-[#0070D1] transition-colors">
            {game.title}
          </h3>
        </Link>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{game.platform}</p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {game.discount > 0 && (
              <span className="text-xs text-gray-400 line-through">
                ${game.price.toFixed(2)}
              </span>
            )}
            <span className="text-lg font-bold text-[#003791] dark:text-[#0070D1]">
              ${discountedPrice.toFixed(2)}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(game);
            }}
            disabled={game.stock === 0}
            className="p-2 bg-[#003791] dark:bg-[#0070D1] text-white rounded-lg hover:bg-[#0070D1] dark:hover:bg-[#005BB5] disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}