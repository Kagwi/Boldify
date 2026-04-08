import { ShoppingBag, Instagram, Menu, X, Search, Heart, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, Product } from '../lib/supabase';

interface NavbarProps {
  currentPage: 'home' | 'shop';
  onNavigate: (page: 'home' | 'shop') => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  // Fetch all products once for search and wishlist details
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) setAllProducts(data);
    };
    fetchProducts();
  }, []);

  // Load wishlist from localStorage and update products
  const loadWishlist = () => {
    const saved = localStorage.getItem('boldify_wishlist');
    if (saved) {
      try {
        const ids = JSON.parse(saved) as string[];
        setWishlistIds(new Set(ids));
        const matched = allProducts.filter(p => ids.includes(p.id));
        setWishlistProducts(matched);
      } catch (e) {}
    } else {
      setWishlistIds(new Set());
      setWishlistProducts([]);
    }
  };

  // Initial load and when allProducts changes
  useEffect(() => {
    loadWishlist();
  }, [allProducts]);

  // Listen for wishlist update events from HomePage/ShopPage
  useEffect(() => {
    const handleWishlistUpdate = () => {
      loadWishlist();
    };
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, [allProducts]);

  // Search filtering
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
    } else {
      const filtered = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }, [searchQuery, allProducts]);

  const removeFromWishlist = (productId: string) => {
    const newIds = Array.from(wishlistIds).filter(id => id !== productId);
    localStorage.setItem('boldify_wishlist', JSON.stringify(newIds));
    setWishlistIds(new Set(newIds));
    setWishlistProducts(wishlistProducts.filter(p => p.id !== productId));
    // Dispatch event to notify other components (like HomePage/ShopPage)
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const getWhatsAppLink = (product: Product) => {
    const message = `Hi, I'm interested in ${product.name} (Ksh ${product.price.toLocaleString()})`;
    return `https://wa.me/254798893450?text=${encodeURIComponent(message)}`;
  };

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
      if (sectionId) setTimeout(() => scrollToSection(sectionId), 100);
    } else if (sectionId) {
      scrollToSection(sectionId);
    }
    setIsMobileMenuOpen(false);
  };

  const SearchModal = () => (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-start justify-center pt-20 px-4">
      <div className="bg-gray-900 w-full max-w-2xl rounded-lg shadow-2xl border border-gold/30">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-gold">Search Products</h2>
          <button onClick={() => setIsSearchModalOpen(false)} className="text-gray-400 hover:text-gold"><X className="h-6 w-6" /></button>
        </div>
        <div className="p-4">
          <input type="text" placeholder="Search by name or description..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-gold" autoFocus />
          <div className="mt-6 max-h-96 overflow-y-auto space-y-4">
            {searchResults.length === 0 && searchQuery && <p className="text-gray-400 text-center py-8">No products found</p>}
            {searchResults.map(product => (
              <div key={product.id} className="flex items-center gap-4 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{product.name}</h3>
                  <p className="text-gray-400 text-sm line-clamp-1">{product.description}</p>
                  <span className="text-gold font-bold">Ksh {product.price.toLocaleString()}</span>
                </div>
                <a href={getWhatsAppLink(product)} target="_blank" rel="noopener noreferrer" className="bg-gold text-black px-3 py-2 text-sm font-bold rounded hover:bg-gold/90 transition">ORDER</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const WishlistModal = () => (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-start justify-center pt-20 px-4">
      <div className="bg-gray-900 w-full max-w-3xl rounded-lg shadow-2xl border border-gold/30">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-gold">Your Wishlist ({wishlistIds.size})</h2>
          <button onClick={() => setIsWishlistModalOpen(false)} className="text-gray-400 hover:text-gold"><X className="h-6 w-6" /></button>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto">
          {wishlistProducts.length === 0 ? <p className="text-gray-400 text-center py-8">Your wishlist is empty</p> : (
            <div className="space-y-4">
              {wishlistProducts.map(product => (
                <div key={product.id} className="flex items-center gap-4 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                  <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{product.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-1">{product.description}</p>
                    <span className="text-gold font-bold">Ksh {product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <a href={getWhatsAppLink(product)} target="_blank" rel="noopener noreferrer" className="bg-gold text-black px-3 py-2 text-sm font-bold rounded hover:bg-gold/90 transition">ORDER</a>
                    <button onClick={() => removeFromWishlist(product.id)} className="bg-red-600/20 text-red-400 px-3 py-2 text-sm font-bold rounded hover:bg-red-600/40 transition flex items-center gap-1"><XCircle className="h-4 w-4" /> REMOVE</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center cursor-pointer group" onClick={() => handleNavClick('home')}>
              <ShoppingBag className="h-8 w-8 text-gold mr-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-2xl font-bold text-gold" style={{ fontFamily: 'Jolt, serif' }}>Boldify Jewellery</span>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => handleNavClick('home')} className={`text-sm font-medium transition-colors duration-300 ${currentPage === 'home' ? 'text-gold' : 'text-gray-300 hover:text-gold'}`}>HOME</button>
              <button onClick={() => handleNavClick('shop')} className={`text-sm font-medium transition-colors duration-300 ${currentPage === 'shop' ? 'text-gold' : 'text-gray-300 hover:text-gold'}`}>SHOP</button>
              <button onClick={() => handleNavClick('home', 'about')} className="text-sm font-medium text-gray-300 hover:text-gold">ABOUT</button>
              <button onClick={() => handleNavClick('home', 'contact')} className="text-sm font-medium text-gray-300 hover:text-gold">CONTACT</button>
            </div>

            {/* Desktop icons */}
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => setIsSearchModalOpen(true)} className="text-gray-300 hover:text-gold"><Search className="h-5 w-5" /></button>
              <button onClick={() => setIsWishlistModalOpen(true)} className="relative text-gray-300 hover:text-gold">
                <Heart className="h-5 w-5" />
                {wishlistIds.size > 0 && <span className="absolute -top-2 -right-2 bg-gold text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{wishlistIds.size}</span>}
              </button>
              <a href="https://www.instagram.com/boldify_jewellery.ke?utm_source=qr&igsh=cTZ4c2ljcmRoNTJs" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gold"><Instagram className="h-5 w-5" /></a>
              <a href="https://www.tiktok.com/@boldify_jewellery?_r=1&_t=ZS-94PQWhub0XR" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gold"><svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg></a>
            </div>

            {/* Mobile button */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-300 hover:text-gold">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/98 border-t border-gold/20">
            <div className="px-4 py-6 space-y-4">
              <button onClick={() => handleNavClick('home')} className="block w-full text-left py-2 text-lg text-gray-300">HOME</button>
              <button onClick={() => handleNavClick('shop')} className="block w-full text-left py-2 text-lg text-gray-300">SHOP</button>
              <button onClick={() => handleNavClick('home', 'about')} className="block w-full text-left py-2 text-lg text-gray-300">ABOUT</button>
              <button onClick={() => handleNavClick('home', 'contact')} className="block w-full text-left py-2 text-lg text-gray-300">CONTACT</button>
              <div className="flex space-x-6 pt-4 border-t border-gold/20">
                <button onClick={() => { setIsSearchModalOpen(true); setIsMobileMenuOpen(false); }}><Search className="h-6 w-6 text-gray-300" /></button>
                <button onClick={() => { setIsWishlistModalOpen(true); setIsMobileMenuOpen(false); }} className="relative">
                  <Heart className="h-6 w-6 text-gray-300" />
                  {wishlistIds.size > 0 && <span className="absolute -top-2 -right-2 bg-gold text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{wishlistIds.size}</span>}
                </button>
                <a href="https://www.instagram.com/boldify_jewellery.ke?utm_source=qr&igsh=cTZ4c2ljcmRoNTJs" target="_blank"><Instagram className="h-6 w-6 text-gray-300" /></a>
                <a href="https://www.tiktok.com/@boldify_jewellery?_r=1&_t=ZS-94PQWhub0XR" target="_blank"><svg className="h-6 w-6 fill-gray-300" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg></a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {isSearchModalOpen && <SearchModal />}
      {isWishlistModalOpen && <WishlistModal />}
    </>
  );
}
