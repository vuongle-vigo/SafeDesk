import { Bell, LogOut, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '../../types';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenMobileMenu: () => void;
}

export default function Header({ user, onLogout, onOpenMobileMenu }: HeaderProps) {
  // NEW: dropdown state + ref for click-outside
  const [showUserInfo, setShowUserInfo] = useState(false);
  const userRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!userRef.current) return;
      if (!userRef.current.contains(e.target as Node)) {
        setShowUserInfo(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 lg:left-64 left-0 z-10"
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-2">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* right controls: pushed to the far right */}
        <div className="ml-auto flex items-center gap-2 lg:gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </motion.button>

          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

          {/* avatar + dropdown */}
          <div ref={userRef} className="relative">
            <button
              onClick={() => setShowUserInfo(prev => !prev)}
              className="flex items-center gap-2 lg:gap-3 focus:outline-none"
              aria-haspopup="true"
              aria-expanded={showUserInfo}
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100"
              />
            </button>

            {showUserInfo && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-md z-20">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.role}</p>
                  {user.email && <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>}
                </div>
                <div className="border-t border-gray-100" />
                <button
                  onClick={() => { setShowUserInfo(false); onLogout(); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors hidden sm:block"
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
