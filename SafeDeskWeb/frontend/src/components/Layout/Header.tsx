import { Search, Bell, LogOut, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '../../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenMobileMenu: () => void;
}

export default function Header({ user, onLogout, onOpenMobileMenu }: HeaderProps) {
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
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm ứng dụng, tiến trình..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </motion.button>

          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

          <div className="flex items-center gap-2 lg:gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100"
            />
            <div className="text-sm hidden sm:block">
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
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
