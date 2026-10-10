exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { payment_id } = JSON.parse(event.body);
    
    // ✅ Tu API Key de NowPayments
    const API_KEY = '6QNS9JV-34Q4M7B-MN0VEH3-A240EVS';

    const response = await fetch(`https://api.nowpayments.io/v1/payment/${payment_id}`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al verificar el pago');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        payment_status: data.payment_status,
      }),
    };
  } catch (error) {
    console.error('Error en check-payment:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message }),
    };
  }
};