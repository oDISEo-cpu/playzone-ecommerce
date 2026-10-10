import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Wallet, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, currentUser, createOrder, storeSettings } = useStore();
  const [paymentMethod, setPaymentMethod] = useState<'PAYPAL' | 'BINANCE'>('PAYPAL');
  const [binanceHash, setBinanceHash] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#2D2D2D] dark:text-[#F1F5F9] mb-4">Debes iniciar sesión para continuar</h1>
        <Link to="/login" className="text-[#0070D1] font-medium hover:underline">
          Ir a Iniciar Sesión
        </Link>
      </div>
    );
  }

  if (cart.length === 0 && !orderComplete) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#2D2D2D] dark:text-[#F1F5F9] mb-4">Tu carrito está vacío</h1>
        <Link to="/games" className="text-[#0070D1] font-medium hover:underline">
          Ir al Catálogo
        </Link>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => {
    const price = item.game.discount > 0
      ? item.game.price * (1 - item.game.discount / 100)
      : item.game.price;
    return sum + price * item.quantity;
  }, 0);

  const handlePayment = async () => {
    setProcessing(true);
    setVerificationStatus('Conectando con la blockchain...');
    
    try {
      if (paymentMethod === 'BINANCE') {
        if (!binanceHash.trim()) {
          useStore.getState().addToast('Ingresa el hash de transacción de Binance', 'error');
          setProcessing(false);
          setVerificationStatus('');
          return;
        }

        setVerificationStatus('Verificando pago en la red TRON...');

        // Llamar a nuestra Netlify Function para verificar el pago
        const response = await fetch('/.netlify/functions/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txHash: binanceHash.trim(),
            walletAddress: storeSettings.binanceWallet,
            amount: subtotal
          }),
        });

        const result = await response.json();

        if (result.valid) {
          setVerificationStatus('¡Pago confirmado! Procesando orden...');
          
          // Crear la orden
          const orderId = createOrder('BINANCE', binanceHash.trim());
          
          // Marcar como completada automáticamente
          if (orderId) {
            useStore.getState().updateOrderStatus(orderId, 'COMPLETED');
          }
          
          setOrderComplete(true);
          setTimeout(() => navigate('/dashboard'), 3000);
        } else {
          useStore.getState().addToast(result.message || 'Pago no verificado', 'error');
          setVerificationStatus('');
        }
      } else {
        // Flujo normal de PayPal (Simulado)
        setVerificationStatus('Procesando pago con PayPal...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const orderId = createOrder('PAYPAL', `PP-${Date.now()}`);
        setOrderComplete(true);
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } catch (error) {
      console.error('Error en el pago:', error);
      useStore.getState().addToast('Error de conexión al verificar el pago', 'error');
      setVerificationStatus('');
    } finally {
      setProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-[#2D2D2D] dark:text-[#F1F5F9] mb-4">¡Compra Exitosa!</h1>
          {paymentMethod === 'PAYPAL' ? (
            <p className="text-gray-600 dark:text-gray-400 mb-6">Tu pago ha sido procesado. Los juegos están disponibles en tu biblioteca.</p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 mb-6">Tu pago fue verificado automáticamente en la blockchain. Los juegos están disponibles en tu biblioteca.</p>
          )}
          <Link
            to="/dashboard"
            className="inline-block px-6 py-3 bg-[#003791] dark:bg-[#0070D1] text-white font-semibold rounded-full hover:bg-[#0070D1] dark:hover:bg-[#005BB5] transition-colors"
          >
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
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          {/* Method Selection */}
          <div className="bg-white dark:bg-[#151E32] rounded-xl border border-[#E5E5E5] dark:border-[#1E293B] p-6 transition-colors">
            <h2 className="font-bold text-[#2D2D2D] dark:text-[#F1F5F9] mb-4">Método de Pago</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod('PAYPAL')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'PAYPAL'
                    ? 'border-[#0070D1] bg-[#E8F1FB] dark:bg-[#1E293B]'
                    : 'border-[#E5E5E5] dark:border-[#1E293B] hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <CreditCard className={`w-8 h-8 ${paymentMethod === 'PAYPAL' ? 'text-[#0070D1]' : 'text-gray-400'}`} />
                <div className="text-left">
                  <p className="font-semibold text-[#2D2D2D] dark:text-[#F1F5F9]">PayPal</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pago instantáneo</p>
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod('BINANCE')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'BINANCE'
                    ? 'border-[#0070D1] bg-[#E8F1FB] dark:bg-[#1E293B]'
                    : 'border-[#E5E5E5] dark:border-[#1E293B] hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Wallet className={`w-8 h-8 ${paymentMethod === 'BINANCE' ? 'text-[#0070D1]' : 'text-gray-400'}`} />
                <div className="text-left">
                  <p className="font-semibold text-[#2D2D2D] dark:text-[#F1F5F9]">Binance (USDT)</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Verificación automática</p>
                </div>
              </button>
            </div>
          </div>

          {/* PayPal */}
          {paymentMethod === 'PAYPAL' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#151E32] rounded-xl border border-[#E5E5E5] dark:border-[#1E293B] p-6 transition-colors"
            >
              <h3 className="font-semibold text-[#2D2D2D] dark:text-[#F1F5F9] mb-4">Pago con PayPal</h3>
              <div className="bg-[#E8F1FB] dark:bg-[#1E293B] rounded-lg p-4 mb-4 transition-colors">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Serás redirigido a PayPal para completar el pago de forma segura. 
                  Tu orden se confirmará automáticamente.
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 transition-colors">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  <strong>Nota:</strong> En producción, aquí se integraría el SDK real de PayPal (Sandbox). 
                  Para esta demo, el pago se simula como completado.
                </p>
              </div>
            </motion.div>
          )}

          {/* Binance */}
          {paymentMethod === 'BINANCE' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#151E32] rounded-xl border border-[#E5E5E5] dark:border-[#1E293B] p-6 transition-colors"
            >
              <h3 className="font-semibold text-[#2D2D2D] dark:text-[#F1F5F9] mb-4">Pago con Binance (USDT TRC20)</h3>
              
              {/* QR Code */}
              {storeSettings.binanceQRUrl && (
                <div className="mb-4 flex flex-col items-center">
                  <img
                    src={storeSettings.binanceQRUrl}
                    alt="QR de pago Binance"
                    className="w-48 h-48 object-contain border border-[#E5E5E5] dark:border-[#1E293B] rounded-lg mb-2 bg-white dark:bg-[#0B1120]"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Escanea el QR o copia la dirección
                  </p>
                </div>
              )}

              <div className="bg-[#E8F1FB] dark:bg-[#1E293B] rounded-lg p-4 mb-4 transition-colors">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Realiza la transferencia USDT (TRC20) a la siguiente dirección:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white dark:bg-[#0B1120] p-3 rounded text-xs text-[#2D2D2D] dark:text-[#F1F5F9] break-all transition-colors">
                    {storeSettings.binanceWallet}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(storeSettings.binanceWallet);
                      useStore.getState().addToast('Dirección copiada', 'success');
                    }}
                    className="px-3 py-2 bg-[#0070D1] text-white text-xs font-medium rounded-lg hover:bg-[#003791] transition-colors whitespace-nowrap"
                  >
                    Copiar
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Monto exacto: <strong>${subtotal.toFixed(2)} USDT</strong>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#F1F5F9] mb-2">
                  Hash de Transacción (TX ID)
                </label>
                <input
                  type="text"
                  value={binanceHash}
                  onChange={(e) => setBinanceHash(e.target.value)}
                  placeholder="Pega aquí el hash de tu transacción..."
                  maxLength={100}
                  className="w-full px-4 py-3 bg-white dark:bg-[#0B1120] border border-[#E5E5E5] dark:border-[#1E293B] text-[#2D2D2D] dark:text-[#F1F5F9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1] transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Tu pago será verificado automáticamente en la blockchain de TRON.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-[#151E32] rounded-xl border border-[#E5E5E5] dark:border-[#1E293B] p-6 transition-colors">
            <h2 className="font-bold text-[#2D2D2D] dark:text-[#F1F5F9] mb-4">Resumen del Pedido</h2>
            <div className="space-y-3 mb-4">
              {cart.map(item => {
                const price = item.game.discount > 0
                  ? item.game.price * (1 - item.game.discount / 100)
                  : item.game.price;
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
            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full mt-6 py-4 bg-[#003791] dark:bg-[#0070D1] text-white font-semibold rounded-xl hover:bg-[#0070D1] dark:hover:bg-[#005BB5] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{verificationStatus || 'Procesando...'}</span>
                </>
              ) : (
                `Pagar $${subtotal.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}