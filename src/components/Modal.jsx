import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Prevent layout shift by adding padding if scrollbar exists
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-primary/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div
        className="bg-surface-container-lowest rounded-[28px] md:rounded-[32px] shadow-2xl w-full max-w-md relative z-10 border border-white/20 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        style={{ maxHeight: '85vh' }}
      >
        {/* Sticky Header */}
        <div className="px-5 md:px-8 py-4 md:py-6 border-b border-surface-container-high flex justify-between items-center bg-white/50 backdrop-blur-md rounded-t-[28px] md:rounded-t-[32px] shrink-0 z-10">
          <h3 className="text-lg md:text-2xl font-black font-headline text-primary tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-2xl bg-surface-container-low hover:bg-surface-container-high transition-all text-on-surface-variant font-bold active:scale-90 shadow-sm"
          >
            <X size={20} className="stroke-[3] md:w-5 md:h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          className="p-5 md:p-8 overflow-y-auto no-scrollbar md:scrollbar-thin md:scrollbar-thumb-primary/10 md:scrollbar-track-transparent"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

