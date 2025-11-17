import { Camera, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { mockScreenshots } from '../data/mockData';
import { Screenshot } from '../types';

export default function Screenshots() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>(mockScreenshots);
  const [selectedImage, setSelectedImage] = useState<Screenshot | null>(null);

  const handleCapture = () => {
    const newScreenshot: Screenshot = {
      id: Date.now().toString(),
      url: 'https://images.pexels.com/photos/1181346/pexels-photo-1181346.jpeg?auto=compress&cs=tinysrgb&w=400',
      timestamp: new Date().toLocaleString('vi-VN')
    };
    setScreenshots([newScreenshot, ...screenshots]);
  };

  const handleDownload = (screenshot: Screenshot) => {
    window.open(screenshot.url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ảnh chụp màn hình</h1>
          <p className="text-gray-500 mt-1">Tổng cộng {screenshots.length} ảnh chụp</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCapture}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          <span>Chụp ngay</span>
        </motion.button>
      </div>

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
