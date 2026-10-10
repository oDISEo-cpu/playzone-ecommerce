exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { payment_id } = JSON.parse(event.body);
    
    // ✅ Tu API Key de NowPayments
    const API_KEY = '6QNS9JV-34Q4M7B-MN0VEH3-A240EVS';

    console.log('🔍 Verificando pago con ID:', payment_id);

    // ✅ ENDPOINT CORRECTO según la documentación (GET Payment Status)
    const response = await fetch(`https://api.nowpayments.io/v1/payment/${payment_id}`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('📦 Estado del pago:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ Error al verificar:', data);
      throw new Error(data.message || `Error ${response.status}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        payment_status: data.payment_status, // 'waiting', 'confirming', 'finished', 'failed', etc.
      }),
    };
  } catch (error) {
    console.error('💥 Error en check-payment:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: error.message || 'Error interno del servidor' 
      }),
    };
  }
};