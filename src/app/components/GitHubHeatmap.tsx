import React, { useMemo, useState } from 'react';
import { 
  format, 
  eachDayOfInterval, 
  startOfYear, 
  endOfYear, 
  isSameDay, 
  startOfWeek, 
  eachWeekOfInterval, 
  addDays,
  getMonth
} from 'date-fns';
import { motion } from 'motion/react';

interface GitHubHeatmapProps {
  data: { date: string; count: number }[];
  year?: number;
}

export const GitHubHeatmap = ({ data, year = 2026 }: GitHubHeatmapProps) => {
  const [hoveredDay, setHoveredDay] = useState<{ date: Date; count: number } | null>(null);

  const days = useMemo(() => {
    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfYear(new Date(year, 0, 1));
    return eachDayOfInterval({ start, end });
  }, [year]);

  const weeks = useMemo(() => {
    const start = startOfWeek(days[0]);
    const end = days[days.length - 1];
    return eachWeekOfInterval({ start, end });
  }, [days]);

  const getDayData = (date: Date) => {
    const entry = data.find(d => isSameDay(new Date(d.date), date));
    return entry ? entry.count : 0;
  };

  const getColor = (count: number) => {
    if (count === 0) return 'bg-[#ebedf0]';
    if (count < 2) return 'bg-[#9be9a8]';
    if (count < 4) return 'bg-[#40c463]';
    if (count < 6) return 'bg-[#30a14e]';
    return 'bg-[#216e39]';
  };

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className="flex flex-col gap-2 w-full overflow-x-auto custom-scrollbar pb-4">
      {/* Month Labels */}
      <div className="flex ml-8 gap-[14px]">
        {months.map((month, i) => (
          <div key={i} className="text-[10px] font-pixel text-gray-400 min-w-[30px]">
            {month.toUpperCase()}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {/* Day Labels */}
        <div className="flex flex-col gap-[7px] justify-center text-[8px] font-pixel text-gray-400 pt-1">
          <span>MON</span>
          <span>WED</span>
          <span>FRI</span>
        </div>

        {/* The Grid */}
        <div className="flex gap-[3px]">
          {weeks.map((weekStart, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[3px]">
              {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                const day = addDays(weekStart, dayIdx);
                if (getDayData(day) === -1 || getMonth(day) !== getMonth(weekStart) && weekIdx === 0) {
                   // Optional: handle alignment if needed
                }
                const count = getDayData(day);
                
                return (
                  <motion.div
                    key={dayIdx}
                    onMouseEnter={() => setHoveredDay({ date: day, count })}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-[11px] h-[11px] rounded-[2px] transition-colors cursor-pointer border-[0.5px] border-black/5 ${getColor(count)}`}
                    whileHover={{ scale: 1.3, zIndex: 10 }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip area */}
      <div className="h-6 flex items-center justify-between px-2 mt-2 border-t border-black/5 pt-2">
        <div className="text-[10px] font-pixel text-gray-500">
          {hoveredDay ? (
            <span className="text-black bg-yellow-200 px-2 border border-black">
              {format(hoveredDay.date, 'MMM dd')}: {hoveredDay.count} SESSIONS
            </span>
          ) : (
            "HOVER FOR DETAILS"
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[8px] font-pixel text-gray-400 mr-2">LESS</span>
          {[0, 1, 3, 5, 7].map((val, i) => (
            <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${getColor(val)}`} />
          ))}
          <span className="text-[8px] font-pixel text-gray-400 ml-1">MORE</span>
        </div>
      </div>
    </div>
  );
};
