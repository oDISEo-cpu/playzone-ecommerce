// netlify/functions/auto-update-images.cjs

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { rawgKey, supabaseUrl, supabaseKey } = JSON.parse(event.body);

    if (!rawgKey || !supabaseUrl || !supabaseKey) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Faltan credenciales' }) };
    }

    // 1. Obtener todos los juegos de Supabase usando REST API (sin librerías extra)
    const fetchGamesRes = await fetch(`${supabaseUrl}/rest/v1/games?select=id,title`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    });
    const games = await fetchGamesRes.json();

    console.log(`📚 Total de juegos a procesar: ${games.length}`);

    const results = { updated: 0, not_found: 0, errors: 0, details: [] };

    // 2. Procesar cada juego
    for (const game of games) {
      try {
        // Buscar en RAWG
        const rawgUrl = `https://api.rawg.io/api/games?key=${rawgKey}&search=${encodeURIComponent(game.title)}&page_size=1`;
        const rawgRes = await fetch(rawgUrl);
        const rawgData = await rawgRes.json();

        if (rawgData.results && rawgData.results.length > 0) {
          const imageUrl = rawgData.results[0].background_image;

          if (imageUrl) {
            // Actualizar en Supabase usando PATCH
            const updateRes = await fetch(`${supabaseUrl}/rest/v1/games?id=eq.${game.id}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({ image_url: imageUrl })
            });

            if (updateRes.ok) {
              results.updated++;
              results.details.push({ title: game.title, status: 'updated' });
            } else {
              results.errors++;
            }
          } else {
            results.not_found++;
          }
        } else {
          results.not_found++;
        }

        // Pausa de 400ms para no saturar la API de RAWG
        await new Promise(resolve => setTimeout(resolve, 400));

      } catch (err) {
        console.error(`Error con ${game.title}:`, err);
        results.errors++;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `✅ Completado: ${results.updated} actualizadas, ${results.not_found} no encontradas, ${results.errors} errores.`,
      }),
    };

  } catch (error) {
    console.error('Error fatal:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};