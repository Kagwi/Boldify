import { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'shop'>('home');
  const [showSearch, setShowSearch] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  const handleNavigate = (page: 'home' | 'shop') => {
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
        <HomePage onNavigateToShop={() => handleNavigate('shop')} />
      ) : (
        <ShopPage onWishlistChange={setWishlistCount} />
      )}
    </div>
  );
}

export default App;
