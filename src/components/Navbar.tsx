import { ShoppingBag, Instagram, Menu, X, Search, Heart, XCircle, ShoppingCart, Trash2 } from 'lucide-react';
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
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());
  const [cartProducts, setCartProducts] = useState<Product[]>([]);

  // Fetch all products once
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) setAllProducts(data);
    };
    fetchProducts();
  }, []);

  // Load wishlist & cart from localStorage
  const loadWishlist = () => {
    const saved = localStorage.getItem('boldify_wishlist');
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        setWishlistIds(new Set(ids));
        setWishlistProducts(allProducts.filter(p => ids.includes(p.id)));
      } catch(e) {}
    } else { setWishlistIds(new Set()); setWishlistProducts([]); }
  };

  const loadCart = () => {
    const saved = localStorage.getItem('boldify_cart');
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        setCartIds(new Set(ids));
        setCartProducts(allProducts.filter(p => ids.includes(p.id)));
      } catch(e) {}
    } else { setCartIds(new Set()); setCartProducts([]); }
  };

  useEffect(() => {
    loadWishlist();
    loadCart();
  }, [allProducts]);

  // Listen for updates
  useEffect(() => {
    const handleWishlistUpdate = () => loadWishlist();
    const handleCartUpdate = () => loadCart();
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [allProducts]);

  // Search
  useEffect(() => {
    if (searchQuery.trim() === '') setSearchResults([]);
    else setSearchResults(allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [searchQuery, allProducts]);

  const removeFromWishlist = (productId: string) => {
    const newIds = Array.from(wishlistIds).filter(id => id !== productId);
    localStorage.setItem('boldify_wishlist', JSON.stringify(newIds));
    setWishlistIds(new Set(newIds));
    setWishlistProducts(wishlistProducts.filter(p => p.id !== productId));
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const removeFromCart = (productId: string) => {
    const newIds = Array.from(cartIds).filter(id => id !== productId);
    localStorage.setItem('boldify_cart', JSON.stringify(newIds));
    setCartIds(new Set(newIds));
    setCartProducts(cartProducts.filter(p => p.id !== productId));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const clearCart = () => {
    localStorage.setItem('boldify_cart', JSON.stringify([]));
    setCartIds(new Set());
    setCartProducts([]);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const getWhatsAppLink = (product: Product) => `https://wa.me/254798893450?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} (Ksh ${product.price.toLocaleString()})`)}`;

  const getMultiOrderWhatsAppLink = () => {
    if (cartProducts.length === 0) return '#';
    let message = "Hi, I'm interested in the following items:\n";
    cartProducts.forEach(p => { message += `- ${p.name} (Ksh ${p.price.toLocaleString()})\n`; });
    message += `\nTotal: Ksh ${cartProducts.reduce((sum, p) => sum + p.price, 0).toLocaleString()}`;
    return `https://wa.me/254798893450?text=${encodeURIComponent(message)}`;
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (page: 'home' | 'shop', sectionId?: string) => {
    if (page !== currentPage) {
      onNavigate(page);
      if (sectionId) setTimeout(() => scrollToSection(sectionId), 100);
    } else if (sectionId) scrollToSection(sectionId);
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
                <div className="flex-1"><h3 className="text-white font-semibold">{product.name}</h3><p className="text-gray-400 text-sm line-clamp-1">{product.description}</p><span className="text-gold font-bold">Ksh {product.price.toLocaleString()}</span></div>
                <a href={getWhatsAppLink(product)} target="_blank" className="bg-gold text-black px-3 py-2 text-sm font-bold rounded hover:bg-gold/90">ORDER</a>
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
                  <div className="flex-1"><h3 className="text-white font-semibold">{product.name}</h3><p className="text-gray-400 text-sm line-clamp-1">{product.description}</p><span className="text-gold font-bold">Ksh {product.price.toLocaleString()}</span></div>
                  <div className="flex gap-2">
                    <a href={getWhatsAppLink(product)} target="_blank" className="bg-gold text-black px-3 py-2 text-sm font-bold rounded">ORDER</a>
                    <button onClick={() => removeFromWishlist(product.id)} className="bg-red-600/20 text-red-400 px-3 py-2 text-sm font-bold rounded flex items-center gap-1"><XCircle className="h-4 w-4" /> REMOVE</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const CartModal = () => {
    const total = cartProducts.reduce((sum, p) => sum + p.price, 0);
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-start justify-center pt-20 px-4">
        <div className="bg-gray-900 w-full max-w-3xl rounded-lg shadow-2xl border border-gold/30">
          <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-gold">Your Cart ({cartIds.size})</h2>
            <button onClick={() => setIsCartModalOpen(false)} className="text-gray-400 hover:text-gold"><X className="h-6 w-6" /></button>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {cartProducts.length === 0 ? <p className="text-gray-400 text-center py-8">Your cart is empty</p> : (
              <>
                <div className="space-y-4">
                  {cartProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-4 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1"><h3 className="text-white font-semibold">{product.name}</h3><p className="text-gray-400 text-sm line-clamp-1">{product.description}</p><span className="text-gold font-bold">Ksh {product.price.toLocaleString()}</span></div>
                      <button onClick={() => removeFromCart(product.id)} className="bg-red-600/20 text-red-400 px-3 py-2 text-sm font-bold rounded flex items-center gap-1"><Trash2 className="h-4 w-4" /> REMOVE</button>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white font-bold">Total:</span>
                    <span className="text-gold text-xl font-bold">Ksh {total.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-4">
                    <a href={getMultiOrderWhatsAppLink()} target="_blank" className="flex-1 bg-gold text-black text-center py-3 font-bold rounded hover:bg-gold/90">ORDER ALL VIA WHATSAPP</a>
                    <button onClick={clearCart} className="bg-red-600/20 text-red-400 px-4 py-3 font-bold rounded hover:bg-red-600/40">CLEAR CART</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center cursor-pointer group" onClick={() => handleNavClick('home')}>
              <ShoppingBag className="h-8 w-8 text-gold mr-3 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold text-gold">Boldify Jewellery</span>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => handleNavClick('home')} className={`text-sm font-medium transition-colors ${currentPage === 'home' ? 'text-gold' : 'text-gray-300 hover:text-gold'}`}>HOME</button>
              <button onClick={() => handleNavClick('shop')} className={`text-sm font-medium transition-colors ${currentPage === 'shop' ? 'text-gold' : 'text-gray-300 hover:text-gold'}`}>SHOP</button>
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
              <button onClick={() => setIsCartModalOpen(true)} className="relative text-gray-300 hover:text-gold">
                <ShoppingCart className="h-5 w-5" />
                {cartIds.size > 0 && <span className="absolute -top-2 -right-2 bg-gold text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{cartIds.size}</span>}
              </button>
              <a href="https://www.instagram.com/boldify_jewellery.ke?utm_source=qr&igsh=cTZ4c2ljcmRoNTJs" target="_blank" className="text-gray-300 hover:text-gold"><Instagram className="h-5 w-5" /></a>
              <a href="https://www.tiktok.com/@boldify_jewellery?_r=1&_t=ZS-94PQWhub0XR" target="_blank" className="text-gray-300 hover:text-gold"><svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg></a>
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
                <button onClick={() => { setIsWishlistModalOpen(true); setIsMobileMenuOpen(false); }} className="relative"><Heart className="h-6 w-6 text-gray-300" />{wishlistIds.size > 0 && <span className="absolute -top-2 -right-2 bg-gold text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{wishlistIds.size}</span>}</button>
                <button onClick={() => { setIsCartModalOpen(true); setIsMobileMenuOpen(false); }} className="relative"><ShoppingCart className="h-6 w-6 text-gray-300" />{cartIds.size > 0 && <span className="absolute -top-2 -right-2 bg-gold text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{cartIds.size}</span>}</button>
                <a href="https://www.instagram.com/boldify_jewellery.ke?utm_source=qr&igsh=cTZ4c2ljcmRoNTJs" target="_blank"><Instagram className="h-6 w-6 text-gray-300" /></a>
                <a href="https://www.tiktok.com/@boldify_jewellery?_r=1&_t=ZS-94PQWhub0XR" target="_blank"><svg className="h-6 w-6 fill-gray-300" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg></a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {isSearchModalOpen && <SearchModal />}
      {isWishlistModalOpen && <WishlistModal />}
      {isCartModalOpen && <CartModal />}
    </>
  );
}
