import { Search, Settings, Ban, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import DateRangePicker from '../components/DateRangePicker';
import AppConfigModal from '../components/AppConfigModal';
import { mockAPI } from '../utils/api';

interface AppsProps {
  selectedDeviceId: string | null;
}

interface AppConfig {
  limitEnabled: boolean;
  limitMinutes: number;
  actionOnLimit: 'close' | 'warn' | 'none';
  warnInterval: number;
  isBlocked: boolean;
}

interface AppData {
  app_id: number;
  app_name: string;
  version: string | null;
  publisher: string | null;
  install_location: string | null;
  icon_base64: string | null;
  daily_limit_minutes: number;
  total_usage: number;
  policy?: {
    id: string;
    is_blocked: boolean;
    limit_enabled: boolean;
    limit_minutes: number | null;
    action_on_limit: 'close' | 'warn' | 'none';
    warn_interval: number;
    today_usage_minutes: number;
  };
}

export default function Apps({ selectedDeviceId }: AppsProps) {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState({
    startDate: new Date(),
    endDate: new Date()
  });
  const [configModalApp, setConfigModalApp] = useState<AppData | null>(null);

  useEffect(() => {
    if (selectedDeviceId) {
      loadApps();
    }
  }, [selectedDeviceId, selectedDate]);

  const formatDateLocal = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const loadApps = async () => {
    if (!selectedDeviceId) return;

    setLoading(true);
    setError(null);

    try {
      // sử dụng format local để tránh về ngày trước do toISOString() -> UTC
      const timeStart = formatDateLocal(selectedDate.startDate);
      const timeEnd = formatDateLocal(selectedDate.endDate);

      console.log('Loading apps for device:', selectedDeviceId, 'from', timeStart, 'to', timeEnd);
      const token =
        localStorage.getItem('token') ||
        null;
        
      const data = await mockAPI.getAppsWithPolicies(selectedDeviceId, timeStart, timeEnd, token);
      console.log('Loaded apps data:', data);
      setApps(data);
    } catch (err) {
      console.error('Failed to load apps:', err);
      setError('Không thể tải danh sách ứng dụng');
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = apps
    .filter(app => app.app_name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSaveConfig = async (appId: number, config: AppConfig) => {
    if (!selectedDeviceId) return;
    const token =
        localStorage.getItem('token') ||
        null;

    try {
      await mockAPI.saveAppPolicy(selectedDeviceId, appId, {
        isBlocked: config.isBlocked,
        limitEnabled: config.limitEnabled,
        limitMinutes: config.limitMinutes,
        actionOnLimit: config.actionOnLimit,
        warnInterval: config.warnInterval
      }, token);

      await loadApps();
    } catch (err) {
      console.error('Failed to save app config:', err);
      alert('Không thể lưu cấu hình');
    }
  };

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const getAppStatus = (app: AppData) => {
    const policy = app.policy;
    if (!policy) return null;

    if (policy.is_blocked) {
      return { type: 'blocked', label: 'Đã chặn', color: 'red' };
    }

    if (policy.limit_enabled && policy.limit_minutes) {
      const used = policy.today_usage_minutes || 0;
      const percentage = (used / policy.limit_minutes) * 100;

      if (percentage >= 100) {
        return { type: 'overlimit', label: 'Vượt giới hạn', color: 'red' };
      } else if (percentage >= 80) {
        return { type: 'warning', label: 'Gần đạt giới hạn', color: 'yellow' };
      } else {
        return { type: 'normal', label: 'Có giới hạn', color: 'green' };
      }
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {!selectedDeviceId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-700">Vui lòng chọn thiết bị ở trang "Thiết bị quản lý" để xem ứng dụng</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý ứng dụng</h1>
          <p className="text-gray-500 mt-1">
            {loading ? 'Đang tải...' : `Tổng cộng ${filteredApps.length} ứng dụng`}
          </p>
        </div>
        <DateRangePicker value={selectedDate} onChange={setSelectedDate} />
      </div>

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

      {loading && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-600">Đang tải danh sách ứng dụng...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4">
          {filteredApps.map((app, index) => {
            const policy = app.policy;
            const usedMinutes = app?.total_usage || 0;
            const status = getAppStatus(app);
            const percentage = policy?.limit_enabled && policy.limit_minutes
              ? (usedMinutes / policy.limit_minutes) * 100
              : 0;

            return (
              <motion.div
                key={app.app_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  {app.icon_base64 ? (
                    <img
                      src={`data:image/png;base64,${app.icon_base64}`}
                      alt={app.app_name}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-contain flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0">
                      📦
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{app.app_name}</h3>
                    {status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        status.color === 'red' ? 'bg-red-100 text-red-700' :
                        status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {status.type === 'blocked' && <Ban className="w-3 h-3" />}
                        {status.label}
                      </span>
                    )}
                  </div>

                    <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500 flex-wrap mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Đã dùng: <span className="font-medium text-gray-700">{formatTime(usedMinutes)}</span>
                      </span>
                      {policy?.limit_enabled && policy.limit_minutes && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span>
                            Giới hạn: <span className="font-medium text-gray-700">{formatTime(policy.limit_minutes)}</span>
                          </span>
                        </>
                      )}
                      {app.version && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span>v{app.version}</span>
                        </>
                      )}
                    </div>

                    {policy?.limit_enabled && policy.limit_minutes && (
                      <div className="mt-3">
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(percentage, 100)}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className={`h-full transition-all duration-300 ${
                            percentage >= 100 ? 'bg-red-500' :
                            percentage >= 80 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                        ></motion.div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">0%</span>
                        <span className={`text-xs font-semibold ${
                          percentage >= 100 ? 'text-red-600' :
                          percentage >= 80 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {percentage.toFixed(0)}%
                        </span>
                        <span className="text-xs text-gray-500">100%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setConfigModalApp(app)}
                    className="px-3 md:px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 flex-shrink-0"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="font-medium hidden sm:inline">Cấu hình</span>
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && !error && filteredApps.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy ứng dụng</h3>
          <p className="text-gray-500">Thử tìm kiếm với từ khóa khác hoặc chọn thiết bị khác</p>
        </div>
      )}

      {configModalApp && (
        <AppConfigModal
          isOpen={!!configModalApp}
          onClose={() => setConfigModalApp(null)}
          app={{
            id: configModalApp.app_id.toString(),
            name: configModalApp.app_name,
            icon: configModalApp.icon_base64
              ? (
                <img
                  src={`data:image/png;base64,${configModalApp.icon_base64}`}
                  alt={configModalApp.app_name}
                  className="w-8 h-8 rounded-md object-contain"
                />
              )
              : '📦',
            category: 'Application',
            usageToday: configModalApp.policy?.today_usage_minutes || 0,
            lastUsed: 'Hôm nay',
            deviceId: selectedDeviceId || ''
          }}
          config={{
            limitEnabled: configModalApp.policy?.limit_enabled || false,
            limitMinutes: configModalApp.policy?.limit_minutes || 60,
            actionOnLimit: configModalApp.policy?.action_on_limit || 'none',
            warnInterval: configModalApp.policy?.warn_interval || 3,
            isBlocked: configModalApp.policy?.is_blocked || false
          }}
          onSave={(config) => handleSaveConfig(configModalApp.app_id, config)}
        />
      )}
    </div>
  );
}
