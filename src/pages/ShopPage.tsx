import { useState, useEffect, useMemo } from 'react';
import { Search, X, Heart, Filter } from 'lucide-react';
import { supabase, Product, Category, Subcategory } from '../lib/supabase';

interface ShopPageProps {
  onWishlistChange: (count: number) => void;
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

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('boldify_wishlist');
    if (savedWishlist) {
      try {
        const arr = JSON.parse(savedWishlist);
        setWishlist(new Set(arr));
        onWishlistChange(arr.length);
      } catch (e) {}
    }
  }, [onWishlistChange]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    const wishlistArray = Array.from(wishlist);
    localStorage.setItem('boldify_wishlist', JSON.stringify(wishlistArray));
    onWishlistChange(wishlistArray.length);
  }, [wishlist, onWishlistChange]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchProducts(), fetchCategories(), fetchSubcategories()]);
      } catch (err) {
        console.error('Error fetching shop data:', err);
        setError('Failed to load products. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Once categories are loaded, apply initialCategory if provided
  useEffect(() => {
    if (categories.length > 0 && initialCategory && !selectedCategory) {
      const categoryExists = categories.some(c => c.slug === initialCategory);
      if (categoryExists) {
        setSelectedCategory(initialCategory);
      }
    }
  }, [categories, initialCategory, selectedCategory]);

  // --- Fetch functions with error handling ---
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (data) setProducts(data);
  };

  const fetchCategories = async () => {
    let { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    let cats = data || [];

    // Ensure "Watches" category exists (by slug 'watches')
    const hasWatches = cats.some(c => c.slug === 'watches');
    if (!hasWatches) {
      const watchesCategory: Category = {
        id: 'watches-temp-id',
        name: 'Watches',
        slug: 'watches',
        created_at: new Date().toISOString(),
      };
      cats = [...cats, watchesCategory];
    }

    setCategories(cats);
  };

  const fetchSubcategories = async () => {
    const { data, error } = await supabase.from('subcategories').select('*');
    if (error) throw error;
    if (data) setSubcategories(data);
  };

  // --- Filtering logic (useMemo for performance) ---
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (selectedCategory) {
      const category = categories.find((c) => c.slug === selectedCategory);
      if (category && category.id !== 'watches-temp-id') {
        filtered = filtered.filter((p) => p.category_id === category.id);
      } else if (category && category.id === 'watches-temp-id') {
        // Temporary category – no products will match unless you add watches to DB
        filtered = [];
      }
    }

    if (selectedSubcategory && filtered.length > 0) {
      const subcategory = subcategories.find((s) => s.slug === selectedSubcategory);
      if (subcategory) {
        filtered = filtered.filter((p) => p.subcategory_id === subcategory.id);
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (priceRange !== 'all') {
      filtered = filtered.filter((p) => {
        if (priceRange === 'under-500') return p.price < 500;
        if (priceRange === '500-1000') return p.price >= 500 && p.price <= 1000;
        if (priceRange === 'over-1000') return p.price > 1000;
        return true;
      });
    }

    return filtered;
  }, [products, categories, subcategories, selectedCategory, selectedSubcategory, searchQuery, priceRange]);

  // --- Helper functions ---
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) newSet.delete(productId);
      else newSet.add(productId);
      return newSet;
    });
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSearchQuery('');
    setPriceRange('all');
  };

  const getWhatsAppLink = (product: Product) => {
    const message = `Hi, I'm interested in ${product.name} (Ksh ${product.price.toLocaleString()})`;
    return `https://wa.me/254798893450?text=${encodeURIComponent(message)}`;
  };

  const availableSubcategories = selectedCategory
    ? subcategories.filter((s) => {
        const category = categories.find((c) => c.slug === selectedCategory);
        return category && s.category_id === category.id && category.id !== 'watches-temp-id';
      })
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-20 flex items-center justify-center">
        <div className="text-gold text-xl">Loading shop...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-20 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1
            className="text-4xl md:text-6xl font-bold text-gold text-center mb-4"
            style={{ fontFamily: 'Jolt, serif' }}
          >
            Shop Collection
          </h1>
          <p
            className="text-gray-400 text-center text-lg"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Discover pieces that speak to your bold spirit
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for jewellery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 text-white pl-12 pr-4 py-3 focus:outline-none focus:border-gold transition-colors"
              style={{ fontFamily: 'Marcellus, serif' }}
              aria-label="Search products"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gold text-black px-6 py-3 font-bold hover:bg-gold/90 transition-colors flex items-center justify-center space-x-2"
            style={{ fontFamily: 'Marcellus, serif' }}
            aria-expanded={showFilters}
          >
            <Filter className="h-5 w-5" />
            <span>FILTERS</span>
          </button>
        </div>

        {showFilters && (
          <div className="mb-8 bg-gray-900/50 border border-gray-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3
                className="text-xl font-bold text-gold"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Filter By
              </h3>
              <button
                onClick={clearFilters}
                className="text-gray-400 hover:text-gold transition-colors flex items-center space-x-2"
                style={{ fontFamily: 'Marcellus, serif' }}
              >
                <X className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label
                  className="block text-white mb-3 font-bold"
                  style={{ fontFamily: 'Marcellus, serif' }}
                >
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('');
                  }}
                  className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                  style={{ fontFamily: 'Marcellus, serif' }}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-white mb-3 font-bold"
                  style={{ fontFamily: 'Marcellus, serif' }}
                >
                  Subcategory
                </label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  disabled={!selectedCategory || selectedCategory === 'watches'}
                  className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
                  style={{ fontFamily: 'Marcellus, serif' }}
                >
                  <option value="">All Subcategories</option>
                  {availableSubcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.slug}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-white mb-3 font-bold"
                  style={{ fontFamily: 'Marcellus, serif' }}
                >
                  Price Range
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                  style={{ fontFamily: 'Marcellus, serif' }}
                >
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
          <p className="text-gray-400" style={{ fontFamily: 'Marcellus, serif' }}>
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
          {wishlist.size > 0 && (
            <p className="text-gold" style={{ fontFamily: 'Marcellus, serif' }}>
              {wishlist.size} in wishlist
            </p>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl" style={{ fontFamily: 'Marcellus, serif' }}>
              No products found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer overflow-hidden bg-gray-900/50 border border-gray-800 hover:border-gold transition-all duration-300"
              >
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black p-2 transition-colors duration-300"
                    aria-label={wishlist.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        wishlist.has(product.id)
                          ? 'text-gold fill-gold'
                          : 'text-white'
                      }`}
                    />
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4 md:p-6">
                  <h3
                    className="text-lg md:text-xl font-bold text-white mb-2"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {product.name}
                  </h3>
                  <p
                    className="text-gray-400 text-xs md:text-sm mb-4 line-clamp-2"
                    style={{ fontFamily: 'Marcellus, serif' }}
                  >
                    {product.description}
                  </p>
                  <div className="flex flex-col space-y-3">
                    <span
                      className="text-xl md:text-2xl font-bold text-gold"
                      style={{ fontFamily: 'Jolt, serif' }}
                    >
                      Ksh {product.price.toLocaleString()}
                    </span>
                    <a
                      href={getWhatsAppLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gold text-black px-4 py-2 text-sm font-bold hover:bg-gold/90 transition-colors duration-300 text-center"
                    >
                      ORDER VIA WHATSAPP
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-black border-t border-gold/20 py-8 px-4 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400" style={{ fontFamily: 'Marcellus, serif' }}>
            © 2026 Boldify Jewellery.Ke. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
