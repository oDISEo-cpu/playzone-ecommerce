// netlify/functions/auto-update-images.cjs

exports.handler = async function (event, context) {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Método no permitido' }) 
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { rawgKey, supabaseUrl, supabaseKey } = body;

    if (!rawgKey || !supabaseUrl || !supabaseKey) {
      return { 
        statusCode: 400, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Faltan credenciales' }) 
      };
    }

    // Obtener juegos de Supabase
    const gamesResponse = await fetch(`${supabaseUrl}/rest/v1/games?select=id,title`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    });

    if (!gamesResponse.ok) {
      throw new Error(`Error al obtener juegos: ${gamesResponse.status}`);
    }

    const games = await gamesResponse.json();
    let updated = 0;
    let notFound = 0;
    let errors = 0;

    // Procesar cada juego
    for (const game of games) {
      try {
        // Buscar en RAWG
        const rawgResponse = await fetch(
          `https://api.rawg.io/api/games?key=${rawgKey}&search=${encodeURIComponent(game.title)}&page_size=1`
        );

        if (!rawgResponse.ok) {
          errors++;
          continue;
        }

        const rawgData = await rawgResponse.json();

        if (rawgData.results && rawgData.results.length > 0) {
          const imageUrl = rawgData.results[0].background_image;

          if (imageUrl) {
            // Actualizar en Supabase
            const updateResponse = await fetch(
              `${supabaseUrl}/rest/v1/games?id=eq.${game.id}`, 
              {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ image_url: imageUrl })
              }
            );

            if (updateResponse.ok) {
              updated++;
            } else {
              errors++;
            }
          } else {
            notFound++;
          }
        } else {
          notFound++;
        }

        // Pausa para no saturar API
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (gameError) {
        errors++;
        console.error(`Error con ${game.title}:`, gameError.message);
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: `✅ Completado: ${updated} actualizadas, ${notFound} no encontradas, ${errors} errores.`
      })
    };

  } catch (error) {
    console.error('Error fatal:', error);
    return { 
      statusCode: 500, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false, 
        error: error.message || 'Error interno del servidor' 
      }) 
    };
  }
};