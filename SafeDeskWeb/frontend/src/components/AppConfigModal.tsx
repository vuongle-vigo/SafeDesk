import { X, Save, AlertTriangle, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface AppConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: {
    id: string;
    name: string;
    icon: string;
  };
  config: {
    limitEnabled: boolean;
    limitMinutes: number;
    actionOnLimit: 'close' | 'warn' | 'none';
    warnInterval: number;
    isBlocked: boolean;
  };
  onSave: (config: any) => void;
}

export default function AppConfigModal({ isOpen, onClose, app, config, onSave }: AppConfigModalProps) {
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{app.icon}</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Cấu hình {app.name}</h2>
                  <p className="text-sm text-gray-500">Thiết lập giới hạn và quy tắc</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Ban className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900">Chặn ứng dụng</p>
                        <p className="text-sm text-red-700 mt-1">
                          Không cho phép sử dụng ứng dụng này hoàn toàn
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localConfig.isBlocked}
                          onChange={(e) => setLocalConfig({ ...localConfig, isBlocked: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`space-y-4 ${localConfig.isBlocked ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900">Giới hạn thời gian</p>
                          <p className="text-sm text-blue-700 mt-1">
                            Đặt giới hạn thời gian sử dụng hàng ngày
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localConfig.limitEnabled}
                            onChange={(e) => setLocalConfig({ ...localConfig, limitEnabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {localConfig.limitEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giới hạn (phút/ngày)
                      </label>
                      <input
                        type="number"
                        value={localConfig.limitMinutes}
                        onChange={(e) => setLocalConfig({ ...localConfig, limitMinutes: parseInt(e.target.value) || 0 })}
                        min="1"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.floor(localConfig.limitMinutes / 60)}h {localConfig.limitMinutes % 60}m mỗi ngày
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hành động khi vượt giới hạn
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="action"
                            value="close"
                            checked={localConfig.actionOnLimit === 'close'}
                            onChange={(e) => setLocalConfig({ ...localConfig, actionOnLimit: e.target.value as any })}
                            className="mt-1"
                          />
                          <div>
                            <p className="font-medium text-gray-900">Đóng ứng dụng</p>
                            <p className="text-sm text-gray-500">Tự động đóng ứng dụng khi hết thời gian</p>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="action"
                            value="warn"
                            checked={localConfig.actionOnLimit === 'warn'}
                            onChange={(e) => setLocalConfig({ ...localConfig, actionOnLimit: e.target.value as any })}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Cảnh báo</p>
                            <p className="text-sm text-gray-500">Hiển thị thông báo cảnh báo</p>
                            {localConfig.actionOnLimit === 'warn' && (
                              <div className="mt-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Tần suất cảnh báo (phút)
                                </label>
                                <select
                                  value={localConfig.warnInterval}
                                  onChange={(e) => setLocalConfig({ ...localConfig, warnInterval: parseInt(e.target.value) })}
                                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="1">Mỗi 1 phút</option>
                                  <option value="3">Mỗi 3 phút</option>
                                  <option value="5">Mỗi 5 phút</option>
                                  <option value="10">Mỗi 10 phút</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="action"
                            value="none"
                            checked={localConfig.actionOnLimit === 'none'}
                            onChange={(e) => setLocalConfig({ ...localConfig, actionOnLimit: e.target.value as any })}
                            className="mt-1"
                          />
                          <div>
                            <p className="font-medium text-gray-900">Không làm gì</p>
                            <p className="text-sm text-gray-500">Chỉ ghi nhận, không có hành động</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Lưu cấu hình</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
