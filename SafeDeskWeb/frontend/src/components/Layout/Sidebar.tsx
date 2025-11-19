import { LayoutDashboard, AppWindow, Activity, Camera, Globe, Shield, Settings, X, Monitor, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  selectedDeviceId: string | null;
  selectedDeviceName?: string;
}

const mainMenuItems = [
  { id: 'devices', label: 'Thiết bị quản lý', icon: Monitor },
  { id: 'settings', label: 'Cài đặt', icon: Settings }
];

const deviceMenuItems = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'apps', label: 'Ứng dụng', icon: AppWindow },
  // { id: 'processes', label: 'Tiến trình', icon: Activity },
  { id: 'activity', label: 'Hoạt động', icon: Clock },
  { id: 'screenshots', label: 'Ảnh chụp', icon: Camera },
  { id: 'history', label: 'Lịch sử web', icon: Globe },
  { id: 'limits', label: 'Giới hạn', icon: Shield }
];

export default function Sidebar({ currentPage, onPageChange, isMobileMenuOpen, onCloseMobileMenu, selectedDeviceId, selectedDeviceName }: SidebarProps) {
  const menuItems = selectedDeviceId ? deviceMenuItems : mainMenuItems;
  return (
    <>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobileMenu}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div
        className={`w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SafeDesk</h1>
              <p className="text-xs text-gray-500">Monitor & Control</p>
            </div>
          </div>
          <button
            onClick={onCloseMobileMenu}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        {selectedDeviceId && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <button
              onClick={() => {
                onPageChange('devices');
                onCloseMobileMenu();
              }}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-2"
            >
              <span>←</span>
              <span>Quay lại danh sách</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <Monitor className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Đang quản lý</p>
                <p className="text-sm font-semibold text-gray-900">{selectedDeviceName || 'Thiết bị'}</p>
              </div>
            </div>
          </div>
        )}
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <li key={item.id}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onPageChange(item.id);
                    onCloseMobileMenu();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <p className="text-sm font-medium mb-1">SafeDesk Pro</p>
          <p className="text-xs opacity-90 mb-3">Nâng cấp để mở khóa tính năng</p>
          <button className="w-full bg-white text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
            Nâng cấp ngay
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
