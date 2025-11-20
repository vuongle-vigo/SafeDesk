import { Calendar, AlertTriangle, Power, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { mockDailySchedules } from '../data/mockData';
import { DailySchedule } from '../types';

export default function Limits() {
  const [schedules, setSchedules] = useState<DailySchedule[]>(mockDailySchedules);
  const [warningEnabled, setWarningEnabled] = useState(true);
  const [shutdownEnabled, setShutdownEnabled] = useState(false);

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

  return (
    <div className="space-y-6">
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
                onChange={(e) => setWarningEnabled(e.target.checked)}
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
                onChange={(e) => setShutdownEnabled(e.target.checked)}
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
