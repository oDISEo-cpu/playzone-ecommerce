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
    const { rawgKey, supabaseUrl, supabaseKey } = JSON.parse(event.body);

    if (!rawgKey || !supabaseUrl || !supabaseKey) {
      return { 
        statusCode: 400, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Faltan credenciales' }) 
      };
    }

    // Obtener juegos
    const gamesResponse = await fetch(`${supabaseUrl}/rest/v1/games?select=id,title`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    });

    if (!gamesResponse.ok) throw new Error('Error al obtener juegos');
    const games = await gamesResponse.json();

    let updated = 0;
    let notFound = 0;
    let errors = 0;

    // Procesar en paralelo con límite de 3 simultáneos
    const batchSize = 3;
    for (let i = 0; i < games.length; i += batchSize) {
      const batch = games.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (game) => {
        try {
          const rawgResponse = await fetch(
            `https://api.rawg.io/api/games?key=${rawgKey}&search=${encodeURIComponent(game.title)}&page_size=1`
          );

          if (!rawgResponse.ok) {
            errors++;
            return;
          }

          const rawgData = await rawgResponse.json();

          if (rawgData.results?.[0]?.background_image) {
            const imageUrl = rawgData.results[0].background_image;

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

      // Pausa pequeña entre lotes
      await new Promise(resolve => setTimeout(resolve, 200));
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
    return { 
      statusCode: 500, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: error.message }) 
    };
  }
};