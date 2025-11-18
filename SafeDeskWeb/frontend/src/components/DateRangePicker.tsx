import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

type ViewMode = 'date' | 'month';

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date>(value.startDate);
  const [tempEndDate, setTempEndDate] = useState<Date>(value.endDate);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>('date');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateRange = (start: Date, end: Date) => {
    if (start.getDate() === 1 && end.getDate() === new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate() && start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `Tháng ${end.getMonth() + 1}/${end.getFullYear()}`;
    }
    const startStr = `${start.getDate().toString().padStart(2, '0')}/${(start.getMonth() + 1).toString().padStart(2, '0')}`;
    const endStr = `${end.getDate().toString().padStart(2, '0')}/${(end.getMonth() + 1).toString().padStart(2, '0')}/${end.getFullYear()}`;
    return `${startStr} - ${endStr}`;
  };

  const handleMonthClick = (month: number) => {
    const startDate = new Date(currentYear, month, 1);
    const endDate = new Date(currentYear, month + 1, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    setTempStartDate(startDate);
    setTempEndDate(endDate);
  };

  const handlePrevYear = () => {
    setCurrentYear(currentYear - 1);
  };

  const handleNextYear = () => {
    setCurrentYear(currentYear + 1);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    clickedDate.setHours(0, 0, 0, 0);

    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      setTempStartDate(clickedDate);
      setTempEndDate(clickedDate);
    } else if (clickedDate < tempStartDate) {
      setTempStartDate(clickedDate);
    } else {
      setTempEndDate(clickedDate);
    }
  };

  const isDateInRange = (day: number) => {
    if (!tempStartDate || !tempEndDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    return date >= tempStartDate && date <= tempEndDate;
  };

  const isDateSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    return (tempStartDate && date.getTime() === tempStartDate.getTime()) ||
           (tempEndDate && date.getTime() === tempEndDate.getTime());
  };

  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      onChange({ startDate: tempStartDate, endDate: tempEndDate });
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTempStartDate(value.startDate);
    setTempEndDate(value.endDate);
    setViewMode('date');
    setIsOpen(false);
  };

  const isMonthSelected = (month: number) => {
    if (!tempStartDate || !tempEndDate) return false;
    const monthStart = new Date(currentYear, month, 1);
    const monthEnd = new Date(currentYear, month + 1, 0);
    return tempStartDate.getTime() === monthStart.getTime() && tempEndDate.getTime() === monthEnd.getTime();
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-gray-700">{formatDateRange(value.startDate, value.endDate)}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
            style={{ width: '280px' }}
          >
            <div className="p-3">
                <div className="flex items-center gap-1 mb-3">
                  <button
                    onClick={viewMode === 'date' ? handlePrevMonth : handlePrevYear}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <div className="flex-1 flex gap-1">
                    <button
                      onClick={() => setViewMode(viewMode === 'date' ? 'month' : 'date')}
                      className="flex-1 text-xs font-semibold text-gray-900 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                    >
                      {viewMode === 'date' ? `Tháng ${currentMonth.getMonth() + 1}` : currentYear}
                    </button>
                  </div>
                  <button
                    onClick={viewMode === 'date' ? handleNextMonth : handleNextYear}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {viewMode === 'date' ? (
                  <>
                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                      {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                        <div key={day} className="text-center text-[10px] font-medium text-gray-500 py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-0.5">
                      {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                        <div key={`empty-${index}`} />
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, index) => {
                        const day = index + 1;
                        const inRange = isDateInRange(day);
                        const selected = isDateSelected(day);

                        return (
                          <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            className={`
                              aspect-square p-1 text-[11px] rounded transition-all
                              ${selected
                                ? 'bg-blue-600 text-white font-semibold hover:bg-blue-700'
                                : inRange
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : 'text-gray-700 hover:bg-gray-100'
                              }
                            `}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-3 gap-1">
                    {['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'].map((month, index) => {
                      const selected = isMonthSelected(index);
                      return (
                        <button
                          key={month}
                          onClick={() => handleMonthClick(index)}
                          className={`
                            px-2 py-2 text-xs rounded transition-all font-medium
                            ${selected
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                            }
                          `}
                        >
                          {month}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={!tempStartDate || !tempEndDate}
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Áp dụng
                  </button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
