import { useEffect } from 'react';
import type { ReactNode } from 'react';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}

export const BaseModal = ({ isOpen, onClose, title, children, width = '480px' }: BaseModalProps) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center opacity-100 visible transition-all duration-300"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ 
          width: width,
          maxWidth: '90vw',
          maxHeight: '90vh'
        }}
      >
        <div className="flex items-center justify-between px-7 py-6 border-b border-slate-200 bg-[#fafbfc] shrink-0">
          <h2 className="text-xl font-bold text-slate-800 m-0">{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 border-none bg-slate-100 rounded-full flex items-center justify-center cursor-pointer transition-all text-slate-500 text-lg hover:bg-slate-200 hover:scale-105 active:scale-95"
          >
            ×
          </button>
        </div>
        <div className="flex-1 p-7 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};