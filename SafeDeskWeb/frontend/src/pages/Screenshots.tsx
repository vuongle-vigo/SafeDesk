import { Camera, Download, X, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { mockScreenshots } from '../data/mockData';
import { Screenshot } from '../types';
import { mockAPI } from '../utils/api';

interface ScreenshotsProps {
  selectedDeviceId: string | null;
}

export default function Screenshots({ selectedDeviceId }: ScreenshotsProps) {
  const [screenshots, setScreenshots] = useState<Screenshot[]>(mockScreenshots);
  const [selectedImage, setSelectedImage] = useState<Screenshot | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [pendingCommandId, setPendingCommandId] = useState<string | null>(null);

  const loadScreenshots = useCallback(async () => {
    try {
      const agentId = selectedDeviceId || localStorage.getItem('agentId') || 'agent-1';
      const token = localStorage.getItem('token') || null;
      const res = await mockAPI.getScreenshots(agentId, 50, token);

      if (res.success && Array.isArray(res.screenshots) && res.screenshots.length > 0) {
        const formattedScreenshots = res.screenshots.map((s: any) => ({
          id: s.id || s.screenshot_id,
          url: s.url || s.screenshot_url,
          timestamp: s.timestamp || s.created_at
        }));
        setScreenshots(formattedScreenshots);
      }
    } catch (err) {
      console.error('Error loading screenshots:', err);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    loadScreenshots();
    const interval = setInterval(loadScreenshots, 10000);
    return () => clearInterval(interval);
  }, [loadScreenshots]);

  const handleCaptureRequest = async () => {
    setIsRequesting(true);
    setRequestError(null);
    // show waiting indicator immediately
    setPendingCommandId('pending');

    try {
      const agentId = selectedDeviceId || localStorage.getItem('agentId') || 'agent-1';
      const token = localStorage.getItem('token') || null;
      const res = await mockAPI.requestScreenshot(agentId, token);

      if (res.success) {
        // replace temporary pending id with real command id if provided
        setPendingCommandId(res.commandId || 'pending');
        setTimeout(() => {
          loadScreenshots();
        }, 3000);
      } else {
        setRequestError('Không thể gửi yêu cầu chụp màn hình');
        setPendingCommandId(null);
      }
    } catch (err) {
      setRequestError('Lỗi kết nối đến server');
      console.error('Error requesting screenshot:', err);
      setPendingCommandId(null);
    } finally {
      setIsRequesting(false);
      // clear the pending indicator after a reasonable timeout if still present
      setTimeout(() => {
        setPendingCommandId(null);
      }, 10000);
    }
  };

  const handleDownload = (screenshot: Screenshot) => {
    window.open(screenshot.url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ảnh chụp màn hình</h1>
          <p className="text-gray-500 mt-1">
            Tổng cộng {screenshots.length} ảnh chụp
            {pendingCommandId && (
              <span className="ml-2 text-blue-600 text-sm">
                • Đang chờ agent xử lý...
              </span>
            )}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCaptureRequest}
          disabled={isRequesting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRequesting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang gửi yêu cầu...</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span>Yêu cầu chụp màn hình</span>
            </>
          )}
        </motion.button>
      </div>

      {requestError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">Lỗi</p>
            <p className="text-sm text-red-700 mt-1">{requestError}</p>
          </div>
        </motion.div>
      )}

      {pendingCommandId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3"
        >
          <Loader2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 animate-spin" />
          <div>
            <p className="font-medium text-blue-900">Đang xử lý</p>
            <p className="text-sm text-blue-700 mt-1">
              Yêu cầu đã được gửi. Agent sẽ chụp màn hình trong lần polling tiếp theo (thường mất 5-10 giây).
            </p>
          </div>
        </motion.div>
      )}

      {screenshots.length === 0 ? (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có ảnh chụp màn hình</h3>
          <p className="text-gray-500 mb-6">
            Nhấn nút "Yêu cầu chụp màn hình" để bắt đầu
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {screenshots.map((screenshot, index) => (
            <motion.div
              key={screenshot.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all group"
            >
              <div
                className="relative aspect-video bg-gray-100 cursor-pointer overflow-hidden"
                onClick={() => setSelectedImage(screenshot)}
              >
                <img
                  src={screenshot.url}
                  alt={`Screenshot ${screenshot.id}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Camera className="w-4 h-4" />
                    <span>{screenshot.timestamp}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDownload(screenshot)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Tải xuống"
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <img
                src={selectedImage.url}
                alt={`Screenshot ${selectedImage.id}`}
                className="w-full h-auto rounded-xl shadow-2xl"
              />

              <div className="mt-4 flex items-center justify-between bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-white font-medium">{selectedImage.timestamp}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownload(selectedImage)}
                  className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải xuống</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
