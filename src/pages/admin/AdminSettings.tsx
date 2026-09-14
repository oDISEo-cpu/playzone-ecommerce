import { useState, useRef } from 'react';
import { Upload, X, Save, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';

export default function AdminSettings() {
  const { storeSettings, updateStoreSettings } = useStore();
  const [binanceWallet, setBinanceWallet] = useState(storeSettings.binanceWallet);
  const [binanceQRUrl, setBinanceQRUrl] = useState(storeSettings.binanceQRUrl);
  const [paypalEmail, setPaypalEmail] = useState(storeSettings.paypalEmail);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        useStore.getState().addToast('Por favor selecciona un archivo de imagen válido', 'error');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        useStore.getState().addToast('La imagen no debe superar los 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBinanceQRUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateStoreSettings({
      binanceWallet,
      binanceQRUrl,
      paypalEmail,
    });
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-[#2D2D2D] mb-6">Configuración de la Tienda</h2>

      <div className="space-y-6">
        {/* Binance Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-[#E5E5E5] p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-[#0070D1]" />
            <h3 className="font-semibold text-[#2D2D2D]">Configuración de Binance (USDT)</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                Dirección de Wallet USDT (TRC20)
              </label>
              <input
                type="text"
                value={binanceWallet}
                onChange={(e) => setBinanceWallet(e.target.value)}
                placeholder="TXqH7kR3vP8mN5wL2jF9cB4dA6eY1hG3kM"
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                Código QR de Pago
              </label>
              
              {/* Preview */}
              {binanceQRUrl && (
                <div className="mb-3 relative inline-block">
                  <img
                    src={binanceQRUrl}
                    alt="QR Preview"
                    className="w-48 h-48 object-contain border border-[#E5E5E5] rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setBinanceQRUrl('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E5E5E5] rounded-lg p-6 text-center cursor-pointer hover:border-[#0070D1] hover:bg-[#E8F1FB]/30 transition-all"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  {binanceQRUrl ? 'Cambiar código QR' : 'Subir código QR'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG hasta 2MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleQRUpload}
                className="hidden"
              />
            </div>
          </div>
        </motion.div>

        {/* PayPal Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-[#E5E5E5] p-6"
        >
          <h3 className="font-semibold text-[#2D2D2D] mb-4">Configuración de PayPal</h3>
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Email de PayPal para recibir pagos
            </label>
            <input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              placeholder="payments@playzone.com"
              className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D1]"
            />
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-[#003791] text-white font-semibold rounded-lg hover:bg-[#0070D1] transition-colors"
          >
            <Save className="w-4 h-4" />
            Guardar Configuración
          </button>
        </motion.div>
      </div>
    </div>
  );
}
