import { Monitor, Laptop, Tablet, Plus, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Device } from '../types';
import AddDeviceModal from '../components/AddDeviceModal';

interface DevicesProps {
  devices: Device[];
  selectedDeviceId: string | null;
  onSelectDevice: (deviceId: string) => void;
  onRemoveDevice?: (deviceId: string) => void;
}

const deviceIcons = {
  desktop: Monitor,
  laptop: Laptop,
  tablet: Tablet
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  idle: 'bg-yellow-500'
};

const statusLabels = {
  online: 'Trực tuyến',
  offline: 'Ngoại tuyến',
  idle: 'Chờ'
};

export default function Devices({ devices, selectedDeviceId, onSelectDevice, onRemoveDevice }: DevicesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredDeviceId, setHoveredDeviceId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thiết bị quản lý</h1>
          <p className="text-gray-500 mt-1">Chọn thiết bị để xem chi tiết hoạt động</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Thêm thiết bị</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {devices.map((device, index) => {
          const Icon = deviceIcons[device.type];
          const isSelected = selectedDeviceId === device.id;
          const isHovered = hoveredDeviceId === device.id;

          return (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectDevice(device.id)}
              onMouseEnter={() => setHoveredDeviceId(device.id)}
              onMouseLeave={() => setHoveredDeviceId(null)}
              className={`bg-white rounded-xl p-4 md:p-6 border-2 cursor-pointer transition-all hover:shadow-lg ${
                isSelected
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-blue-50' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusColors[device.status]}`}></div>
                  <span className="text-xs text-gray-600">{statusLabels[device.status]}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{device.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{device.os}</p>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>IP:</span>
                    <span className="font-mono">{device.ipAddress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hoạt động:</span>
                    <span>{device.lastActive}</span>
                  </div>
                </div>
              </div>

              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <button className="py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <SettingsIcon className="w-4 h-4" />
                      <span>Cài đặt</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Bạn có chắc muốn gỡ thiết bị "${device.name}"?`)) {
                          onRemoveDevice?.(device.id);
                        }
                      }}
                      className="py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Gỡ bỏ</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AddDeviceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {devices.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Monitor className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có thiết bị</h3>
          <p className="text-gray-500 mb-4">Thêm thiết bị đầu tiên để bắt đầu giám sát</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thêm thiết bị ngay
          </button>
        </div>
      )}
    </div>
  );
}
