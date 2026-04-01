import { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'shop'>('home');
  const [showSearch, setShowSearch] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleNavigate = (page: 'home' | 'shop', categorySlug?: string) => {
    if (page === 'shop' && categorySlug) {
      setSelectedCategory(categorySlug);
    } else {
      setSelectedCategory(null); // clear category when navigating to home or shop without category
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onSearchClick={() => setShowSearch(!showSearch)}
        wishlistCount={wishlistCount}
      />
      {currentPage === 'home' ? (
        <HomePage onNavigateToShop={(categorySlug) => handleNavigate('shop', categorySlug)} />
      ) : (
        <ShopPage onWishlistChange={setWishlistCount} initialCategory={selectedCategory} />
      )}
    </div>
  );
}

export default App;
