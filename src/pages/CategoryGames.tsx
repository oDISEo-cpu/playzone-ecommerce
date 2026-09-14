import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import GameCard from '../components/ui/GameCard';
import { useStore } from '../store';

export default function CategoryGames() {
  const { slug } = useParams<{ slug: string }>();
  const { games } = useStore();

  const categoryGames = games.filter(g => g.category === slug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/games" className="flex items-center gap-2 text-gray-500 hover:text-[#0070D1] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Volver al catálogo</span>
      </Link>

      <h1 className="text-3xl font-bold text-[#2D2D2D] mb-2">{slug}</h1>
      <p className="text-gray-500 mb-8">{categoryGames.length} juegos en esta categoría</p>

      {categoryGames.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No hay juegos en esta categoría.</p>
          <Link to="/games" className="text-[#0070D1] font-medium hover:underline mt-4 inline-block">
            Ver todos los juegos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoryGames.map((game, idx) => (
            <GameCard key={game.id} game={game} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
