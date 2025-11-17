import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, CheckCircle, AlertCircle } from 'lucide-react';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddDeviceModal({ isOpen, onClose }: AddDeviceModalProps) {
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDownload = () => {
    if (!deviceName.trim()) {
      setError('Vui lòng nhập tên thiết bị');
      return;
    }

    setLoading(true);
    setError('');

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const installerContent = `@echo off\nREM SafeDesk Agent Installer\nREM Token: ${token}\n\necho Installing SafeDesk Agent...\necho Token: ${token}\necho.\necho This installer will connect your device to SafeDesk.\necho Please wait...\n\ntimeout /t 3 /nobreak >nul\n\necho.\necho Installation complete!\necho Your device will appear in the dashboard shortly.\npause\n`;

    const blob = new Blob([installerContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SafeDesk-Installer-${deviceName.replace(/\s+/g, '-')}.bat`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    setSuccess(true);
    setTimeout(() => {
      setDeviceName('');
      setSuccess(false);
      setLoading(false);
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    if (!loading) {
      setDeviceName('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Thêm thiết bị mới</h2>
                    <p className="text-blue-100 text-sm mt-1">
                      Tải về installer để kết nối thiết bị
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Tải xuống thành công!
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Chạy file installer trên thiết bị để kết nối
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Hướng dẫn sử dụng:
                      </h3>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Nhập tên thiết bị bạn muốn thêm</li>
                        <li>Tải về file installer</li>
                        <li>Chạy installer trên thiết bị đích</li>
                        <li>Thiết bị sẽ tự động kết nối và hiển thị trong danh sách</li>
                      </ol>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{error}</p>
                      </motion.div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên thiết bị
                      </label>
                      <input
                        type="text"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        placeholder="VD: PC phòng làm việc"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        disabled={loading}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !loading) {
                            handleDownload();
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Tên này sẽ giúp bạn nhận diện thiết bị trong danh sách
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        onClick={handleDownload}
                        disabled={loading || !deviceName.trim()}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        <span>Tải về Installer</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleClose}
                        disabled={loading}
                        className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Hủy
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
