import { ShoppingBag, Instagram, Menu, X, Search, Heart } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  currentPage: 'home' | 'shop';
  onNavigate: (page: 'home' | 'shop') => void;
  onSearchClick: () => void;
  wishlistCount: number;
}

export default function Navbar({ currentPage, onNavigate, onSearchClick, wishlistCount }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const handleNavClick = (page: 'home' | 'shop', sectionId?: string) => {
    if (page !== currentPage) {
      onNavigate(page);
      if (sectionId) {
        setTimeout(() => scrollToSection(sectionId), 100);
      }
    } else if (sectionId) {
      scrollToSection(sectionId);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => handleNavClick('home')}
          >
            <ShoppingBag className="h-8 w-8 text-gold mr-3 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-2xl font-bold text-gold" style={{ fontFamily: 'Jolt, serif' }}>
              Boldify Jewellery
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-sm font-medium transition-colors duration-300 ${
                currentPage === 'home' ? 'text-gold' : 'text-gray-300 hover:text-gold'
              }`}
              style={{ fontFamily: 'Marcellus, serif' }}
            >
              HOME
            </button>
            <button
              onClick={() => handleNavClick('shop')}
              className={`text-sm font-medium transition-colors duration-300 ${
                currentPage === 'shop' ? 'text-gold' : 'text-gray-300 hover:text-gold'
              }`}
              style={{ fontFamily: 'Marcellus, serif' }}
            >
              SHOP
            </button>
            <button
              onClick={() => handleNavClick('home', 'about')}
              className="text-sm font-medium text-gray-300 hover:text-gold transition-colors duration-300"
              style={{ fontFamily: 'Marcellus, serif' }}
            >
              ABOUT
            </button>
            <button
              onClick={() => handleNavClick('home', 'contact')}
              className="text-sm font-medium text-gray-300 hover:text-gold transition-colors duration-300"
              style={{ fontFamily: 'Marcellus, serif' }}
            >
              CONTACT
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={onSearchClick}
              className="text-gray-300 hover:text-gold transition-colors duration-300"
            >
              <Search className="h-5 w-5" />
            </button>
            <div className="relative">
              <Heart className="h-5 w-5 text-gray-300 hover:text-gold transition-colors duration-300 cursor-pointer" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </div>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-gold transition-colors duration-300"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-gold transition-colors duration-300"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-gold transition-colors duration-300"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/98 border-t border-gold/20">
          <div className="px-4 py-6 space-y-4">
            <button
              onClick={() => handleNavClick('home')}
              className={`block w-full text-left py-2 text-lg ${
                currentPage === 'home' ? 'text-gold' : 'text-gray-300'
              }`}
              style={{ fontFamily: 'Marcellus, serif' }}
            >
              HOME
            </button>
            <button
              onClick={() => handleNavClick('shop')}
              className={`block w-full text-left py-2 text-lg ${
                currentPage === 'shop' ? 'text-gold' : 'text-gray-300'
              }`}
              style={{ fontFamily: 'Marcellus, serif' }}
            >
              SHOP
            </button>
            <button
              onClick={() => handleNavClick('home', 'about')}
              className="block w-full text-left py-2 text-lg text-gray-300"
              style={{ fontFamily: 'Marcellus, serif' }}
            >
              ABOUT
            </button>
            <button
              onClick={() => handleNavClick('home', 'contact')}
              className="block w-full text-left py-2 text-lg text-gray-300"
              style={{ fontFamily: 'Marcellus, serif' }}
            >
              CONTACT
            </button>
            <div className="flex space-x-6 pt-4 border-t border-gold/20">
              <button onClick={onSearchClick}>
                <Search className="h-6 w-6 text-gray-300" />
              </button>
              <div className="relative">
                <Heart className="h-6 w-6 text-gray-300" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-6 w-6 text-gray-300" />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
                <svg className="h-6 w-6 fill-gray-300" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
