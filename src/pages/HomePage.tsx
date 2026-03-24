import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Phone, Mail, MessageCircle, Send } from 'lucide-react';
import { supabase, Product, Review } from '../lib/supabase';

interface HomePageProps {
  onNavigateToShop: () => void;
}

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
];

export default function HomePage({ onNavigateToShop }: HomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    fetchFeaturedProducts();
    fetchNewArrivals();
    fetchReviews();

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
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
    return `https://wa.me/254700000000?text=${encodeURIComponent(message)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-royal-blue/40 to-black/80 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="text-center px-4">
                <h1
                  className="text-5xl md:text-7xl lg:text-8xl font-bold text-gold mb-6 animate-fade-in"
                  style={{ fontFamily: 'Jolt, serif' }}
                >
                  {slide.title}
                </h1>
                <p
                  className="text-xl md:text-3xl text-gray-200 mb-12"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {slide.subtitle}
                </p>
                <button
                  onClick={onNavigateToShop}
                  className="bg-gold text-black px-12 py-4 text-lg font-bold hover:bg-gold/90 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gold/50"
                  style={{ fontFamily: 'Marcellus, serif' }}
                >
                  SHOP NOW
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-gold/90 text-white hover:text-black p-3 transition-all duration-300"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-gold/90 text-white hover:text-black p-3 transition-all duration-300"
        >
          <ChevronRight className="h-8 w-8" />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 transition-all duration-300 ${
                index === currentSlide ? 'bg-gold w-12' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-4xl md:text-5xl font-bold text-gold text-center mb-4"
            style={{ fontFamily: 'Jolt, serif' }}
          >
            Featured Collections
          </h2>
          <p
            className="text-gray-400 text-center mb-12 text-lg"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Handpicked pieces that define boldness
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer overflow-hidden bg-gray-900/50 border border-gray-800 hover:border-gold transition-all duration-300"
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <h3
                    className="text-xl font-bold text-white mb-2"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4" style={{ fontFamily: 'Marcellus, serif' }}>
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gold" style={{ fontFamily: 'Jolt, serif' }}>
                      Ksh {product.price.toLocaleString()}
                    </span>
                    <a
                      href={getWhatsAppLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gold text-black px-4 py-2 text-sm font-bold hover:bg-gold/90 transition-colors duration-300"
                    >
                      ORDER
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-4xl md:text-5xl font-bold text-gold text-center mb-4"
            style={{ fontFamily: 'Jolt, serif' }}
          >
            New Arrivals
          </h2>
          <p
            className="text-gray-400 text-center mb-12 text-lg"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Fresh additions to elevate your collection
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer overflow-hidden bg-gray-900/50 border border-gray-800 hover:border-gold transition-all duration-300"
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-gold text-black px-3 py-1 text-xs font-bold">
                    NEW
                  </span>
                </div>
                <div className="p-6">
                  <h3
                    className="text-xl font-bold text-white mb-2"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4" style={{ fontFamily: 'Marcellus, serif' }}>
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gold" style={{ fontFamily: 'Jolt, serif' }}>
                      Ksh {product.price.toLocaleString()}
                    </span>
                    <a
                      href={getWhatsAppLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gold text-black px-4 py-2 text-sm font-bold hover:bg-gold/90 transition-colors duration-300"
                    >
                      ORDER
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-4xl md:text-5xl font-bold text-gold text-center mb-4"
            style={{ fontFamily: 'Jolt, serif' }}
          >
            Customer Reviews
          </h2>
          <p
            className="text-gray-400 text-center mb-12 text-lg"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            What our bold women say
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-gray-900/50 border border-gray-800 p-6 hover:border-gold transition-all duration-300"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < review.rating ? 'text-gold fill-gold' : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic" style={{ fontFamily: 'Marcellus, serif' }}>
                  "{review.comment}"
                </p>
                <p className="text-gold font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {review.customer_name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-4xl md:text-5xl font-bold text-gold text-center mb-8"
            style={{ fontFamily: 'Jolt, serif' }}
          >
            About Boldify Jewellery
          </h2>
          <div className="text-gray-300 space-y-6 text-lg" style={{ fontFamily: 'Marcellus, serif' }}>
            <p className="leading-relaxed">
              At Boldify Jewellery.Ke, we believe that every woman deserves to wear pieces that reflect her strength, confidence, and unique style. Our carefully curated collection features bold, statement jewellery designed for the modern Kenyan woman who isn't afraid to stand out.
            </p>
            <p className="leading-relaxed">
              From elegant necklaces to stunning earrings and exquisite bangles, each piece in our collection is selected with meticulous attention to detail. We combine luxury with affordability, ensuring that you can express your bold personality without compromise.
            </p>
            <p className="leading-relaxed">
              Our mission is simple: to empower women through jewellery that makes them feel unstoppable. Whether you're dressing up for a special occasion or adding a touch of elegance to your everyday look, Boldify has the perfect piece for you.
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-4xl md:text-5xl font-bold text-gold text-center mb-4"
            style={{ fontFamily: 'Jolt, serif' }}
          >
            Get In Touch
          </h2>
          <p
            className="text-gray-400 text-center mb-12 text-lg"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            We'd love to hear from you
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-gold mt-1" />
                <div>
                  <h3 className="text-white font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Phone
                  </h3>
                  <a
                    href="tel:+254700000000"
                    className="text-gray-400 hover:text-gold transition-colors"
                    style={{ fontFamily: 'Marcellus, serif' }}
                  >
                    +254 700 000 000
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-gold mt-1" />
                <div>
                  <h3 className="text-white font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Email
                  </h3>
                  <a
                    href="mailto:info@boldifyjewellery.ke"
                    className="text-gray-400 hover:text-gold transition-colors"
                    style={{ fontFamily: 'Marcellus, serif' }}
                  >
                    info@boldifyjewellery.ke
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <MessageCircle className="h-6 w-6 text-gold mt-1" />
                <div>
                  <h3 className="text-white font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    WhatsApp
                  </h3>
                  <a
                    href="https://wa.me/254700000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-gold text-black px-6 py-2 font-bold hover:bg-gold/90 transition-colors"
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
                  className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-gold transition-colors"
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
                  className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                  style={{ fontFamily: 'Marcellus, serif' }}
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-gold transition-colors resize-none"
                  style={{ fontFamily: 'Marcellus, serif' }}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gold text-black px-6 py-3 font-bold hover:bg-gold/90 transition-colors flex items-center justify-center space-x-2"
                style={{ fontFamily: 'Marcellus, serif' }}
              >
                <span>SEND MESSAGE</span>
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="bg-black border-t border-gold/20 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400" style={{ fontFamily: 'Marcellus, serif' }}>
            © 2024 Boldify Jewellery.Ke. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
