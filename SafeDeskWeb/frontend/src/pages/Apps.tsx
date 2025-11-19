import { Search, Trash2, Edit2, X, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { mockApps, mockCategoryLabels } from '../data/mockData';
import { AppInfo, CategoryLabel } from '../types';
import { mockAPI } from '../utils/api';

interface AppsProps {
  selectedDeviceId: string | null;
}

export default function Apps({ selectedDeviceId }: AppsProps) {
  // accept API shape (icon_base64, app_name, version, publisher, status, last_updated)
  const [apps, setApps] = useState<any[]>(mockApps);
  const [categoryLabels, setCategoryLabels] = useState<CategoryLabel[]>(mockCategoryLabels);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [isEditingCategories, setIsEditingCategories] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredApps = apps
    .filter(app => selectedDeviceId ? (app.agent_id === selectedDeviceId || app.deviceId === selectedDeviceId) : true)
    .filter(app => {
      const name = (app.app_name || app.name || '').toString().toLowerCase();
      return name.includes(searchTerm.toLowerCase());
    });

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('token') || undefined;
    const load = async () => {
      if (!selectedDeviceId) {
        setApps(mockApps);
        setLoading(false);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      const res = await mockAPI.getAgentApplications(selectedDeviceId, token);
      if (!mounted) return;
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Không thể tải ứng dụng');
        return;
      }
      setApps(res.applications || []);
    };
    load();
    return () => { mounted = false; };
  }, [selectedDeviceId]);

  const handleUninstall = async (appId: string) => {
    if (!window.confirm('Bạn có chắc muốn gỡ cài đặt ứng dụng này?')) return;

    // find app and agent id
    const targetApp = apps.find(a => a.id === appId);
    const agentId = selectedDeviceId || targetApp?.agent_id || targetApp?.deviceId;
    const token = localStorage.getItem('token') || undefined;

    // optimistic update: mark as uninstalling
    setApps(prev => prev.map(a => a.id === appId ? { ...a, status: 'uninstalling' } : a));

    try {
      const res = await mockAPI.setAgentApplicationsStatus(String(agentId), { appId, status: 'uninstalling' }, token);
      if (!res.success) {
        // revert status
        setApps(prev => prev.map(a => a.id === appId ? { ...a, status: targetApp?.status || '' } : a));
        alert(res.error || 'Không thể gửi yêu cầu gỡ cài đặt');
        return;
      }

      // tạo thêm command loại "uninstall" để agent nhận lệnh
      const cmdBody = {
        commandType: 'uninstall',
        commandParams: {
          appId,
          appName: targetApp?.app_name || targetApp?.name || ''
        }
      };
      const cmdRes = await mockAPI.createAgentCommand(String(agentId), cmdBody, token);
      if (!cmdRes.success) {
        // không revert optimistic UI, chỉ thông báo
        alert(cmdRes.error || 'Không thể tạo command gỡ cài đặt cho agent');
      }
      // scheduled successfully — backend/agent sẽ xử lý thực tế
    } catch (err: any) {
      setApps(prev => prev.map(a => a.id === appId ? { ...a, status: targetApp?.status || '' } : a));
      alert(err?.message || 'Lỗi mạng khi gửi yêu cầu gỡ cài đặt');
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
      {selectedDeviceId && loading && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-sm text-gray-600">Đang tải ứng dụng...</div>
      )}
      {selectedDeviceId && error && (
        <div className="bg-red-50 rounded-xl p-4 border border-red-200 text-sm text-red-600">{error}</div>
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
        {filteredApps.map((app, index) => {
          const name = app.app_name || app.name || 'Unknown';
          const version = app.version || app.ver || '';
          const publisher = app.publisher || app.manufacturer || '';
          const status = app.status || '';
          const lastUpdated = app.last_updated || app.lastUpdated || '';
          const iconBase64 = app.icon_base64 || app.iconBase64 || null;

          // enable uninstall only when quite_uninstall_string is non-empty
          const canUninstall = !!((app.quite_uninstall_string || app.quiet_uninstall_string || '').toString().trim());
          // if backend set status to "uninstalling", show "Đang gỡ" and disable the button
          const isUninstalling = (status === 'uninstalling');
          const buttonDisabled = !canUninstall || isUninstalling;
           return (
             <motion.div
               key={app.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.05 }}
               className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 hover:shadow-md transition-all"
             >
               <div className="flex items-center gap-3 md:gap-4">
                 <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-50 overflow-hidden">
                   {iconBase64 ? (
                     <img src={`data:image/png;base64,${iconBase64}`} alt={name} className="w-full h-full object-contain" />
                   ) : (
                     <div className="text-xl md:text-2xl text-gray-600">{name.charAt(0)}</div>
                   )}
                 </div>
 
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1 flex-wrap">
                     <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{name}</h3>
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
                   <div className="flex items-center gap-3 text-xs md:text-sm text-gray-500 flex-wrap">
                     {version && <span>Phiên bản: <span className="font-mono">{version}</span></span>}
                     {publisher && <span>• Nhà phát hành: {publisher}</span>}
                     {status && <span>• Trạng thái: {status}</span>}
                     {lastUpdated && <span>• Cập nhật: {lastUpdated}</span>}
                   </div>
                 </div>
 
                <motion.button
                  whileHover={!buttonDisabled ? { scale: 1.05 } : undefined}
                  whileTap={!buttonDisabled ? { scale: 0.95 } : undefined}
                  onClick={() => !buttonDisabled && handleUninstall(app.id)}
                  disabled={buttonDisabled}
                  title={isUninstalling ? 'Đang gỡ' : (!canUninstall ? 'Không thể gỡ cài đặt trên thiết bị này' : 'Gỡ')}
                  className={`${!buttonDisabled ? 'px-3 md:px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100' : 'px-3 md:px-4 py-2 bg-gray-100 text-gray-400 cursor-not-allowed'} rounded-lg transition-colors flex items-center gap-2 flex-shrink-0`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-medium hidden sm:inline">{isUninstalling ? 'Đang gỡ' : 'Gỡ'}</span>
                </motion.button>
               </div>
             </motion.div>
           );
         })}
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
