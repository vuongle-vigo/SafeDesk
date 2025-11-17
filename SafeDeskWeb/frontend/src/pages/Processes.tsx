import { X, RefreshCw, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { mockProcesses } from '../data/mockData';
import { Process } from '../types';

export default function Processes() {
  const [processes, setProcesses] = useState<Process[]>(mockProcesses);
  const [filterStatus, setFilterStatus] = useState<'all' | 'running' | 'stopped'>('all');

  useEffect(() => {
    const interval = setInterval(() => {
      setProcesses(prev => prev.map(proc => ({
        ...proc,
        cpu: proc.status === 'running' ? Math.max(0, proc.cpu + (Math.random() - 0.5) * 5) : 0,
        ram: proc.status === 'running' ? Math.max(0, proc.ram + (Math.random() - 0.5) * 50) : proc.ram
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleKillProcess = (processId: string) => {
    if (window.confirm('Bạn có chắc muốn đóng tiến trình này?')) {
      setProcesses(processes.map(proc =>
        proc.id === processId ? { ...proc, status: 'stopped' as const, cpu: 0 } : proc
      ));
    }
  };

  const filteredProcesses = processes.filter(proc =>
    filterStatus === 'all' ? true : proc.status === filterStatus
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Giám sát tiến trình</h1>
          <p className="text-gray-500 mt-1">Theo dõi tài nguyên hệ thống theo thời gian thực</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-gray-200"
        >
          <p className="text-xs md:text-sm text-gray-600 mb-1">Tổng CPU</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">
            {filteredProcesses.filter(p => p.status === 'running').reduce((sum, p) => sum + p.cpu, 0).toFixed(1)}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-gray-200"
        >
          <p className="text-xs md:text-sm text-gray-600 mb-1">Tổng RAM</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">
            {(filteredProcesses.filter(p => p.status === 'running').reduce((sum, p) => sum + p.ram, 0) / 1024).toFixed(1)} GB
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 md:p-6 border border-gray-200"
        >
          <p className="text-xs md:text-sm text-gray-600 mb-1">Đang chạy</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">
            {processes.filter(p => p.status === 'running').length}
          </p>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2 flex-wrap">
            {(['all', 'running', 'stopped'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Tất cả' : status === 'running' ? 'Đang chạy' : 'Đã dừng'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tên tiến trình
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  CPU
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  RAM
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProcesses.map((proc, index) => (
                <motion.tr
                  key={proc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{proc.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-700">{proc.cpu.toFixed(1)}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-700">{proc.ram} MB</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-700">{proc.uptime}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      proc.status === 'running'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {proc.status === 'running' ? 'Đang chạy' : 'Dừng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {proc.status === 'running' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleKillProcess(proc.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Đóng tiến trình"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
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
