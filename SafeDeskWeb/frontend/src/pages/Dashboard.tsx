import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, AppWindow, Power, AlertTriangle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { mockUsageByCategory, mockUsageByHour, mockUsageByDay, mockUsageByWeek, mockUsageByMonth, mockTopApps } from '../data/mockData';

type TimeRange = 'hour' | 'day' | 'week' | 'month';

interface DashboardProps {
  selectedDeviceId?: string | null;
}

export default function Dashboard({ selectedDeviceId }: DashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('hour');

  const getChartData = () => {
    switch (timeRange) {
      case 'hour':
        return mockUsageByHour;
      case 'day':
        return mockUsageByDay;
      case 'week':
        return mockUsageByWeek;
      case 'month':
        return mockUsageByMonth;
      default:
        return mockUsageByHour;
    }
  };

  const getXAxisKey = () => {
    switch (timeRange) {
      case 'hour':
        return 'hour';
      case 'day':
        return 'day';
      case 'week':
        return 'week';
      case 'month':
        return 'month';
      default:
        return 'hour';
    }
  };

  const getChartTitle = () => {
    switch (timeRange) {
      case 'hour':
        return 'Thời gian theo giờ';
      case 'day':
        return 'Thời gian theo ngày';
      case 'week':
        return 'Thời gian theo tuần';
      case 'month':
        return 'Thời gian theo tháng';
      default:
        return 'Thời gian theo giờ';
    }
  };

  const stats = [
    { label: 'Thời gian hôm nay', value: '6h 42m', icon: Clock, color: 'blue' },
    { label: 'Ứng dụng đang chạy', value: '12', icon: AppWindow, color: 'green' },
    { label: 'Hoạt động lần cuối', value: '2 phút trước', icon: Power, color: 'purple' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-gray-500 mt-1">Theo dõi hoạt động máy tính của bạn</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600'
          };

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-yellow-900">Cảnh báo giới hạn</p>
          <p className="text-sm text-yellow-700 mt-1">
            Bạn đã sử dụng <strong>95/120 phút</strong> cho các game hôm nay. Còn 25 phút.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-gray-200"
        >
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6">Thời gian theo danh mục</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={mockUsageByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {mockUsageByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 md:gap-4 mt-4">
            {mockUsageByCategory.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }}></div>
                <div className="text-xs md:text-sm min-w-0">
                  <p className="font-medium text-gray-900 truncate">{cat.name}</p>
                  <p className="text-gray-500">{cat.value} phút</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">{getChartTitle()}</h3>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="px-2 md:px-3 py-1.5 text-xs md:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="hour">Theo giờ</option>
                <option value="day">Theo ngày</option>
                <option value="week">Theo tuần</option>
                <option value="month">Theo tháng</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={getChartData()} key={timeRange}>
              <XAxis dataKey={getXAxisKey()} stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Bar dataKey="minutes" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 ứng dụng</h3>
        <div className="space-y-4">
          {mockTopApps.map((app, index) => (
            <div key={app.name} className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-medium text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{app.name}</p>
                  <p className="text-sm text-gray-500">{app.time}</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${app.percentage}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  ></motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
