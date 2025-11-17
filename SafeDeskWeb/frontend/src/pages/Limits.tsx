import { Plus, Edit2, Trash2, Clock, Tag, Package, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { mockUsageLimits, mockApps, mockDailySchedules } from '../data/mockData';
import { UsageLimit, DailySchedule } from '../types';

export default function Limits() {
  const [activeTab, setActiveTab] = useState<'app-limits' | 'daily-schedule'>('app-limits');
  const [limits, setLimits] = useState<UsageLimit[]>(mockUsageLimits);
  const [schedules, setSchedules] = useState<DailySchedule[]>(mockDailySchedules);
  const [isAdding, setIsAdding] = useState(false);
  const [limitType, setLimitType] = useState<'category' | 'app'>('category');
  const [newLimit, setNewLimit] = useState({ name: '', category: 'other', appId: '', limitMinutes: 60 });

  const handleAddLimit = () => {
    if (limitType === 'category' && newLimit.name.trim()) {
      const limit: UsageLimit = {
        id: Date.now().toString(),
        name: newLimit.name,
        type: 'category',
        category: newLimit.category,
        limitMinutes: newLimit.limitMinutes,
        usedMinutes: 0
      };
      setLimits([...limits, limit]);
      setNewLimit({ name: '', category: 'other', appId: '', limitMinutes: 60 });
      setIsAdding(false);
    } else if (limitType === 'app' && newLimit.appId) {
      const app = mockApps.find(a => a.id === newLimit.appId);
      if (app) {
        const limit: UsageLimit = {
          id: Date.now().toString(),
          name: app.name,
          type: 'app',
          appId: newLimit.appId,
          limitMinutes: newLimit.limitMinutes,
          usedMinutes: 0
        };
        setLimits([...limits, limit]);
        setNewLimit({ name: '', category: 'other', appId: '', limitMinutes: 60 });
        setIsAdding(false);
      }
    }
  };

  const handleDeleteLimit = (limitId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa giới hạn này?')) {
      setLimits(limits.filter(limit => limit.id !== limitId));
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Giới hạn & Quy tắc</h1>
          <p className="text-gray-500 mt-1">Quản lý thời gian sử dụng và lịch trình</p>
        </div>
        {activeTab === 'app-limits' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm giới hạn</span>
          </motion.button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-1 inline-flex gap-1">
        <button
          onClick={() => setActiveTab('app-limits')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'app-limits'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Giới hạn ứng dụng
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

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border-2 border-blue-500"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm giới hạn mới</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại giới hạn</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="category"
                  checked={limitType === 'category'}
                  onChange={(e) => setLimitType(e.target.value as 'category' | 'app')}
                  className="w-4 h-4 text-blue-600"
                />
                <Tag className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Theo danh mục</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="app"
                  checked={limitType === 'app'}
                  onChange={(e) => setLimitType(e.target.value as 'category' | 'app')}
                  className="w-4 h-4 text-blue-600"
                />
                <Package className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Theo ứng dụng</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {limitType === 'category' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên giới hạn</label>
                  <input
                    type="text"
                    value={newLimit.name}
                    onChange={(e) => setNewLimit({ ...newLimit, name: e.target.value })}
                    placeholder="VD: Social Media"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                  <select
                    value={newLimit.category}
                    onChange={(e) => setNewLimit({ ...newLimit, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="game">Game</option>
                    <option value="office">Văn phòng</option>
                    <option value="education">Học tập</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn ứng dụng</label>
                <select
                  value={newLimit.appId}
                  onChange={(e) => setNewLimit({ ...newLimit, appId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn ứng dụng --</option>
                  {mockApps.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.icon} {app.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giới hạn (phút)</label>
              <input
                type="number"
                value={newLimit.limitMinutes}
                onChange={(e) => setNewLimit({ ...newLimit, limitMinutes: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddLimit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Lưu
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAdding(false)}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </motion.button>
          </div>
        </motion.div>
      )}

      {activeTab === 'app-limits' && (
        <div className="grid grid-cols-1 gap-4">
        {limits.map((limit, index) => {
          const percentage = (limit.usedMinutes / limit.limitMinutes) * 100;
          const remainingMinutes = limit.limitMinutes - limit.usedMinutes;

          return (
            <motion.div
              key={limit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{limit.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      limit.type === 'app'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {limit.type === 'app' ? 'Ứng dụng' : 'Danh mục'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {limit.usedMinutes} / {limit.limitMinutes} phút
                      {remainingMinutes > 0 && (
                        <span className="text-gray-400">• Còn {remainingMinutes} phút</span>
                      )}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteLimit(limit.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="relative">
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-full ${getProgressColor(percentage)} transition-all duration-300`}
                  ></motion.div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">0%</span>
                  <span className={`text-xs font-semibold ${
                    percentage >= 90 ? 'text-red-600' :
                    percentage >= 70 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {percentage.toFixed(0)}%
                  </span>
                  <span className="text-xs text-gray-500">100%</span>
                </div>
              </div>

              {percentage >= 90 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ Sắp đạt giới hạn! Bạn đã sử dụng {percentage.toFixed(0)}% thời gian.
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
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
