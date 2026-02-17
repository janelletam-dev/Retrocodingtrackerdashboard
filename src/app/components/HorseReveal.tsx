import React, { useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import horseImg from '../../assets/mascot-horse.png';

interface HorseRevealProps {
  progress: number; // 0 to 100
  shuffle?: number[] | null; // Optional pre-shuffled array for persistence
  onShuffleGenerated?: (shuffle: number[]) => void; // Callback when shuffle is first created
}

export const HorseReveal: React.FC<HorseRevealProps> = ({ progress, shuffle, onShuffleGenerated }) => {
  const gridSize = 24; 
  const totalBlocks = gridSize * gridSize;
  const hasNotifiedRef = useRef(false);
  
  // Create a randomized list of indices to reveal (or use provided shuffle)
  const blocks = useMemo(() => {
    // If shuffle is provided, use it
    if (shuffle && shuffle.length === totalBlocks) {
      return shuffle;
    }
    
    // Otherwise, create a new shuffle
    const arr = Array.from({ length: totalBlocks }, (_, i) => i);
    // Fisher-Yates shuffle for true randomness
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    
    return arr;
  }, [shuffle, totalBlocks]);

  // Notify parent of new shuffle in useEffect to avoid setState during render
  useEffect(() => {
    if (!shuffle && onShuffleGenerated && !hasNotifiedRef.current) {
      onShuffleGenerated(blocks);
      hasNotifiedRef.current = true;
    }
  }, [shuffle, blocks, onShuffleGenerated]);

  // Calculate exactly how many blocks to reveal based on daily progress
  const hideCount = Math.floor((progress / 100) * totalBlocks);
  const hiddenIndices = new Set(blocks.slice(0, hideCount));

  // Solid blue for the mask
  const maskColor = "#0066ff"; // A clear system blue

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full aspect-square max-w-[340px] border-4 border-black bg-white overflow-hidden shadow-[8px_8px_0px_black]">
        {/* Target Image - The Horse */}
        <img 
          src={horseImg} 
          alt="Pixel Horse Reveal" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Reveal Mask Layer */}
        <div 
          className="absolute inset-0 grid" 
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)` 
          }}
        >
          {blocks.map((id) => {
            const isRevealed = hiddenIndices.has(id);
            
            return (
              <motion.div
                key={id}
                initial={false}
                animate={{ 
                  opacity: isRevealed ? 0 : 1,
                  scale: isRevealed ? 0.9 : 1,
                }}
                transition={{ 
                  duration: 0.4, 
                  ease: "easeOut"
                }}
                className="w-full h-full"
                style={{
                  backgroundColor: maskColor,
                  opacity: isRevealed ? 0 : 1,
                  pointerEvents: 'none'
                }}
              />
            );
          })}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="flex items-center gap-3 bg-white border-2 border-black px-4 py-2 shadow-[4px_4px_0px_black]">
        <span className="font-pixel text-[10px] text-gray-500 font-bold uppercase">SYNC_PROGRESS:</span>
        <span className="font-pixel text-lg font-black text-blue-600">{progress.toFixed(0)}%</span>
      </div>
    </div>
  );
};
