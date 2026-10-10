// netlify/functions/auto-update-images.cjs

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Método no permitido' }) 
    };
  }

  try {
    const { rawgKey, supabaseUrl, supabaseKey, chunkIndex = 0, chunkSize = 30 } = JSON.parse(event.body);

    if (!rawgKey || !supabaseUrl || !supabaseKey) {
      return { 
        statusCode: 400, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Faltan credenciales' }) 
      };
    }

    // 1. Obtener TODOS los juegos (esto es rápido)
    const gamesResponse = await fetch(`${supabaseUrl}/rest/v1/games?select=id,title`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    });

    if (!gamesResponse.ok) {
      throw new Error('Error al obtener juegos de Supabase');
    }

    const allGames = await gamesResponse.json();
    
    // 2. Extraer solo el lote (chunk) actual
    const start = chunkIndex * chunkSize;
    const end = start + chunkSize;
    const gamesChunk = allGames.slice(start, end);

    if (gamesChunk.length === 0) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, message: 'No hay más juegos en este lote.', finished: true })
      };
    }

    let updated = 0;
    let notFound = 0;
    let errors = 0;

    // 3. Procesar este lote en paralelo (máximo 5 a la vez para no saturar RAWG)
    const concurrencyLimit = 5;
    for (let i = 0; i < gamesChunk.length; i += concurrencyLimit) {
      const batch = gamesChunk.slice(i, i + concurrencyLimit);
      
      await Promise.all(batch.map(async (game) => {
        try {
          // Búsqueda exacta para mayor precisión y velocidad
          const rawgResponse = await fetch(
            `https://api.rawg.io/api/games?key=${rawgKey}&search=${encodeURIComponent(game.title)}&search_exact=true&page_size=1`
          );

          if (!rawgResponse.ok) {
            errors++;
            return;
          }

          const rawgData = await rawgResponse.json();

          if (rawgData.results?.[0]?.background_image) {
            const imageUrl = rawgData.results[0].background_image;

            // Actualizar en Supabase
            await fetch(`${supabaseUrl}/rest/v1/games?id=eq.${game.id}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({ image_url: imageUrl })
            });

            updated++;
          } else {
            notFound++;
          }
        } catch {
          errors++;
        }
      }));

      // Pequeña pausa entre lotes internos
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const isFinished = end >= allGames.length;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        finished: isFinished,
        message: `Lote ${chunkIndex + 1} completado: ${updated} actualizadas, ${notFound} no encontradas, ${errors} errores.`,
        stats: { updated, notFound, errors }
      })
    };

  } catch (error) {
    return { 
      statusCode: 500, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: error.message }) 
    };
  }
};