import { Globe, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { mockBrowserHistory } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type TimeFilter = 'today' | 'week' | 'month';

export default function History() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');

  const topSites = mockBrowserHistory
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 5)
    .map(site => ({
      name: site.domain.split('.')[0],
      visits: site.visitCount
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử duyệt web</h1>
          <p className="text-gray-500 mt-1">Theo dõi hoạt động trình duyệt</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2 flex-wrap">
            {([
              { key: 'today', label: 'Hôm nay' },
              { key: 'week', label: 'Tuần này' },
              { key: 'month', label: 'Tháng này' }
            ] as const).map((filter) => (
              <button
                key={filter.key}
                onClick={() => setTimeFilter(filter.key)}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                  timeFilter === filter.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Tổng trang web</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{mockBrowserHistory.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Tổng lượt truy cập</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {mockBrowserHistory.reduce((sum, item) => sum + item.visitCount, 0)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Trung bình/trang</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {(mockBrowserHistory.reduce((sum, item) => sum + item.visitCount, 0) / mockBrowserHistory.length).toFixed(0)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top 5 trang web</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={topSites} layout="vertical">
            <XAxis type="number" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <YAxis dataKey="name" type="category" stroke="#9CA3AF" style={{ fontSize: '12px' }} width={100} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Bar dataKey="visits" fill="#3B82F6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Trang web
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Lượt truy cập
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockBrowserHistory.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                        {item.favicon}
                      </div>
                      <span className="font-medium text-gray-900 max-w-md truncate">
                        {item.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-600 hover:underline cursor-pointer">
                      {item.domain}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-700">{item.timestamp}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                      {item.visitCount} lần
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
