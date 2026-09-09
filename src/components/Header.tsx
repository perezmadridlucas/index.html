import React from 'react';
import { Calendar, Send, Users, FileText, History, Plane } from 'lucide-react';
import { UcamLogo } from './UcamLogo';
import { DailyPlan } from '../types';

interface HeaderProps {
  currentTab: 'schedule' | 'dispatch' | 'roster' | 'trip' | 'history' | 'progress';
  setCurrentTab: (tab: 'schedule' | 'dispatch' | 'roster' | 'trip' | 'history' | 'progress') => void;
  plan: DailyPlan;
  setPlan: React.Dispatch<React.SetStateAction<DailyPlan>>;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  plan,
  setPlan,
}) => {
  // Helpers to set date quickly to Tomorrow / Today
  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = d.toISOString().split('T')[0];
    setPlan(prev => ({
      ...prev,
      date: dateStr,
    }));
  };

  return (
    <header className="bg-stone-950 border-b border-stone-800/80 sticky top-0 z-40 shadow-xl">
      {/* Top Banner with Brand Colors */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-800 via-amber-500 to-blue-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* Logo & Identity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UcamLogo size={44} showText={true} glow={true} />
            </div>

            {/* Mobile Plan Date Pill */}
            <div className="md:hidden flex items-center gap-1.5 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800 text-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-stone-200">{plan.date}</span>
            </div>
          </div>

          {/* Center / Date Controls & Schedule Title */}
          <div className="flex flex-wrap items-center gap-2 bg-stone-900/90 border border-stone-800 p-1.5 rounded-xl">
            <div className="flex items-center gap-1.5 px-2 text-stone-300 text-xs font-medium">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Date:</span>
            </div>

            <input
              type="date"
              value={plan.date}
              onChange={(e) => setPlan(prev => ({ ...prev, date: e.target.value }))}
              className="bg-stone-950 border border-stone-700 text-stone-100 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 font-mono font-medium"
            />

            <button
              onClick={() => setQuickDate(1)}
              className="px-2 py-1 text-xs rounded bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-300 font-medium transition-colors cursor-pointer"
              title="Set to tomorrow"
            >
              Tomorrow
            </button>
            <button
              onClick={() => setQuickDate(0)}
              className="px-2 py-1 text-xs rounded bg-stone-800/60 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              title="Set to today"
            >
              Today
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-stone-800/80 pt-2 pb-2.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCurrentTab('schedule')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'schedule'
                ? 'bg-gradient-to-r from-red-800 to-red-700 text-white shadow-lg shadow-red-950 border border-red-500/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Schedule Planner</span>
            <span className="bg-stone-950/60 text-amber-300 text-[11px] px-1.5 py-0.5 rounded-full font-mono">
              {plan.items.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('dispatch')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'dispatch'
                ? 'bg-gradient-to-r from-red-800 to-red-700 text-white shadow-lg shadow-red-950 border border-red-500/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Send className="w-4 h-4 text-green-400" />
            <span>WhatsApp Dispatch</span>
          </button>

          <button
            onClick={() => setCurrentTab('roster')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'roster'
                ? 'bg-gradient-to-r from-red-800 to-red-700 text-white shadow-lg shadow-red-950 border border-red-500/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Roster & Contacts</span>
          </button>

          <button
            onClick={() => setCurrentTab('trip')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'trip'
                ? 'bg-gradient-to-r from-red-800 to-red-700 text-white shadow-lg shadow-red-950 border border-red-500/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Plane className="w-4 h-4 text-amber-400" />
            <span>Trip Planner</span>
          </button>

          <button
            onClick={() => setCurrentTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'history'
                ? 'bg-gradient-to-r from-red-800 to-red-700 text-white shadow-lg shadow-red-950 border border-red-500/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>Dispatch History</span>
          </button>

          <button
            onClick={() => setCurrentTab('progress')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap ml-auto cursor-pointer ${
              currentTab === 'progress'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'text-amber-400/90 hover:text-amber-300 bg-amber-950/40 border border-amber-700/30'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Progress & Guide</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
