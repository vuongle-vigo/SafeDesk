import { Monitor, Laptop, Tablet, Plus, Settings as SettingsIcon, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Device } from '../types';
import AddDeviceModal from '../components/AddDeviceModal';
import { mockAPI } from '../utils/api';

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
  const [uninstallingId, setUninstallingId] = useState<string | null>(null);

  // map agent_id -> status
  const [agentStatuses, setAgentStatuses] = useState<Record<string, string>>({});
  // new: agents state
  const [agents, setAgents] = useState<
    {
      agent_id: string;
      guid: string;
      os: string;
      hostname: string;
      last_activity: string;
      status?: string;
    }[]
  >([]);

  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentsError, setAgentsError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadAgents = async () => {
      setAgentsLoading(true);
      setAgentsError(null);
      const token =
        localStorage.getItem('token') ||
        null;

      const res = await mockAPI.getAllAgents(token);

      if (!mounted) return;
      setAgentsLoading(false);
      if (!res.success) {
        setAgentsError(res.error || 'Không thể tải agents');
        return;
      }
      setAgents((res.agents || []).map((a: any) => ({ ...a })));
    };
    loadAgents();
    return () => {
      mounted = false;
    };
  }, []);

  // polling statuses while on this page
  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('token') || null;
    const fetchStatuses = async () => {
      const res = await mockAPI.getAgentsStatus(token || undefined);
      if (!mounted) return;
      if (res.success && res.agentsStatus) {
        const map: Record<string, string> = {};
        res.agentsStatus.forEach((s) => {
          map[s.agent_id] = s.status;
        });
        setAgentStatuses(map);
        // optionally update agents array entries with status
        setAgents((prev) => prev.map((a) => ({ ...a, status: map[a.agent_id] || a.status || 'offline' })));
      }
    };

    // fetch immediately then every 5s
    fetchStatuses();
    const id = setInterval(fetchStatuses, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const combinedItems: {
    id: string;
    name: string;
    os?: string;
    ipAddress?: string;
    lastActive?: string;
    status?: 'online' | 'offline' | 'idle' | string;
    // keep original marker if needed
    _source?: 'agent' | 'device';
  }[] = [
    // only agents (map agents to the same UI shape)
    ...agents.map((a) => ({
      id: a.agent_id,
      name: a.hostname || a.agent_id,
      os: a.os,
      ipAddress: '—',
      lastActive: a.last_activity,
      type: 'desktop',
      // take live status from agentStatuses if available
      status: agentStatuses[a.agent_id] || a.status || 'offline',
      _source: 'agent' as const
    }))
  ];

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
        {combinedItems.map((device, index) => {
          const Icon = deviceIcons[device.type as keyof typeof deviceIcons] ?? Monitor;
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
                  <div className={`w-2 h-2 rounded-full ${statusColors[device.status as keyof typeof statusColors] || 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-600">{statusLabels[device.status as keyof typeof statusLabels] || 'Ngoại tuyến'}</span>
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
                    <span>Thời gian:</span>
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
                        // trigger self-uninstall command instead of immediate local removal
                        const doUninstall = async () => {
                          if (!window.confirm(`Bạn có chắc muốn gỡ cài đặt (self_uninstall) trên thiết bị "${device.name}"?`)) return;
                          try {
                            setUninstallingId(device.id);
                            const token = localStorage.getItem('token') || null;
                            const res = await mockAPI.createAgentCommand(device.id, { commandType: 'self_uninstall', commandParams: {} }, token || undefined);
                            if (res.success) {
                              window.alert('Lệnh gỡ cài đặt đã được gửi tới agent.');
                              // optional: call onRemoveDevice if you want to remove from UI immediately
                              // onRemoveDevice?.(device.id);
                            } else {
                              window.alert('Không thể gửi lệnh: ' + (res.error || 'Unknown error'));
                            }
                          } catch (err) {
                            console.error('Error sending uninstall command:', err);
                            window.alert('Lỗi khi gửi lệnh gỡ cài đặt');
                          } finally {
                            setUninstallingId(null);
                          }
                        };
                        void doUninstall();
                      }}
                      className="py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {uninstallingId === device.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>Gỡ cài đặt</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AddDeviceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {agents.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Monitor className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy agent</h3>
          <p className="text-gray-500 mb-4">Hệ thống chưa nhận được agent từ backend</p>
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
