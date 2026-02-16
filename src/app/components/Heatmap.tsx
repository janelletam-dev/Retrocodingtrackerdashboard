import React, { useMemo, useState } from 'react';
import { 
  format, 
  addDays, 
  startOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth, 
  startOfMonth,
  addWeeks
} from 'date-fns';

interface HeatmapProps {
  startDate: string;
  numWeeks?: number;
  data?: { date: string; hours: number }[];
}

export const Heatmap = ({ startDate, numWeeks = 20, data = [] }: HeatmapProps) => {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const missionStart = new Date(startDate);
  
  const weeks = useMemo(() => {
    const result = [];
    let currentWeekStart = startOfWeek(missionStart, { weekStartsOn: 1 }); // Start Monday
    
    for (let i = 0; i < numWeeks; i++) {
      const weekDays = eachDayOfInterval({
        start: currentWeekStart,
        end: addDays(currentWeekStart, 6)
      });
      result.push(weekDays);
      currentWeekStart = addWeeks(currentWeekStart, 1);
    }
    return result;
  }, [missionStart, numWeeks]);

  const getLevelClass = (date: Date) => {
    const entry = data.find(d => isSameDay(new Date(d.date), date));
    const hours = entry ? entry.hours : 0;
    
    if (hours <= 0) return "bg-[#d9d4c5] border-black/10 hover:border-black/40";
    if (hours < 1) return "bg-[#9be9a8] border-black/20 hover:border-black/50";
    if (hours < 2) return "bg-[#40c463] border-black/20 hover:border-black/50";
    if (hours < 3) return "bg-[#30a14e] border-black/20 hover:border-black/50";
    return "bg-[#216e39] border-black/20 hover:border-black/50";
  };

  const monthLabels = useMemo(() => {
    const labels: { label: string; index: number }[] = [];
    weeks.forEach((week, i) => {
      const firstDay = week[0];
      if (i === 0 || isSameMonth(firstDay, startOfMonth(firstDay))) {
        const monthName = format(firstDay, 'MMM').toUpperCase();
        if (!labels.find(l => l.label === monthName)) {
          labels.push({ label: monthName, index: i });
        }
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Date Indicator on Hover */}
      <div className="h-6 flex items-center justify-between border-b border-black/10 pb-2">
        <div className="text-[10px] font-pixel text-gray-400">
          {hoveredDate ? (
            <span className="text-black bg-yellow-200 px-2 py-0.5 border border-black shadow-[1px_1px_0px_black]">
              TARGET_DATE: {format(hoveredDate, 'MMM dd, yyyy').toUpperCase()}
            </span>
          ) : (
            <span>HOVER_OVER_SQUARES_FOR_LOGS</span>
          )}
        </div>
        <div className="text-[8px] font-pixel text-gray-400 flex gap-4 uppercase">
          <span>{numWeeks} Weeks Tracked</span>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Day of Month Numbers */}
        <div className="flex flex-col justify-between text-[9px] text-gray-500 font-pixel pt-[20px] pb-[8px] min-w-[20px]">
          <span>01</span>
          <span>10</span>
          <span>20</span>
          <span>31</span>
        </div>

        <div className="flex-1 overflow-x-auto custom-scrollbar pb-4">
          <div className="inline-flex flex-col gap-2 min-w-max">
            {/* Months Header */}
            <div className="flex h-4 relative">
              {weeks.map((week, i) => {
                const label = monthLabels.find(l => l.index === i);
                return (
                  <div key={i} className="w-[18px] flex-shrink-0 relative">
                    {label && (
                      <span className="absolute left-0 bottom-0 text-[10px] font-pixel text-black font-bold whitespace-nowrap">
                        {label.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* The Grid with more spacing */}
            <div className="flex gap-[6px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[6px]">
                  {week.map((day, dayIndex) => (
                    <div 
                      key={dayIndex}
                      onMouseEnter={() => setHoveredDate(day)}
                      onMouseLeave={() => setHoveredDate(null)}
                      className={`w-[12px] h-[12px] border-2 rounded-[2px] transition-all cursor-crosshair ${getLevelClass(day)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
