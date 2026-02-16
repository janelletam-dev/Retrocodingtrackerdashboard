import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'yellow' | 'orange' | 'white';
}

export const RetroButton = ({ children, className, variant = 'yellow', ...props }: RetroButtonProps) => {
  const variants = {
    yellow: "bg-[var(--color-retro-yellow)] hover:bg-[#ffffa0]",
    orange: "bg-[var(--color-retro-orange)] hover:bg-[#ffc98c]",
    white: "bg-white hover:bg-gray-100",
  };

  return (
    <button 
      className={cn(
        "retro-btn px-4 py-2 font-bold text-xs",
        variants[variant],
        className
      )} 
      {...props}
    >
      {children}
    </button>
  );
};
