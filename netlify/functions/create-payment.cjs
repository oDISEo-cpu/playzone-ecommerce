exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { amount, order_id } = JSON.parse(event.body);
    
    // ✅ Tu API Key de NowPayments
    const API_KEY = '6QNS9JV-34Q4M7B-MN0VEH3-A240EVS'; 

    console.log('📝 Creando pago con NowPayments:', { amount, order_id });

    // ✅ ENDPOINT CORRECTO según la documentación (Flujo Estándar)
    const response = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: 'usdttrc20', // USDT en red TRON (TRC20)
        order_id: order_id,
      }),
    });

    const data = await response.json();
    
    // Log para que puedas ver la respuesta en los logs de Netlify si algo falla
    console.log('📦 Respuesta completa de NowPayments:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ Error de NowPayments:', data);
      throw new Error(data.message || `Error ${response.status}`);
    }

    // Verificar que los campos necesarios existan en la respuesta
    if (!data.payment_id || !data.pay_address || !data.pay_amount) {
      console.error('⚠️ Faltan campos en la respuesta:', data);
      throw new Error('Respuesta incompleta de NowPayments');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        payment_id: data.payment_id,
        pay_address: data.pay_address,
        pay_amount: data.pay_amount,
        payment_status: data.payment_status,
      }),
    };
  } catch (error) {
    console.error('💥 Error en create-payment:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: error.message || 'Error interno del servidor' 
      }),
    };
  }
};