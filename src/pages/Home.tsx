import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, Swords, Gamepad2, Trophy, Compass, Skull, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import HeroCarousel from '../components/ui/HeroCarousel';
import GameCard from '../components/ui/GameCard';
import { useStore } from '../store';

const categories = [
  { name: 'Acción', icon: Swords, color: 'bg-red-500' },
  { name: 'RPG', icon: Gamepad2, color: 'bg-purple-500' },
  { name: 'Deportes', icon: Trophy, color: 'bg-green-500' },
  { name: 'Aventura', icon: Compass, color: 'bg-blue-500' },
  { name: 'Terror', icon: Skull, color: 'bg-gray-700' },
  { name: 'Indie', icon: Palette, color: 'bg-orange-500' },
];

export default function Home() {
  const { games, loadGames } = useStore();

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const featuredGames = games
    .filter(g => g.isFeatured && g.discount > 0)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const newReleaseGames = games
    .filter(g => g.isNewRelease)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] transition-colors duration-300">
      <section className="py-6">
        <HeroCarousel />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">Explorar Categorías</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                to={`/games/category/${cat.name}`}
                className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-[#151E32] border border-gray-200 dark:border-[#1E293B] rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 ${cat.color} rounded-full flex items-center justify-center`}>
                  <cat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {featuredGames.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Ofertas Especiales</h2>
            </div>
            <Link to="/games" className="text-[#0070D1] dark:text-[#60A5FA] text-sm font-medium hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredGames.map((game, idx) => (
              <GameCard key={game.id} game={game} index={idx} />
            ))}
          </div>
        </section>
      )}

      {newReleaseGames.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Nuevos Lanzamientos</h2>
            </div>
            <Link to="/games" className="text-[#0070D1] dark:text-[#60A5FA] text-sm font-medium hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {newReleaseGames.map((game, idx) => (
              <GameCard key={game.id} game={game} index={idx} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-[#003791] dark:bg-[#002255] py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para tu próxima aventura?
          </h2>
          <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
            Descubre los mejores juegos de PlayStation con precios increíbles.
            Entrega digital instantánea.
          </p>
          <Link
            to="/games"
            className="inline-block px-8 py-4 bg-white text-[#003791] dark:bg-[#0070D1] dark:text-white font-bold rounded-full hover:bg-[#E8F1FB] dark:hover:bg-[#005BB5] transition-colors"
          >
            Explorar Catálogo
          </Link>
        </div>
      </section>
    </div>
  );
}