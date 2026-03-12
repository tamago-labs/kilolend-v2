import { HashRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <div className="bg-slate-100 min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/launch-token" element={<LaunchToken />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
