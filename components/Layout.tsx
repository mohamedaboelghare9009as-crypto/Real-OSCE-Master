import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { Activity, Search, Bell, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full bg-[#F6F8FA]/90 backdrop-blur-md pt-4 pb-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-12">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Activity className="text-white w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="text-lg md:text-xl font-bold tracking-tight text-slate-900">OSCE Master</span>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-2">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => `
                    px-5 py-2.5 rounded-full text-sm font-semibold transition-all
                    ${isActive
                      ? 'text-white bg-slate-900 shadow-lg shadow-slate-900/10'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white'}
                  `}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-slate-100">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none focus:outline-none text-sm w-32 text-slate-700 placeholder:text-slate-400" />
            </div>
            <button className="p-2 md:p-3 bg-white rounded-full text-slate-400 hover:text-emerald-500 hover:shadow-md transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 md:top-2 md:right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div
              onClick={() => navigate('/profile')}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-100 border-2 border-white shadow-md overflow-hidden cursor-pointer hover:scale-105 transition-transform"
            >
              <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Fallback"} alt="User" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed inset-x-0 top-20 z-30 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-lg"
          >
            <nav className="flex flex-col p-4 space-y-2">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    px-4 py-3 rounded-xl text-base font-semibold transition-all
                    ${isActive
                      ? 'text-white bg-slate-900'
                      : 'text-slate-600 hover:bg-slate-100'}
                  `}
                >
                  {link.label}
                </NavLink>
              ))}
              {/* Mobile Search */}
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl mt-2">
                <Search className="w-5 h-5 text-slate-400" />
                <input type="text" placeholder="Search..." className="bg-transparent border-none focus:outline-none text-base flex-1 text-slate-700 placeholder:text-slate-400" />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;