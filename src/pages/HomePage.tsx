import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Phone, Mail, MessageCircle, Send, Gem, Award, Heart, Facebook, Instagram, Twitter } from 'lucide-react';
import { supabase, Product, Review } from '../lib/supabase';

interface HomePageProps {
  onNavigateToShop: () => void;
}

const heroSlides = [
  {
    image: 'https://images.pexels.com/photos/7314460/pexels-photo-7314460.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Bold Pieces for Bold Women',
    subtitle: 'Elevate Your Style',
  },
  {
    image: 'https://images.pexels.com/photos/36339479/pexels-photo-36339479.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Statement Elegance',
    subtitle: 'Make Every Moment Count',
  },
  {
    image: 'https://images.pexels.com/photos/31730435/pexels-photo-31730435.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Luxury Redefined',
    subtitle: 'Discover Your Bold',
  },
  {
    image: 'https://images.pexels.com/photos/36536669/pexels-photo-36536669.png?auto=compress&cs=tinysrgb&w=1920',
    title: 'Timeless Craftsmanship',
    subtitle: 'Every Piece Tells a Story',
  },
  {
    image: 'https://images.pexels.com/photos/5043048/pexels-photo-5043048.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Modern Elegance',
    subtitle: 'Designed for You',
  },
  {
    image: 'https://images.pexels.com/photos/36339461/pexels-photo-36339461.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Uniquely Yours',
    subtitle: 'Celebrate Your Individuality',
  },
];

export default function HomePage({ onNavigateToShop }: HomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Refs for scroll‑reveal animation and section navigation
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const headingRefs = useRef<(HTMLDivElement | null)[]>([]);
  const experienceCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const aboutRef = useRef<HTMLElement | null>(null);
  const contactRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchNewArrivals();
    fetchReviews();

    // Slower autoplay (4 seconds)
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for scroll‑triggered reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    sectionsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    headingRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    experienceCardsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const fetchFeaturedProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .limit(4);
    if (data) setFeaturedProducts(data);
  };

  const fetchNewArrivals = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_new_arrival', true)
      .order('created_at', { ascending: false })
      .limit(4);
    if (data) setNewArrivals(data);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);
    if (data) setReviews(data);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const getWhatsAppLink = (product: Product) => {
    const message = `Hi, I'm interested in ${product.name} (Ksh ${product.price.toLocaleString()})`;
    return `https://wa.me/254798893450?text=${encodeURIComponent(message)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, message } = formData;
    const subject = encodeURIComponent('Inquiry from Boldify website');
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:boldifyjewelry@gmail.com?subject=${subject}&body=${body}`;
    setFormData({ name: '', email: '', message: '' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] relative overflow-x-hidden">
      {/* Subtle noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20200%20200%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noise%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.65%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noise)%22/%3E%3C/svg%3E')] bg-repeat bg-[length:200px]"></div>

      {/* Hero Section */}
      <div
        ref={heroRef}
        className="relative h-screen overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
      >
        {heroSlides.map((slide, index) => {
          const offsetX = index === currentSlide ? mousePosition.x * 40 : 0;
          const offsetY = index === currentSlide ? mousePosition.y * 30 : 0;
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1500 ease-out ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10" />
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover will-change-transform"
                style={{
                  transform: `translate(${offsetX}px, ${offsetY}px) scale(1.05)`,
                  transition: 'transform 0.1s ease-out',
                }}
              />
              <div className="absolute inset-0 z-20 flex items-center justify-start px-8 md:px-20 lg:px-32">
                <div className="max-w-2xl text-left">
                  <h1
                    className={`text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight tracking-tight transition-all duration-900 ${
                      isAnimating
                        ? 'opacity-0 -translate-y-6 scale-95 rotate-2'
                        : 'opacity-100 translate-y-0 scale-100 rotate-0'
                    }`}
                    style={{ fontFamily: 'Jolt, serif', transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  >
                    {slide.title}
                  </h1>
                  <p
                    className={`text-xl md:text-3xl text-white/90 mb-12 font-light tracking-wide transition-all duration-900 delay-150 ${
                      isAnimating
                        ? 'opacity-0 -translate-y-4 scale-95'
                        : 'opacity-100 translate-y-0 scale-100'
                    }`}
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {slide.subtitle}
                  </p>
                  <button
                    onClick={onNavigateToShop}
                    className={`group bg-transparent border-2 border-white text-white px-12 py-4 text-lg font-bold hover:bg-white hover:text-black transition-all duration-500 hover:scale-105 hover:shadow-2xl transition-all duration-900 delay-300 ${
                      isAnimating
                        ? 'opacity-0 translate-y-4'
                        : 'opacity-100 translate-y-0'
                    }`}
                    style={{ fontFamily: 'Marcellus, serif' }}
                  >
                    <span className="relative inline-block">
                      SHOP NOW
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-500"></span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-black/40 backdrop-blur-sm hover:bg-white/90 text-white hover:text-black p-3 transition-all duration-300 rounded-full focus:outline-none"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-black/40 backdrop-blur-sm hover:bg-white/90 text-white hover:text-black p-3 transition-all duration-300 rounded-full focus:outline-none"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                setIsAnimating(true);
                setTimeout(() => setIsAnimating(false), 1000);
              }}
              className={`transition-all duration-500 rounded-full ${
                index === currentSlide
                  ? 'w-8 h-1 bg-white'
                  : 'w-2 h-1 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Featured Collections */}
      <section
        ref={(el) => (sectionsRef.current[0] = el)}
        className="py-12 px-6 md:px-12 lg:px-24"
      >
        <div className="max-w-7xl mx-auto">
          <div
            ref={(el) => (headingRefs.current[0] = el)}
            className="mb-12 text-center opacity-0 translate-y-8 transition-all duration-700"
          >
            <h2
              className="text-4xl md:text-5xl font-semibold text-[#1A1A1A] mb-4 tracking-tight"
              style={{ fontFamily: 'Jolt, serif' }}
            >
              Featured Collections
            </h2>
            <p
              className="text-[#4A4A4A] text-lg font-light max-w-2xl mx-auto"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Handpicked pieces that define boldness
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative cursor-pointer bg-white/80 backdrop-blur-sm border border-[#E5E5E5] hover:border-[#C4A747] transition-all duration-500 hover:shadow-2xl"
                style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0.9, 0.4, 1.1)' }}
              >
                <div className="relative h-80 overflow-hidden bg-[#FAFAFA]">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125 will-change-transform"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0.95, 0.4, 1.05)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-6">
                  <h3
                    className="text-xl font-semibold text-[#1A1A1A] mb-2"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {product.name}
                  </h3>
                  <p className="text-[#666666] text-sm mb-4 line-clamp-2" style={{ fontFamily: 'Marcellus, serif' }}>
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-[#C4A747]" style={{ fontFamily: 'Jolt, serif' }}>
                      Ksh {product.price.toLocaleString()}
                    </span>
                    <a
                      href={getWhatsAppLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative overflow-hidden bg-[#1A1A1A] text-white px-5 py-2 text-sm font-bold transition-all duration-300 hover:bg-[#C4A747] hover:text-black group/btn"
                    >
                      <span className="relative z-10">ORDER</span>
                      <span className="absolute inset-0 bg-[#C4A747] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section
        ref={(el) => (sectionsRef.current[1] = el)}
        className="py-12 px-6 md:px-12 lg:px-24 bg-[#F1EFEA]"
      >
        <div className="max-w-7xl mx-auto">
          <div
            ref={(el) => (headingRefs.current[1] = el)}
            className="mb-12 text-center opacity-0 translate-y-8 transition-all duration-700"
          >
            <h2
              className="text-4xl md:text-5xl font-semibold text-[#1A1A1A] mb-4"
              style={{ fontFamily: 'Jolt, serif' }}
            >
              New Arrivals
            </h2>
            <p
              className="text-[#4A4A4A] text-lg font-light max-w-2xl mx-auto"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Fresh additions to elevate your collection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {newArrivals.map((product) => (
              <div
                key={product.id}
                className="group relative cursor-pointer bg-white/80 backdrop-blur-sm border border-[#E5E5E5] hover:border-[#C4A747] transition-all duration-500"
              >
                <div className="relative h-80 overflow-hidden bg-[#FAFAFA]">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125 will-change-transform"
                  />
                  <span className="absolute top-4 left-4 bg-[#C4A747] text-black px-3 py-1 text-xs font-bold tracking-wide z-10">
                    NEW
                  </span>
                </div>
                <div className="p-6">
                  <h3
                    className="text-xl font-semibold text-[#1A1A1A] mb-2"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {product.name}
                  </h3>
                  <p className="text-[#666666] text-sm mb-4 line-clamp-2" style={{ fontFamily: 'Marcellus, serif' }}>
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-[#C4A747]" style={{ fontFamily: 'Jolt, serif' }}>
                      Ksh {product.price.toLocaleString()}
                    </span>
                    <a
                      href={getWhatsAppLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative overflow-hidden bg-[#1A1A1A] text-white px-5 py-2 text-sm font-bold transition-all duration-300 hover:bg-[#C4A747] hover:text-black group/btn"
                    >
                      <span className="relative z-10">ORDER</span>
                      <span className="absolute inset-0 bg-[#C4A747] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Boldify Experience - Dark Ocean Blue */}
      <section
        ref={(el) => (sectionsRef.current[2] = el)}
        className="py-12 px-6 md:px-12 lg:px-24 bg-[#0A192F]"
      >
        <div className="max-w-7xl mx-auto">
          <div
            ref={(el) => (headingRefs.current[2] = el)}
            className="mb-12 text-center opacity-0 translate-y-8 transition-all duration-700"
          >
            <h2
              className="text-4xl md:text-5xl font-semibold text-white mb-4"
              style={{ fontFamily: 'Jolt, serif' }}
            >
              The Boldify Experience
            </h2>
            <p
              className="text-gray-300 text-lg font-light max-w-2xl mx-auto"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              More than jewelry — a celebration of you
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: Gem,
                title: 'Ethically Sourced',
                description: 'We partner with suppliers who prioritize fair labor and sustainable practices, ensuring every gem and metal tells a story of integrity.',
                delay: 0,
              },
              {
                icon: Award,
                title: 'Artisan Crafted',
                description: 'Each piece is meticulously handcrafted by skilled artisans who pour passion and precision into every detail.',
                delay: 150,
              },
              {
                icon: Heart,
                title: 'Timeless Design',
                description: 'Modern silhouettes meet classic elegance – jewelry that transcends trends and becomes a cherished heirloom.',
                delay: 300,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                ref={(el) => (experienceCardsRef.current[idx] = el)}
                className="text-center opacity-0 translate-y-6 transition-all duration-700 group"
                style={{ transitionDelay: `${item.delay}ms` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors duration-300 mb-5">
                  <item.icon className="h-6 w-6 text-[#C4A747]" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {item.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed max-w-sm mx-auto" style={{ fontFamily: 'Marcellus, serif' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section
        ref={(el) => (sectionsRef.current[3] = el)}
        className="py-12 px-6 md:px-12 lg:px-24"
      >
        <div className="max-w-7xl mx-auto">
          <div
            ref={(el) => (headingRefs.current[3] = el)}
            className="mb-12 text-center opacity-0 translate-y-8 transition-all duration-700"
          >
            <h2
              className="text-4xl md:text-5xl font-semibold text-[#1A1A1A] mb-4"
              style={{ fontFamily: 'Jolt, serif' }}
            >
              Customer Reviews
            </h2>
            <p
              className="text-[#4A4A4A] text-lg font-light max-w-2xl mx-auto"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              What our bold women say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-[#E5E5E5] p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-[#C4A747]"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < review.rating ? 'text-[#C4A747] fill-[#C4A747]' : 'text-[#DDD]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[#333] mb-6 italic text-base leading-relaxed" style={{ fontFamily: 'Marcellus, serif' }}>
                  "{review.comment}"
                </p>
                <p className="text-[#C4A747] font-semibold tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {review.customer_name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - with background image and overlay */}
      <section
        id="about"
        ref={(el) => {
          sectionsRef.current[4] = el;
          aboutRef.current = el;
        }}
        className="relative py-12 px-6 md:px-12 lg:px-24 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.pexels.com/photos/1689318/pexels-photo-1689318.jpeg?auto=compress&cs=tinysrgb&w=1920')" }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <div
            ref={(el) => (headingRefs.current[4] = el)}
            className="mb-12 text-center opacity-0 translate-y-8 transition-all duration-700"
          >
            <h2
              className="text-4xl md:text-5xl font-semibold text-white mb-4"
              style={{ fontFamily: 'Jolt, serif' }}
            >
              About Boldify Jewelry
            </h2>
            <div className="w-24 h-px bg-[#C4A747] mx-auto mb-6"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-gray-200 space-y-6 text-lg leading-relaxed" style={{ fontFamily: 'Marcellus, serif' }}>
              <p>
                At Boldify Jewelry.Ke, we believe that every woman deserves to wear pieces that reflect her strength, confidence, and unique style. Our carefully curated collection features bold, statement jewelry designed for the modern Kenyan woman who isn't afraid to stand out.
              </p>
              <p>
                From elegant necklaces to stunning earrings and exquisite bangles, each piece in our collection is selected with meticulous attention to detail. We combine luxury with affordability, ensuring that you can express your bold personality without compromise.
              </p>
              <p>
                Our mission is simple: to empower women through jewelry that makes them feel unstoppable. Whether you're dressing up for a special occasion or adding a touch of elegance to your everyday look, Boldify has the perfect piece for you.
              </p>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
              <img
                src="https://images.pexels.com/photos/6174221/pexels-photo-6174221.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Jewelry"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        ref={(el) => {
          sectionsRef.current[5] = el;
          contactRef.current = el;
        }}
        className="py-12 px-6 md:px-12 lg:px-24"
      >
        <div className="max-w-6xl mx-auto">
          <div
            ref={(el) => (headingRefs.current[5] = el)}
            className="mb-12 text-center opacity-0 translate-y-8 transition-all duration-700"
          >
            <h2
              className="text-4xl md:text-5xl font-semibold text-[#1A1A1A] mb-4"
              style={{ fontFamily: 'Jolt, serif' }}
            >
              Get In Touch
            </h2>
            <p
              className="text-[#4A4A4A] text-lg font-light max-w-2xl mx-auto"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              We'd love to hear from you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-10">
              <div className="flex items-start space-x-5">
                <Phone className="h-6 w-6 text-[#C4A747] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-[#1A1A1A] font-bold mb-2 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Phone
                  </h3>
                  <a
                    href="tel:+254798893450"
                    className="text-[#666666] hover:text-[#C4A747] transition-colors duration-300"
                    style={{ fontFamily: 'Marcellus, serif' }}
                  >
                    0798 893 450
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-5">
                <Mail className="h-6 w-6 text-[#C4A747] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-[#1A1A1A] font-bold mb-2 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Email
                  </h3>
                  <a
                    href="mailto:boldifyjewelry@gmail.com"
                    className="text-[#666666] hover:text-[#C4A747] transition-colors duration-300"
                    style={{ fontFamily: 'Marcellus, serif' }}
                  >
                    boldifyjewelry@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-5">
                <MessageCircle className="h-6 w-6 text-[#C4A747] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-[#1A1A1A] font-bold mb-2 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                    WhatsApp
                  </h3>
                  <a
                    href="https://wa.me/254798893450"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#1A1A1A] text-white px-6 py-3 font-bold transition-all duration-300 hover:bg-[#C4A747] hover:text-black"
                    style={{ fontFamily: 'Marcellus, serif' }}
                  >
                    CHAT WITH US
                  </a>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-transparent border-b border-[#DDD] text-[#1A1A1A] px-0 py-3 focus:outline-none focus:border-[#C4A747] transition-colors duration-300 placeholder:text-[#AAA]"
                  style={{ fontFamily: 'Marcellus, serif' }}
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-transparent border-b border-[#DDD] text-[#1A1A1A] px-0 py-3 focus:outline-none focus:border-[#C4A747] transition-colors duration-300 placeholder:text-[#AAA]"
                  style={{ fontFamily: 'Marcellus, serif' }}
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full bg-transparent border-b border-[#DDD] text-[#1A1A1A] px-0 py-3 focus:outline-none focus:border-[#C4A747] transition-colors duration-300 resize-none placeholder:text-[#AAA]"
                  style={{ fontFamily: 'Marcellus, serif' }}
                  required
                />
              </div>
              <button
                type="submit"
                className="group relative w-full bg-[#1A1A1A] text-white px-6 py-3 font-bold overflow-hidden transition-all duration-300 hover:bg-[#C4A747] hover:text-black"
                style={{ fontFamily: 'Marcellus, serif' }}
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>SEND MESSAGE</span>
                  <Send className="h-5 w-5" />
                </span>
                <span className="absolute inset-0 bg-[#C4A747] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Washout gradient effect above footer */}
      <div className="relative h-24 bg-gradient-to-t from-[#F1EFEA] to-transparent pointer-events-none"></div>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white border-t border-[#C4A747]/20 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center md:text-left">
              <button
                onClick={scrollToTop}
                className="text-2xl font-bold text-[#C4A747] hover:text-white transition-colors duration-300"
                style={{ fontFamily: 'Jolt, serif' }}
              >
                BOLDIFY
              </button>
              <p className="text-gray-400 text-sm mt-2" style={{ fontFamily: 'Marcellus, serif' }}>
                Statement jewelry for the bold woman.
              </p>
            </div>

            <div className="text-center">
              <h3 className="font-bold text-white mb-4 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                Quick Links
              </h3>
              <ul className="space-y-2" style={{ fontFamily: 'Marcellus, serif' }}>
                <li>
                  <button onClick={scrollToTop} className="text-gray-400 hover:text-[#C4A747] transition-colors">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={onNavigateToShop} className="text-gray-400 hover:text-[#C4A747] transition-colors">
                    Shop
                  </button>
                </li>
                <li>
                  <a
                    href="#about"
                    onClick={(e) => handleAnchorClick(e, 'about')}
                    className="text-gray-400 hover:text-[#C4A747] transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    onClick={(e) => handleAnchorClick(e, 'contact')}
                    className="text-gray-400 hover:text-[#C4A747] transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div className="text-center md:text-right">
              <h3 className="font-bold text-white mb-4 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                Follow Us
              </h3>
              <div className="flex justify-center md:justify-end space-x-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#C4A747] transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#C4A747] transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#C4A747] transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-500 text-sm" style={{ fontFamily: 'Marcellus, serif' }}>
              © 2026 Boldify Jewelry.Ke. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        html {
          scroll-behavior: smooth;
        }
        a, button, [role="button"] {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
