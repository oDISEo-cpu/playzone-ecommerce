import { supabase } from './supabase';
import { Game } from '../types';

// Convertir formato de Supabase a formato de la app
const mapGameFromDB = (dbGame: any): Game => ({
  id: dbGame.id,
  title: dbGame.title,
  description: dbGame.description,
  price: Number(dbGame.price),
  discount: dbGame.discount || 0,
  category: dbGame.category,
  platform: dbGame.platform,
  imageUrl: dbGame.image_url,
  stock: dbGame.stock || 0,
  isFeatured: dbGame.is_featured || false,
  isNewRelease: dbGame.is_new_release || false,
  videoUrl: dbGame.video_url || '',
  videoType: dbGame.video_type || 'file',
  isPreOrder: dbGame.is_pre_order || false,
  releaseDate: dbGame.release_date || '',
  createdAt: dbGame.created_at,
});

// Convertir formato de la app a formato de Supabase
const mapGameToDB = (game: Partial<Game>) => ({
  title: game.title,
  description: game.description,
  price: game.price,
  discount: game.discount || 0,
  category: game.category,
  platform: game.platform,
  image_url: game.imageUrl,
  stock: game.stock || 0,
  is_featured: game.isFeatured || false,
  is_new_release: game.isNewRelease || false,
  video_url: game.videoUrl || null,
  video_type: game.videoType || 'file',
  is_pre_order: game.isPreOrder || false,
  release_date: game.releaseDate || null,
});

// Obtener todos los juegos
export const fetchGames = async (): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching games:', error);
    return [];
  }

  return data.map(mapGameFromDB);
};

// Agregar un juego
export const addGameToDB = async (game: Omit<Game, 'id' | 'createdAt'>): Promise<Game | null> => {
  const { data, error } = await supabase
    .from('games')
    .insert([mapGameToDB(game)])
    .select()
    .single();

  if (error) {
    console.error('Error adding game:', error);
    return null;
  }

  return mapGameFromDB(data);
};

// Actualizar un juego
export const updateGameInDB = async (id: string, updates: Partial<Game>): Promise<Game | null> => {
  const { data, error } = await supabase
    .from('games')
    .update(mapGameToDB(updates))
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating game:', error);
    return null;
  }

  return mapGameFromDB(data);
};

// Eliminar un juego
export const deleteGameFromDB = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting game:', error);
    return false;
  }

  return true;
};