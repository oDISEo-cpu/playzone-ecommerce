import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Wallet, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, currentUser, createOrder, storeSettings } = useStore();
  const [paymentMethod, setPaymentMethod] = useState<'PAYPAL' | 'BINANCE'>('PAYPAL');
  const [binanceHash, setBinanceHash] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Redirect if not logged in
  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#2D2D2D] mb-4">Debes iniciar sesión para continuar</h1>
        <Link to="/login" className="text-[#0070D1] font-medium hover:underline">
          Ir a Iniciar Sesión
        </Link>
      </div>
    );
  }

  // Redirect if cart is empty
  if (cart.length === 0 && !orderComplete) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#2D2D2D] mb-4">Tu carrito está vacío</h1>
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
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (paymentMethod === 'BINANCE' && !binanceHash.trim()) {
      useStore.getState().addToast('Ingresa el hash de transacción de Binance', 'error');
      setProcessing(false);
      return;
    }

    const orderId = createOrder(paymentMethod, paymentMethod === 'BINANCE' ? binanceHash : `PP-${Date.now()}`);
    setProcessing(false);
    setOrderComplete(true);

    if (orderId) {
      setTimeout(() => navigate('/dashboard'), 3000);
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
          <h1 className="text-3xl font-bold text-[#2D2D2D] mb-4">¡Compra Exitosa!</h1>
          {paymentMethod === 'PAYPAL' ? (
            <p className="text-gray-600 mb-6">Tu pago ha sido procesado. Los juegos están disponibles en tu biblioteca.</p>
          ) : (
            <p className="text-gray-600 mb-6">Tu orden está pendiente de confirmación. Te notificaremos cuando el administrador verifique tu pago.</p>
          )}
          <Link
            to="/dashboard"
            className="inline-block px-6 py-3 bg-[#003791] text-white font-semibold rounded-full hover:bg-[#0070D1] transition-colors"
          >
            Ir a Mis Compras
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/cart" className="flex items-center gap-2 text-gray-500 hover:text-[#0070D1] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Volver al carrito</span>
      </Link>

      <h1 className="text-3xl font-bold text-[#2D2D2D] mb-8">Pasarela de Pago</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          {/* Method Selection */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
            <h2 className="font-bold text-[#2D2D2D] mb-4">Método de Pago</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod('PAYPAL')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'PAYPAL'
                    ? 'border-[#0070D1] bg-[#E8F1FB]'
                    : 'border-[#E5E5E5] hover:border-gray-300'
                }`}
              >
                <CreditCard className={`w-8 h-8 ${paymentMethod === 'PAYPAL' ? 'text-[#0070D1]' : 'text-gray-400'}`} />
                <div className="text-left">
                  <p className="font-semibold text-[#2D2D2D]">PayPal</p>
                  <p className="text-xs text-gray-500">Pago instantáneo</p>
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod('BINANCE')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'BINANCE'
                    ? 'border-[#0070D1] bg-[#E8F1FB]'
                    : 'border-[#E5E5E5] hover:border-gray-300'
                }`}
              >
                <Wallet className={`w-8 h-8 ${paymentMethod === 'BINANCE' ? 'text-[#0070D1]' : 'text-gray-400'}`} />
                <div className="text-left">
                  <p className="font-semibold text-[#2D2D2D]">Binance (USDT)</p>
                  <p className="text-xs text-gray-500">Confirmación manual</p>
                </div>
              </button>
            </div>
          </div>

          {/* PayPal */}
          {paymentMethod === 'PAYPAL' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-[#E5E5E5] p-6"
            >
              <h3 className="font-semibold text-[#2D2D2D] mb-4">Pago con PayPal</h3>
              <div className="bg-[#E8F1FB] rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">
                  Serás redirigido a PayPal para completar el pago de forma segura. 
                  Tu orden se confirmará automáticamente.
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
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
              className="bg-white rounded-xl border border-[#E5E5E5] p-6"
            >
              <h3 className="font-semibold text-[#2D2D2D] mb-4">Pago con Binance (USDT)</h3>
              
              {/* QR Code */}
              {storeSettings.binanceQRUrl && (
                <div className="mb-4 flex flex-col items-center">
                  <img
                    src={storeSettings.binanceQRUrl}
                    alt="QR de pago Binance"
                    className="w-48 h-48 object-contain border border-[#E5E5E5] rounded-lg mb-2"
                  />
                  <p className="text-sm text-gray-600 text-center">
                    Escanea el QR o copia la dirección
                  </p>
                </div>
              )}

              <div className="bg-[#E8F1FB] rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Realiza la transferencia USDT (TRC20) a la siguiente dirección:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white p-3 rounded text-xs text-[#2D2D2D] break-all">
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
                <p className="text-sm text-gray-600 mt-2">
                  Monto exacto: <strong>${subtotal.toFixed(2)} USDT</strong>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                  Hash de Transacción
                </label>
                <input
                  type="text"
                  value={binanceHash}
                  onChange={(e) => setBinanceHash(e.target.value)}
                  placeholder="Pega aquí el hash de tu transacción..."
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1]"
                />
                <p className="text-xs text-gray-500 mt-2">
                  El administrador verificará tu pago manualmente. Esto puede tomar hasta 24 horas.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-xl border border-[#E5E5E5] p-6">
            <h2 className="font-bold text-[#2D2D2D] mb-4">Resumen del Pedido</h2>
            <div className="space-y-3 mb-4">
              {cart.map(item => {
                const price = item.game.discount > 0
                  ? item.game.price * (1 - item.game.discount / 100)
                  : item.game.price;
                return (
                  <div key={item.game.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">{item.game.title} x{item.quantity}</span>
                    <span className="text-[#2D2D2D] font-medium shrink-0">${(price * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-[#E5E5E5] pt-4">
              <div className="flex justify-between">
                <span className="font-bold text-[#2D2D2D]">Total</span>
                <span className="font-bold text-xl text-[#2D2D2D]">${subtotal.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full mt-6 py-4 bg-[#003791] text-white font-semibold rounded-xl hover:bg-[#0070D1] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando...
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
