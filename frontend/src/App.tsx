import { useState, useEffect } from 'react';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Home } from './pages/Home';
import { Markets } from './pages/Markets';
import { Swap } from './pages/Swap';
import { Agents } from './pages/Agents';
import { LaunchToken } from './pages/LaunchToken';
import { Portfolio } from './pages/Portfolio';
import { Leaderboard } from './pages/Leaderboard';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { usePrices, useMarketsStore } from './hooks';

const currentPageToComponent: Record<string, React.ComponentType> = {
  '/': Home,
  '/markets': Markets,
  '/swap': Swap,
  '/agents': Agents,
  '/launch-token': LaunchToken,
  '/portfolio': Portfolio,
  '/leaderboard': Leaderboard,
  '/terms': Terms,
  '/privacy': Privacy,
};

function App() {
  // Initialize prices
  usePrices();
  
  // Initialize markets 
  useMarketsStore();
  
  const [currentPage, setCurrentPage] = useState('/');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentPage(hash);
    };
    
    // Initial load
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Cleanup
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (path: string) => {
    setCurrentPage(path);
    window.location.hash = path;
  };

  const CurrentPageComponent = currentPageToComponent[currentPage] || Home;

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col font-sans">
      <Header onNavigate={handleNavigate} />
      <main className="flex-1">
        <CurrentPageComponent />
      </main>
      <Footer />
    </div>
  );
}

export default App;
