// netlify/functions/auto-update-images.cjs

exports.handler = async function (event) {
  console.log('🚀 Función auto-update-images iniciada');
  console.log(' Método:', event.httpMethod);
  console.log('📋 Body recibido:', event.body);

  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    console.log(' Método no permitido:', event.httpMethod);
    return { 
      statusCode: 405, 
      body: JSON.stringify({ success: false, error: 'Método no permitido' }) 
    };
  }

  try {
    // Parsear el body
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (parseError) {
      console.error(' Error parseando body:', parseError);
      return { 
        statusCode: 400, 
        body: JSON.stringify({ success: false, error: 'Body inválido', details: parseError.message }) 
      };
    }

    const { rawgKey, supabaseUrl, supabaseKey } = body;

    console.log('🔑 RAWG Key:', rawgKey ? 'Presente' : 'Ausente');
    console.log(' Supabase URL:', supabaseUrl || 'Ausente');
    console.log(' Supabase Key:', supabaseKey ? 'Presente' : 'Ausente');

    // Validar que tengamos todos los datos necesarios
    if (!rawgKey) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ success: false, error: 'Falta la API Key de RAWG' }) 
      };
    }

    if (!supabaseUrl || !supabaseKey) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ success: false, error: 'Faltan credenciales de Supabase' }) 
      };
    }

    console.log('📡 Obteniendo juegos de Supabase...');
    console.log('📡 URL:', `${supabaseUrl}/rest/v1/games?select=id,title`);

    // 1. Obtener todos los juegos de Supabase
    let games;
    try {
      const fetchGamesRes = await fetch(`${supabaseUrl}/rest/v1/games?select=id,title`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      });

      console.log('📡 Respuesta de Supabase:', fetchGamesRes.status);

      if (!fetchGamesRes.ok) {
        const errorText = await fetchGamesRes.text();
        console.error(' Error en respuesta de Supabase:', errorText);
        throw new Error(`Error al obtener juegos: ${fetchGamesRes.status} - ${errorText}`);
      }

      games = await fetchGamesRes.json();
      console.log(`📚 Total de juegos obtenidos: ${games.length}`);
    } catch (fetchError) {
      console.error('❌ Error al obtener juegos:', fetchError);
      return { 
        statusCode: 500, 
        body: JSON.stringify({ 
          success: false, 
          error: 'No se pudieron obtener los juegos de Supabase',
          details: fetchError.message 
        }) 
      };
    }

    const results = { 
      updated: 0, 
      not_found: 0, 
      errors: 0, 
      details: [] 
    };

    // 2. Procesar cada juego
    for (const game of games) {
      try {
        console.log(`\n🔍 Procesando: ${game.title}`);

        // Buscar en RAWG
        const rawgUrl = `https://api.rawg.io/api/games?key=${rawgKey}&search=${encodeURIComponent(game.title)}&page_size=1`;
        console.log('🔍 URL RAWG:', rawgUrl);
        
        const rawgRes = await fetch(rawgUrl);
        
        if (!rawgRes.ok) {
          console.warn(`⚠️ RAWG respondió con error para ${game.title}: ${rawgRes.status}`);
          results.errors++;
          results.details.push({ title: game.title, status: 'rawg_error', code: rawgRes.status });
          continue;
        }

        const rawgData = await rawgRes.json();
        console.log('📦 Respuesta RAWG:', JSON.stringify(rawgData).substring(0, 200));

        if (rawgData.results && rawgData.results.length > 0) {
          const imageUrl = rawgData.results[0].background_image;
          console.log('🖼️ Imagen encontrada:', imageUrl);

          if (imageUrl) {
            console.log(`✅ Actualizando ${game.title} en Supabase...`);

            // Actualizar en Supabase
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

            console.log(' Respuesta de actualización:', updateRes.status);

            if (updateRes.ok) {
              results.updated++;
              results.details.push({ title: game.title, status: 'updated', image: imageUrl });
              console.log(`✅ Actualizado exitosamente: ${game.title}`);
            } else {
              const errorText = await updateRes.text();
              console.error(`❌ Error actualizando ${game.title}:`, errorText);
              results.errors++;
              results.details.push({ title: game.title, status: 'update_error', error: errorText });
            }
          } else {
            console.log(`⚠️ No hay imagen para ${game.title}`);
            results.not_found++;
            results.details.push({ title: game.title, status: 'no_image' });
          }
        } else {
          console.log(`⚠️ No se encontró ${game.title} en RAWG`);
          results.not_found++;
          results.details.push({ title: game.title, status: 'not_found' });
        }

        // Pausa de 400ms para no saturar la API de RAWG
        await new Promise(resolve => setTimeout(resolve, 400));

      } catch (gameError) {
        console.error(`💥 Error procesando ${game.title}:`, gameError);
        results.errors++;
        results.details.push({ title: game.title, status: 'error', error: gameError.message });
      }
    }

    console.log('\n✅ Proceso completado:', results);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `✅ Completado: ${results.updated} actualizadas, ${results.not_found} no encontradas, ${results.errors} errores.`,
        results
      }),
    };

  } catch (error) {
    console.error('💥 Error fatal en la función:', error);
    console.error('💥 Stack trace:', error.stack);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        success: false, 
        error: 'Error interno del servidor',
        details: error.message 
      }) 
    };
  }
};