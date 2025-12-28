import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { Activity, Search, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full bg-[#F6F8FA]/90 backdrop-blur-md pt-4 pb-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-12">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Activity className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">OSCE Master</span>
            </div>

            {/* Nav Links */}
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
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-slate-100">
                <Search className="w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search..." className="bg-transparent border-none focus:outline-none text-sm w-32 text-slate-700 placeholder:text-slate-400" />
             </div>
            <button className="p-3 bg-white rounded-full text-slate-400 hover:text-emerald-500 hover:shadow-md transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div 
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white shadow-md overflow-hidden cursor-pointer hover:scale-105 transition-transform"
            >
                <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Fallback"} alt="User" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;