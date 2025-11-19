import { Plus, Edit2, Trash2, Clock, Calendar, AlertCircle, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { mockDailySchedules } from '../data/mockData';
import { DailySchedule, AppUsageDaily } from '../types';
import DateRangePicker from '../components/DateRangePicker';
import { mockAPI } from '../utils/api';

interface LimitsProps {
  selectedDeviceId: string | null;
}

export default function Limits({ selectedDeviceId }: LimitsProps) {
  const [activeTab, setActiveTab] = useState<'app-usage' | 'daily-schedule'>('app-usage');
  const [schedules, setSchedules] = useState<DailySchedule[]>(mockDailySchedules);
  const [selectedDate, setSelectedDate] = useState({
    startDate: new Date(),
    endDate: new Date()
  });
  const [appUsageData, setAppUsageData] = useState<AppUsageDaily[]>([]);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<number>(0);


  function formatDate(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // fetch applications with total_usage for the selected date range (or fallback to a single day)
  useEffect(() => {
    let mounted = true;
    async function loadApps() {
      try {
        const agentId = selectedDeviceId || localStorage.getItem('agentId') || 'agent-1';
        const token = localStorage.getItem('token') || null;
        const start = new Date(selectedDate.startDate);
        start.setHours(0,0,0,0);
        const end = new Date(selectedDate.endDate);
        end.setHours(0,0,0,0);
        const startDateStr = formatDate(start);
        const endDateStr = formatDate(end);
        const res = await mockAPI.getAgentApplicationsWithUsage(agentId, startDateStr, endDateStr, token);
        if (!mounted) return;
        if (res.success && Array.isArray(res.applications)) {
          // helper: convert various icon_base64 shapes to a usable data URI
          const toDataUri = (val?: string) => {
            if (!val) return undefined;
            const trimmed = val.trim();
            if (trimmed.startsWith('data:')) return trimmed; // already a data URI
            // raw SVG markup -> encode to base64 data URI
            if (trimmed.startsWith('<')) {
              try {
                // browser btoa (handle unicode)
                const b64 = typeof window !== 'undefined'
                  ? window.btoa(unescape(encodeURIComponent(trimmed)))
                  : Buffer.from(trimmed).toString('base64');
                return `data:image/svg+xml;base64,${b64}`;
              } catch (e) {
                // fallback to uri-encoded svg
                return `data:image/svg+xml;utf8,${encodeURIComponent(trimmed)}`;
              }
            }
            // otherwise assume it's raw base64 (PNG fallback)
            return `data:image/png;base64,${trimmed}`;
          };

          // map to UI shape used in this page
          const mapped: AppUsageDaily[] = res.applications.map((a: any) => {
            const iconFromBase64 = toDataUri(a.icon_base64);
            // use daily_limit_minutes from response if provided
            const dailyLimit = typeof a.daily_limit_minutes !== 'undefined' ? Number(a.daily_limit_minutes) : undefined;
            return {
              id: String(a.app_id ?? a.id ?? a.appId ?? a.pkg ?? a.package),
              appName: a.app_name ?? a.name ?? a.displayName ?? 'Unknown',
              minutesUsed: Math.round(Number(a.total_usage ?? a.usage_minutes ?? a.minutes ?? 0)),
              limitMinutes: (typeof dailyLimit === 'number' && dailyLimit > 0) ? dailyLimit : undefined,
              icon: iconFromBase64 ?? (a.icon_base64 ?? (a.app_name ? a.app_name[0] : '?')),
              date: formatDate(start) 
            };
          });
          setAppUsageData(mapped);
        } else {
          setAppUsageData([]);
        }
      } catch (err) {
        if (mounted) setAppUsageData([]);
      }
    }
    loadApps();
    return () => { mounted = false; };
  }, [selectedDate, selectedDeviceId]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleToggleSchedule = (scheduleId: string) => {
    setSchedules(schedules.map(s =>
      s.id === scheduleId ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const handleUpdateScheduleTime = (scheduleId: string, field: 'startTime' | 'endTime', value: string) => {
    setSchedules(schedules.map(s =>
      s.id === scheduleId ? { ...s, [field]: value } : s
    ));
  };

  const getFilteredAppUsage = () => {
    const dateStr = formatDate(selectedDate.startDate);
    return appUsageData.filter(app => app.date === dateStr);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleSetLimit = async (appId: string, limitMinutes: number) => {
    const agentId = selectedDeviceId || localStorage.getItem('agentId') || 'agent-1';
    const token = localStorage.getItem('token') || null;
    try {
      const res = await mockAPI.setAgentApplicationLimit(agentId, appId, limitMinutes, token);
      if (res.success && res.application) {
        const daily = Number(res.application.daily_limit_minutes ?? res.application.dailyLimitMinutes ?? res.application.daily_limit ?? limitMinutes);
        setAppUsageData(prev => prev.map(app => app.id === appId ? { ...app, limitMinutes: (daily > 0 ? daily : undefined) } : app));
      } else {
        // fallback: update local state anyway
        setAppUsageData(prev => prev.map(app => app.id === appId ? { ...app, limitMinutes } : app));
      }
    } catch (e) {
      // fallback on error
      setAppUsageData(prev => prev.map(app => app.id === appId ? { ...app, limitMinutes } : app));
    } finally {
      setEditingAppId(null);
    }
  };

  const handleRemoveLimit = (appId: string) => {
    setAppUsageData(appUsageData.map(app =>
      app.id === appId ? { ...app, limitMinutes: undefined } : app
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Giới hạn & Quy tắc</h1>
          <p className="text-gray-500 mt-1">Quản lý thời gian sử dụng và lịch trình</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-1 inline-flex gap-1">
        <button
          onClick={() => setActiveTab('app-usage')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'app-usage'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center gap-2">
            <Timer className="w-4 h-4" />
            Theo dõi sử dụng
          </span>
        </button>
        <button
          onClick={() => setActiveTab('daily-schedule')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'daily-schedule'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Lịch sử dụng hàng ngày
          </span>
        </button>
      </div>

      {activeTab === 'app-usage' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Theo dõi thời gian sử dụng</h3>
                <p className="text-sm text-gray-500">Xem và quản lý thời gian sử dụng ứng dụng theo ngày</p>
              </div>
            </div>
            <DateRangePicker value={selectedDate} onChange={setSelectedDate} />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {getFilteredAppUsage().map((app, index) => {
              const percentage = app.limitMinutes ? (app.minutesUsed / app.limitMinutes) * 100 : 0;
              const isOverLimit = percentage > 100;
              const isNearLimit = percentage >= 80 && percentage <= 100;

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-3xl">
                        {typeof app.icon === 'string' && app.icon.startsWith('data:') ? (
                          <img src={app.icon} alt={app.appName} className="w-8 h-8 rounded-md object-cover" />
                        ) : (
                          <div className="text-3xl">{app.icon}</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{app.appName}</h3>
                          {isOverLimit && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Vượt giới hạn
                            </span>
                          )}
                          {isNearLimit && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
                              Gần đạt giới hạn
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Đã dùng: <span className="font-medium text-gray-700">{formatTime(app.minutesUsed)}</span>
                          </span>
                          {app.limitMinutes && (
                            <span>• Giới hạn: <span className="font-medium text-gray-700">{formatTime(app.limitMinutes)}</span></span>
                          )}
                        </div>

                        {app.limitMinutes && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(percentage, 100)}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className={`h-full transition-all duration-300 ${
                                  isOverLimit ? 'bg-red-500' :
                                  isNearLimit ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                              ></motion.div>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-gray-500">0%</span>
                              <span className={`text-xs font-semibold ${
                                isOverLimit ? 'text-red-600' :
                                isNearLimit ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {percentage.toFixed(0)}%
                              </span>
                              <span className="text-xs text-gray-500">100%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {editingAppId === app.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editLimitValue}
                            onChange={(e) => setEditLimitValue(parseInt(e.target.value) || 0)}
                            placeholder="Phút"
                            className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSetLimit(app.id, editLimitValue)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Lưu
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setEditingAppId(null)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            Hủy
                          </motion.button>
                        </div>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setEditingAppId(app.id);
                              setEditLimitValue(app.limitMinutes || 60);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={app.limitMinutes ? "Chỉnh sửa giới hạn" : "Đặt giới hạn"}
                          >
                            {app.limitMinutes ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </motion.button>
                          {app.limitMinutes && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemoveLimit(app.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa giới hạn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {isOverLimit && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Đã vượt giới hạn {formatTime(app.minutesUsed - (app.limitMinutes || 0))}!
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {getFilteredAppUsage().length === 0 && (
            <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
              <Timer className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Không có dữ liệu sử dụng cho ngày đã chọn</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'daily-schedule' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900">Lịch sử dụng hàng ngày</p>
                <p className="text-sm text-blue-700 mt-1">
                  Thiết lập khung giờ được phép sử dụng máy tính cho từng ngày trong tuần.
                </p>
              </div>
            </div>
          </div>

          {schedules.map((schedule, index) => (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    schedule.enabled ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Calendar className={`w-5 h-5 ${
                      schedule.enabled ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{schedule.dayName}</h3>
                    <p className="text-sm text-gray-500">
                      {schedule.enabled
                        ? `${schedule.startTime} - ${schedule.endTime}`
                        : 'Không giới hạn'}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schedule.enabled}
                    onChange={() => handleToggleSchedule(schedule.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {schedule.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giờ bắt đầu
                    </label>
                    <input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => handleUpdateScheduleTime(schedule.id, 'startTime', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giờ kết thúc
                    </label>
                    <input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => handleUpdateScheduleTime(schedule.id, 'endTime', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
