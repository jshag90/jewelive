import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  fullHeight?: boolean;
}

export default function BottomSheet({
  open,
  title,
  onClose,
  children,
  footer,
  fullHeight = false,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="jl-sheet" role="dialog" aria-modal="true">
      <button
        type="button"
        className="jl-sheet__backdrop"
        aria-label="close"
        onClick={onClose}
      />
      <div className={`jl-sheet__panel ${fullHeight ? 'jl-sheet__panel--full' : ''}`}>
        <div className="jl-sheet__handle" />
        <header className="jl-sheet__header">
          <div className="jl-sheet__title">{title || ''}</div>
          <button
            type="button"
            className="jl-sheet__close"
            onClick={onClose}
            aria-label="close"
          >
            <X size={20} />
          </button>
        </header>
        <div className="jl-sheet__body">{children}</div>
        {footer ? <footer className="jl-sheet__footer">{footer}</footer> : null}
      </div>
    </div>
  );
}
