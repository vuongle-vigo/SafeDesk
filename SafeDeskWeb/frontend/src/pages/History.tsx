import { Search, Filter, Globe, Calendar, X, AlertCircle } from 'lucide-react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
// removed import of mockBrowserHistory
import { mockAPI } from '../utils/api';
import type { BrowserHistory } from '../types';

type DateFilter = '7days' | '30days' | '3months';

interface HistoryProps {
  selectedDeviceId?: string | null;
}

export default function History({ selectedDeviceId }: HistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [browserFilter, setBrowserFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('7days');
  const [hideSystem, setHideSystem] = useState(true);

  // API mode (use only API)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiHistory, setApiHistory] = useState<BrowserHistory[]>([]);
  const [apiTotal, setApiTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const LIMIT = 50;

  // Add a ref to avoid including `loading` and `nextCursor` in fetch deps and prevent re-entry
  const isFetchingRef = useRef(false);
  const nextCursorRef = useRef<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // WebKit timestamp conversion (Chrome uses microseconds since 1601-01-01)
  const WEBKIT_EPOCH_OFFSET = 11644473600000000;

  const webkitToUnixMs = (webkit: number): number => {
    return Math.floor((webkit - WEBKIT_EPOCH_OFFSET) / 1000);
  };

  // Fetch from API
  const fetchAPIHistory = useCallback(async (reset = false) => {
    if (!selectedDeviceId) return;
    if (isFetchingRef.current) return; // use ref guard

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || '';
      const cursor = reset ? undefined : (nextCursorRef.current || undefined);
      const result = await mockAPI.getBrowserHistory(
        selectedDeviceId,
        {
          q: debouncedSearch || undefined,
          browser: browserFilter || undefined,
          range: dateFilter,
          hide_system: hideSystem,
          limit: LIMIT,
          cursor
        }, token
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch history');
      }
      const newItems = result.items || [];
      setApiHistory(prev => reset ? newItems : [...prev, ...newItems]);

      const nc = result.nextCursor || null;
      setNextCursor(nc);
      nextCursorRef.current = nc; // keep ref in sync

      setHasMore(!!nc);
      if (result.total !== undefined) {
        setApiTotal(result.total);
      }
    } catch (err: any) {
      console.error('Failed to fetch history:', err);
      setError(err.message);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  // note: nextCursor removed from deps; function depends on stable refs/state values
  }, [selectedDeviceId, debouncedSearch, browserFilter, dateFilter, hideSystem]);

  // Reset and reload when filters or selectedDeviceId change
  useEffect(() => {
    if (!selectedDeviceId) {
      setApiHistory([]);
      setApiTotal(0);
      setNextCursor(null);
      nextCursorRef.current = null;
      setHasMore(false);
      return;
    }
    // reset and fetch fresh
    setApiHistory([]);
    setNextCursor(null);
    nextCursorRef.current = null;
    fetchAPIHistory(true);
  }, [selectedDeviceId, debouncedSearch, browserFilter, dateFilter, hideSystem]); // removed fetchAPIHistory from deps to avoid loop

  // Derive available browsers from apiHistory
  const availableBrowsers = useMemo(() => {
    const setB = new Set(apiHistory.map(h => h.browser_name).filter(Boolean));
    return Array.from(setB).sort();
  }, [apiHistory]);

  // Filtered data: now purely from API results (no mock slicing)
  const { filteredHistory, total } = useMemo(() => {
    return { filteredHistory: apiHistory, total: apiTotal };
  }, [apiHistory, apiTotal]);

  // Group by date
  const groupedHistory = useMemo(() => {
    const grouped: Record<string, BrowserHistory[]> = {};

    filteredHistory.forEach(item => {
      const unixMs = webkitToUnixMs(item.last_visit_time);
      const date = new Date(unixMs).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });

    return grouped;
  }, [filteredHistory]);

  // Infinite scroll observer: uses API hasMore / fetchAPIHistory
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingRef.current) {
          if (hasMore) {
            fetchAPIHistory(false);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, fetchAPIHistory]); // loading removed, use isFetchingRef guard

  const formatTime = (timestamp: number) => {
    const unixMs = webkitToUnixMs(timestamp);
    const date = new Date(unixMs);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '';
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setBrowserFilter('');
    setDateFilter('7days');
    setHideSystem(true);
  };

  const activeFiltersCount = [
    searchQuery,
    browserFilter,
    dateFilter !== '7days',
    !hideSystem
  ].filter(Boolean).length;

  const showHasMore = hasMore;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử duyệt web</h1>
          <p className="text-gray-500 mt-1">
            {total > 0 ? `${total.toLocaleString()} lượt truy cập` : 'Không có lịch sử'}
            {/* removed "(Dữ liệu mẫu)" tag */}
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Lỗi tải dữ liệu</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <p className="text-sm text-red-600 mt-1">Đang hiển thị dữ liệu mẫu</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            placeholder="Tìm kiếm URL hoặc tiêu đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-5 h-5 text-gray-400" />

          {/* Browser filter */}
          <select
            value={browserFilter}
            onChange={(e) => setBrowserFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trình duyệt</option>
            {availableBrowsers.map(browser => (
              <option key={browser} value={browser}>{browser}</option>
            ))}
          </select>

          {/* Date filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7days">7 ngày gần đây</option>
            <option value="30days">30 ngày gần đây</option>
            <option value="3months">3 tháng gần đây</option>
          </select>

          {/* Hide system pages */}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={hideSystem}
              onChange={(e) => setHideSystem(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            Ẩn trang hệ thống
          </label>

          {/* Clear filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Xóa bộ lọc ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {/* History list */}
      <div className="space-y-6">
        {Object.keys(groupedHistory).length === 0 && !loading && (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy lịch sử
            </h3>
            <p className="text-gray-500">
              Thử thay đổi bộ lọc hoặc khoảng thời gian
            </p>
          </div>
        )}

        {Object.entries(groupedHistory).map(([date, items]) => (
          <div key={date}>
            {/* Date header */}
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">
                {formatDate(date)}
              </h2>
              <span className="text-sm text-gray-500">
                {items.length} lượt truy cập
              </span>
            </div>

            {/* History cards */}
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Time */}
                    <span className="text-sm text-gray-500 font-medium min-w-[3rem]">
                      {formatTime(item.last_visit_time)}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* URL with favicon */}
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={getFavicon(item.url)}
                          alt=""
                          className="w-4 h-4"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate"
                        >
                          {getDomain(item.url)}
                        </a>
                      </div>

                      {/* Title */}
                      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {item.title || 'Không có tiêu đề'}
                      </h4>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {item.visit_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {item.visit_count} lần
                          </span>
                        )}
                        {item.browser_name && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                            {item.browser_name}
                          </span>
                        )}
                        {item.typed_count > 0 && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                            ⌨️ Đã nhập
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* Load more trigger */}
        {showHasMore && (
          <div ref={loadMoreRef} className="py-8 text-center">
            {loading && (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                <span>Đang tải thêm...</span>
              </div>
            )}
          </div>
        )}

        {!showHasMore && filteredHistory.length > 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            Đã hiển thị tất cả {total.toLocaleString()} lượt truy cập
          </div>
        )}
      </div>
    </div>
  );
}
