import { Search, Trash2, Edit2, X, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { mockApps, mockCategoryLabels } from '../data/mockData';
import { AppInfo, CategoryLabel } from '../types';

interface AppsProps {
  selectedDeviceId: string | null;
}

export default function Apps({ selectedDeviceId }: AppsProps) {
  const [apps, setApps] = useState<AppInfo[]>(mockApps);
  const [categoryLabels, setCategoryLabels] = useState<CategoryLabel[]>(mockCategoryLabels);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [isEditingCategories, setIsEditingCategories] = useState(false);

  const filteredApps = apps
    .filter(app => selectedDeviceId ? app.deviceId === selectedDeviceId : true)
    .filter(app => app.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleUninstall = (appId: string) => {
    if (window.confirm('Bạn có chắc muốn gỡ cài đặt ứng dụng này?')) {
      setApps(apps.filter(app => app.id !== appId));
    }
  };

  const handleChangeCategory = (appId: string, newCategory: string) => {
    setApps(apps.map(app =>
      app.id === appId ? { ...app, category: newCategory as AppInfo['category'] } : app
    ));
    setEditingAppId(null);
  };

  const handleUpdateCategoryLabel = (categoryId: string, newLabel: string, newColor: string) => {
    setCategoryLabels(categoryLabels.map(cat =>
      cat.id === categoryId ? { ...cat, label: newLabel, color: newColor } : cat
    ));
  };

  const getCategoryLabel = (category: string) => {
    const label = categoryLabels.find(c => c.category === category);
    return label ? label.label : category;
  };

  const getCategoryColor = (category: string) => {
    const label = categoryLabels.find(c => c.category === category);
    return label ? label.color : '#6B7280';
  };

  return (
    <div className="space-y-6">
      {!selectedDeviceId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <Tag className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-700">Vui lòng chọn thiết bị ở trang "Thiết bị quản lý" để xem ứng dụng</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý ứng dụng</h1>
          <p className="text-gray-500 mt-1">Tổng cộng {filteredApps.length} ứng dụng</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditingCategories(!isEditingCategories)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <Tag className="w-4 h-4" />
          <span>Quản lý nhãn</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isEditingCategories && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 overflow-hidden"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chỉnh sửa nhãn danh mục</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryLabels.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="color"
                    value={cat.color}
                    onChange={(e) => handleUpdateCategoryLabel(cat.id, cat.label, e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={cat.label}
                    onChange={(e) => handleUpdateCategoryLabel(cat.id, e.target.value, cat.color)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500 capitalize">{cat.category}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm ứng dụng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredApps.map((app, index) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0">
                {app.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{app.name}</h3>
                  {editingAppId === app.id ? (
                    <div className="flex items-center gap-1">
                      <select
                        value={app.category}
                        onChange={(e) => handleChangeCategory(app.id, e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      >
                        {categoryLabels.map(cat => (
                          <option key={cat.id} value={cat.category}>{cat.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setEditingAppId(null)}
                        className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingAppId(app.id)}
                      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: getCategoryColor(app.category) + '20', color: getCategoryColor(app.category) }}
                    >
                      <span>{getCategoryLabel(app.category)}</span>
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500 flex-wrap">
                  <span>📦 {app.size}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>🕐 {app.lastUsed}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>📊 {app.usageCount} lần</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleUninstall(app.id)}
                className="px-3 md:px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Gỡ</span>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredApps.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy ứng dụng</h3>
          <p className="text-gray-500">Thử tìm kiếm với từ khóa khác hoặc chọn thiết bị khác</p>
        </div>
      )}
    </div>
  );
}
