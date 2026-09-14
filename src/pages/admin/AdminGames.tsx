import { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Star, Sparkles, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { Game } from '../../types';

const categories = ['Acción', 'RPG', 'Deportes', 'Aventura', 'Terror', 'Indie'];
const platforms = ['PS4', 'PS5', 'PS4/PS5'];

export default function AdminGames() {
  const { games, addGame, updateGame, deleteGame } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'featured' | 'new'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    discount: 0,
    category: 'Acción',
    platform: 'PS5',
    imageUrl: '',
    stock: 0,
    isFeatured: false,
    isNewRelease: false,
    videoUrl: '',
    videoType: 'file' as 'file' | 'youtube' | 'vimeo',
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
      isFeatured: false,
      isNewRelease: false,
      videoUrl: '',
      videoType: 'file',
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
      isFeatured: game.isFeatured,
      isNewRelease: game.isNewRelease,
      videoUrl: game.videoUrl || '',
      videoType: game.videoType || 'file',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
      useStore.getState().addToast('Por favor sube una imagen del juego', 'error');
      return;
    }
    
    if (editingGame) {
      await updateGame(editingGame.id, formData);
    } else {
      await addGame(formData);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este juego?')) {
      deleteGame(id);
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        useStore.getState().addToast('Por favor selecciona un archivo de imagen válido', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        useStore.getState().addToast('La imagen no debe superar los 5MB', 'error');
        return;
      }
      
      setUploadingImage(true);
      try {
        const url = await useStore.getState().uploadGameImage(file);
        setFormData({ ...formData, imageUrl: url });
      } catch (error) {
        useStore.getState().addToast('Error al subir la imagen', 'error');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        useStore.getState().addToast('Por favor selecciona un archivo de video válido', 'error');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        useStore.getState().addToast('El video no debe superar los 100MB', 'error');
        return;
      }
      
      setUploadingVideo(true);
      try {
        const url = await useStore.getState().uploadGameVideo(file);
        setFormData({ ...formData, videoUrl: url, videoType: 'file' });
      } catch (error) {
        useStore.getState().addToast('Error al subir el video. Asegúrate de configurar Supabase.', 'error');
      } finally {
        setUploadingVideo(false);
      }
    }
  };

  const filteredGames = games.filter(game => {
    if (filterType === 'featured') return game.isFeatured;
    if (filterType === 'new') return game.isNewRelease;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-[#2D2D2D]">Gestión de Juegos ({games.length})</h2>
        <div className="flex items-center gap-3">
          {/* Filtros */}
          <div className="flex bg-[#E8F1FB] rounded-lg p-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'all' ? 'bg-white text-[#003791] shadow-sm' : 'text-gray-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('featured')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                filterType === 'featured' ? 'bg-white text-[#003791] shadow-sm' : 'text-gray-600'
              }`}
            >
              <Star className="w-3 h-3" /> Ofertas
            </button>
            <button
              onClick={() => setFilterType('new')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                filterType === 'new' ? 'bg-white text-[#003791] shadow-sm' : 'text-gray-600'
              }`}
            >
              <Sparkles className="w-3 h-3" /> Nuevos
            </button>
          </div>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 px-4 py-2 bg-[#003791] text-white rounded-lg text-sm font-medium hover:bg-[#0070D1] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </div>

      {/* Games Table */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#E8F1FB]">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] uppercase">Juego</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] uppercase">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] uppercase">Precio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] uppercase">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] uppercase">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {filteredGames.map(game => (
                <tr key={game.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={game.imageUrl} alt={game.title} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-medium text-sm text-[#2D2D2D] truncate max-w-[150px]">{game.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{game.category}</td>
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
                    <div className="flex items-center gap-1">
                      {game.isFeatured && (
                        <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3" /> Oferta
                        </span>
                      )}
                      {game.isNewRelease && (
                        <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3" /> Nuevo
                        </span>
                      )}
                      {game.videoUrl && (
                        <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          <Video className="w-3 h-3" /> Video
                        </span>
                      )}
                      {!game.isFeatured && !game.isNewRelease && !game.videoUrl && (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
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

                {/* Toggles para Featured y New Release */}
                <div className="space-y-3 p-4 bg-[#E8F1FB] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-[#2D2D2D]">Mostrar en Ofertas Especiales</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        formData.isFeatured ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          formData.isFeatured ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-[#2D2D2D]">Mostrar en Nuevos Lanzamientos</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isNewRelease: !formData.isNewRelease })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        formData.isNewRelease ? 'bg-yellow-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          formData.isNewRelease ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Imagen del Juego */}
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Imagen del Juego</label>
                  {formData.imageUrl && (
                    <div className="mb-3 relative">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-[#E5E5E5]" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, imageUrl: '' });
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#E5E5E5] rounded-lg p-4 text-center cursor-pointer hover:border-[#0070D1] hover:bg-[#E8F1FB]/30 transition-all"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">{formData.imageUrl ? 'Cambiar imagen' : 'Subir imagen'}</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>

                {/* Video del Juego */}
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1">Video (opcional)</label>
                  
                  {/* Tipo de video */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, videoType: 'file', videoUrl: '' })}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        formData.videoType === 'file' ? 'border-[#0070D1] bg-[#E8F1FB] text-[#003791]' : 'border-[#E5E5E5] text-gray-600'
                      }`}
                    >
                      <Video className="w-3 h-3 inline mr-1" /> Archivo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, videoType: 'youtube', videoUrl: '' })}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        formData.videoType === 'youtube' ? 'border-[#0070D1] bg-[#E8F1FB] text-[#003791]' : 'border-[#E5E5E5] text-gray-600'
                      }`}
                    >
                      YouTube
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, videoType: 'vimeo', videoUrl: '' })}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        formData.videoType === 'vimeo' ? 'border-[#0070D1] bg-[#E8F1FB] text-[#003791]' : 'border-[#E5E5E5] text-gray-600'
                      }`}
                    >
                      Vimeo
                    </button>
                  </div>

                  {/* Preview de video */}
                  {formData.videoUrl && formData.videoType === 'file' && (
                    <div className="mb-3 relative">
                      <video src={formData.videoUrl} className="w-full h-32 object-cover rounded-lg border border-[#E5E5E5]" controls />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, videoUrl: '' });
                          if (videoInputRef.current) videoInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {formData.videoUrl && (formData.videoType === 'youtube' || formData.videoType === 'vimeo') && (
                    <div className="mb-3 p-2 bg-gray-100 rounded-lg text-xs text-gray-600 break-all flex items-center justify-between gap-2">
                      <span className="truncate">URL: {formData.videoUrl}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, videoUrl: '' })}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600 shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {formData.videoType === 'file' ? (
                    <div>
                      <div
                        onClick={() => videoInputRef.current?.click()}
                        className="border-2 border-dashed border-[#E5E5E5] rounded-lg p-3 text-center cursor-pointer hover:border-[#0070D1] hover:bg-[#E8F1FB]/30 transition-all"
                      >
                        {uploadingVideo ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-[#0070D1] border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-gray-600">Subiendo video...</p>
                          </div>
                        ) : (
                          <>
                            <Video className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">Subir video (MP4, máx 100MB)</p>
                            <p className="text-xs text-gray-400 mt-1">Requiere Supabase configurado</p>
                          </>
                        )}
                      </div>
                      <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder={`URL de ${formData.videoType === 'youtube' ? 'YouTube' : 'Vimeo'}...`}
                      className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1]"
                    />
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-[#E5E5E5] text-[#2D2D2D] font-medium rounded-lg hover:bg-gray-50">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-2.5 bg-[#003791] text-white font-medium rounded-lg hover:bg-[#0070D1]">
                    {editingGame ? 'Guardar' : 'Crear'}
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
