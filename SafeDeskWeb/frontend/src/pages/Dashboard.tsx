import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, AppWindow, Power, AlertTriangle, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import DateRangePicker from '../components/DateRangePicker';
import { mockAPI } from '../utils/api';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

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

  const [apiUsage, setApiUsage] = useState<any[] | null>(null);
  const [topApps, setTopApps] = useState<any[]>([]);
  const [agentStatus, setAgentStatus] = useState<any | null>(null);

  // NEW: top sites state
  const [topSites, setTopSites] = useState<any[] | null>(null);
  const [topSitesError, setTopSitesError] = useState<string | null>(null);

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
        const agentId = selectedDeviceId || localStorage.getItem('agentId') || 'agent-1';
        const token = localStorage.getItem('token') || null;
        const startDateStr = formatDate(dateRange.startDate);
        const endDateStr = formatDate(dateRange.endDate);
        const res = await mockAPI.getAgentPowerUsage(agentId, startDateStr, endDateStr, token);
        if (!mounted) return;
        if (res.success && Array.isArray(res.usage)) {
          setApiUsage(res.usage);
        } else {
          setApiUsage([]);
        }
      } catch (err) {
        if (mounted) setApiUsage([]);
      }
    }
    loadUsage();
    return () => { mounted = false; };
  }, [dateRange, selectedDeviceId]);

  useEffect(() => {
    let mounted = true;
    async function loadTopApps() {
      try {
        const agentId = selectedDeviceId || localStorage.getItem('agentId') || 'agent-1';
        const token = localStorage.getItem('token') || null;
        // use the 7 most recent days ending at today (independent from datepicker)
        const end = new Date();
        end.setHours(0, 0, 0, 0);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        const startDateStr = formatDate(start);
        const endDateStr = formatDate(end);
        const res = await mockAPI.getAgentTopApplications(agentId, startDateStr, endDateStr, token);
        if (!mounted) return;
        if (res.success && Array.isArray(res.apps)) {
          const apps = res.apps.map((a: any) => ({
            appId: a.app_id ?? a.id ?? a.appId,
            name: a.app_name ?? a.name ?? 'Unknown',
            minutes: Math.round(Number(a.total_usage ?? a.usage_minutes ?? a.minutes ?? 0)),
          }));
          const maxMinutes = apps.length ? Math.max(...apps.map((x: any) => x.minutes || 0), 0) : 0;
          const appsWithMeta = apps.map((a: any) => ({
            ...a,
            percentage: maxMinutes ? (a.minutes / maxMinutes) * 100 : 0,
            time: formatMinutesToLabel(a.minutes),
          }));
          setTopApps(appsWithMeta);
        } else {
          setTopApps([]);
        }
      } catch (err) {
        if (mounted) setTopApps([]);
      }
    }
    loadTopApps();
    return () => { mounted = false; };
  }, [selectedDeviceId]); // no longer depends on dateRange; uses today's date

  useEffect(() => {
    let mounted = true;
    async function loadAgentStatus() {
      try {
        const agentId = selectedDeviceId || localStorage.getItem('agentId') || 'agent-1';
        const token = localStorage.getItem('token') || null;
        // use the new API that targets GET /api/agents/:agentId/status
        const res = await mockAPI.getAgentOnlineStatus(agentId, token);
        if (!mounted) return;
        if (res.success) {
          // normalize to previous agentStatus usage (object with online/lastSeen/raw/message)
          setAgentStatus(res.data || null);
        } else {
          setAgentStatus({ online: false, message: res.error || 'Không có dữ liệu' });
        }
      } catch (err) {
        if (mounted) setAgentStatus({ online: false, message: 'Không có dữ liệu' });
      }
    }
    loadAgentStatus();
    return () => { mounted = false; };
  }, [selectedDeviceId]);

  useEffect(() => {
    let mounted = true;
    async function loadTopSites() {
      setTopSites(null);
      setTopSitesError(null);
      try {
        const agentId = selectedDeviceId || localStorage.getItem('agentId') || 'agent-1';
        const token = localStorage.getItem('token') || null;
        const res = await mockAPI.getTopSitesLastWeek(agentId, token);
        console.log('Top sites API response:', res.topSites.topSites);
        if (!mounted) return;
        if (res.success && Array.isArray(res.topSites.topSites)) {
          // normalize possible shapes: { url, visits } or { name, visits } etc.
          console.log('Top sites raw data:', res.topSites);
          const normalized = (res.topSites.topSites || []).map((s: any) => {
            const url = s.domain ?? s.name ?? s.site ?? '';
            const visits = Number(s.visits ?? s.count ?? s.total ?? 0) || 0;
            return { name: url, visits };
          }).filter(Boolean);
          // compute percentage by visits
          const max = normalized.length ? Math.max(...normalized.map((x:any) => x.visits)) : 0;
          const withMeta = normalized.map((x:any) => ({
            ...x,
            percentage: max ? (x.visits / max) * 100 : 0,
            time: `${x.visits} lần`
          }));
          setTopSites(withMeta);
        } else {
          // If API returned raw array (some endpoints return array directly)
          if (res.success && Array.isArray(res.topSites) === false && Array.isArray(res.topSites ?? res)) {
            const arr = (res.topSites ?? res) as any[];
            const normalized = arr.map((s: any) => {
              const url = s.domain ?? s.name ?? s.site ?? '';
              const visits = Number(s.visits ?? s.count ?? s.total ?? 0) || 0;
              return { name: url, visits };
            });
            const max = normalized.length ? Math.max(...normalized.map((x:any) => x.visits)) : 0;
            setTopSites(normalized.map((x:any) => ({ ...x, percentage: max ? (x.visits / max) * 100 : 0, time: `${x.visits} lần` })));
          } else {
            setTopSites([]);
          }
        }
      } catch (err: any) {
        if (!mounted) return;
        setTopSitesError(err?.message || 'Lỗi khi tải top sites');
        setTopSites([]);
      }
    }
    loadTopSites();
    return () => { mounted = false; };
  }, [selectedDeviceId]);

  function formatLastActivity(statusObj: any) {
    if (!statusObj) return 'Đang tải';

    // if normalized object contains direct status field (from backend { agentId, status })
    const candidateStatus = statusObj.status ?? statusObj.raw?.status ?? statusObj.raw ?? null;
    if (candidateStatus != null && (typeof candidateStatus === 'string' || typeof candidateStatus === 'number')) {
      // reuse existing logic for primitive status
      if (typeof candidateStatus === 'string') {
        const s = String(candidateStatus).toLowerCase();
        if (s === 'online') return 'Online';
        if (s === 'offline') return 'Offline';
        if (!isNaN(Date.parse(candidateStatus))) {
          const parsed = Date.parse(candidateStatus);
          const diffMin = Math.floor((Date.now() - parsed) / 60000);
          if (diffMin <= 0) return 'Vừa xong';
          if (diffMin < 60) return `${diffMin} phút trước`;
          const hrs = Math.floor(diffMin / 60);
          if (hrs < 24) return `${hrs} giờ trước`;
          const days = Math.floor(hrs / 24);
          return `${days} ngày trước`;
        }
      } else if (typeof candidateStatus === 'number') {
        const n = candidateStatus;
        const t = (n > 1e12 ? n : n * 1000);
        const diffMin = Math.floor((Date.now() - t) / 60000);
        if (diffMin <= 0) return 'Vừa xong';
        if (diffMin < 60) return `${diffMin} phút trước`;
        const hrs = Math.floor(diffMin / 60);
        if (hrs < 24) return `${hrs} giờ trước`;
        const days = Math.floor(hrs / 24);
        return `${days} ngày trước`;
      }
    }

    // If API returned normalized object (from getAgentOnlineStatus)
    if (typeof statusObj === 'object') {
      if (statusObj.online === true) return 'Online';
      if (statusObj.online === false) {
        if (statusObj.lastSeen) {
          const last = new Date(statusObj.lastSeen);
          if (!isNaN(last.getTime())) {
            const diffMin = Math.floor((Date.now() - last.getTime()) / 60000);
            if (diffMin <= 0) return 'Vừa xong';
            if (diffMin < 60) return `${diffMin} phút trước`;
            const hrs = Math.floor(diffMin / 60);
            if (hrs < 24) return `${hrs} giờ trước`;
            const days = Math.floor(hrs / 24);
            return `${days} ngày trước`;
          }
        }
        return 'Offline';
      }

      if (statusObj.lastSeen) {
        const last = new Date(statusObj.lastSeen);
        if (!isNaN(last.getTime())) {
          const diffMin = Math.floor((Date.now() - last.getTime()) / 60000);
          if (diffMin <= 0) return 'Vừa xong';
          if (diffMin < 60) return `${diffMin} phút trước`;
          const hrs = Math.floor(diffMin / 60);
          if (hrs < 24) return `${hrs} giờ trước`;
          const days = Math.floor(hrs / 24);
          return `${days} ngày trước`;
        }
      }

      if (statusObj.message) return String(statusObj.message);
      return 'Không có dữ liệu';
    }

    return 'Không có dữ liệu';
  }

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

  const chartData = useMemo(() => {
    const buildEmpty = () => {
      if (granularity === 'hour') {
        return Array.from({ length: 24 }, (_, i) => ({ hour: String(i), minutes: 0 }));
      }
      if (granularity === 'week') {
        const dates = getDatesBetween(dateRange.startDate, dateRange.endDate);
        const weeks = Array.from(new Set(dates.map((d) => {
          const dt = new Date(d);
          return `${dt.getFullYear()}-W${getWeekNumber(dt)}`;
        })));
        return weeks.map((w) => ({ week: w, minutes: 0 })).sort((a: any, b: any) => a.week.localeCompare(b.week));
      }
      return getDatesBetween(dateRange.startDate, dateRange.endDate).map((d) => ({ day: d, minutes: 0 }));
    };

    if (apiUsage === null) {
      return buildEmpty();
    }

    if (Array.isArray(apiUsage) && apiUsage.length > 0) {
      const normalized = apiUsage.map((it: any) => ({
        date: it.date,
        hour: typeof it.hour === 'number' ? it.hour : (it.hour ? Number(it.hour) : undefined),
        minutes: Number(it.usage_minutes ?? it.minutes ?? 0)
      }));

      if (granularity === 'hour') {
        const targetDate = formatDate(dateRange.startDate);
        const hours = Array.from({ length: 24 }, (_, i) => i);
        return hours.map((h) => {
          const match = normalized.find((n: any) => n.date === targetDate && n.hour === h);
          return { hour: String(h), minutes: match ? match.minutes : 0 };
        });
      }

      if (granularity === 'day') {
        const dates = getDatesBetween(dateRange.startDate, dateRange.endDate);
        return dates.map((d) => {
          const total = normalized
            .filter((n: any) => n.date === d)
            .reduce((s: number, it: any) => s + (it.minutes || 0), 0);
          return { day: d, minutes: total };
        });
      }

      if (granularity === 'week') {
        const groups = new Map<string, number>();
        for (const it of normalized) {
          if (!it.date) continue;
          const wk = (() => {
            const d = new Date(it.date);
            return `${d.getFullYear()}-W${getWeekNumber(d)}`;
          })();
          groups.set(wk, (groups.get(wk) || 0) + (it.minutes || 0));
        }
        return Array.from(groups.entries())
          .map(([week, minutes]) => ({ week, minutes }))
          .sort((a: any, b: any) => a.week.localeCompare(b.week));
      }
    }
    return buildEmpty();
  }, [apiUsage, granularity, dateRange]);

  function getWeekNumber(d: Date) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date as any) - (yearStart as any)) / 86400000 + 1) / 7);
  }

  const totalMinutesToday = useMemo<number | null>(() => {
    if (apiUsage === null) return null;
    const today = new Date();
    const todayStr = formatDate(today);
    if (!Array.isArray(apiUsage) || apiUsage.length === 0) return 0;
    return apiUsage.reduce((sum: number, it: any) => {
      const date = it?.date;
      const minutes = Number(it?.usage_minutes ?? it?.minutes ?? 0);
      return sum + (date === todayStr ? minutes : 0);
    }, 0);
  }, [apiUsage]);

  function formatMinutesToLabel(totalMin: number | null) {
    if (totalMin === null) return 'Đang tải';
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  const stats = [
    { label: 'Thời gian hôm nay', value: formatMinutesToLabel(totalMinutesToday), icon: Clock, color: 'blue' },
    { label: 'Ứng dụng đang chạy', value: '12', icon: AppWindow, color: 'green' },
    { label: 'Hoạt động lần cuối', value: formatLastActivity(agentStatus), icon: Power, color: 'purple' }
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-4 md:p-6 border border-gray-200"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">{chartTitle}</h3>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
        <ResponsiveContainer width="100%" height={280}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-gray-200"
        >
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <AppWindow className="w-5 h-5 text-blue-600" />
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Top ứng dụng sử dụng nhiều nhất</h3>
          </div>
          <div className="space-y-3">
            {topApps.slice(0, 6).map((app, index) => {
              const maxPercentage = Math.max(...topApps.map(a => a.percentage || 0), 0);
              const normalizedWidth = maxPercentage ? (app.percentage / maxPercentage) * 100 : 0;

              return (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.06 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{app.name}</p>
                      <p className="text-xs font-semibold text-gray-600 ml-2">{app.time}</p>
                    </div>
                    <div className="relative w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${normalizedWidth}%` }}
                        transition={{ delay: 0.5 + index * 0.06, duration: 0.7, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                          index === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          index === 2 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                          index === 3 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                          index === 4 ? 'bg-gradient-to-r from-pink-500 to-pink-600' :
                          'bg-gradient-to-r from-teal-500 to-teal-600'
                        }`}
                      ></motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-gray-200"
        >
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <Globe className="w-5 h-5 text-green-600" />
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Top website được truy cập</h3>
          </div>
          <div className="space-y-3">
            {topSites === null && (
              // loading skeleton (keeps layout similar to final list)
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3 animate-pulse">
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))
            )}

            {topSites !== null && topSites.length === 0 && (
              <div className="text-sm text-gray-500">Không có dữ liệu</div>
            )}

            {topSites !== null && topSites.length > 0 && topSites.slice(0, 6).map((site, index) => {
              const maxPercentage = Math.max(...(topSites.map(s => s.percentage || 0)));
              const normalizedWidth = maxPercentage ? (site.percentage / maxPercentage) * 100 : 0;

              return (
                <motion.div
                  key={site.name + index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.06 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{site.name}</p>
                      <p className="text-xs font-semibold text-gray-600 ml-2">{site.time}</p>
                    </div>
                    <div className="relative w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${normalizedWidth}%` }}
                        transition={{ delay: 0.5 + index * 0.06, duration: 0.7, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          index === 0 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          index === 1 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                          index === 2 ? 'bg-gradient-to-r from-teal-500 to-teal-600' :
                          index === 3 ? 'bg-gradient-to-r from-cyan-500 to-cyan-600' :
                          index === 4 ? 'bg-gradient-to-r from-sky-500 to-sky-600' :
                          'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}
                      ></motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
