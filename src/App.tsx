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

useEffect(() => {
  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('❌ Database Error:', error);
      } else {
        console.log('✅ Database Connected! Categories:', data);
      }
    } catch (err) {
      console.error('❌ Connection Failed:', err);
    }
  };
  
  testConnection();
}, []);

export default App;
