import { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { Game } from '../../types';

const categories = ['Acción', 'RPG', 'Deportes', 'Aventura', 'Terror', 'Indie'];
const platforms = ['PS4', 'PS5', 'PS4/PS5'];

export default function AdminGames() {
  const { games, addGame, updateGame, deleteGame } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    discount: 0,
    category: 'Acción',
    platform: 'PS5',
    imageUrl: '',
    stock: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreateForm = () => {
    setEditingGame(null);
    setFormData({
      title: '',
      description: '',
      price: 0,
      discount: 0,
      category: 'Acción',
      platform: 'PS5',
      imageUrl: '',
      stock: 0,
    });
    setShowForm(true);
  };

  const openEditForm = (game: Game) => {
    setEditingGame(game);
    setFormData({
      title: game.title,
      description: game.description,
      price: game.price,
      discount: game.discount,
      category: game.category,
      platform: game.platform,
      imageUrl: game.imageUrl,
      stock: game.stock,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que haya una imagen
    if (!formData.imageUrl) {
      useStore.getState().addToast('Por favor sube una imagen del juego', 'error');
      return;
    }
    
    if (editingGame) {
      updateGame(editingGame.id, formData);
    } else {
      addGame(formData);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este juego?')) {
      deleteGame(id);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        useStore.getState().addToast('Por favor selecciona un archivo de imagen válido', 'error');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        useStore.getState().addToast('La imagen no debe superar los 5MB', 'error');
        return;
      }

      // Convertir a base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData({ ...formData, imageUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#2D2D2D]">Gestión de Juegos ({games.length})</h2>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 px-4 py-2 bg-[#003791] text-white rounded-lg text-sm font-medium hover:bg-[#0070D1] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Juego
        </button>
      </div>

      {/* Games Table */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#E8F1FB]">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] uppercase">Juego</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] uppercase">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] uppercase">Plataforma</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] uppercase">Precio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] uppercase">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {games.map(game => (
                <tr key={game.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={game.imageUrl} alt={game.title} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-medium text-sm text-[#2D2D2D] truncate max-w-[150px]">{game.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{game.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{game.platform}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[#2D2D2D]">${game.price.toFixed(2)}</span>
                    {game.discount > 0 && (
                      <span className="text-xs text-red-500 ml-1">-{game.discount}%</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${game.stock === 0 ? 'text-red-500' : game.stock < 10 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {game.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(game)}
                        className="p-1.5 text-gray-400 hover:text-[#0070D1] hover:bg-[#E8F1FB] rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(game.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#2D2D2D]">
                  {editingGame ? 'Editar Juego' : 'Nuevo Juego'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Título</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Descripción</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Precio ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Descuento (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Categoría</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1]"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Plataforma</label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1]"
                    >
                      {platforms.map(plat => (
                        <option key={plat} value={plat}>{plat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Imagen del Juego</label>
                  
                  {/* Preview de imagen */}
                  {formData.imageUrl && (
                    <div className="mb-3 relative">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg border border-[#E5E5E5]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, imageUrl: '' });
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Input de archivo */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#E5E5E5] rounded-lg p-6 text-center cursor-pointer hover:border-[#0070D1] hover:bg-[#E8F1FB]/30 transition-all"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium">
                      {formData.imageUrl ? 'Cambiar imagen' : 'Haz clic para subir una imagen'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG hasta 5MB</p>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 border border-[#E5E5E5] text-[#2D2D2D] font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#003791] text-white font-medium rounded-lg hover:bg-[#0070D1] transition-colors"
                  >
                    {editingGame ? 'Guardar Cambios' : 'Crear Juego'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
