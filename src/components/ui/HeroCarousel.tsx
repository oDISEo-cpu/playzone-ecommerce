import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Game } from '../../types';
import { useStore } from '../../store';

export default function HeroCarousel() {
  const { games } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const featuredGames = games.filter(g => g.discount > 0 || g.stock > 20).slice(0, 5);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % featuredGames.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredGames.length]);

  if (featuredGames.length === 0) return null;

  const currentGame = featuredGames[currentIndex];
  const discountedPrice = currentGame.discount > 0
    ? currentGame.price * (1 - currentGame.discount / 100)
    : currentGame.price;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + featuredGames.length) % featuredGames.length);

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&playlist=${videoId}` : '';
  };

  const getVimeoEmbedUrl = (url: string) => {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1` : '';
  };

  const renderBackground = (game: Game) => {
    // En mobile, siempre usar imagen para ahorrar datos
    if (isMobile || !game.videoUrl) {
      return (
        <img
          src={game.imageUrl}
          alt={game.title}
          className="w-full h-full object-cover"
        />
      );
    }

    // Video file
    if (game.videoType === 'file') {
      return (
        <video
          src={game.videoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      );
    }

    // YouTube
    if (game.videoType === 'youtube') {
      const embedUrl = getYouTubeEmbedUrl(game.videoUrl);
      if (embedUrl) {
        return (
          <iframe
            src={embedUrl}
            className="w-full h-full object-cover pointer-events-none"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={game.title}
          />
        );
      }
    }

    // Vimeo
    if (game.videoType === 'vimeo') {
      const embedUrl = getVimeoEmbedUrl(game.videoUrl);
      if (embedUrl) {
        return (
          <iframe
            src={embedUrl}
            className="w-full h-full object-cover pointer-events-none"
            allow="autoplay; fullscreen"
            allowFullScreen
            title={game.title}
          />
        );
      }
    }

    // Fallback to image
    return (
      <img
        src={game.imageUrl}
        alt={game.title}
        className="w-full h-full object-cover"
      />
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mx-4 sm:mx-0">
      <div className="relative h-[300px] sm:h-[400px] md:h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGame.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {renderBackground(currentGame)}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="px-8 sm:px-12 md:px-16 max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentGame.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <span className="inline-block bg-[#0070D1] text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                  {currentGame.category}
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
                  {currentGame.title}
                </h2>
                <p className="text-blue-100 text-sm sm:text-base mb-4 line-clamp-2">
                  {currentGame.description}
                </p>
                <div className="flex items-center gap-4 mb-6">
                  {currentGame.discount > 0 && (
                    <>
                      <span className="text-blue-200 line-through text-lg">${currentGame.price.toFixed(2)}</span>
                      <span className="text-white text-3xl font-bold">${discountedPrice.toFixed(2)}</span>
                      <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-md">
                        -{currentGame.discount}%
                      </span>
                    </>
                  )}
                  {currentGame.discount === 0 && (
                    <span className="text-white text-3xl font-bold">${currentGame.price.toFixed(2)}</span>
                  )}
                </div>
                <Link
                  to={`/games/${currentGame.id}`}
                  className="inline-block px-6 py-3 bg-[#0070D1] text-white font-semibold rounded-full hover:bg-white hover:text-[#003791] transition-all duration-300"
                >
                  Ver Detalles
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {featuredGames.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
