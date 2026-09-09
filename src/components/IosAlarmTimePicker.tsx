import React, { useState, useEffect, useRef } from 'react';
import { Clock, Bell, ChevronUp, ChevronDown, Check } from 'lucide-react';

interface IosAlarmTimePickerProps {
  value: string; // e.g. "10:45 AM", "07:30 PM", "19:30", "10:00"
  onChange: (timeStr: string) => void;
  label?: string;
  isEndTime?: boolean;
  format24h?: boolean;
}

export const IosAlarmTimePicker: React.FC<IosAlarmTimePickerProps> = ({
  value,
  onChange,
  label = 'Start Time',
  isEndTime = false,
  format24h = false,
}) => {
  // Parse initial time
  const parseTimeString = (time: string) => {
    let hour = 10;
    let minute = 45;
    let period: 'AM' | 'PM' = 'AM';

    if (!time) return { hour: 10, minute: 0, period: 'AM' as const };

    const clean = time.trim().toUpperCase();
    const hasAmPm = clean.includes('AM') || clean.includes('PM');

    if (hasAmPm) {
      period = clean.includes('PM') ? 'PM' : 'AM';
      const timePart = clean.replace(/AM|PM/g, '').trim();
      const parts = timePart.split(':');
      if (parts.length >= 2) {
        hour = parseInt(parts[0], 10) || 12;
        minute = parseInt(parts[1], 10) || 0;
      }
    } else {
      const parts = clean.split(':');
      if (parts.length >= 2) {
        const rawHour = parseInt(parts[0], 10) || 0;
        minute = parseInt(parts[1], 10) || 0;
        if (rawHour >= 12) {
          period = 'PM';
          hour = rawHour === 12 ? 12 : rawHour - 12;
        } else {
          period = 'AM';
          hour = rawHour === 0 ? 12 : rawHour;
        }
      }
    }

    if (hour < 1) hour = 12;
    if (hour > 12) hour = 12;
    if (minute < 0) minute = 0;
    if (minute > 59) minute = 59;

    return { hour, minute, period };
  };

  const initial = parseTimeString(value);
  const [selectedHour, setSelectedHour] = useState<number>(initial.hour);
  const [selectedMinute, setSelectedMinute] = useState<number>(initial.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(initial.period);

  // Sync with value prop if it changes externally
  useEffect(() => {
    const parsed = parseTimeString(value);
    setSelectedHour(parsed.hour);
    setSelectedMinute(parsed.minute);
    setSelectedPeriod(parsed.period);
  }, [value]);

  const updateTime = (h: number, m: number, p: 'AM' | 'PM') => {
    setSelectedHour(h);
    setSelectedMinute(m);
    setSelectedPeriod(p);
    
    if (format24h) {
      let h24 = h;
      if (p === 'PM' && h < 12) h24 = h + 12;
      if (p === 'AM' && h === 12) h24 = 0;
      const formatted24 = `${h24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      onChange(formatted24);
    } else {
      const formattedHour = h.toString().padStart(2, '0');
      const formattedMinute = m.toString().padStart(2, '0');
      onChange(`${formattedHour}:${formattedMinute} ${p}`);
    }
  };

  // Hour options (1 to 12)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  // Minute options (0 to 59)
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // Wheel scrolling helper
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);

  // Scroll to active items smoothly
  useEffect(() => {
    if (hourScrollRef.current) {
      const activeEl = hourScrollRef.current.querySelector(`[data-hour="${selectedHour}"]`) as HTMLElement;
      if (activeEl) {
        hourScrollRef.current.scrollTop = activeEl.offsetTop - hourScrollRef.current.clientHeight / 2 + activeEl.clientHeight / 2;
      }
    }
  }, [selectedHour]);

  useEffect(() => {
    if (minuteScrollRef.current) {
      const activeEl = minuteScrollRef.current.querySelector(`[data-minute="${selectedMinute}"]`) as HTMLElement;
      if (activeEl) {
        minuteScrollRef.current.scrollTop = activeEl.offsetTop - minuteScrollRef.current.clientHeight / 2 + activeEl.clientHeight / 2;
      }
    }
  }, [selectedMinute]);

  const incrementHour = (delta: number) => {
    let next = selectedHour + delta;
    if (next > 12) next = 1;
    if (next < 1) next = 12;
    updateTime(next, selectedMinute, selectedPeriod);
  };

  const incrementMinute = (delta: number) => {
    let next = selectedMinute + delta;
    let nextPeriod = selectedPeriod;
    let nextHour = selectedHour;

    if (next >= 60) {
      next = next % 60;
      nextHour = selectedHour === 12 ? 1 : selectedHour + 1;
    } else if (next < 0) {
      next = 60 + next;
      nextHour = selectedHour === 1 ? 12 : selectedHour - 1;
    }
    updateTime(nextHour, next, nextPeriod);
  };

  // Quick preset times from 10:00 to 12:00 divided into 15-minute intervals
  const presetTimes = [
    { label: '10:00 AM', h: 10, m: 0, p: 'AM' as const },
    { label: '10:15 AM', h: 10, m: 15, p: 'AM' as const },
    { label: '10:30 AM', h: 10, m: 30, p: 'AM' as const },
    { label: '10:45 AM', h: 10, m: 45, p: 'AM' as const },
    { label: '11:00 AM', h: 11, m: 0, p: 'AM' as const },
    { label: '11:15 AM', h: 11, m: 15, p: 'AM' as const },
    { label: '11:30 AM', h: 11, m: 30, p: 'AM' as const },
    { label: '11:45 AM', h: 11, m: 45, p: 'AM' as const },
    { label: '12:00 PM', h: 12, m: 0, p: 'PM' as const },
  ];

  const formattedDisplay = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')} ${selectedPeriod}`;

  return (
    <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-4 shadow-2xl space-y-3 font-sans">
      
      {/* iOS Clock Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#2c2c2e]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
              {label}
            </span>
          </div>
        </div>

        {/* Digital Readout Display */}
        <div className="px-3 py-1 bg-[#2c2c2e] border border-stone-700/60 rounded-xl flex items-center gap-1.5 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono font-black text-amber-400 text-sm tracking-wider">
            {formattedDisplay}
          </span>
        </div>
      </div>

      {/* iOS Wheel Alarm Drum Container */}
      <div className="relative bg-[#000000] border border-[#2c2c2e] rounded-xl p-2 py-3 overflow-hidden shadow-inner flex justify-center items-center">
        
        {/* Horizontal Selection Lens / Bar (iOS Style) */}
        <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 h-10 bg-[#2c2c2e]/60 border-y border-[#3a3a3c] rounded-lg pointer-events-none z-0" />

        {/* 3 Wheel Columns: Hours, Minutes, AM/PM */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] relative z-10">
          
          {/* 1. Hour Drum */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => incrementHour(-1)}
              className="p-1 text-stone-500 hover:text-amber-400 transition"
              title="Previous hour"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            <div 
              ref={hourScrollRef}
              className="h-28 overflow-y-auto scrollbar-none snap-y snap-mandatory flex flex-col items-center py-8 w-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {hours.map((h) => {
                const isSelected = h === selectedHour;
                return (
                  <div
                    key={h}
                    data-hour={h}
                    onClick={() => updateTime(h, selectedMinute, selectedPeriod)}
                    className={`snap-center h-9 flex items-center justify-center w-full font-mono transition cursor-pointer select-none ${
                      isSelected
                        ? 'text-2xl font-black text-white scale-110'
                        : 'text-base font-medium text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    {h.toString().padStart(2, '0')}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => incrementHour(1)}
              className="p-1 text-stone-500 hover:text-amber-400 transition"
              title="Next hour"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-bold text-stone-500 mt-0.5">HOURS</span>
          </div>

          {/* 2. Minute Drum */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => incrementMinute(-5)}
              className="p-1 text-stone-500 hover:text-amber-400 transition"
              title="-5 minutes"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            <div 
              ref={minuteScrollRef}
              className="h-28 overflow-y-auto scrollbar-none snap-y snap-mandatory flex flex-col items-center py-8 w-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {minutes.map((m) => {
                const isSelected = m === selectedMinute;
                return (
                  <div
                    key={m}
                    data-minute={m}
                    onClick={() => updateTime(selectedHour, m, selectedPeriod)}
                    className={`snap-center h-9 flex items-center justify-center w-full font-mono transition cursor-pointer select-none ${
                      isSelected
                        ? 'text-2xl font-black text-white scale-110'
                        : 'text-base font-medium text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    {m.toString().padStart(2, '0')}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => incrementMinute(5)}
              className="p-1 text-stone-500 hover:text-amber-400 transition"
              title="+5 minutes"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-bold text-stone-500 mt-0.5">MIN</span>
          </div>

          {/* 3. AM / PM Segmented Drum */}
          <div className="flex flex-col items-center justify-center">
            <div className="h-28 flex flex-col justify-center gap-2 w-full px-2">
              <button
                type="button"
                onClick={() => updateTime(selectedHour, selectedMinute, 'AM')}
                className={`py-2 px-3 rounded-lg text-xs font-black transition cursor-pointer text-center ${
                  selectedPeriod === 'AM'
                    ? 'bg-amber-500 text-black shadow-md scale-105 font-bold'
                    : 'bg-[#2c2c2e] text-stone-400 hover:text-stone-200'
                }`}
              >
                AM
              </button>

              <button
                type="button"
                onClick={() => updateTime(selectedHour, selectedMinute, 'PM')}
                className={`py-2 px-3 rounded-lg text-xs font-black transition cursor-pointer text-center ${
                  selectedPeriod === 'PM'
                    ? 'bg-amber-500 text-black shadow-md scale-105 font-bold'
                    : 'bg-[#2c2c2e] text-stone-400 hover:text-stone-200'
                }`}
              >
                PM
              </button>
            </div>
            <span className="text-[10px] font-bold text-stone-500 mt-0.5">PERIOD</span>
          </div>
        </div>
      </div>

      {/* Common Presets */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-stone-400">
          <span className="font-bold">Quick Presets:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {presetTimes.map((pt) => {
            const isMatch = pt.h === selectedHour && pt.m === selectedMinute && pt.p === selectedPeriod;
            return (
              <button
                type="button"
                key={pt.label}
                onClick={() => updateTime(pt.h, pt.m, pt.p)}
                className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg shrink-0 transition cursor-pointer ${
                  isMatch
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-[#2c2c2e] hover:bg-stone-700 text-stone-300'
                }`}
              >
                {pt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
