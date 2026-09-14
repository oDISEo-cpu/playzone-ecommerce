import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verificar si Supabase está configurado
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '';
};

/**
 * Sube una imagen a Supabase Storage
 * @param file - Archivo de imagen
 * @param folder - Carpeta destino (ej: 'games', 'qr')
 * @returns URL pública de la imagen o null si falla
 */
export const uploadImage = async (file: File, folder: string = 'images'): Promise<string | null> => {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase no configurado, usando fallback base64');
      return await fileToBase64(file);
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('La imagen no debe superar los 5MB');
    }

    // Generar nombre único
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Subir archivo
    const { data, error } = await supabase.storage
      .from('playzone-store')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('playzone-store')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    // Fallback a base64 si Supabase falla
    return await fileToBase64(file);
  }
};

/**
 * Sube un video a Supabase Storage
 * @param file - Archivo de video
 * @param folder - Carpeta destino (ej: 'videos')
 * @returns URL pública del video o null si falla
 */
export const uploadVideo = async (file: File, folder: string = 'videos'): Promise<string | null> => {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase no configurado. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('video/')) {
      throw new Error('El archivo debe ser un video');
    }

    // Validar tamaño (máximo 100MB)
    if (file.size > 100 * 1024 * 1024) {
      throw new Error('El video no debe superar los 100MB');
    }

    // Generar nombre único
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Subir archivo
    const { data, error } = await supabase.storage
      .from('playzone-store')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) throw error;

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('playzone-store')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error al subir video:', error);
    throw error;
  }
};

/**
 * Elimina un archivo de Supabase Storage
 * @param filePath - Ruta del archivo en el bucket
 */
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const { error } = await supabase.storage
      .from('playzone-store')
      .remove([filePath]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return false;
  }
};

/**
 * Convierte un archivo a base64 (fallback)
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Extrae la ruta del archivo de una URL pública de Supabase
 */
export const getFilePathFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // La estructura es: /storage/v1/object/public/bucket-name/path/to/file
    const bucketIndex = pathParts.indexOf('public');
    if (bucketIndex === -1) return null;
    
    // Saltar el bucket name y obtener la ruta
    return pathParts.slice(bucketIndex + 2).join('/');
  } catch {
    return null;
  }
};
