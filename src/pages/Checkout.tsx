import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, ArrowLeft, CheckCircle, Loader2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, currentUser, createOrder, updateOrderStatus } = useStore();
  
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  
  const [nowPaymentsData, setNowPaymentsData] = useState<{
    payment_id: string;
    pay_address: string;
    pay_amount: string;
  } | null>(null);
  const [paymentId, setPaymentId] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0B1120] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Debes iniciar sesión para continuar</h1>
          <Link to="/login" className="text-[#0070D1] dark:text-[#60A5FA] font-medium hover:underline">
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0B1120] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tu carrito está vacío</h1>
          <Link to="/games" className="text-[#0070D1] dark:text-[#60A5FA] font-medium hover:underline">
            Ir al Catálogo
          </Link>
        </div>
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
    setError('');
    
    try {
      console.log('🚀 Iniciando pago con NowPayments...', { amount: subtotal });
      
      const response = await fetch('/.netlify/functions/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: subtotal, 
          order_id: `ORDER-${Date.now()}` 
        }),
      });
      
      const result = await response.json();
      console.log('📥 Respuesta del servidor:', result);
      
      if (result.success && result.pay_address) {
        console.log('✅ Pago creado exitosamente:', result);
        setNowPaymentsData({
          payment_id: result.payment_id,
          pay_address: result.pay_address,
          pay_amount: result.pay_amount,
        });
        setPaymentId(result.payment_id);
        setVerificationStatus('');
        setError('');
      } else {
        console.error('❌ Error al crear pago:', result);
        const errorMsg = result.message || 'No se pudo generar la dirección de pago';
        setError(errorMsg);
        useStore.getState().addToast(errorMsg, 'error');
        setVerificationStatus('');
      }
    } catch (error) {
      console.error('💥 Error en handleInitiatePayment:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error de conexión';
      setError(errorMsg);
      useStore.getState().addToast(errorMsg, 'error');
      setVerificationStatus('');
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentId) {
      setError('No hay ID de pago para verificar');
      return;
    }
    
    setProcessing(true);
    setVerificationStatus('Consultando a la blockchain a través de NowPayments...');
    setError('');
    
    try {
      const response = await fetch('/.netlify/functions/check-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId }),
      });
      
      const result = await response.json();
      console.log('📥 Resultado de verificación:', result);
      
      if (result.success && result.payment_status === 'finished') {
        setVerificationStatus('¡Pago confirmado! Procesando orden...');
        const orderId = createOrder('BINANCE', `NP-${paymentId}`);
        if (orderId) updateOrderStatus(orderId, 'COMPLETED');
        
        setOrderComplete(true);
        setTimeout(() => navigate('/dashboard'), 3000);
      } else if (result.success && result.payment_status === 'waiting' || result.payment_status === 'confirming') {
        useStore.getState().addToast('Pago detectado, esperando confirmaciones de la red. Espera 1-2 minutos.', 'info');
        setVerificationStatus('');
      } else if (result.success && result.payment_status === 'failed') {
        setError('El pago falló. Por favor intenta de nuevo.');
        useStore.getState().addToast('Pago fallido', 'error');
        setVerificationStatus('');
      } else {
        setError('No se pudo verificar el pago. Asegúrate de haber enviado el monto exacto.');
        useStore.getState().addToast('Pago no encontrado', 'error');
        setVerificationStatus('');
      }
    } catch (error) {
      console.error('💥 Error en handleVerifyPayment:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error al verificar';
      setError(errorMsg);
      useStore.getState().addToast(errorMsg, 'error');
      setVerificationStatus('');
    } finally {
      setProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0B1120] transition-colors duration-300">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">¡Compra Exitosa!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Tu pago fue verificado automáticamente en la blockchain. Los juegos están disponibles en tu biblioteca.
            </p>
            <Link to="/dashboard" className="inline-block px-6 py-3 bg-[#003791] dark:bg-[#0070D1] text-white font-semibold rounded-full hover:bg-[#0070D1] dark:hover:bg-[#005BB5] transition-colors">
              Ir a Mis Compras
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/cart" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#0070D1] dark:hover:text-[#60A5FA] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver al carrito</span>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Pasarela de Pago</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-white dark:bg-[#151E32] rounded-xl border border-gray-200 dark:border-[#1E293B] p-6 transition-colors"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#E8F1FB] dark:bg-[#1E293B] rounded-xl">
                  <Wallet className="w-8 h-8 text-[#0070D1] dark:text-[#60A5FA]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Binance (USDT TRC20)</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pago seguro con verificación automática en blockchain</p>
                </div>
              </div>

              {!nowPaymentsData ? (
                <div className="text-center py-8 border-t border-gray-100 dark:border-[#1E293B] pt-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                    Al hacer clic, el sistema generará una dirección de depósito <strong className="text-[#0070D1] dark:text-[#60A5FA]">única y segura</strong> vinculada a tu orden.
                  </p>
                  <button
                    onClick={handleInitiatePayment}
                    disabled={processing}
                    className="px-8 py-4 bg-[#003791] dark:bg-[#0070D1] text-white font-semibold rounded-xl hover:bg-[#0070D1] dark:hover:bg-[#005BB5] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                  >
                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generar Dirección de Pago'}
                  </button>
                  {verificationStatus && <p className="text-sm text-[#0070D1] dark:text-[#60A5FA] mt-4 animate-pulse">{verificationStatus}</p>}
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-md mx-auto">
                      <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-t border-gray-100 dark:border-[#1E293B] pt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Instrucciones de Pago</h3>
                  
                  <div className="bg-[#E8F1FB] dark:bg-[#1E293B] rounded-xl p-5 mb-6 transition-colors">
                    <p className="text-sm text-gray-700 dark:text-gray-200 mb-3">
                      Envía exactamente <strong className="text-[#003791] dark:text-[#60A5FA] text-lg">{nowPaymentsData.pay_amount} USDT</strong> a esta dirección:
                    </p>
                    <div className="flex items-stretch gap-2">
                      <code className="flex-1 bg-white dark:bg-[#0B1120] p-4 rounded-lg text-xs text-gray-800 dark:text-gray-200 break-all transition-colors border border-gray-200 dark:border-gray-700 font-mono flex items-center">
                        {nowPaymentsData.pay_address}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(nowPaymentsData.pay_address);
                          useStore.getState().addToast('Dirección copiada al portapapeles', 'success');
                        }}
                        className="px-4 bg-[#0070D1] text-white rounded-lg hover:bg-[#003791] transition-colors flex items-center justify-center"
                        title="Copiar dirección"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-6 transition-colors">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-start gap-2">
                      <span className="text-lg">⚠️</span>
                      <span>
                        <strong>Importante:</strong> Asegúrate de usar exclusivamente la red <strong className="text-[#0070D1] dark:text-[#60A5FA]">TRON (TRC20)</strong>. 
                        Enviar fondos por otra red (como ERC20 o BEP20) resultará en la pérdida permanente de tus fondos.
                      </span>
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleVerifyPayment}
                    disabled={processing}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                  >
                    {processing ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> <span>{verificationStatus || 'Verificando en la blockchain...'}</span></>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Ya realicé el pago, verificar ahora
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                    La verificación automática puede tardar de 1 a 3 minutos dependiendo de la congestión de la red TRON.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-[#151E32] rounded-xl border border-gray-200 dark:border-[#1E293B] p-6 transition-colors">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Resumen del Pedido</h2>
              <div className="space-y-3 mb-4">
                {cart.map(item => {
                  const price = item.game.discount > 0 ? item.game.price * (1 - item.game.discount / 100) : item.game.price;
                  return (
                    <div key={item.game.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 truncate mr-2">{item.game.title} x{item.quantity}</span>
                      <span className="text-gray-900 dark:text-white font-medium shrink-0">${(price * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-200 dark:border-[#1E293B] pt-4 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white">Total a Pagar</span>
                  <span className="font-bold text-2xl text-[#003791] dark:text-[#60A5FA]">${subtotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                  Equivalente a ~{nowPaymentsData ? nowPaymentsData.pay_amount : (subtotal * 1.0).toFixed(2)} USDT
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}