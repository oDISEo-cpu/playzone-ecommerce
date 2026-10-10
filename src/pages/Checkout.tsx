import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Wallet, ArrowLeft, CheckCircle, Loader2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, currentUser, createOrder, updateOrderStatus } = useStore();
  const [paymentMethod, setPaymentMethod] = useState<'PAYPAL' | 'BINANCE'>('PAYPAL');
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  
  // Estados para NowPayments
  const [nowPaymentsData, setNowPaymentsData] = useState<any>(null);
  const [paymentId, setPaymentId] = useState<string>('');

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#2D2D2D] dark:text-[#F1F5F9] mb-4">Debes iniciar sesión para continuar</h1>
        <Link to="/login" className="text-[#0070D1] font-medium hover:underline">Ir a Iniciar Sesión</Link>
      </div>
    );
  }

  if (cart.length === 0 && !orderComplete) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#2D2D2D] dark:text-[#F1F5F9] mb-4">Tu carrito está vacío</h1>
        <Link to="/games" className="text-[#0070D1] font-medium hover:underline">Ir al Catálogo</Link>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => {
    const price = item.game.discount > 0 ? item.game.price * (1 - item.game.discount / 100) : item.game.price;
    return sum + price * item.quantity;
  }, 0);

  const handleInitiatePayment = async () => {
    setProcessing(true);
    setVerificationStatus('Generando dirección de pago segura...');
    
    try {
      if (paymentMethod === 'BINANCE') {
        // 1. Llamar a nuestra función de Netlify para crear la factura en NowPayments
        const response = await fetch('/.netlify/functions/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: subtotal,
            order_id: `ORDER-${Date.now()}`
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          setNowPaymentsData(result);
          setPaymentId(result.payment_id);
          setVerificationStatus('');
        } else {
          useStore.getState().addToast(result.message || 'Error al generar el pago', 'error');
        }
      } else {
        // Flujo PayPal (Simulado)
        setVerificationStatus('Procesando pago con PayPal...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        const orderId = createOrder('PAYPAL', `PP-${Date.now()}`);
        setOrderComplete(true);
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      useStore.getState().addToast('Error de conexión', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentId) return;
    
    setProcessing(true);
    setVerificationStatus('Consultando a la blockchain a través de NowPayments...');
    
    try {
      const response = await fetch('/.netlify/functions/check-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId }),
      });
      
      const result = await response.json();
      
      if (result.success && result.payment_status === 'finished') {
        setVerificationStatus('¡Pago confirmado! Procesando orden...');
        const orderId = createOrder('BINANCE', `NP-${paymentId}`);
        if (orderId) updateOrderStatus(orderId, 'COMPLETED');
        
        setOrderComplete(true);
        setTimeout(() => navigate('/dashboard'), 3000);
      } else if (result.success && result.payment_status === 'waiting') {
        useStore.getState().addToast('Aún no detectamos el pago. Asegúrate de haber enviado el monto exacto y espera 1-2 minutos.', 'info');
        setVerificationStatus('');
      } else {
        useStore.getState().addToast('Pago no encontrado o fallido.', 'error');
        setVerificationStatus('');
      }
    } catch (error) {
      console.error('Error:', error);
      useStore.getState().addToast('Error al verificar el pago', 'error');
      setVerificationStatus('');
    } finally {
      setProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-[#2D2D2D] dark:text-[#F1F5F9] mb-4">¡Compra Exitosa!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Tu pago fue verificado automáticamente. Los juegos están disponibles en tu biblioteca.</p>
          <Link to="/dashboard" className="inline-block px-6 py-3 bg-[#003791] dark:bg-[#0070D1] text-white font-semibold rounded-full hover:bg-[#0070D1] dark:hover:bg-[#005BB5] transition-colors">
            Ir a Mis Compras
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/cart" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#0070D1] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Volver al carrito</span>
      </Link>

      <h1 className="text-3xl font-bold text-[#2D2D2D] dark:text-[#F1F5F9] mb-8">Pasarela de Pago</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Selección de Método */}
          <div className="bg-white dark:bg-[#151E32] rounded-xl border border-[#E5E5E5] dark:border-[#1E293B] p-6 transition-colors">
            <h2 className="font-bold text-[#2D2D2D] dark:text-[#F1F5F9] mb-4">Método de Pago</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => { setPaymentMethod('PAYPAL'); setNowPaymentsData(null); }}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'PAYPAL' ? 'border-[#0070D1] bg-[#E8F1FB] dark:bg-[#1E293B]' : 'border-[#E5E5E5] dark:border-[#1E293B] hover:border-gray-300'
                }`}
              >
                <CreditCard className={`w-8 h-8 ${paymentMethod === 'PAYPAL' ? 'text-[#0070D1]' : 'text-gray-400'}`} />
                <div className="text-left">
                  <p className="font-semibold text-[#2D2D2D] dark:text-[#F1F5F9]">PayPal</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pago instantáneo (Demo)</p>
                </div>
              </button>
              <button
                onClick={() => { setPaymentMethod('BINANCE'); setNowPaymentsData(null); }}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'BINANCE' ? 'border-[#0070D1] bg-[#E8F1FB] dark:bg-[#1E293B]' : 'border-[#E5E5E5] dark:border-[#1E293B] hover:border-gray-300'
                }`}
              >
                <Wallet className={`w-8 h-8 ${paymentMethod === 'BINANCE' ? 'text-[#0070D1]' : 'text-gray-400'}`} />
                <div className="text-left">
                  <p className="font-semibold text-[#2D2D2D] dark:text-[#F1F5F9]">Binance (USDT TRC20)</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Verificación automática</p>
                </div>
              </button>
            </div>
          </div>

          {/* Vista de PayPal */}
          {paymentMethod === 'PAYPAL' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#151E32] rounded-xl border border-[#E5E5E5] dark:border-[#1E293B] p-6 transition-colors">
              <h3 className="font-semibold text-[#2D2D2D] dark:text-[#F1F5F9] mb-4">Pago con PayPal</h3>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 transition-colors">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  <strong>Nota:</strong> En producción, aquí se integraría el SDK real de PayPal. Para esta demo, el pago se simula como completado al hacer clic en "Pagar".
                </p>
              </div>
            </motion.div>
          )}

          {/* Vista de Binance / NowPayments */}
          {paymentMethod === 'BINANCE' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#151E32] rounded-xl border border-[#E5E5E5] dark:border-[#1E293B] p-6 transition-colors">
              {!nowPaymentsData ? (
                // Paso 1: Botón para generar la dirección
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-[#0070D1] mx-auto mb-4" />
                  <h3 className="font-semibold text-[#2D2D2D] dark:text-[#F1F5F9] mb-2">Pagar con USDT (TRC20)</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Al hacer clic, generaremos una dirección de depósito única y segura para tu orden.
                  </p>
                  <button
                    onClick={handleInitiatePayment}
                    disabled={processing}
                    className="px-6 py-3 bg-[#003791] dark:bg-[#0070D1] text-white font-semibold rounded-lg hover:bg-[#0070D1] dark:hover:bg-[#005BB5] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                  >
                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generar Dirección de Pago'}
                  </button>
                  {verificationStatus && <p className="text-sm text-[#0070D1] mt-4">{verificationStatus}</p>}
                </div>
              ) : (
                // Paso 2: Mostrar la dirección generada
                <div>
                  <h3 className="font-semibold text-[#2D2D2D] dark:text-[#F1F5F9] mb-4">Instrucciones de Pago</h3>
                  <div className="bg-[#E8F1FB] dark:bg-[#1E293B] rounded-lg p-4 mb-4 transition-colors">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Envía exactamente <strong>{nowPaymentsData.pay_amount} USDT</strong> a esta dirección (Red TRC20):
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white dark:bg-[#0B1120] p-3 rounded text-xs text-[#2D2D2D] dark:text-[#F1F5F9] break-all transition-colors">
                        {nowPaymentsData.pay_address}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(nowPaymentsData.pay_address);
                          useStore.getState().addToast('Dirección copiada', 'success');
                        }}
                        className="p-3 bg-[#0070D1] text-white rounded-lg hover:bg-[#003791] transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 transition-colors">
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      ⚠️ <strong>Importante:</strong> Asegúrate de usar la red <strong>TRON (TRC20)</strong>. Enviar por otra red resultará en la pérdida de fondos.
                    </p>
                  </div>

                  <button
                    onClick={handleVerifyPayment}
                    disabled={processing}
                    className="w-full py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> <span>{verificationStatus || 'Verificando...'}</span></>
                    ) : (
                      '✅ Ya realicé el pago, verificar ahora'
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Resumen del Pedido */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-[#151E32] rounded-xl border border-[#E5E5E5] dark:border-[#1E293B] p-6 transition-colors">
            <h2 className="font-bold text-[#2D2D2D] dark:text-[#F1F5F9] mb-4">Resumen del Pedido</h2>
            <div className="space-y-3 mb-4">
              {cart.map(item => {
                const price = item.game.discount > 0 ? item.game.price * (1 - item.game.discount / 100) : item.game.price;
                return (
                  <div key={item.game.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 truncate mr-2">{item.game.title} x{item.quantity}</span>
                    <span className="text-[#2D2D2D] dark:text-[#F1F5F9] font-medium shrink-0">${(price * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-[#E5E5E5] dark:border-[#1E293B] pt-4 transition-colors">
              <div className="flex justify-between">
                <span className="font-bold text-[#2D2D2D] dark:text-[#F1F5F9]">Total</span>
                <span className="font-bold text-xl text-[#003791] dark:text-[#0070D1]">${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}