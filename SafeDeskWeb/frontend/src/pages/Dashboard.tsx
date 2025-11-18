import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, AppWindow, Power, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { mockUsageByCategory, mockUsageByHour, mockUsageByDay, mockUsageByWeek, mockUsageByMonth, mockTopApps } from '../data/mockData';
import DateRangePicker from '../components/DateRangePicker';
import { mockAPI } from '../utils/api';

 interface DashboardProps {
  selectedDeviceId: string | null;
}

export default function Dashboard({ selectedDeviceId }: DashboardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: today,
    endDate: today,
  });

  const [apiUsage, setApiUsage] = useState<any[] | null>(null); // null = not loaded, [] = loaded empty

  // helper to format date as YYYY-MM-DD for API path
  function formatDate(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  useEffect(() => {
    let mounted = true;
    async function loadUsage() {
      try {
        // prefer selectedDeviceId passed from parent, otherwise fallback to localStorage/default
        const agentId = selectedDeviceId || localStorage.getItem('agentId') || 'agent-1';
        const token = localStorage.getItem('token') || null;
        // use YYYY-MM-DD format (no time) for API path
        const startDateStr = formatDate(dateRange.startDate);
        const endDateStr = formatDate(dateRange.endDate);
        const res = await mockAPI.getAgentPowerUsage(agentId, startDateStr, endDateStr, token);
        if (!mounted) return;
        if (res.success && Array.isArray(res.usage)) {
          setApiUsage(res.usage);
        } else {
          setApiUsage([]); // treat as loaded but empty
        }
      } catch (err) {
        if (mounted) setApiUsage([]);
      }
    }
    loadUsage();
    return () => { mounted = false; };
  }, [dateRange, selectedDeviceId]);

  // helper to generate array of YYYY-MM-DD between two dates (inclusive)
  function getDatesBetween(start: Date, end: Date) {
    const arr: string[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      arr.push(formatDate(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return arr;
  }

  const { xAxisKey, chartTitle, granularity } = useMemo(() => {
    const diffTime = Math.abs(dateRange.endDate.getTime() - dateRange.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isFullMonth = dateRange.startDate.getDate() === 1 &&
                        dateRange.endDate.getDate() === new Date(dateRange.endDate.getFullYear(), dateRange.endDate.getMonth() + 1, 0).getDate() &&
                        dateRange.startDate.getMonth() === dateRange.endDate.getMonth() &&
                        dateRange.startDate.getFullYear() === dateRange.endDate.getFullYear();

    if (isFullMonth) {
      return { xAxisKey: 'week', chartTitle: 'Thời gian theo tuần trong tháng', granularity: 'week' as const };
    } else if (diffDays === 0) {
      return { xAxisKey: 'hour', chartTitle: 'Thời gian theo giờ', granularity: 'hour' as const };
    } else {
      return { xAxisKey: 'day', chartTitle: 'Thời gian theo ngày', granularity: 'day' as const };
    }
  }, [dateRange]);

  // map API usage to chart format; fallback to mock data when apiUsage is null or empty
  const chartData = useMemo(() => {
    if (apiUsage === null) {
      // still loading -> show mock
      if (granularity === 'hour') return mockUsageByHour;
      if (granularity === 'week') return mockUsageByWeek;
      return mockUsageByDay;
    }
    if (Array.isArray(apiUsage) && apiUsage.length > 0) {
      // normalize apiUsage entries: expect { date: 'YYYY-MM-DD', hour: number, usage_minutes: number }
      const normalized = apiUsage.map((it: any) => ({
        date: it.date,
        hour: typeof it.hour === 'number' ? it.hour : (it.hour ? Number(it.hour) : undefined),
        minutes: Number(it.usage_minutes ?? it.usage_minutes ?? it.minutes ?? 0)
      }));

      if (granularity === 'hour') {
        // assume single-day selection (start == end). Build hours 0..23
        const targetDate = formatDate(dateRange.startDate);
        const hours = Array.from({ length: 24 }, (_, i) => i);
        return hours.map((h) => {
          const match = normalized.find((n: any) => n.date === targetDate && n.hour === h);
          return { hour: String(h), minutes: match ? match.minutes : 0 };
        });
      }

      if (granularity === 'day') {
        // build list of days in range and sum minutes per day
        const dates = getDatesBetween(dateRange.startDate, dateRange.endDate);
        return dates.map((d) => {
          const total = normalized
            .filter((n: any) => n.date === d)
            .reduce((s: number, it: any) => s + (it.minutes || 0), 0);
          return { day: d, minutes: total };
        });
      }

      if (granularity === 'week') {
        // group by week number (YYYY-W{num}) across the normalized entries
        const groups = new Map<string, number>();
        for (const it of normalized) {
          if (!it.date) continue;
          const wk = (() => {
            const d = new Date(it.date);
            return `${d.getFullYear()}-W${getWeekNumber(d)}`;
          })();
          groups.set(wk, (groups.get(wk) || 0) + (it.minutes || 0));
        }
        // convert to array sorted by week label
        return Array.from(groups.entries())
          .map(([week, minutes]) => ({ week, minutes }))
          .sort((a: any, b: any) => a.week.localeCompare(b.week));
      }
    }
     // loaded but empty -> fall back to mock (so chart still shows something)
     if (granularity === 'hour') return mockUsageByHour;
     if (granularity === 'week') return mockUsageByWeek;
     return mockUsageByDay;
   }, [apiUsage, granularity, dateRange]);

  // helper to compute week number (used as fallback label)
  function getWeekNumber(d: Date) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date as any) - (yearStart as any)) / 86400000 + 1) / 7);
  }

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
            <h3 className="text-base md:text-lg font-semibold text-gray-900">{chartTitle}</h3>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey={xAxisKey} stroke="#9CA3AF" style={{ fontSize: '12px' }} />
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
