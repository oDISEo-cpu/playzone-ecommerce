# Configuración de Supabase para PlayZone Store

## ¿Por qué necesito Supabase?

Supabase Storage te permite:
- ✅ Subir imágenes de juegos (hasta 5MB)
- ✅ Subir videos de juegos (hasta 100MB)
- ✅ Subir códigos QR de Binance
- ✅ Almacenamiento ilimitado en la nube
- ✅ URLs públicas para compartir

Sin Supabase, solo puedes:
- ✅ Subir imágenes (comprimidas en base64)
- ❌ NO puedes subir videos locales
- ✅ Usar URLs de YouTube/Vimeo

## Paso 1: Crear cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Inicia sesión con GitHub
4. Crea un nuevo proyecto (es gratis)

## Paso 2: Crear el bucket de almacenamiento

1. En el dashboard de Supabase, ve a **Storage** (menú lateral)
2. Haz clic en **"New bucket"**
3. Configura el bucket:
   - **Name**: `playzone-store`
   - **Public bucket**: ✅ Marcado (para que las imágenes/videos sean accesibles)
   - **File size limit**: `104857600` (100MB para videos)
   - **Allowed MIME types**: 
     ```
     image/png, image/jpeg, image/jpg, image/webp,
     video/mp4, video/webm, video/quicktime
     ```
4. Haz clic en **"Create bucket"**

## Paso 3: Configurar políticas de seguridad

En la sección del bucket `playzone-store`, ve a **Policies** y crea estas políticas:

### Política 1: Permitir lectura pública
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (true);
```

### Política 2: Permitir inserción autenticada
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (true);
```

### Política 3: Permitir eliminación autenticada
```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (true);
```

## Paso 4: Obtener las credenciales

1. Ve a **Settings** → **API** (menú lateral)
2. Copia estos valores:
   - **Project URL**: `https://tu-proyecto.supabase.co`
   - **anon public key**: `eyJhbGc...` (clave larga)

## Paso 5: Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

⚠️ **IMPORTANTE**: 
- Reemplaza `tu-proyecto.supabase.co` con tu URL real
- Reemplaza `eyJhbGc...` con tu anon key real
- NO subas el archivo `.env` a Git (ya está en `.gitignore`)

## Paso 6: Reiniciar el servidor

```bash
# Detén el servidor (Ctrl+C)
# Luego reinícialo
npm run dev
```

## Paso 7: Verificar la configuración

1. Ve a `/admin/games`
2. Intenta subir una imagen de juego
3. Si ves "Imagen subida a la nube" → ¡Funciona!
4. Si ves "Imagen comprimida (Supabase no configurado)" → Revisa las variables de entorno

## Solución de problemas

### Error: "Supabase no configurado"
- Verifica que el archivo `.env` existe
- Verifica que las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están correctas
- Reinicia el servidor después de crear/modificar `.env`

### Error: "Error al subir el video"
- Verifica que creaste el bucket `playzone-store`
- Verifica que el bucket es público
- Verifica las políticas de seguridad
- Verifica que el video no supera los 100MB

### Error: "Permission denied"
- Revisa las políticas de seguridad del bucket
- Asegúrate de que las 3 políticas están creadas
- Verifica que el bucket sea público

## Estructura de archivos en Supabase

```
playzone-store/
├── games/          # Imágenes de juegos
│   ├── 1234567890-abc.jpg
│   └── 1234567891-def.jpg
├── videos/         # Videos de juegos
│   ├── 1234567890-abc.mp4
│   └── 1234567891-def.mp4
└── qr/             # Códigos QR de Binance
    └── 1234567890-abc.png
```

## Límites del plan gratuito de Supabase

- **Almacenamiento**: 1GB
- **Ancho de banda**: 2GB/mes
- **Tamaño máximo de archivo**: 100MB
- **Proyectos**: 2 activos

Si necesitas más, puedes upgrade a un plan de pago ($25/mes).

## Alternativas a Supabase

Si no quieres usar Supabase, puedes:
1. **Usar solo URLs externas**: YouTube, Vimeo, Cloudinary
2. **Usar otro servicio de almacenamiento**:
   - Cloudinary (gratis hasta 25GB)
   - AWS S3 (pago por uso)
   - Firebase Storage (gratis hasta 5GB)
   - Imgur (solo imágenes)

## Ejemplo de uso en el código

```typescript
import { uploadImage, uploadVideo } from './lib/supabase';

// Subir imagen
const imageUrl = await uploadImage(file, 'games');
// Retorna: https://xxx.supabase.co/storage/v1/object/public/playzone-store/games/123.jpg

// Subir video
const videoUrl = await uploadVideo(file, 'videos');
// Retorna: https://xxx.supabase.co/storage/v1/object/public/playzone-store/videos/123.mp4
```

## Notas importantes

- Los archivos subidos son **públicos** (cualquiera con la URL puede verlos)
- No subas información sensible o privada
- Los nombres de archivo son únicos (timestamp + random)
- Los archivos no se pueden sobrescribir (se crean nuevos)
- Para eliminar archivos, usa la función `deleteFile()` del servicio
