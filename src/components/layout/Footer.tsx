import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#003791] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#003791] font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-xl">PlayZone Store</span>
            </div>
            <p className="text-blue-200 text-sm max-w-md">
              Tu tienda digital de confianza para juegos de PlayStation. 
              Los mejores títulos al mejor precio, con entrega digital instantánea.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Navegación</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link to="/games" className="hover:text-white transition-colors">Catálogo</Link></li>
              <li><Link to="/games/category/Acción" className="hover:text-white transition-colors">Acción</Link></li>
              <li><Link to="/games/category/RPG" className="hover:text-white transition-colors">RPG</Link></li>
              <li><Link to="/games/category/Deportes" className="hover:text-white transition-colors">Deportes</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><span className="hover:text-white transition-colors cursor-pointer">Centro de Ayuda</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Política de Reembolso</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Términos de Servicio</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Privacidad</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-blue-200 text-sm">
            © 2026 PlayZone Store. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2 text-blue-200 text-sm">
            <Gamepad2 className="w-4 h-4" />
            <span>Hecho con pasión para gamers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
