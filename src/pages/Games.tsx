import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import GameCard from '../components/ui/GameCard';

const categories = ['Todos', 'Acción', 'RPG', 'Deportes', 'Aventura', 'Terror', 'Indie', 'Simulación'];
const platforms = ['Todas', 'PS4', 'PS5', 'PS4/PS5'];

export default function Games() {
  const { games } = useStore();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'Todos';
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPlatform, setSelectedPlatform] = useState('Todas');
  const [maxPrice, setMaxPrice] = useState(100);
  const [sortBy, setSortBy] = useState('recent');

  const filteredGames = useMemo(() => {
    let result = [...games];

    if (selectedCategory !== 'Todos') {
      result = result.filter(g => g.category === selectedCategory);
    }
    if (selectedPlatform !== 'Todas') {
      result = result.filter(g => g.platform === selectedPlatform || g.platform.includes(selectedPlatform));
    }
    result = result.filter(g => g.price <= maxPrice);

    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [games, selectedCategory, selectedPlatform, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Catálogo de Juegos</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{filteredGames.length} juegos encontrados</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-[#151E32] border border-gray-200 dark:border-[#1E293B] text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1] transition-colors"
            >
              <option value="recent">Más recientes</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filtros */}
          <aside className="lg:col-span-1 space-y-8">
            {/* Categoría */}
            <div className="bg-white dark:bg-[#151E32] rounded-xl border border-gray-200 dark:border-[#1E293B] p-6 transition-colors">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Categoría</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedCategory === cat ? 'border-[#0070D1] dark:border-[#60A5FA]' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedCategory === cat && <div className="w-2 h-2 rounded-full bg-[#0070D1] dark:bg-[#60A5FA]" />}
                    </div>
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="hidden"
                    />
                    <span className={`text-sm transition-colors ${
                      selectedCategory === cat ? 'text-[#0070D1] dark:text-[#60A5FA] font-medium' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                    }`}>
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Plataforma */}
            <div className="bg-white dark:bg-[#151E32] rounded-xl border border-gray-200 dark:border-[#1E293B] p-6 transition-colors">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Plataforma</h3>
              <div className="space-y-2">
                {platforms.map(plat => (
                  <label key={plat} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedPlatform === plat ? 'border-[#0070D1] dark:border-[#60A5FA]' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedPlatform === plat && <div className="w-2 h-2 rounded-full bg-[#0070D1] dark:bg-[#60A5FA]" />}
                    </div>
                    <input
                      type="radio"
                      name="platform"
                      value={plat}
                      checked={selectedPlatform === plat}
                      onChange={() => setSelectedPlatform(plat)}
                      className="hidden"
                    />
                    <span className={`text-sm transition-colors ${
                      selectedPlatform === plat ? 'text-[#0070D1] dark:text-[#60A5FA] font-medium' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                    }`}>
                      {plat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Precio */}
            <div className="bg-white dark:bg-[#151E32] rounded-xl border border-gray-200 dark:border-[#1E293B] p-6 transition-colors">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Precio</h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0070D1]"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>$0</span>
                  <span className="font-medium text-[#0070D1] dark:text-[#60A5FA]">${maxPrice}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Grid de Juegos */}
          <div className="lg:col-span-3">
            {filteredGames.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No se encontraron juegos con estos filtros.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredGames.map((game, idx) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <GameCard game={game} index={idx} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}