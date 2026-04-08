import { useState, useEffect, useMemo } from 'react';
import { Search, X, Heart, Filter, Instagram, Facebook, ShoppingCart } from 'lucide-react';
import { supabase, Product, Category, Subcategory } from '../lib/supabase';

interface ShopPageProps {
  initialCategory?: string | null;
}

export default function ShopPage({ initialCategory }: ShopPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load wishlist & cart from localStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem('boldify_wishlist');
    if (savedWishlist) { try { setWishlist(new Set(JSON.parse(savedWishlist))); } catch(e) {} }
    const savedCart = localStorage.getItem('boldify_cart');
    if (savedCart) { try { setCart(new Set(JSON.parse(savedCart))); } catch(e) {} }
  }, []);

  // Save wishlist & cart and dispatch events
  useEffect(() => {
    localStorage.setItem('boldify_wishlist', JSON.stringify(Array.from(wishlist)));
    window.dispatchEvent(new Event('wishlistUpdated'));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('boldify_cart', JSON.stringify(Array.from(cart)));
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cart]);

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => { const newSet = new Set(prev); if (newSet.has(productId)) newSet.delete(productId); else newSet.add(productId); return newSet; });
  };

  const addToCart = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCart(prev => new Set(prev).add(productId));
  };

  const removeFromCart = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCart(prev => { const newSet = new Set(prev); newSet.delete(productId); return newSet; });
  };

  // Data fetching (unchanged)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProducts(), fetchCategories(), fetchSubcategories()]);
      } catch (err) { setError('Failed to load products.'); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (categories.length && initialCategory && !selectedCategory && categories.some(c => c.slug === initialCategory)) {
      setSelectedCategory(initialCategory);
    }
  }, [categories, initialCategory, selectedCategory]);

  const fetchProducts = async () => { const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }); if (data) setProducts(data); };
  const fetchCategories = async () => {
    let { data } = await supabase.from('categories').select('*');
    let cats = data || [];
    if (!cats.some(c => c.slug === 'watches')) cats.push({ id: 'watches-temp-id', name: 'Watches', slug: 'watches', created_at: new Date().toISOString() });
    if (!cats.some(c => c.slug === 'rings')) cats.push({ id: 'rings-temp-id', name: 'Rings', slug: 'rings', created_at: new Date().toISOString() });
    setCategories(cats);
  };
  const fetchSubcategories = async () => { const { data } = await supabase.from('subcategories').select('*'); if (data) setSubcategories(data); };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (selectedCategory) {
      const cat = categories.find(c => c.slug === selectedCategory);
      if (cat && !cat.id.includes('temp')) filtered = filtered.filter(p => p.category_id === cat.id);
      else if (cat?.id.includes('temp')) filtered = [];
    }
    if (selectedSubcategory && filtered.length) {
      const sub = subcategories.find(s => s.slug === selectedSubcategory);
      if (sub) filtered = filtered.filter(p => p.subcategory_id === sub.id);
    }
    if (searchQuery) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (priceRange !== 'all') {
      filtered = filtered.filter(p => {
        if (priceRange === 'under-500') return p.price < 500;
        if (priceRange === '500-1000') return p.price >= 500 && p.price <= 1000;
        if (priceRange === 'over-1000') return p.price > 1000;
        return true;
      });
    }
    return filtered;
  }, [products, categories, subcategories, selectedCategory, selectedSubcategory, searchQuery, priceRange]);

  const clearFilters = () => { setSelectedCategory(''); setSelectedSubcategory(''); setSearchQuery(''); setPriceRange('all'); };
  const getWhatsAppLink = (product: Product) => `https://wa.me/254798893450?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} (Ksh ${product.price.toLocaleString()})`)}`;
  const availableSubcategories = selectedCategory ? subcategories.filter(s => { const cat = categories.find(c => c.slug === selectedCategory); return cat && s.category_id === cat.id && !cat.id.includes('temp'); }) : [];

  if (loading) return <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-20 flex items-center justify-center"><div className="text-gold text-xl">Loading shop...</div></div>;
  if (error) return <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-20 flex items-center justify-center"><div className="text-red-500 text-xl">{error}</div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gold text-center mb-4">Shop Collection</h1>
          <p className="text-gray-400 text-center text-lg">Discover pieces that speak to your bold spirit</p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search for jewellery..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-900 border border-gray-800 text-white pl-12 pr-4 py-3 focus:outline-none focus:border-gold" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="bg-gold text-black px-6 py-3 font-bold hover:bg-gold/90 flex items-center justify-center space-x-2"><Filter className="h-5 w-5" /><span>FILTERS</span></button>
        </div>

        {showFilters && (
          <div className="mb-8 bg-gray-900/50 border border-gray-800 p-6">
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-gold">Filter By</h3><button onClick={clearFilters} className="text-gray-400 hover:text-gold flex items-center space-x-2"><X className="h-4 w-4" /><span>Clear All</span></button></div>
            <div className="grid md:grid-cols-3 gap-6">
              <div><label className="block text-white mb-3 font-bold">Category</label><select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory(''); }} className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3">{categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}</select></div>
              <div><label className="block text-white mb-3 font-bold">Subcategory</label><select value={selectedSubcategory} onChange={(e) => setSelectedSubcategory(e.target.value)} disabled={!selectedCategory || selectedCategory === 'watches' || selectedCategory === 'rings'} className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 disabled:opacity-50"><option value="">All Subcategories</option>{availableSubcategories.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}</select></div>
              <div><label className="block text-white mb-3 font-bold">Price Range</label><select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3"><option value="all">All Prices</option><option value="under-500">Under Ksh 500</option><option value="500-1000">Ksh 500 - 1000</option><option value="over-1000">Over Ksh 1000</option></select></div>
            </div>
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-400">Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}</p>
          {wishlist.size > 0 && <p className="text-gold">{wishlist.size} in wishlist</p>}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20"><p className="text-gray-400 text-xl">No products found. Try adjusting your filters.</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map(product => {
              const inCart = cart.has(product.id);
              return (
                <div key={product.id} className="group cursor-pointer overflow-hidden bg-gray-900/50 border border-gray-800 hover:border-gold transition-all duration-300">
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    <button onClick={(e) => toggleWishlist(product.id, e)} className="absolute top-4 right-12 bg-black/50 hover:bg-black p-2 rounded-full transition-colors z-10">
                      <Heart className={`h-5 w-5 ${wishlist.has(product.id) ? 'text-gold fill-gold' : 'text-white'}`} />
                    </button>
                    <button onClick={(e) => inCart ? removeFromCart(product.id, e) : addToCart(product.id, e)} className="absolute top-4 right-4 bg-black/50 hover:bg-black p-2 rounded-full transition-colors z-10">
                      <ShoppingCart className={`h-5 w-5 ${inCart ? 'text-gold' : 'text-white'}`} />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">{product.name}</h3>
                    <p className="text-gray-400 text-xs md:text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex flex-col space-y-3">
                      <span className="text-xl md:text-2xl font-bold text-gold">Ksh {product.price.toLocaleString()}</span>
                      <a href={getWhatsAppLink(product)} target="_blank" rel="noopener noreferrer" className="bg-gold text-black px-4 py-2 text-sm font-bold hover:bg-gold/90 transition-colors text-center">ORDER VIA WHATSAPP</a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="bg-black border-t border-gold/20 py-8 px-4 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center space-x-6 mb-4">
            <a href="https://www.instagram.com/boldify_jewellery.ke?utm_source=qr&igsh=cTZ4c2ljcmRoNTJs" target="_blank" className="text-gray-400 hover:text-gold"><Instagram className="h-5 w-5" /></a>
            <a href="https://www.tiktok.com/@boldify_jewellery?_r=1&_t=ZS-94PQWhub0XR" target="_blank" className="text-gray-400 hover:text-gold"><Facebook className="h-5 w-5" /></a>
          </div>
          <p className="text-gray-400">© 2026 Boldify Jewellery.Ke. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
