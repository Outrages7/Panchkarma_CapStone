import { useEffect } from "react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "medium",
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-lg",
    large: "max-w-2xl",
    xlarge: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity"
        style={{ zIndex: 9999 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="flex min-h-screen items-center justify-center p-4"
        style={{ zIndex: 10000, position: "relative" }}
      >
        <div
          className={`relative w-full ${sizeClasses[size]} bg-white border border-stone-200 rounded-2xl shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto overflow-x-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50 rounded-t-2xl">
              {/* Green accent bar */}
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-emerald-500 rounded-full" />
                {title && (
                  <h3 className="text-base font-extrabold text-stone-900 tracking-tight">{title}</h3>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-200 rounded-xl transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-5 bg-white">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
