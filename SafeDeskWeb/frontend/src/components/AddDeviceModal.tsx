import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { mockAPI } from '../utils/api';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddDeviceModal({ isOpen, onClose }: AddDeviceModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // thời gian bắt buộc hiển thị spinner (ms)
  const PREPARE_DELAY_MS = 1200;

  const handleDownload = async () => {
    setLoading(true);
    setError('');

    try {
      const delayP = new Promise((resolve) => setTimeout(resolve, PREPARE_DELAY_MS));
      const token = localStorage.getItem('token') || '';

      // gọi API thật → trả blob
      const installerReq = mockAPI.generateInstaller(token);

      const [, installerResp] = await Promise.all([delayP, installerReq]);

      if (!installerResp.success || !installerResp.blob) {
        setError(installerResp.error || 'Không thể tạo installer');
        setLoading(false);
        return;
      }

      // File blob từ BE
      const blob = installerResp.blob;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SafeDesk-Installer-${Date.now()}.bat`; // tên file tải về
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setLoading(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Lỗi khi tạo installer');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
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
                      <h3 className="font-semibold text-blue-900 mb-2">Hướng dẫn sử dụng:</h3>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Tải về file installer.</li>
                        <li>Chạy installer trong vòng 15 phút kể từ lúc tải.</li>
                        <li>Chạy file với quyền Administrator.</li>
                        <li>Thiết bị sẽ tự động kết nối và hiển thị trong dashboard.</li>
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

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        onClick={handleDownload}
                        disabled={loading}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
                          />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                        <span>{loading ? 'Đang chuẩn bị...' : 'Tải về Installer'}</span>
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
