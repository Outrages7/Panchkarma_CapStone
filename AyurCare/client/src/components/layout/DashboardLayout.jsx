import { useState } from "react";
import Sidebar from "./Sidebar";
import NotificationPanel from "./NotificationPanel";
import SessionFollowUp from "./SessionFollowUp";
import ThemeToggle from "../common/ThemeToggle";
import { FaSearch } from "react-icons/fa";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans text-stone-900 dark:text-stone-300 selection:bg-emerald-200 selection:text-emerald-900 dark:selection:bg-emerald-500/30 dark:selection:text-emerald-200 transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 h-[72px] flex-shrink-0 transition-colors duration-300">
          <div className="h-full flex items-center justify-between px-6 lg:px-10">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-800 rounded-xl transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Optional Search / Left area (empty for now, keeps structure) */}
            <div className="hidden sm:flex items-center text-stone-400 dark:text-stone-500 bg-stone-100/50 dark:bg-stone-900 px-3 py-2 rounded-lg border border-stone-200/50 dark:border-stone-800 focus-within:border-emerald-500/50 dark:focus-within:border-emerald-500/50 focus-within:bg-white dark:focus-within:bg-stone-950 transition-colors w-64 lg:ml-0 ml-4 group">
              <FaSearch className="w-4 h-4 mr-2 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-full text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-600"
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-auto">
              <ThemeToggle />
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
