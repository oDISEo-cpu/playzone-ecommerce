import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import { motion } from 'framer-motion';
import GameCard from '../components/ui/GameCard';
import { useStore } from '../store';

const categories = ['Acción', 'RPG', 'Deportes', 'Aventura', 'Terror', 'Indie'];
const platforms = ['PS4', 'PS5', 'PS4/PS5'];
const sortOptions = [
  { label: 'Más recientes', value: 'newest' },
  { label: 'Precio: Menor a Mayor', value: 'price-asc' },
  { label: 'Precio: Mayor a Menor', value: 'price-desc' },
  { label: 'Mayor descuento', value: 'discount' },
];

export default function Games() {
  const { games } = useStore();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredGames = useMemo(() => {
    let result = [...games];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(g => g.category === selectedCategory);
    }

    // Platform filter
    if (selectedPlatform) {
      result = result.filter(g => g.platform === selectedPlatform);
    }

    // Price filter
    result = result.filter(g => {
      const price = g.discount > 0 ? g.price * (1 - g.discount / 100) : g.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-asc':
        result.sort((a, b) => {
          const pa = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
          const pb = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
          return pa - pb;
        });
        break;
      case 'price-desc':
        result.sort((a, b) => {
          const pa = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
          const pb = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
          return pb - pa;
        });
        break;
      case 'discount':
        result.sort((a, b) => b.discount - a.discount);
        break;
    }

    return result;
  }, [games, searchQuery, selectedCategory, selectedPlatform, sortBy, priceRange]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedPlatform('');
    setPriceRange([0, 100]);
  };

  const hasActiveFilters = selectedCategory || selectedPlatform || priceRange[0] > 0 || priceRange[1] < 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#2D2D2D]">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Catálogo de Juegos'}
          </h1>
          <p className="text-gray-500 mt-1">{filteredGames.length} juegos encontrados</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1]"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#003791] text-white rounded-lg text-sm"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : 'hidden'} lg:block lg:relative lg:w-64 shrink-0`}>
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h3 className="font-bold text-lg">Filtros</h3>
            <button onClick={() => setShowFilters(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-[#0070D1] hover:underline mb-4 block"
            >
              Limpiar filtros
            </button>
          )}

          {/* Category */}
          <div className="mb-6">
            <h3 className="font-semibold text-[#2D2D2D] mb-3">Categoría</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                    className="w-4 h-4 text-[#0070D1] focus:ring-[#0070D1]"
                  />
                  <span className="text-sm text-[#2D2D2D]">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="mb-6">
            <h3 className="font-semibold text-[#2D2D2D] mb-3">Plataforma</h3>
            <div className="space-y-2">
              {platforms.map(plat => (
                <label key={plat} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="platform"
                    checked={selectedPlatform === plat}
                    onChange={() => setSelectedPlatform(selectedPlatform === plat ? '' : plat)}
                    className="w-4 h-4 text-[#0070D1] focus:ring-[#0070D1]"
                  />
                  <span className="text-sm text-[#2D2D2D]">{plat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="font-semibold text-[#2D2D2D] mb-3">Precio</h3>
            <input
              type="range"
              min="0"
              max="100"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, Number(e.target.value)])}
              className="w-full accent-[#0070D1]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$0</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>

          <button
            onClick={() => setShowFilters(false)}
            className="lg:hidden w-full py-3 bg-[#003791] text-white rounded-lg font-medium mt-4"
          >
            Aplicar Filtros
          </button>
        </aside>

        {/* Games Grid */}
        <div className="flex-1">
          {filteredGames.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-gray-500 text-lg">No se encontraron juegos con estos filtros.</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-[#0070D1] font-medium hover:underline"
              >
                Limpiar filtros
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredGames.map((game, idx) => (
                <GameCard key={game.id} game={game} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
