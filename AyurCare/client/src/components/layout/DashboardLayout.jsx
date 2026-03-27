import { useState } from "react";
import Sidebar from "./Sidebar";
import NotificationPanel from "./NotificationPanel";
import SessionFollowUp from "./SessionFollowUp";
import { FaSearch } from "react-icons/fa";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200 h-[72px] flex-shrink-0">
          <div className="h-full flex items-center justify-between px-6 lg:px-10">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Optional Search / Left area (empty for now, keeps structure) */}
            <div className="hidden sm:flex items-center text-stone-400 bg-stone-100/50 px-3 py-2 rounded-lg border border-stone-200/50 focus-within:border-emerald-500/50 focus-within:bg-white transition-colors w-64 lg:ml-0 ml-4">
              <FaSearch className="w-4 h-4 mr-2" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-full text-stone-800 placeholder-stone-400"
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-auto">
              <NotificationPanel />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-10 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Session follow-up popups/banners */}
      <SessionFollowUp />
    </div>
  );
};

export default DashboardLayout;
