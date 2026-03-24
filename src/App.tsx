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

VITE_SUPABASE_URL = https://bmeyzpqrwtzqsxwbcded.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZXl6cHFyd3R6cXN4d2JjZGVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTg3MTYsImV4cCI6MjA4OTkzNDcxNn0.zXkShsfzf_Qm7qv2h38BbnLXENW6KXTlcpSgx5jvXGc
export default App;
