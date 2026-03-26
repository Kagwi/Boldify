import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Phone, Mail, MessageCircle, Send, Gem, Shield, Sparkles } from 'lucide-react';
import { supabase, Product, Review } from '../lib/supabase';

interface HomePageProps {
  onNavigateToShop: () => void;
}

// Updated hero slides – 6 images
const heroSlides = [
  {
    image: 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Bold Pieces for Bold Women',
    subtitle: 'Elevate Your Style',
  },
  {
    image: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Statement Elegance',
    subtitle: 'Make Every Moment Count',
  },
  {
    image: 'https://images.pexels.com/photos/1446524/pexels-photo-1446524.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Luxury Redefined',
    subtitle: 'Discover Your Bold',
  },
  {
    image: 'https://images.pexels.com/photos/1061140/pexels-photo-1061140.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Timeless Craftsmanship',
    subtitle: 'Wear Your Story',
  },
  {
    image: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Radiance Defined',
    subtitle: 'Shine Bright',
  },
  {
    image: 'https://images.pexels.com/photos/698184/pexels-photo-698184.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Modern Heirlooms',
    subtitle: 'For Generations',
  },
];

export default function HomePage({ onNavigateToShop }: HomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  // Refs for scroll‑reveal animation on sections and individual elements
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const animateRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchNewArrivals();
    fetchReviews();

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for sections (whole section reveal)
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

    return () => observer.disconnect();
  }, []);

  // Intersection Observer for individual animated elements (slide-in, fade-up)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    animateRef.current.forEach((el) => {
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

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const getWhatsAppLink = (product: Product) => {
    const message = `Hi, I'm interested in ${product.name} (Ksh ${product.price.toLocaleString()})`;
    return `https://wa.me/254798893450?text=${encodeURIComponent(message)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate email sending – open default mail client
    window.location.href = `mailto:boldifyjewellery@gmail.com?subject=Message from ${formData.name}&body=${encodeURIComponent(formData.message)}%0A%0AFrom: ${formData.email}`;
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] relative overflow-x-hidden">
      {/* Subtle noise texture overlay – FIXED data URI */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20200%20200%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noise%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.65%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noise)%22/%3E%3C/svg%3E')] bg-repeat bg-[length:200px]"></div>

      {/* Hero Section – 6 slides */}
      <div className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              style={{ willChange: 'transform' }}
            />
            <div className="absolute inset-0 z-20 flex items-center justify-start px-8 md:px-20 lg:px-32">
              <div className="max-w-2xl text-left">
                <h1
                  className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight tracking-tight"
                  style={{ fontFamily: 'Jolt, serif' }}
                >
                  {slide.title}
                </h1>
                <p
                  className="text-xl md:text-3xl text-white/90 mb-12 font-light tracking-wide"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {slide.subtitle}
                </p>
                <button
                  onClick={onNavigateToShop}
                  className="group bg-transparent border-2 border-white text-white px-12 py-4 text-lg font-bold hover:bg-white hover:text-black transition-all duration-500 hover:scale-105 hover:shadow-2xl"
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
        ))}

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
              onClick={() => setCurrentSlide(index)}
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
        className="py-32 px-6 md:px-12 lg:px-24 opacity-0 translate-y-10 transition-all duration-1000 delay-200"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-left md:text-center">
            <h2
              className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4 tracking-tight animate-on-scroll"
              ref={(el) => (animateRef.current[0] = el)}
            >
              Featured Collections
            </h2>
            <p
              className="text-[#4A4A4A] text-lg font-light max-w-2xl mx-auto animate-on-scroll"
              ref={(el) => (animateRef.current[1] = el)}
            >
              Handpicked pieces that define boldness
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {featuredProducts.map((product, idx) => (
              <div
                key={product.id}
                className="group relative cursor-pointer bg-white/80 backdrop-blur-sm border border-[#E5E5E5] hover:border-[#C4A747] transition-all duration-500 hover:shadow-2xl animate-on-scroll"
                ref={(el) => (animateRef.current[2 + idx] = el)}
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
        className="py-32 px-6 md:px-12 lg:px-24 bg-[#F1EFEA] opacity-0 translate-y-10 transition-all duration-1000 delay-300"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-left md:text-center">
            <h2
              className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4 animate-on-scroll"
              ref={(el) => (animateRef.current[10] = el)}
            >
              New Arrivals
            </h2>
            <p
              className="text-[#4A4A4A] text-lg font-light max-w-2xl mx-auto animate-on-scroll"
              ref={(el) => (animateRef.current[11] = el)}
            >
              Fresh additions to elevate your collection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {newArrivals.map((product, idx) => (
              <div
                key={product.id}
                className="group relative cursor-pointer bg-white/80 backdrop-blur-sm border border-[#E5E5E5] hover:border-[#C4A747] transition-all duration-500 animate-on-scroll"
                ref={(el) => (animateRef.current[12 + idx] = el)}
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

      {/* New Section: Why Boldify (above Customer Reviews) */}
      <section
        ref={(el) => (sectionsRef.current[2] = el)}
        className="py-32 px-6 md:px-12 lg:px-24 opacity-0 translate-y-10 transition-all duration-1000 delay-400"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4 animate-on-scroll"
              ref={(el) => (animateRef.current[20] = el)}
            >
              Why Boldify
            </h2>
            <p
              className="text-[#4A4A4A] text-lg font-light max-w-2xl mx-auto animate-on-scroll"
              ref={(el) => (animateRef.current[21] = el)}
            >
              Crafted with passion, worn with confidence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center animate-on-scroll" ref={(el) => (animateRef.current[22] = el)}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#C4A747]/10 rounded-full mb-6">
                <Gem className="h-10 w-10 text-[#C4A747]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">Handcrafted Excellence</h3>
              <p className="text-[#666666]">Each piece is meticulously crafted by skilled artisans, ensuring unique character and lasting beauty.</p>
            </div>
            <div className="text-center animate-on-scroll" ref={(el) => (animateRef.current[23] = el)}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#C4A747]/10 rounded-full mb-6">
                <Shield className="h-10 w-10 text-[#C4A747]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">Ethically Sourced</h3>
              <p className="text-[#666666]">We are committed to responsible sourcing, ensuring every gem and metal is conflict‑free.</p>
            </div>
            <div className="text-center animate-on-scroll" ref={(el) => (animateRef.current[24] = el)}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#C4A747]/10 rounded-full mb-6">
                <Sparkles className="h-10 w-10 text-[#C4A747]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">Lifetime Polish</h3>
              <p className="text-[#666666]">Enjoy complimentary cleaning and polishing for life – your jewelry will always shine.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section
        ref={(el) => (sectionsRef.current[3] = el)}
        className="py-32 px-6 md:px-12 lg:px-24 bg-[#F1EFEA] opacity-0 translate-y-10 transition-all duration-1000 delay-500"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-left md:text-center">
            <h2
              className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4 animate-on-scroll"
              ref={(el) => (animateRef.current[25] = el)}
            >
              Customer Reviews
            </h2>
            <p
              className="text-[#4A4A4A] text-lg font-light max-w-2xl mx-auto animate-on-scroll"
              ref={(el) => (animateRef.current[26] = el)}
            >
              What our bold women say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, idx) => (
              <div
                key={review.id}
                className="bg-white border border-[#E5E5E5] p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-[#C4A747] animate-on-scroll"
                ref={(el) => (animateRef.current[27 + idx] = el)}
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

      {/* Brand Banner (above About Us) */}
      <div className="relative py-24 px-6 md:px-12 bg-gradient-to-r from-[#C4A747]/20 to-[#C4A747]/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl md:text-3xl font-light italic text-[#1A1A1A] animate-on-scroll" ref={(el) => (animateRef.current[40] = el)}>
            “Jewelry is not just an accessory – it’s a reflection of your inner strength.”
          </p>
          <p className="mt-4 text-[#C4A747] font-semibold animate-on-scroll" ref={(el) => (animateRef.current[41] = el)}>
            – Boldify Jewellery
          </p>
        </div>
      </div>

      {/* About Us – Two Columns */}
      <section
        ref={(el) => (sectionsRef.current[4] = el)}
        className="py-32 px-6 md:px-12 lg:px-24 opacity-0 translate-y-10 transition-all duration-1000 delay-600"
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2
              className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6 animate-on-scroll"
              ref={(el) => (animateRef.current[42] = el)}
            >
              About Boldify Jewellery
            </h2>
            <div className="w-20 h-px bg-[#C4A747] mb-8 animate-on-scroll" ref={(el) => (animateRef.current[43] = el)} />
            <div className="text-[#2C2C2C] space-y-6 text-lg leading-relaxed" style={{ fontFamily: 'Marcellus, serif' }}>
              <p className="animate-on-scroll" ref={(el) => (animateRef.current[44] = el)}>
                At Boldify Jewellery.Ke, we believe that every woman deserves to wear pieces that reflect her strength, confidence, and unique style. Our carefully curated collection features bold, statement jewellery designed for the modern Kenyan woman who isn't afraid to stand out.
              </p>
              <p className="animate-on-scroll" ref={(el) => (animateRef.current[45] = el)}>
                From elegant necklaces to stunning earrings and exquisite bangles, each piece in our collection is selected with meticulous attention to detail. We combine luxury with affordability, ensuring that you can express your bold personality without compromise.
              </p>
              <p className="animate-on-scroll" ref={(el) => (animateRef.current[46] = el)}>
                Our mission is simple: to empower women through jewellery that makes them feel unstoppable. Whether you're dressing up for a special occasion or adding a touch of elegance to your everyday look, Boldify has the perfect piece for you.
              </p>
            </div>
          </div>
          <div className="relative animate-on-scroll" ref={(el) => (animateRef.current[47] = el)}>
            <div className="aspect-[4/5] overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/3779160/pexels-photo-3779160.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Jewelry craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section with Background Image & Overlay */}
      <section
        ref={(el) => (sectionsRef.current[5] = el)}
        className="relative py-32 px-6 md:px-12 lg:px-24 opacity-0 translate-y-10 transition-all duration-1000 delay-700"
      >
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <img
            src="https://images.pexels.com/photos/3584290/pexels-photo-3584290.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Luxury jewelry background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 max-w-6xl mx-auto">
          <div className="mb-20 text-left md:text-center">
            <h2
              className="text-4xl md:text-5xl font-bold text-white mb-4 animate-on-scroll"
              ref={(el) => (animateRef.current[48] = el)}
            >
              Get In Touch
            </h2>
            <p
              className="text-white/80 text-lg font-light max-w-2xl mx-auto animate-on-scroll"
              ref={(el) => (animateRef.current[49] = el)}
            >
              We'd love to hear from you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact info with refined spacing */}
            <div className="space-y-10">
              <div className="flex items-start space-x-5 animate-on-scroll" ref={(el) => (animateRef.current[50] = el)}>
                <Phone className="h-6 w-6 text-[#C4A747] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-bold mb-2 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Phone
                  </h3>
                  <a
                    href="tel:+254798893450"
                    className="text-white/80 hover:text-[#C4A747] transition-colors duration-300"
                    style={{ fontFamily: 'Marcellus, serif' }}
                  >
                    0798893450
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-5 animate-on-scroll" ref={(el) => (animateRef.current[51] = el)}>
                <Mail className="h-6 w-6 text-[#C4A747] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-bold mb-2 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Email
                  </h3>
                  <a
                    href="mailto:boldifyjewellery@gmail.com"
                    className="text-white/80 hover:text-[#C4A747] transition-colors duration-300"
                    style={{ fontFamily: 'Marcellus, serif' }}
                  >
                    boldifyjewellery@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-5 animate-on-scroll" ref={(el) => (animateRef.current[52] = el)}>
                <MessageCircle className="h-6 w-6 text-[#C4A747] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-bold mb-2 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                    WhatsApp
                  </h3>
                  <a
                    href="https://wa.me/254798893450"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#C4A747] text-black px-6 py-3 font-bold transition-all duration-300 hover:bg-white hover:text-black"
                    style={{ fontFamily: 'Marcellus, serif' }}
                  >
                    CHAT WITH US
                  </a>
                </div>
              </div>
            </div>

            {/* Contact form – now opens email app */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="animate-on-scroll" ref={(el) => (animateRef.current[53] = el)}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/30 text-white px-4 py-3 focus:outline-none focus:border-[#C4A747] transition-colors duration-300 placeholder:text-white/60"
                  style={{ fontFamily: 'Marcellus, serif' }}
                  required
                />
              </div>
              <div className="animate-on-scroll" ref={(el) => (animateRef.current[54] = el)}>
                <input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/30 text-white px-4 py-3 focus:outline-none focus:border-[#C4A747] transition-colors duration-300 placeholder:text-white/60"
                  style={{ fontFamily: 'Marcellus, serif' }}
                  required
                />
              </div>
              <div className="animate-on-scroll" ref={(el) => (animateRef.current[55] = el)}>
                <textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/30 text-white px-4 py-3 focus:outline-none focus:border-[#C4A747] transition-colors duration-300 resize-none placeholder:text-white/60"
                  style={{ fontFamily: 'Marcellus, serif' }}
                  required
                />
              </div>
              <button
                type="submit"
                className="group relative w-full bg-[#C4A747] text-black px-6 py-3 font-bold overflow-hidden transition-all duration-300 hover:bg-white hover:text-black animate-on-scroll"
                ref={(el) => (animateRef.current[56] = el)}
                style={{ fontFamily: 'Marcellus, serif' }}
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>SEND MESSAGE</span>
                  <Send className="h-5 w-5" />
                </span>
                <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer with washout gradient */}
      <footer className="relative border-t border-[#E5E5E5] bg-white overflow-hidden">
        {/* Washout gradient from top to bottom */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#C4A747]/20 via-transparent to-transparent opacity-50"></div>
        <div className="relative z-10 py-10 px-6 md:px-12">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-[#666666] text-sm" style={{ fontFamily: 'Marcellus, serif' }}>
              © 2026 Boldify Jewellery.Ke. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        /* Section reveal */
        .visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        /* Individual element animations (fade-up + slide) */
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1), transform 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        .animate-on-scroll.animated {
          opacity: 1;
          transform: translateY(0);
        }

        /* Optional staggered effect for grid items can be controlled via delay, but we keep it uniform */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
