import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const VideoModal = ({ isOpen, onClose, videoId, title }) => {
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

  if (!isOpen || !videoId) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-stone-950/90 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl bg-black animate-in fade-in zoom-in duration-300">
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center z-10 pointer-events-none">
          <h3 className="text-white font-bold tracking-wide drop-shadow-md">{title}</h3>
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all border border-white/10 shadow-lg pointer-events-auto"
          aria-label="Close video"
        >
          <FaTimes className="w-4 h-4" />
        </button>

        <div className="relative pt-[56.25%] w-full h-0">
          <iframe
            className="absolute inset-0 w-full h-full border-0"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
