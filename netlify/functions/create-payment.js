exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { amount, order_id } = JSON.parse(event.body);
    
    // ✅ Tu API Key de NowPayments
    const API_KEY = '6QNS9JV-34Q4M7B-MN0VEH3-A240EVS'; 

    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
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
        ipn_callback_url: '', 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al crear el pago');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        payment_id: data.id,
        pay_address: data.pay_address,
        pay_amount: data.pay_amount,
        invoice_url: data.invoice_url,
      }),
    };
  } catch (error) {
    console.error('Error en create-payment:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message }),
    };
  }
};