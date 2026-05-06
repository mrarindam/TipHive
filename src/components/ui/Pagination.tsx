'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  activeColorClass?: string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, activeColorClass = 'bg-[#f7931a] text-black shadow-[0_0_30px_rgba(247,147,26,0.3)]' }: PaginationProps) {
  const getPages = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Show 1 2 3 ... Last
        if (!pages.includes(2)) pages.push(2);
        if (!pages.includes(3)) pages.push(3);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show 1 ... Last-2 Last-1 Last
        pages.push('...');
        if (!pages.includes(totalPages - 2)) pages.push(totalPages - 2);
        if (!pages.includes(totalPages - 1)) pages.push(totalPages - 1);
        if (!pages.includes(totalPages)) pages.push(totalPages);
      } else {
        // Show 1 ... Current ... Last
        pages.push('...');
        pages.push(currentPage);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-10 border-t border-white/5 mt-6">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all group"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {getPages().map((page, index) => (
        page === '...' ? (
          <div key={`ellipsis-${index}`} className="w-12 h-12 flex items-center justify-center text-slate-600 font-black tracking-widest text-lg">
            ...
          </div>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(Number(page))}
            className={`w-12 h-12 rounded-2xl font-black text-sm transition-all transform active:scale-95 ${
              currentPage === page
                ? `${activeColorClass} scale-105 z-10`
                : 'bg-white/5 border border-white/10 text-slate-500 hover:bg-white/10 hover:text-slate-300'
            }`}
          >
            {page}
          </button>
        )
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all group"
        aria-label="Next page"
      >
        <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
