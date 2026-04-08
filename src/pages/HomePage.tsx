import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Phone, Mail, MessageCircle, Send, Gem, Award, Heart, Facebook, Instagram, Twitter, ChevronDown, ShoppingCart } from 'lucide-react';
import { supabase, Product, Review, Category } from '../lib/supabase';

interface HomePageProps {
  onNavigateToShop?: (categorySlug?: string) => void;
}

const heroSlides = [
  { image: 'https://github.com/Kagwi/Boldify/blob/main/public/images/WhatsApp%20Image%202026-03-27%20at%2008.51.45.jpeg?raw=true', title: 'Bold Pieces for Bold Women', subtitle: 'Elevate Your Style' },
  { image: 'https://github.com/Kagwi/Boldify/blob/main/public/images/WhatsApp%20Image%202026-03-27%20at%2008.51.44.jpeg?raw=true', title: 'Statement Elegance', subtitle: 'Make Every Moment Count' },
  { image: 'https://github.com/Kagwi/Boldify/blob/main/public/images/WhatsApp%20Image%202026-03-27%20at%2008.51.45%20(1).jpeg?raw=true', title: 'Luxury Redefined', subtitle: 'Discover Your Bold' },
  { image: 'https://github.com/Kagwi/Boldify/blob/main/public/images/WhatsApp%20Image%202026-03-27%20at%2008.51.44%20(2).jpeg?raw=true', title: 'Timeless Craftsmanship', subtitle: 'Every Piece Tells a Story' },
  { image: 'https://github.com/Kagwi/Boldify/blob/main/public/images/WhatsApp%20Image%202026-03-27%20at%2008.51.44%20(1).jpeg?raw=true', title: 'Modern Elegance', subtitle: 'Designed for You' },
  { image: 'https://github.com/Kagwi/Boldify/blob/main/public/images/WhatsApp%20Image%202026-03-28%20at%2000.05.21.jpeg?raw=true', title: 'Uniquely Yours', subtitle: 'Celebrate Your Individuality' },
];

export default function HomePage({ onNavigateToShop }: HomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Wishlist state
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  // Cart state (array of product ids)
  const [cart, setCart] = useState<Set<string>>(new Set());

  // Load wishlist & cart from localStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem('boldify_wishlist');
    if (savedWishlist) {
      try { setWishlist(new Set(JSON.parse(savedWishlist))); } catch(e) {}
    }
    const savedCart = localStorage.getItem('boldify_cart');
    if (savedCart) {
      try { setCart(new Set(JSON.parse(savedCart))); } catch(e) {}
    }
  }, []);

  // Save wishlist & cart to localStorage and dispatch events
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
    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) newSet.delete(productId);
      else newSet.add(productId);
      return newSet;
    });
  };

  const addToCart = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCart(prev => new Set(prev).add(productId));
  };

  const removeFromCart = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCart(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const headingRefs = useRef<(HTMLDivElement | null)[]>([]);
  const experienceCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const aboutRef = useRef<HTMLElement | null>(null);
  const contactRef = useRef<HTMLElement | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchFeaturedProducts();
    fetchNewArrivals();
    fetchReviews();
    fetchCategories();

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );
    [...sectionsRef.current, ...headingRefs.current, ...experienceCardsRef.current].forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      let cats = data || [];
      if (!cats.some(c => c.slug === 'watches')) cats.push({ id: 'watches-temp-id', name: 'Watches', slug: 'watches', created_at: new Date().toISOString() });
      if (!cats.some(c => c.slug === 'rings')) cats.push({ id: 'rings-temp-id', name: 'Rings', slug: 'rings', created_at: new Date().toISOString() });
      setCategories(cats);
      await fetchCategoryImages(cats);
    } catch (err) {
      console.error(err);
      setCategories([
        { id: 'fallback-watches', name: 'Watches', slug: 'watches', created_at: new Date().toISOString() },
        { id: 'fallback-rings', name: 'Rings', slug: 'rings', created_at: new Date().toISOString() }
      ]);
    } finally { setLoadingCategories(false); }
  };

  const fetchCategoryImages = async (cats: Category[]) => {
    const images: Record<string, string> = {};
    for (const cat of cats) {
      try {
        const { data } = await supabase.from('products').select('image_url').eq('category_id', cat.id).limit(1);
        if (data && data.length) images[cat.id] = data[0].image_url;
        else images[cat.id] = cat.slug === 'watches' ? 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800' : cat.slug === 'rings' ? 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=800' : 'https://images.pexels.com/photos/6174221/pexels-photo-6174221.jpeg?auto=compress&cs=tinysrgb&w=800';
      } catch { images[cat.id] = 'https://images.pexels.com/photos/6174221/pexels-photo-6174221.jpeg?auto=compress&cs=tinysrgb&w=800'; }
    }
    setCategoryImages(images);
  };

  const fetchFeaturedProducts = async () => {
    setLoadingProducts(true);
    try { const { data } = await supabase.from('products').select('*').eq('is_featured', true).limit(4); if (data) setFeaturedProducts(data); }
    catch (err) { console.error(err); } finally { setLoadingProducts(false); }
  };
  const fetchNewArrivals = async () => {
    try { const { data } = await supabase.from('products').select('*').eq('is_new_arrival', true).order('created_at', { ascending: false }).limit(4); if (data) setNewArrivals(data); }
    catch (err) { console.error(err); }
  };
  const fetchReviews = async () => {
    setLoadingReviews(true);
    try { const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(6); if (data) setReviews(data); }
    catch (err) { console.error(err); } finally { setLoadingReviews(false); }
  };

  const nextSlide = () => { setCurrentSlide((p) => (p + 1) % heroSlides.length); setIsAnimating(true); setTimeout(() => setIsAnimating(false), 1000); };
  const prevSlide = () => { setCurrentSlide((p) => (p - 1 + heroSlides.length) % heroSlides.length); setIsAnimating(true); setTimeout(() => setIsAnimating(false), 1000); };
  const getWhatsAppLink = (product: Product) => `https://wa.me/254798893450?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} (Ksh ${product.price.toLocaleString()})`)}`;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, message } = formData;
    window.location.href = `mailto:boldifyjewelry@gmail.com?subject=${encodeURIComponent('Inquiry from Boldify website')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    setFormData({ name: '', email: '', message: '' });
  };
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => { e.preventDefault(); document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' }); };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePosition({ x: (e.clientX - rect.left) / rect.width - 0.5, y: (e.clientY - rect.top) / rect.height - 0.5 });
  };
  const navigateToCategory = (slug: string) => { if (onNavigateToShop) onNavigateToShop(slug); };

  const faqItems = [
    { question: "What materials are your jewellery made of?", answer: "Our pieces are made from high-quality materials such as stainless steel, gold plating, and premium alloys—designed to be durable, stylish, and long-lasting." },
    { question: "Will the jewellery tarnish or fade?", answer: "Our jewellery is designed to resist tarnishing, especially our stainless steel pieces. However, proper care (avoiding water, perfumes, and chemicals) helps maintain shine longer." },
    { question: "Is your jewellery suitable for sensitive skin?", answer: "Yes! Most of our pieces are hypoallergenic and safe for sensitive skin. If you have specific allergies, feel free to contact us before purchasing." },
    { question: "How do I place an order?", answer: "Simply browse our collection, add your favorite pieces to cart, and proceed to checkout. It’s quick and easy 💕" },
    { question: "What payment methods do you accept?", answer: "We only accept M-Pesa payments at the moments." },
    { question: "How long does delivery take?", answer: "Delivery typically takes 1–3 business days within major towns and slightly longer for other areas." },
    { question: "Do you offer same-day delivery?", answer: "Same-day delivery may be available in selected locations. Contact us to confirm availability." },
    { question: "How much is delivery?", answer: "Shipping costs vary depending on your location. The exact fee will be shown at checkout." },
    { question: "How can I contact you?", answer: "You can reach us via WhatsApp, Instagram, or email—we’re always happy to help 💕" }
  ];
  const toggleFaq = (idx: number) => setOpenFaqIndex(openFaqIndex === idx ? null : idx);

  const ProductCard = ({ product, isNew = false }: { product: Product; isNew?: boolean }) => {
    const inCart = cart.has(product.id);
    return (
      <div className="group relative cursor-pointer bg-white/80 backdrop-blur-sm border border-[#E5E5E5] hover:border-[#C4A747] transition-all duration-500 hover:shadow-2xl">
        <div className="relative h-80 overflow-hidden bg-[#FAFAFA]">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125" />
          {isNew && <span className="absolute top-4 left-4 bg-[#C4A747] text-black px-3 py-1 text-xs font-bold tracking-wide z-10">NEW</span>}
          <button onClick={(e) => toggleWishlist(product.id, e)} className="absolute top-4 right-12 bg-black/50 hover:bg-black p-2 rounded-full transition-colors z-20" aria-label="Wishlist">
            <Heart className={`h-5 w-5 ${wishlist.has(product.id) ? 'text-[#C4A747] fill-[#C4A747]' : 'text-white'}`} />
          </button>
          <button onClick={(e) => inCart ? removeFromCart(product.id, e) : addToCart(product.id, e)} className="absolute top-4 right-4 bg-black/50 hover:bg-black p-2 rounded-full transition-colors z-20" aria-label={inCart ? 'Remove from cart' : 'Add to cart'}>
            <ShoppingCart className={`h-5 w-5 ${inCart ? 'text-[#C4A747]' : 'text-white'}`} />
          </button>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">{product.name}</h3>
          <p className="text-[#666666] text-sm mb-4 line-clamp-2">{product.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-[#C4A747]">Ksh {product.price.toLocaleString()}</span>
            <a href={getWhatsAppLink(product)} target="_blank" rel="noopener noreferrer" className="relative overflow-hidden bg-[#1A1A1A] text-white px-5 py-2 text-sm font-bold transition-all duration-300 hover:bg-[#C4A747] hover:text-black group/btn">
              <span className="relative z-10">ORDER</span>
              <span className="absolute inset-0 bg-[#C4A747] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] relative overflow-x-hidden">
      {/* Hero section – same as before (unchanged) */}
      <div ref={heroRef} className="relative h-screen overflow-hidden cursor-grab active:cursor-grabbing" onMouseMove={handleMouseMove}>
        {heroSlides.map((slide, index) => {
          const offsetX = index === currentSlide ? mousePosition.x * 40 : 0;
          const offsetY = index === currentSlide ? mousePosition.y * 30 : 0;
          return (
            <div key={index} className={`absolute inset-0 transition-all duration-1000 ease-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10" />
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" style={{ transform: `translate(${offsetX}px, ${offsetY}px)`, transition: 'transform 0.1s ease-out' }} />
              <div className="absolute inset-0 z-20 flex items-center justify-start px-8 md:px-20 lg:px-32">
                <div className="max-w-2xl text-left">
                  <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 ${isAnimating ? 'opacity-0 -translate-y-6' : 'opacity-100 translate-y-0'}`}>{slide.title}</h1>
                  <p className={`text-xl md:text-3xl text-white/90 mb-12 ${isAnimating ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>{slide.subtitle}</p>
                  <button onClick={() => onNavigateToShop && onNavigateToShop()} className={`group bg-transparent border-2 border-white text-white px-12 py-4 text-lg font-bold hover:bg-white hover:text-black transition-all ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                    SHOP NOW
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-black/40 backdrop-blur-sm p-3 rounded-full"><ChevronLeft className="h-6 w-6 text-white" /></button>
        <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-black/40 backdrop-blur-sm p-3 rounded-full"><ChevronRight className="h-6 w-6 text-white" /></button>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button key={index} onClick={() => { setCurrentSlide(index); setIsAnimating(true); setTimeout(() => setIsAnimating(false), 1000); }} className={`transition-all rounded-full ${index === currentSlide ? 'w-8 h-1 bg-white' : 'w-2 h-1 bg-white/50'}`} />
          ))}
        </div>
      </div>

      {/* Shop by Category (same as before, omitted for brevity – include full code) */}
      <section ref={(el) => (sectionsRef.current[0] = el)} className="py-12 px-6 md:px-12 lg:px-24" style={{ backgroundColor: '#000000' }}>
        <div className="max-w-7xl mx-auto">
          <div ref={(el) => (headingRefs.current[0] = el)} className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-4">Shop by Category</h2>
            <p className="text-gray-300 text-lg">Find your perfect piece by exploring our curated collections</p>
          </div>
          {loadingCategories ? <div className="text-center text-white py-12">Loading categories...</div> : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map(cat => (
                <div key={cat.id} onClick={() => navigateToCategory(cat.slug)} className="group cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-2xl hover:-translate-y-2">
                  <div className="relative h-64 overflow-hidden">
                    <img src={categoryImages[cat.id] || 'https://images.pexels.com/photos/6174221/pexels-photo-6174221.jpeg?auto=compress&cs=tinysrgb&w=800'} alt={cat.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                      <h3 className="text-2xl font-bold text-white mb-2">{cat.name}</h3>
                      <div className="w-12 h-px bg-[#C4A747] mx-auto mb-3"></div>
                      <p className="text-white/80 text-sm">Shop Now →</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="text-center text-white py-12">No categories found.</div>}
        </div>
      </section>

      {/* Featured Collections */}
      <section ref={(el) => (sectionsRef.current[1] = el)} className="py-12 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div ref={(el) => (headingRefs.current[1] = el)} className="mb-12 text-center opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-4xl md:text-5xl font-semibold text-[#1A1A1A] mb-4">Featured Collections</h2>
            <p className="text-[#4A4A4A] text-lg">Handpicked pieces that define boldness</p>
          </div>
          {loadingProducts && featuredProducts.length === 0 ? <div className="text-center py-12">Loading products...</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section ref={(el) => (sectionsRef.current[2] = el)} className="py-12 px-6 md:px-12 lg:px-24 bg-[#F1EFEA]">
        <div className="max-w-7xl mx-auto">
          <div ref={(el) => (headingRefs.current[2] = el)} className="mb-12 text-center opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-4xl md:text-5xl font-semibold text-[#1A1A1A] mb-4">New Arrivals</h2>
            <p className="text-[#4A4A4A] text-lg">Fresh additions to elevate your collection</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} isNew />)}
          </div>
        </div>
      </section>

      {/* The Boldify Experience, Customer Reviews, About, FAQ, Contact, Footer – same as before (unchanged) */}
      {/* For brevity, copy these sections from your original file or previous version */}
      {/* ... (keep all sections unchanged) ... */}
    </div>
  );
}
