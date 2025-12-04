import { Calendar, AlertTriangle, Power, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { DailySchedule } from '../types';
import { mockAPI } from '../utils/api';

interface LimitProps {
  selectedDeviceId?: string;
}

export default function Limits({ selectedDeviceId }: LimitProps) {
  const [schedules, setSchedules] = useState<DailySchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [warningEnabled, setWarningEnabled] = useState(true);
  const [shutdownEnabled, setShutdownEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token') || null;
        const policies = await mockAPI.getDailyPolicies(selectedDeviceId ?? 'local', token);

        const dayMap: Record<string, string> = {
          mon: 'Thứ hai',
          tue: 'Thứ ba',
          wed: 'Thứ tư',
          thu: 'Thứ năm',
          fri: 'Thứ sáu',
          sat: 'Thứ bảy',
          sun: 'Chủ nhật'
        };

        const arr = Array.isArray(policies) ? policies : [];

        const anyWarn = arr.some((p: any) => Number(p.warn_on_exceed) === 1);
        const anyShutdown = arr.some((p: any) => Number(p.shutdown_on_exceed) === 1);
        if (mounted) {
          setWarningEnabled(Boolean(anyWarn));
          setShutdownEnabled(Boolean(anyShutdown));
        }

        const parsed: DailySchedule[] = arr.map((it: any, idx: number) => {
          const id = String(it.id ?? it._id ?? `policy-${idx}`);

          const dow = (it.day_of_week || it.day || '').toString().toLowerCase();
          const dayName = dayMap[dow] ?? it.day_name ?? `Ngày ${idx + 1}`;

          const enabled = Number(it.enabled) === 1 || it.enabled === true;

          let startTime = '08:00';
          let endTime = '20:00';
          const hours = Array.isArray(it.allowed_hours) && it.allowed_hours.length ? it.allowed_hours[0] : null;
          if (typeof hours === 'string' && hours.includes('-')) {
            const [s, e] = hours.split('-').map((x: string) => x.trim());
            if (s) startTime = s;
            if (e) endTime = e;
          }

          // parse limit_daily_minutes (may be null)
          const limitMinutes = (typeof it.limit_daily_minutes !== 'undefined' && it.limit_daily_minutes !== null)
            ? Number(it.limit_daily_minutes)
            : null;

          return {
            id,
            dayName,
            enabled,
            startTime,
            endTime
          , limitMinutes
          } as DailySchedule;
        });

        if (mounted) setSchedules(parsed);
      } catch (err) {
        console.error('Failed to load daily policies', err);
        if (mounted) setSchedules([]); // fallback empty
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [selectedDeviceId]);

  const handleToggleSchedule = async (scheduleId: string) => {
    // optimistic update
    const prev = schedules;
    const next = schedules.map(s => s.id === scheduleId ? { ...s, enabled: !s.enabled } : s);
    setSchedules(next);

    // prepare payload for API: enabled as 1/0 and allowed_hours from start/end
    const s = next.find(x => x.id === scheduleId);
    if (!s) return;
    const payload = {
      enabled: s.enabled ? 1 : 0,
      allowed_hours: [`${s.startTime}-${s.endTime}`],
    };

    try {
      const token = localStorage.getItem('token') || null;
      await mockAPI.updateDailyPolicy(selectedDeviceId, scheduleId, payload, token);
    } catch (err) {
      console.error('Failed to update schedule toggle, rolling back', err);
      setSchedules(prev); // rollback on error
    }
  };

  const handleUpdateScheduleTime = async (scheduleId: string, field: 'startTime' | 'endTime', value: string) => {
    // optimistic update
    const prev = schedules;
    const next = schedules.map(s => s.id === scheduleId ? { ...s, [field]: value } : s);
    setSchedules(next);

    const s = next.find(x => x.id === scheduleId);
    if (!s) return;
    const payload = {
      // keep enabled as 1/0
      enabled: s.enabled ? 1 : 0,
      allowed_hours: [`${s.startTime}-${s.endTime}`],
     // include daily limit if present
      limit_daily_minutes: (typeof s.limitMinutes !== 'undefined' && s.limitMinutes !== null) ? Number(s.limitMinutes) : null
    };

    try {
      const token = localStorage.getItem('token') || null;
      await mockAPI.updateDailyPolicy(selectedDeviceId ?? 'local', scheduleId, payload, token);
    } catch (err) {
      console.error('Failed to update schedule time, rolling back', err);
      setSchedules(prev); // rollback on error
    }
  };

  const handleUpdateScheduleLimit = async (scheduleId: string, value: string) => {
    // value may be '' => null
    const parsedVal = value === '' ? null : Number(value);
    const prev = schedules;
    const next = schedules.map(s => s.id === scheduleId ? { ...s, limitMinutes: parsedVal } : s);
    setSchedules(next);

    const s = next.find(x => x.id === scheduleId);
    if (!s) return;
    const payload = {
      enabled: s.enabled ? 1 : 0,
      allowed_hours: [`${s.startTime}-${s.endTime}`],
      limit_daily_minutes: (typeof s.limitMinutes !== 'undefined' && s.limitMinutes !== null) ? Number(s.limitMinutes) : null
    };

    try {
      const token = localStorage.getItem('token') || null;
      await mockAPI.updateDailyPolicy(selectedDeviceId, scheduleId, payload, token);
    } catch (err) {
      console.error('Failed to update schedule limit, rolling back', err);
      setSchedules(prev); // rollback
    }
  };

  // Toggle global warn on exceed -> POST /actions { type: 'warn_on_exceed', enable: 1/0 }
  const handleToggleWarning = async (newValue?: boolean) => {
    const prev = warningEnabled;
    const nextVal = typeof newValue === 'boolean' ? newValue : !warningEnabled;
    setWarningEnabled(nextVal);

    try {
      const token = localStorage.getItem('token') || null;
      await mockAPI.sendAgentAction(selectedDeviceId ?? 'local', { warn_on_exceed: nextVal ? 1 : 0, shutdown_on_exceed: shutdownEnabled ? 1 : 0 }, token);
    } catch (err) {
      console.error('Failed to update warn_on_exceed, rolling back', err);
      setWarningEnabled(prev);
    }
  };

  // Toggle global shutdown on exceed -> POST /actions { type: 'shutdown_on_exceed', enable: 1/0 }
  const handleToggleShutdown = async (newValue?: boolean) => {
    const prev = shutdownEnabled;
    const nextVal = typeof newValue === 'boolean' ? newValue : !shutdownEnabled;
    setShutdownEnabled(nextVal);

    try {
      const token = localStorage.getItem('token') || null;
      await mockAPI.sendAgentAction(selectedDeviceId ?? 'local', { warn_on_exceed: warningEnabled ? 1 : 0, shutdown_on_exceed: nextVal ? 1 : 0 }, token);
    } catch (err) {
      console.error('Failed to update shutdown_on_exceed, rolling back', err);
      setShutdownEnabled(prev);
    }
  };

  return (
    <div className="space-y-6">
      {/* optional loading indicator */}
      {loading && <div className="text-sm text-gray-500">Đang tải lịch sử sử dụng...</div>}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử dụng hàng ngày</h1>
          <p className="text-gray-500 mt-1">Thiết lập khung giờ được phép sử dụng máy tính</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Cảnh báo khi vượt giới hạn</h3>
              <p className="text-sm text-gray-500">Hiển thị thông báo khi vượt quá thời gian</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={warningEnabled}
                onChange={() => handleToggleWarning()}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>
          {warningEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pl-13 text-sm text-gray-600"
            >
              Thông báo sẽ xuất hiện mỗi 3 phút sau khi vượt giới hạn
            </motion.div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Power className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Tự động tắt máy</h3>
              <p className="text-sm text-gray-500">Tắt máy khi hết thời gian sử dụng</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={shutdownEnabled}
                onChange={() => handleToggleShutdown()}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
          {shutdownEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pl-13"
            >
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">
                  Máy sẽ tự động tắt khi vượt quá giờ kết thúc trong lịch
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-900">Lịch sử dụng theo ngày trong tuần</p>
            <p className="text-sm text-blue-700 mt-1">
              Thiết lập khung giờ được phép sử dụng máy tính cho từng ngày. Khi bật, máy chỉ có thể sử dụng trong khung giờ đã đặt.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
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

            {/* Limit input - always editable */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Giới hạn (phút)</label>
              <input
                type="number"
                min={0}
                value={typeof schedule.limitMinutes === 'number' ? String(schedule.limitMinutes) : ''}
                onChange={(e) => handleUpdateScheduleLimit(schedule.id, e.target.value)}
                placeholder="Để trống = không giới hạn"
                className="w-40 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Lưu ý</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Lịch sử dụng áp dụng cho tất cả ứng dụng trên máy tính</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Khi tắt lịch cho một ngày, máy có thể sử dụng không giới hạn</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Giới hạn ứng dụng riêng lẻ có thể được thiết lập ở trang "Quản lý ứng dụng"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Thay đổi sẽ được áp dụng ngay lập tức cho thiết bị được chọn</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
