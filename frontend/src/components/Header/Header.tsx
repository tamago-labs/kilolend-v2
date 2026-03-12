import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Clock, ChevronDown, ExternalLink } from 'react-feather';

export const Header = () => {
  const [showNavDropdown, setShowNavDropdown] = useState(false);
  const [isConnected] = useState(false); // Mock wallet connection state
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-50 h-18">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        {/* Brand Logo */}
        <div
          className="flex items-center cursor-pointer relative"
          onClick={() => navigate('/')}
        >
          <img
            src="/images/kilolend-logo-desktop.png"
            alt="KiloLend"
            className="h-13 w-38"
          />
          {/* v2 Badge */}
          <div className="absolute -top-1 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
            v2
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex gap-6">
          <div
            className="text-base font-medium text-slate-500 cursor-pointer hover:text-slate-900 transition-colors"
            onClick={() => navigate('/markets')}
          >
            Lending
          </div>
          <div
            className="text-base font-medium text-slate-500 cursor-pointer hover:text-slate-900 transition-colors"
            onClick={() => navigate('/agents')}
          >
            Agent Hub
          </div>
          <div
            className="text-base font-medium text-slate-500 cursor-pointer hover:text-slate-900 transition-colors"
            onClick={() => navigate('/launch-token')}
          >
            Launch Token
          </div>

          {/* More Dropdown */}
          <div className="relative">
            <div
              className={`text-base font-medium cursor-pointer flex items-center gap-1 transition-colors ${showNavDropdown ? 'text-green-500' : 'text-slate-500 hover:text-slate-900'}`}
              onClick={() => setShowNavDropdown(!showNavDropdown)}
            >
              More
              <ChevronDown
                size={16}
                className={`transition-transform ${showNavDropdown ? 'rotate-180' : ''}`}
              />
            </div>

            {/* Dropdown Menu */}
            {showNavDropdown && (
              <div className="absolute top-full left-0 bg-white border border-slate-200 rounded-xl shadow-lg p-3 min-w-[200px] z-100 mt-2">
                <div
                  className="px-4 py-3 rounded-lg cursor-pointer text-sm text-slate-900 transition-colors flex items-center gap-3 hover:bg-slate-50"
                  onClick={() => {
                    navigate('/leaderboard');
                    setShowNavDropdown(false);
                  }}
                >
                  Leaderboard
                </div>
                <div
                  className="px-4 py-3 rounded-lg cursor-pointer text-sm text-slate-900 transition-colors flex items-center gap-3 hover:bg-slate-50"
                  onClick={() => {
                    navigate('/portfolio');
                    setShowNavDropdown(false);
                  }}
                >
                  Portfolio
                </div>
                <div
                  className="px-4 py-3 rounded-lg cursor-pointer text-sm text-slate-900 transition-colors flex items-center gap-3 hover:bg-slate-50"
                  onClick={() => {
                    window.open('https://docs.kilolend.xyz', '_blank', 'noopener,noreferrer');
                    setShowNavDropdown(false);
                  }}
                >
                  <span>Documentation</span>
                  <ExternalLink size={14} />
                </div>
                <div
                  className="px-4 py-3 rounded-lg cursor-pointer text-sm text-slate-900 transition-colors flex items-center gap-3 hover:bg-slate-50"
                  onClick={() => {
                    window.open('https://discord.gg/BDQnjcHbnj', '_blank', 'noopener,noreferrer');
                    setShowNavDropdown(false);
                  }}
                >
                  <span>Discord</span>
                  <ExternalLink size={14} />
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">

        {!isConnected ? (
          /* Connect Button */
          <button
            className="flex gap-1 items-center justify-center min-w-[280px] h-12 text-white bg-green-500 rounded-xl border-none text-lg font-bold cursor-pointer transition-all hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30"
            onClick={() => console.log('Connect wallet clicked')}
          >
            Connect
          </button>
        ) : (
          /* Connected State - Mock */
          <>
            {/* Settings Icon */}
            <button className="flex items-center justify-center w-11 h-11 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer transition-all text-slate-500 hover:bg-slate-100 hover:text-slate-900">
              <Settings size={20} />
            </button>

            {/* Clock/Activities Icon */}
            <button className="flex items-center justify-center w-11 h-11 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer transition-all text-slate-500 hover:bg-slate-100 hover:text-slate-900">
              <Clock size={20} />
            </button>

            {/* Profile Section */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 cursor-pointer transition-all hover:bg-slate-100">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">KL</span>
              </div>
              <div className="flex flex-col items-start">
                <div className="text-xs font-semibold text-green-500 leading-none">Connected</div>
                <div className="text-sm text-slate-500 font-mono leading-none mt-0.5">0x1234...5678</div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};