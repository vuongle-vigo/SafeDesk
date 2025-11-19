import { Clock, Calendar, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ActivitySession } from '../types';
import { mockAPI } from '../utils/api';

interface ActivityProps {
  selectedDeviceId: string | null;
}

export default function Activity({ selectedDeviceId }: ActivityProps) {
  const [sessions, setSessions] = useState<ActivitySession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // default to today in YYYY-MM-DD so the date picker matches today's data
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
  const uniqueApps = new Set(sessions.map(s => s.appName)).size;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      system: 'bg-gray-100 text-gray-700',
      game: 'bg-purple-100 text-purple-700',
      office: 'bg-blue-100 text-blue-700',
      education: 'bg-green-100 text-green-700',
      other: 'bg-orange-100 text-orange-700'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  useEffect(() => {
    let mounted = true;
    async function loadProcesses() {
      try {
        setIsLoading(true);
        // prefer selectedDeviceId passed from parent, otherwise fallback to localStorage/default
        const agentId = selectedDeviceId || localStorage.getItem('agentId') || 'agent-1';
        const token = localStorage.getItem('token') || null;
        // selectedDate is already YYYY-MM-DD (input[type=date])
        const res = await mockAPI.getAgentProcessUsage(agentId, selectedDate, selectedDate, token);
        if (!mounted) return;
        if (res.success && Array.isArray(res.usage)) {
          // map backend fields to ActivitySession expected by the UI
          const mapped = (res.usage as any[]).map((it) => {
            const iconEl = it?.icon_base64
              ? (<img src={`data:image/png;base64,${it.icon_base64}`} alt={it?.app_name ?? ''} className="w-8 h-8 object-contain" />)
              : (it?.app_name ? (it.app_name[0] || '') : '🔍');

            return {
              id: String(it?.usage_id ?? `${it?.agent_id ?? ''}-${it?.date_recorded ?? ''}-${it?.start_time ?? ''}`),
              icon: iconEl,
              duration: Math.round(Number(it?.time_usage ?? 0)),
              appName: it?.app_name ?? (it?.process_path ? it.process_path.split('\\').pop() : 'Unknown'),
              windowTitle: it?.process_title ?? '',
              category: 'other',
              startTime: it?.start_time ?? '',
              processName: it?.process_path ?? ''
            } as ActivitySession;
          });
          setSessions(mapped);
        } else {
          setSessions([]);
        }
      } catch (err) {
        if (mounted) setSessions([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadProcesses();
    return () => { mounted = false; };
  }, [selectedDate, selectedDeviceId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hoạt động theo thời gian thực</h1>
          <p className="text-gray-500 mt-1">Timeline các ứng dụng được sử dụng</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tổng thời gian</p>
              <p className="text-xl font-bold text-gray-900">{isLoading ? 'Đang tải...' : formatDuration(totalDuration)}</p>
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
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Phiên làm việc</p>
              <p className="text-xl font-bold text-gray-900">{sessions.length}</p>
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
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📱</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Ứng dụng khác nhau</p>
              <p className="text-xl font-bold text-gray-900">{uniqueApps}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline hoạt động</h3>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          <div className="space-y-4">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex items-start gap-4 pl-2"
              >
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-12 h-12 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center text-xl shadow-sm">
                    {session.icon}
                  </div>
                  <div className="absolute -right-2 -bottom-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                    {session.duration}m
                  </div>
                </div>

                <div className="flex-1 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{session.appName}</h4>
                      <p className="text-sm text-gray-600 mt-1">{session.windowTitle}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(session.category)}`}>
                      {session.category === 'office' ? 'Văn phòng' :
                       session.category === 'game' ? 'Game' :
                       session.category === 'education' ? 'Học tập' :
                       session.category === 'system' ? 'Hệ thống' : 'Khác'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Bắt đầu: {session.startTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {session.processName}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {!isLoading && sessions.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có hoạt động</h3>
          <p className="text-gray-500">Không có dữ liệu hoạt động cho ngày này</p>
        </div>
      )}
    </div>
  );
}
