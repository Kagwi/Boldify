import { useState, useEffect, useMemo } from 'react';
import { Search, X, Heart, Filter, Instagram, Facebook } from 'lucide-react';  // ← added Instagram and Facebook
import { supabase, Product, Category, Subcategory } from '../lib/supabase';

interface ShopPageProps {
  onWishlistChange?: (count: number) => void;
  initialCategory?: string | null;
}

export default function ShopPage({ onWishlistChange, initialCategory }: ShopPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wishlist persistence
  useEffect(() => {
    const saved = localStorage.getItem('boldify_wishlist');
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        setWishlist(new Set(arr));
        if (onWishlistChange) onWishlistChange(arr.length);
      } catch (e) {}
    }
  }, [onWishlistChange]);

  useEffect(() => {
    const arr = Array.from(wishlist);
    localStorage.setItem('boldify_wishlist', JSON.stringify(arr));
    if (onWishlistChange) onWishlistChange(arr.length);
  }, [wishlist, onWishlistChange]);

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) newSet.delete(productId);
      else newSet.add(productId);
      return newSet;
    });
  };

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchProducts(), fetchCategories(), fetchSubcategories()]);
      } catch (err) {
        console.error(err);
        setError('Failed to load products. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && initialCategory && !selectedCategory) {
      const categoryExists = categories.some(c => c.slug === initialCategory);
      if (categoryExists) setSelectedCategory(initialCategory);
    }
  }, [categories, initialCategory, selectedCategory]);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if (data) setProducts(data);
  };

  const fetchCategories = async () => {
    let { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    let cats = data || [];
    if (!cats.some(c => c.slug === 'watches')) cats.push({ id: 'watches-temp-id', name: 'Watches', slug: 'watches', created_at: new Date().toISOString() });
    if (!cats.some(c => c.slug === 'rings')) cats.push({ id: 'rings-temp-id', name: 'Rings', slug: 'rings', created_at: new Date().toISOString() });
    setCategories(cats);
  };

  const fetchSubcategories = async () => {
    const { data, error } = await supabase.from('subcategories').select('*');
    if (error) throw error;
    if (data) setSubcategories(data);
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (selectedCategory) {
      const category = categories.find(c => c.slug === selectedCategory);
      if (category && !category.id.includes('temp')) filtered = filtered.filter(p => p.category_id === category.id);
      else if (category && category.id.includes('temp')) filtered = [];
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

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSearchQuery('');
    setPriceRange('all');
  };

  const getWhatsAppLink = (product: Product) => `https://wa.me/254798893450?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} (Ksh ${product.price.toLocaleString()})`)}`;

  const availableSubcategories = selectedCategory
    ? subcategories.filter(s => {
        const cat = categories.find(c => c.slug === selectedCategory);
        return cat && s.category_id === cat.id && !cat.id.includes('temp');
      })
    : [];

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-20 flex items-center justify-center"><div className="text-gold text-xl">Loading shop...</div></div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-20 flex items-center justify-center"><div className="text-red-500 text-xl">{error}</div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gold text-center mb-4" style={{ fontFamily: 'Jolt, serif' }}>Shop Collection</h1>
          <p className="text-gray-400 text-center text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>Discover pieces that speak to your bold spirit</p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search for jewellery..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-900 border border-gray-800 text-white pl-12 pr-4 py-3 focus:outline-none focus:border-gold transition-colors" style={{ fontFamily: 'Marcellus, serif' }} aria-label="Search products" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="bg-gold text-black px-6 py-3 font-bold hover:bg-gold/90 transition-colors flex items-center justify-center space-x-2" style={{ fontFamily: 'Marcellus, serif' }} aria-expanded={showFilters}>
            <Filter className="h-5 w-5" /><span>FILTERS</span>
          </button>
        </div>

        {showFilters && (
          <div className="mb-8 bg-gray-900/50 border border-gray-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gold" style={{ fontFamily: 'Playfair Display, serif' }}>Filter By</h3>
              <button onClick={clearFilters} className="text-gray-400 hover:text-gold transition-colors flex items-center space-x-2" style={{ fontFamily: 'Marcellus, serif' }}><X className="h-4 w-4" /><span>Clear All</span></button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-white mb-3 font-bold" style={{ fontFamily: 'Marcellus, serif' }}>Category</label>
                <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory(''); }} className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-gold transition-colors" style={{ fontFamily: 'Marcellus, serif' }}>
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white mb-3 font-bold" style={{ fontFamily: 'Marcellus, serif' }}>Subcategory</label>
                <select value={selectedSubcategory} onChange={(e) => setSelectedSubcategory(e.target.value)} disabled={!selectedCategory || selectedCategory === 'watches' || selectedCategory === 'rings'} className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-gold transition-colors disabled:opacity-50" style={{ fontFamily: 'Marcellus, serif' }}>
                  <option value="">All Subcategories</option>
                  {availableSubcategories.map(sub => <option key={sub.id} value={sub.slug}>{sub.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white mb-3 font-bold" style={{ fontFamily: 'Marcellus, serif' }}>Price Range</label>
                <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-gold transition-colors" style={{ fontFamily: 'Marcellus, serif' }}>
                  <option value="all">All Prices</option>
                  <option value="under-500">Under Ksh 500</option>
                  <option value="500-1000">Ksh 500 - 1000</option>
                  <option value="over-1000">Over Ksh 1000</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-400" style={{ fontFamily: 'Marcellus, serif' }}>Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}</p>
          {wishlist.size > 0 && <p className="text-gold" style={{ fontFamily: 'Marcellus, serif' }}>{wishlist.size} in wishlist</p>}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20"><p className="text-gray-400 text-xl" style={{ fontFamily: 'Marcellus, serif' }}>No products found. Try adjusting your filters.</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map(product => (
              <div key={product.id} className="group cursor-pointer overflow-hidden bg-gray-900/50 border border-gray-800 hover:border-gold transition-all duration-300">
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  <button onClick={(e) => toggleWishlist(product.id, e)} className="absolute top-4 right-4 bg-black/50 hover:bg-black p-2 rounded-full transition-colors" aria-label={wishlist.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}>
                    <Heart className={`h-5 w-5 ${wishlist.has(product.id) ? 'text-gold fill-gold' : 'text-white'}`} />
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{product.name}</h3>
                  <p className="text-gray-400 text-xs md:text-sm mb-4 line-clamp-2" style={{ fontFamily: 'Marcellus, serif' }}>{product.description}</p>
                  <div className="flex flex-col space-y-3">
                    <span className="text-xl md:text-2xl font-bold text-gold" style={{ fontFamily: 'Jolt, serif' }}>Ksh {product.price.toLocaleString()}</span>
                    <a href={getWhatsAppLink(product)} target="_blank" rel="noopener noreferrer" className="bg-gold text-black px-4 py-2 text-sm font-bold hover:bg-gold/90 transition-colors duration-300 text-center">ORDER VIA WHATSAPP</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-black border-t border-gold/20 py-8 px-4 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center space-x-6 mb-4">
            <a href="https://www.instagram.com/boldify_jewellery.ke?utm_source=qr&igsh=cTZ4c2ljcmRoNTJs" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold transition-colors" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://www.tiktok.com/@boldify_jewellery?_r=1&_t=ZS-94PQWhub0XR" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold transition-colors" aria-label="TikTok">
              <Facebook className="h-5 w-5" />
            </a>
          </div>
          <p className="text-gray-400" style={{ fontFamily: 'Marcellus, serif' }}>© 2026 Boldify Jewellery.Ke. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
