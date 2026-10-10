import { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Star, Sparkles, Video, Calendar, Monitor } from 'lucide-react';
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
    isHeroBanner: false,
    isPreOrder: false,
    releaseDate: '',
    videoUrl: '',
    videoType: 'file' as 'file' | 'youtube' | 'vimeo',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Estados para el Bot de Imágenes
  const [rawgApiKey, setRawgApiKey] = useState('');
  const [processingImages, setProcessingImages] = useState(false);
  const [imageUpdateResult, setImageUpdateResult] = useState('');

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
      isHeroBanner: false,
      isPreOrder: false,
      releaseDate: '',
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
      isHeroBanner: game.isHeroBanner || false,
      isPreOrder: game.isPreOrder || false,
      releaseDate: game.releaseDate || '',
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

  // ✅ Función del Bot de Imágenes
  const handleAutoUpdateImages = async () => {
    if (!rawgApiKey) {
      useStore.getState().addToast('Ingresa tu API Key de RAWG', 'error');
      return;
    }

    setProcessingImages(true);
    setImageUpdateResult('⏳ El bot está trabajando... Esto puede tardar 2-3 minutos. No cierres la pestaña.');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch('/.netlify/functions/auto-update-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rawgKey: rawgApiKey,
          supabaseUrl,
          supabaseKey
        }),
      });

      const result = await response.json();

      if (result.success) {
        setImageUpdateResult(result.message);
        useStore.getState().addToast('¡Portadas actualizadas!', 'success');
        await useStore.getState().loadGames();
      } else {
        setImageUpdateResult(`❌ Error: ${result.error || 'Desconocido'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setImageUpdateResult('❌ Error de conexión con el servidor.');
    } finally {
      setProcessingImages(false);
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
        <h2 className="text-xl font-bold text-[#2D2D2D] dark:text-[#F1F5F9]">Gestión de Juegos ({games.length})</h2>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#E8F1FB] dark:bg-[#1E293B] rounded-lg p-1 transition-colors">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'all' ? 'bg-white dark:bg-[#151E32] text-[#003791] dark:text-[#0070D1] shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('featured')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                filterType === 'featured' ? 'bg-white dark:bg-[#151E32] text-[#003791] dark:text-[#0070D1] shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Star className="w-3 h-3" /> Ofertas
            </button>
            <button
              onClick={() => setFilterType('new')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                filterType === 'new' ? 'bg-white dark:bg-[#151E32] text-[#003791] dark:text-[#0070D1] shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Sparkles className="w-3 h-3" /> Nuevos
            </button>
          </div>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 px-4 py-2 bg-[#003791] dark:bg-[#0070D1] text-white rounded-lg text-sm font-medium hover:bg-[#0070D1] dark:hover:bg-[#005BB5] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </div>

      {/* Games Table */}
      <div className="bg-white dark:bg-[#151E32] rounded-xl border border-[#E5E5E5] dark:border-[#1E293B] overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#E8F1FB] dark:bg-[#1E293B] transition-colors">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] dark:text-[#0070D1] uppercase">Juego</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] dark:text-[#0070D1] uppercase">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] dark:text-[#0070D1] uppercase">Precio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] dark:text-[#0070D1] uppercase">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] dark:text-[#0070D1] uppercase">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#003791] dark:text-[#0070D1] uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#1E293B]">
              {filteredGames.map(game => (
                <tr key={game.id} className="hover:bg-gray-50 dark:hover:bg-[#1E293B]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={game.imageUrl} alt={game.title} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-medium text-sm text-[#2D2D2D] dark:text-[#F1F5F9] truncate max-w-[150px]">{game.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{game.category}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[#2D2D2D] dark:text-[#F1F5F9]">${game.price.toFixed(2)}</span>
                    {game.discount > 0 && (
                      <span className="text-xs text-red-500 dark:text-red-400 ml-1">-{game.discount}%</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${game.stock === 0 ? 'text-red-500 dark:text-red-400' : game.stock < 10 ? 'text-yellow-500 dark:text-yellow-400' : 'text-green-500 dark:text-green-400'}`}>
                      {game.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {game.isFeatured && (
                        <span className="flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3" /> Oferta
                        </span>
                      )}
                      {game.isNewRelease && (
                        <span className="flex items-center gap-1 text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3" /> Nuevo
                        </span>
                      )}
                      {game.videoUrl && (
                        <span className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                          <Video className="w-3 h-3" /> Video
                        </span>
                      )}
                      {!game.isFeatured && !game.isNewRelease && !game.videoUrl && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(game)}
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-[#0070D1] hover:bg-[#E8F1FB] dark:hover:bg-[#1E293B] rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(game.id)}
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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

      {/*  BOT DE AUTOMATIZACIÓN DE IMÁGENES */}
      <div className="mt-10 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl border border-indigo-400/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Automatización de Portadas (RAWG)</h3>
            <p className="text-indigo-100 text-sm">Actualiza las imágenes de todos los juegos automáticamente.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Pega tu API Key de RAWG aquí..."
            value={rawgApiKey}
            onChange={(e) => setRawgApiKey(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
          />
          <button
            onClick={handleAutoUpdateImages}
            disabled={processingImages || !rawgApiKey}
            className="px-6 py-3 bg-white text-indigo-700 font-bold rounded-lg hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {processingImages ? (
              <>
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Auto-Actualizar Imágenes
              </>
            )}
          </button>
        </div>

        {imageUpdateResult && (
          <div className="mt-4 p-3 bg-black/20 rounded-lg text-white text-sm font-medium backdrop-blur-sm border border-white/10">
            {imageUpdateResult}
          </div>
        )}
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
              className="bg-white dark:bg-[#151E32] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[#E5E5E5] dark:border-[#1E293B] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#2D2D2D] dark:text-[#F1F5F9]">
                  {editingGame ? 'Editar Juego' : 'Nuevo Juego'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#F1F5F9] mb-1">Título</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-[#0B1120] border border-[#E5E5E5] dark:border-[#1E293B] text-[#2D2D2D] dark:text-[#F1F5F9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#F1F5F9] mb-1">Descripción</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-[#0B1120] border border-[#E5E5E5] dark:border-[#1E293B] text-[#2D2D2D] dark:text-[#F1F5F9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1] resize-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#F1F5F9] mb-1">Precio ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-white dark:bg-[#0B1120] border border-[#E5E5E5] dark:border-[#1E293B] text-[#2D2D2D] dark:text-[#F1F5F9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#F1F5F9] mb-1">Descuento (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-white dark:bg-[#0B1120] border border-[#E5E5E5] dark:border-[#1E293B] text-[#2D2D2D] dark:text-[#F1F5F9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#F1F5F9] mb-1">Categoría</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-[#0B1120] border border-[#E5E5E5] dark:border-[#1E293B] text-[#2D2D2D] dark:text-[#F1F5F9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1] transition-colors"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#F1F5F9] mb-1">Plataforma</label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-[#0B1120] border border-[#E5E5E5] dark:border-[#1E293B] text-[#2D2D2D] dark:text-[#F1F5F9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1] transition-colors"
                    >
                      {platforms.map(plat => (
                        <option key={plat} value={plat}>{plat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#F1F5F9] mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-white dark:bg-[#0B1120] border border-[#E5E5E5] dark:border-[#1E293B] text-[#2D2D2D] dark:text-[#F1F5F9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1] transition-colors"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-3 p-4 bg-[#E8F1FB] dark:bg-[#1E293B] rounded-lg transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-[#2D2D2D] dark:text-[#F1F5F9]">Mostrar en Ofertas Especiales</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        formData.isFeatured ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
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
                      <span className="text-sm font-medium text-[#2D2D2D] dark:text-[#F1F5F9]">Mostrar en Nuevos Lanzamientos</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isNewRelease: !formData.isNewRelease })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        formData.isNewRelease ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'
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

                {/* Toggle para Banner Principal */}
                <div className="flex items-center justify-between p-4 bg-[#E8F1FB] dark:bg-[#1E293B] rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-[#2D2D2D] dark:text-[#F1F5F9]">Mostrar en Banner Principal</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isHeroBanner: !formData.isHeroBanner })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      formData.isHeroBanner ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        formData.isHeroBanner ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle para Pre-Venta */}
                <div className="flex items-center justify-between p-4 bg-[#E8F1FB] dark:bg-[#1E293B] rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-[#2D2D2D] dark:text-[#F1F5F9]">Disponible en Pre-Venta</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPreOrder: !formData.isPreOrder })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      formData.isPreOrder ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        formData.isPreOrder ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Fecha de Lanzamiento */}
                {formData.isPreOrder && (
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#F1F5F9] mb-1">
                      Fecha de Lanzamiento
                    </label>
                    <input
                      type="date"
                      value={formData.releaseDate}
                      onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-[#0B1120] border border-[#E5E5E5] dark:border-[#1E293B] text-[#2D2D2D] dark:text-[#F1F5F9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    />
                  </div>
                )}

                {/* Imagen del Juego */}
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#F1F5F9] mb-1">Imagen del Juego</label>
                  {formData.imageUrl && (
                    <div className="mb-3 relative">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-[#E5E5E5] dark:border-[#1E293B]" />
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
                    className="border-2 border-dashed border-[#E5E5E5] dark:border-[#1E293B] rounded-lg p-4 text-center cursor-pointer hover:border-[#0070D1] hover:bg-[#E8F1FB]/30 dark:hover:bg-[#1E293B]/50 transition-all"
                  >
                    <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">{formData.imageUrl ? 'Cambiar imagen' : 'Subir imagen'}</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>

                {/* Video del Juego */}
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#F1F5F9] mb-1">Video (opcional)</label>
                  
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, videoType: 'file', videoUrl: '' })}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        formData.videoType === 'file' ? 'border-[#0070D1] bg-[#E8F1FB] dark:bg-[#1E293B] text-[#003791] dark:text-[#0070D1]' : 'border-[#E5E5E5] dark:border-[#1E293B] text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Video className="w-3 h-3 inline mr-1" /> Archivo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, videoType: 'youtube', videoUrl: '' })}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        formData.videoType === 'youtube' ? 'border-[#0070D1] bg-[#E8F1FB] dark:bg-[#1E293B] text-[#003791] dark:text-[#0070D1]' : 'border-[#E5E5E5] dark:border-[#1E293B] text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      YouTube
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, videoType: 'vimeo', videoUrl: '' })}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        formData.videoType === 'vimeo' ? 'border-[#0070D1] bg-[#E8F1FB] dark:bg-[#1E293B] text-[#003791] dark:text-[#0070D1]' : 'border-[#E5E5E5] dark:border-[#1E293B] text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Vimeo
                    </button>
                  </div>

                  {formData.videoUrl && formData.videoType === 'file' && (
                    <div className="mb-3 relative">
                      <video src={formData.videoUrl} className="w-full h-32 object-cover rounded-lg border border-[#E5E5E5] dark:border-[#1E293B]" controls />
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
                    <div className="mb-3 p-2 bg-gray-100 dark:bg-[#1E293B] rounded-lg text-xs text-gray-600 dark:text-gray-400 break-all flex items-center justify-between gap-2 transition-colors">
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
                        className="border-2 border-dashed border-[#E5E5E5] dark:border-[#1E293B] rounded-lg p-3 text-center cursor-pointer hover:border-[#0070D1] hover:bg-[#E8F1FB]/30 dark:hover:bg-[#1E293B]/50 transition-all"
                      >
                        {uploadingVideo ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-[#0070D1] border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">Subiendo video...</p>
                          </div>
                        ) : (
                          <>
                            <Video className="w-5 h-5 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">Subir video (MP4, máx 100MB)</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Requiere Supabase configurado</p>
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
                      className="w-full px-4 py-2 bg-white dark:bg-[#0B1120] border border-[#E5E5E5] dark:border-[#1E293B] text-[#2D2D2D] dark:text-[#F1F5F9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1] transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-[#E5E5E5] dark:border-[#1E293B] text-[#2D2D2D] dark:text-[#F1F5F9] font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-[#1E293B] transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-2.5 bg-[#003791] dark:bg-[#0070D1] text-white font-medium rounded-lg hover:bg-[#0070D1] dark:hover:bg-[#005BB5] transition-colors">
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