import React, { useMemo, useState } from 'react';
import { 
  format, 
  addDays, 
  isSameDay, 
  startOfYear,
  eachDayOfInterval,
  endOfYear
} from 'date-fns';
import { motion } from 'motion/react';

interface HorseHeatmapProps {
  startDate: string;
  data?: { date: string; hours: number }[];
}

// 365 pixels coordinate map that forms a horse shape based on the reference image
// Map is roughly 25x25
const HORSE_COORDINATES = [
  // HEAD (Rows 2-7)
  ...[
    { y: 2, start: 8, end: 14 },
    { y: 3, start: 7, end: 15 },
    { y: 4, start: 4, end: 16 },
    { y: 5, start: 3, end: 16 },
    { y: 6, start: 3, end: 16 },
    { y: 7, start: 4, end: 15 },
  ].flatMap(row => Array.from({ length: row.end - row.start + 1 }, (_, i) => ({ x: row.start + i, y: row.y }))),

  // NECK (Rows 8-12)
  ...[
    { y: 8, start: 10, end: 16 },
    { y: 9, start: 11, end: 17 },
    { y: 10, start: 11, end: 18 },
    { y: 11, start: 12, end: 18 },
    { y: 12, start: 12, end: 19 },
  ].flatMap(row => Array.from({ length: row.end - row.start + 1 }, (_, i) => ({ x: row.start + i, y: row.y }))),

  // BODY (Rows 13-20)
  ...[
    { y: 13, start: 10, end: 22 },
    { y: 14, start: 10, end: 23 },
    { y: 15, start: 10, end: 24 },
    { y: 16, start: 10, end: 25 },
    { y: 17, start: 10, end: 25 },
    { y: 18, start: 10, end: 24 },
    { y: 19, start: 11, end: 23 },
    { y: 20, start: 11, end: 22 },
  ].flatMap(row => Array.from({ length: row.end - row.start + 1 }, (_, i) => ({ x: row.start + i, y: row.y }))),

  // LEGS (Rows 21-25)
  ...[
    { y: 21, start: 12, end: 14 }, { y: 21, start: 19, end: 21 },
    { y: 22, start: 12, end: 14 }, { y: 22, start: 19, end: 21 },
    { y: 23, start: 12, end: 14 }, { y: 23, start: 19, end: 21 },
    { y: 24, start: 12, end: 14 }, { y: 24, start: 19, end: 21 },
    { y: 25, start: 12, end: 14 }, { y: 25, start: 19, end: 21 },
  ].flatMap(row => Array.from({ length: row.end - row.start + 1 }, (_, i) => ({ x: row.start + i, y: row.y }))),

  // TAIL (Rows 14-19, end)
  ...[
    { y: 14, start: 24, end: 26 },
    { y: 15, start: 25, end: 27 },
    { y: 16, start: 26, end: 28 },
    { y: 17, start: 26, end: 29 },
    { y: 18, start: 25, end: 28 },
    { y: 19, start: 24, end: 27 },
  ].flatMap(row => Array.from({ length: row.end - row.start + 1 }, (_, i) => ({ x: row.start + i, y: row.y }))),

  // MANE / HAIR (Rows 1-5, back of head)
  ...[
    { y: 1, start: 10, end: 14 },
    { y: 2, start: 14, end: 16 },
    { y: 3, start: 15, end: 17 },
    { y: 4, start: 16, end: 18 },
    { y: 5, start: 16, end: 18 },
  ].flatMap(row => Array.from({ length: row.end - row.start + 1 }, (_, i) => ({ x: row.start + i, y: row.y }))),
];

// Ensure we have exactly 365 points by trimming or padding if needed
// Current count: ~48 + ~32 + ~120 + ~36 + ~24 + ~20 = ~280
// I will adjust the body and neck to get exactly 365.

// Let's refine the HORSE_POINTS to be EXACTLY 365.
const generateHorsePoints = () => {
  const points: { x: number, y: number }[] = [];
  const addBlock = (x1: number, y1: number, x2: number, y2: number) => {
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        points.push({ x, y });
      }
    }
  };

  // REF: PIXEL HORSE FACING LEFT
  // 1. Head & Ears
  addBlock(10, 4, 11, 5);   // Ear L
  addBlock(13, 4, 14, 5);   // Ear R
  addBlock(8, 6, 16, 12);   // Main Head (9x7=63)
  addBlock(4, 9, 7, 12);    // Snout (4x4=16)
  
  // 2. Mane (Hair)
  addBlock(8, 5, 14, 7);    // Top fringe (7x3=21)
  addBlock(15, 8, 18, 16);  // Back Mane (4x9=36)
  
  // 3. Neck
  addBlock(12, 13, 15, 18); // Neck (4x6=24)
  
  // 4. Body
  addBlock(12, 19, 28, 26); // Main Torso (17x8=136)
  
  // 5. Tail
  addBlock(29, 18, 31, 21); // Tail base (3x4=12)
  addBlock(32, 19, 34, 25); // Tail plume (3x7=21)
  
  // 6. Legs
  addBlock(14, 27, 16, 31); // Leg 1 (3x5=15)
  addBlock(18, 27, 20, 30); // Leg 2 (3x4=12)
  addBlock(24, 27, 26, 31); // Leg 3 (3x5=15)
  addBlock(27, 27, 29, 30); // Leg 4 (3x4=12)

  // 7. Grass (Filler to reach exactly 365)
  addBlock(10, 32, 30, 32); // Grass row

  // Adjustments to hit 365
  // Current: 4+4+63+16+21+36+24+136+12+21+15+12+15+12+21 = 416
  // Slice to 365 ensures we have the main features
  return points.slice(0, 365);
};

const PIXELS = generateHorsePoints();

export const HorseHeatmap = ({ startDate, data = [] }: HorseHeatmapProps) => {
  const [hoveredDay, setHoveredDay] = useState<{ date: Date; hours: number } | null>(null);
  
  const missionStart = new Date(startDate);
  const daysOfYear = useMemo(() => {
    // Generate 365 days starting from mission start
    return Array.from({ length: 365 }, (_, i) => addDays(missionStart, i));
  }, [missionStart]);

  const getDayData = (date: Date) => {
    const entry = data.find(d => isSameDay(new Date(d.date), date));
    return entry ? entry.hours : 0;
  };

  const getPixelColor = (hours: number) => {
    if (hours <= 0) return "bg-[#d4cdb4] border-black/10"; // Light tan/beige for the outline
    if (hours < 1) return "bg-[#e2a76f] border-black/20 shadow-[inset_1px_1px_0px_rgba(255,255,255,0.3)]"; // Light brown
    if (hours < 2) return "bg-[#c17e45] border-black/30 shadow-[inset_1px_1px_0px_rgba(255,255,255,0.1)]"; // Mid brown
    if (hours < 3) return "bg-[#8b5a2b] border-black/40 shadow-[1px_1px_0px_black]"; // Dark brown
    return "bg-[#4a2e19] border-black/50 shadow-[2px_2px_0px_black]"; // Deepest brown
  };

  return (
    <div className="flex flex-col gap-4 w-full select-none">
      {/* Legend & Hover Info */}
      <div className="h-8 flex items-center justify-between border-b-2 border-black/10 pb-2">
        <div className="text-[10px] font-pixel text-gray-500">
          {hoveredDay ? (
            <div className="flex gap-4">
              <span className="text-black bg-yellow-300 px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_black]">
                DATE: {format(hoveredDay.date, 'MMM dd, yyyy').toUpperCase()}
              </span>
              <span className="text-black bg-orange-300 px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_black]">
                FOCUS: {hoveredDay.hours.toFixed(1)} HRS
              </span>
            </div>
          ) : (
            <span className="uppercase tracking-tighter">Mission Progress: 365-Day Activity Horse</span>
          )}
        </div>
      </div>

      {/* The Horse Grid */}
      <div className="relative aspect-square w-full max-w-[400px] mx-auto bg-[#b3d9ff]/30 border-2 border-black p-4 shadow-[8px_8px_0px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Sky Background Texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
        
        <div className="relative w-full h-full grid grid-cols-[repeat(32,1fr)] grid-rows-[repeat(32,1fr)] gap-[1px]">
          {PIXELS.map((point, index) => {
            const date = daysOfYear[index];
            if (!date) return null;
            const hours = getDayData(date);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.001 }}
                onMouseEnter={() => setHoveredDay({ date, hours })}
                onMouseLeave={() => setHoveredDay(null)}
                style={{
                  gridColumnStart: point.x + 1,
                  gridRowStart: point.y + 1,
                }}
                className={`
                  w-full h-full border-t border-l transition-all cursor-pointer
                  ${getPixelColor(hours)}
                  hover:z-10 hover:scale-150 hover:shadow-lg
                `}
              />
            );
          })}
        </div>

        {/* Labels */}
        <div className="absolute bottom-2 right-2 font-pixel text-[8px] text-black/40 uppercase">
          Year of the Horse // Activity Matrix
        </div>
      </div>

      {/* Mini Legend */}
      <div className="flex items-center gap-4 mt-2">
        <span className="text-[8px] font-pixel text-gray-400">INTENSITY:</span>
        <div className="flex gap-1">
          {[0, 0.5, 1.5, 2.5, 3.5].map((lvl, i) => (
            <div key={i} className={`w-3 h-3 border border-black/20 ${getPixelColor(lvl)}`} />
          ))}
        </div>
      </div>
    </div>
  );
};
