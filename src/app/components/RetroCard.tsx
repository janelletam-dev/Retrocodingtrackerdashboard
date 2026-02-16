import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RetroCardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
}

export const RetroCard = ({ children, className, accent, ...props }: RetroCardProps) => {
  return (
    <div 
      className={cn(
        "retro-card p-6",
        accent ? "bg-white" : "bg-[#fffbf0]",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};
