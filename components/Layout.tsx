import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { Activity, Search, Bell, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../stores/useNotificationStore';
import { BreadcrumbNavigation, PageProgress } from './Navigation/NavigationButtons';
import { useNavigationFeatures } from '../hooks/useNavigationFeatures';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  
  // Initialize navigation features
  useNavigationFeatures();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 transition-colors duration-300">

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md pt-4 pb-2 border-b border-transparent transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-12">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -ml-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
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
                      ? 'text-white bg-emerald-500 shadow-lg shadow-emerald-500/20'
                      : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'}
                  `}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>


          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-slate-100">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none focus:outline-none text-sm w-32 text-slate-700 placeholder:text-slate-400" />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationMenuOpen(!notificationMenuOpen);
                  setProfileMenuOpen(false);
                }}
                className="p-2 md:p-3 bg-white rounded-full text-slate-400 hover:text-emerald-500 hover:shadow-md transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 md:top-2 md:right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {notificationMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-16 right-0 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 origin-top-right"
                  >
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-bold text-slate-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => markAsRead(notification.id)}
                              className={`
                                p-4 hover:bg-slate-50 transition-colors cursor-pointer relative group
                                ${notification.read ? 'opacity-60 bg-white' : 'bg-blue-50/30'}
                              `}
                            >
                              <div className="flex gap-3">
                                <div className={`
                                  mt-1 w-2 h-2 rounded-full flex-shrink-0
                                  ${notification.read ? 'bg-slate-200' : 'bg-emerald-500'}
                                `} />
                                <div className="flex-1">
                                  <h4 className={`text-sm font-semibold mb-1 ${notification.read ? 'text-slate-600' : 'text-slate-900'}`}>
                                    {notification.title}
                                  </h4>
                                  <p className="text-xs text-slate-500 leading-relaxed mb-2">
                                    {notification.message}
                                  </p>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              onClick={() => {
                setProfileMenuOpen(!profileMenuOpen);
                setNotificationMenuOpen(false);
              }}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-100 border-2 border-white shadow-md overflow-hidden cursor-pointer hover:scale-105 transition-transform"
            >
              <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Fallback"} alt="User" />
            </div>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute top-16 right-4 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 origin-top-right"
                >
                  <div className="px-4 py-2 border-b border-slate-100 mb-2">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                    <p className="text-xs text-slate-500">{user?.plan || 'Free'} Plan</p>
                  </div>
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2"
                  >
                    <UserIcon size={16} /> Profile
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
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
                      ? 'text-white bg-emerald-500'
                      : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'}
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
        {/* Breadcrumb and Progress */}
        <div className="mb-6 space-y-3">
          <BreadcrumbNavigation />
          <PageProgress />
        </div>
        
        {children}
      </main>
    </div>
  );
};

export default Layout;