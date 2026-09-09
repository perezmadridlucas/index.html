import React, { forwardRef } from 'react';
import { TripPlan, TeamMember } from '../types';
import { getLicenseVisual } from '../utils/licenseHelper';
import { 
  Plane, 
  Bus, 
  Train, 
  MapPin, 
  Calendar, 
  Clock, 
  Building2, 
  Sun, 
  ShieldAlert, 
  Users, 
  Shirt, 
  Dumbbell,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface TripDocumentPreviewProps {
  tripPlan: TripPlan;
  members: TeamMember[];
}

export const TripDocumentPreview = forwardRef<HTMLDivElement, TripDocumentPreviewProps>(({
  tripPlan,
  members
}, ref) => {
  // Helper to format staff position strictly in English only
  const formatEnglishRole = (role?: string) => {
    if (!role) return 'Staff';
    const trimmed = role.trim();

    // If it contains a slash (e.g. "Entrenador Principal / Head Coach"), check for English part
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/').map(p => p.trim());
      for (const part of parts) {
        const lower = part.toLowerCase();
        if (lower.includes('head coach')) return 'Head Coach';
        if (lower.includes('assistant coach')) return 'Assistant Coach';
        if (lower.includes('team manager') || lower.includes('team delegate')) return 'Team Manager';
        if (lower.includes('s&c') || lower.includes('strength')) return 'S&C Coach';
        if (lower.includes('head physio')) return 'Head Physiotherapist';
        if (lower.includes('physio')) return 'Physiotherapist';
        if (lower.includes('team doctor') || lower.includes('doctor')) return 'Team Doctor';
        if (lower.includes('medical staff')) return 'Medical Staff';
        if (lower.includes('general manager')) return 'General Manager';
        if (lower.includes('communications') || lower.includes('press')) return 'Press Officer';
        if (lower.includes('equipment')) return 'Equipment Manager';
        if (lower.includes('analytics')) return 'Video & Analytics';
        if (lower.includes('scouting')) return 'Scouting';
        if (lower.includes('assistant') || lower.includes('technical')) return 'Technical Assistant';
      }
    }

    const lower = trimmed.toLowerCase();
    if (lower.includes('head coach') || (lower.includes('entrenador') && lower.includes('principal'))) return 'Head Coach';
    if (lower.includes('assistant coach') || lower.includes('entrenador ayudante') || lower.includes('asistente técnico') || lower.includes('segundo')) return 'Assistant Coach';
    if (lower.includes('team manager') || lower.includes('delegado') || lower.includes('delegate')) return 'Team Manager';
    if (lower.includes('preparador') || lower.includes('s&c') || lower.includes('físico') || lower.includes('strength')) return 'S&C Coach';
    if (lower.includes('fisioterapeuta principal') || lower.includes('head physio')) return 'Head Physiotherapist';
    if (lower.includes('fisioterapeuta') || lower.includes('physio')) return 'Physiotherapist';
    if (lower.includes('médico') || lower.includes('doctor')) return 'Team Doctor';
    if (lower.includes('director general') || lower.includes('general manager')) return 'General Manager';
    if (lower.includes('prensa') || lower.includes('comunicación') || lower.includes('press')) return 'Press Officer';
    if (lower.includes('material') || lower.includes('equipment') || lower.includes('utillero')) return 'Equipment Manager';
    if (lower.includes('analytics') || lower.includes('analítica')) return 'Video & Analytics';
    if (lower.includes('scouting')) return 'Scouting';
    if (lower.includes('medical') || lower.includes('médic')) return 'Medical Staff';
    if (lower.includes('board') || lower.includes('directiv')) return 'Board Member';

    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  // Map player IDs to actual team member info
  const playerMembers = members
    .filter(m => m.role === 'player' && tripPlan.selectedPlayerIds.includes(m.id))
    .sort((a, b) => Number(a.jerseyNumber || 99) - Number(b.jerseyNumber || 99));

  // Resolve staff members from members list matching selectedStaffIds
  const staffMembersFromRoster = members
    .filter(m => (m.role === 'staff' || m.role === 'medical') && (tripPlan.selectedStaffIds || []).includes(m.id))
    .map(m => ({
      id: m.id,
      name: m.name,
      roleTitle: formatEnglishRole(m.position || (m.role === 'medical' ? 'Medical Staff' : 'Staff')),
    }));

  // Fallback to tripPlan.staffList if staffMembersFromRoster is empty
  const resolvedStaff = staffMembersFromRoster.length > 0
    ? staffMembersFromRoster
    : (tripPlan.staffList || [])
        .filter(st => !tripPlan.selectedStaffIds || tripPlan.selectedStaffIds.includes(st.id))
        .map(st => ({
          id: st.id,
          name: st.names,
          roleTitle: formatEnglishRole(st.roleTitle),
        }));

  // Outbound Cities
  const outboundCities = (tripPlan.outboundRouteCities || ['Alicante', 'Madrid', 'Barcelona'])
    .map(c => c.trim())
    .filter(Boolean);

  // Return Cities
  const returnCities = (tripPlan.returnRouteCities || ['Barcelona', 'Alicante'])
    .map(c => c.trim())
    .filter(Boolean);

  // Match Date & Time Split
  let matchDateClean = tripPlan.matchDate || '';
  let matchTimeClean = tripPlan.matchTime || '';

  if (!matchDateClean || !matchTimeClean) {
    const raw = tripPlan.matchDateTime || 'Thursday, June 4 – 19:00 hrs';
    if (raw.includes('–')) {
      const parts = raw.split('–');
      matchDateClean = matchDateClean || parts[0]?.trim() || 'Thursday, June 4';
      matchTimeClean = matchTimeClean || parts[1]?.trim() || '19:00 hrs';
    } else if (raw.includes('-')) {
      const parts = raw.split('-');
      matchDateClean = matchDateClean || parts[0]?.trim() || 'Thursday, June 4';
      matchTimeClean = matchTimeClean || parts[1]?.trim() || '19:00 hrs';
    } else {
      matchDateClean = matchDateClean || raw;
      matchTimeClean = matchTimeClean || '19:00 hrs';
    }
  }

  // Mode icon
  const getTransportIcon = (type?: string, details?: string) => {
    const text = (type || details || '').toLowerCase();
    if (text.includes('tren') || text.includes('train')) {
      return <Train className="w-3.5 h-3.5" />;
    }
    if (text.includes('autobús') || text.includes('bus')) {
      return <Bus className="w-3.5 h-3.5" />;
    }
    return <Plane className="w-3.5 h-3.5" />;
  };

  const getTransportLabel = (type?: string, details?: string) => {
    const text = (type || details || '').toLowerCase();
    if (text.includes('tren') || text.includes('train')) return 'Train';
    if (text.includes('autobús') || text.includes('bus')) return 'Team Bus';
    return 'Flight';
  };

  // Clean outbound arrival text: "Estimated arrival in Barcelona: 17:30 hrs"
  const cleanOutboundArrival = (() => {
    const destCity = tripPlan.outboundArrivalCity || tripPlan.city || 'Barcelona';
    const destTime = tripPlan.outboundArrivalTime || '17:30';
    if (!tripPlan.arrivalDestinationTime) {
      return `Estimated arrival in ${destCity}: ${destTime} hrs`;
    }
    let text = tripPlan.arrivalDestinationTime.trim();
    if (!text.toLowerCase().startsWith('estimated')) {
      text = `Estimated ${text.charAt(0).toLowerCase() + text.slice(1)}`;
    }
    return text.replace(/Arrival/g, 'arrival');
  })();

  // Clean return arrival text with lowercase "arrival"
  const cleanReturnArrival = (tripPlan.returnArrivalMurciaTime || 'arrival in Murcia: 11:00 hrs')
    .replace(/Estimated Arrival/i, 'Estimated arrival')
    .replace(/Arrival/g, 'arrival');

  // Clean hotel name without stars
  const cleanHotelName = (tripPlan.hotelName || 'Hotel Eurostars Grand Marina')
    .replace(/\s*5\*|\s*★+/g, '')
    .trim();

  // Clean Return Departure Point (Location)
  const returnDeparturePoint = (
    tripPlan.returnDepartureLocation ||
    tripPlan.hotelName ||
    'Hotel Eurostars Grand Marina'
  )
    .replace(/\s*5\*|\s*★+/g, '')
    .trim();

  // Clean Return Bus Departure Time
  const cleanReturnBusTime = (() => {
    const candidate = tripPlan.returnDepartureTime || tripPlan.hotelDepartureTime || '06:45 hrs';
    const cleanStr = candidate.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Look for standard HH:MM pattern (e.g., 06:45)
    const timeMatch = cleanStr.match(/\b\d{1,2}:\d{2}\b/);
    if (timeMatch) {
      return `${timeMatch[0]} hrs`;
    }

    // Fallback: strip any prefix like "Bus Departure:"
    const stripped = cleanStr.replace(/^(bus\s+departure|hotel\s+departure|departure)\s*:?\s*/i, '').trim();
    if (stripped) {
      return stripped.toLowerCase().endsWith('hrs') ? stripped : `${stripped} hrs`;
    }

    return '06:45 hrs';
  })();

  return (
    <div
      ref={ref}
      id="trip-pdf-document"
      className="bg-white text-stone-900 font-sans w-full max-w-[860px] mx-auto px-2.5 sm:px-3 py-2.5 shadow-2xl rounded-2xl border border-stone-200 print:border-0 print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full print:rounded-none"
      style={{ fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* 1. Header: Compact Executive Match Banner */}
      <div className="rounded-xl bg-slate-950 text-white px-4 py-2 mb-2 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-1.5">
          {/* Left: UCAM Logo + Competition & Round / Game Number */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-9 shrink-0 flex items-center justify-center">
              <img
                src="/ucam-logo.png"
                alt="UCAM Murcia CB Logo"
                className="w-full h-full object-contain filter drop-shadow-sm select-none"
                crossOrigin="anonymous"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== 'https://upload.wikimedia.org/wikipedia/commons/5/54/Escudo_Deportivo_UCAM_-_UCAM_Murcia_CF_-_UCAM_Murcia_CB.png') {
                    target.src = 'https://upload.wikimedia.org/wikipedia/commons/5/54/Escudo_Deportivo_UCAM_-_UCAM_Murcia_CF_-_UCAM_Murcia_CB.png';
                  }
                }}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-extrabold tracking-wide uppercase text-amber-300">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{tripPlan.competition || 'Liga Endesa'}</span>
              </div>
              {(tripPlan.gameNumber || tripPlan.roundTitle) && (
                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-[10px] font-black tracking-wider uppercase text-amber-200">
                  <span>{tripPlan.gameNumber || tripPlan.roundTitle}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Club & Itinerary Title */}
          <div className="text-left sm:text-right">
            <span className="text-xs font-black text-white tracking-wider uppercase block">
              UCAM MURCIA CB
            </span>
            <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest block">
              TEAM TRAVEL ITINERARY
            </span>
          </div>
        </div>

        {/* Compact Matchup */}
        <div className="flex items-center justify-between pt-1.5 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm sm:text-base font-black uppercase tracking-tight text-white">
              {tripPlan.rivalName || 'Barça'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-[9px] font-black tracking-widest text-amber-300 uppercase">
              VS
            </span>
            <span className="text-sm sm:text-base font-black uppercase tracking-tight text-amber-300">
              UCAM MURCIA CB
            </span>
          </div>

          {/* Destination Badge */}
          <div className="text-[10px] font-bold text-slate-200 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 shrink-0">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span className="uppercase tracking-wider font-extrabold">{tripPlan.city || 'Barcelona'}</span>
          </div>
        </div>
      </div>

      {/* 2. Outbound Journey Card */}
      <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 mb-2 shadow-sm space-y-1.5">
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              {getTransportIcon(tripPlan.transportType, tripPlan.flightOutboundDetails)}
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                1. Outbound Journey
              </h3>
            </div>
          </div>
        </div>

        {/* High-impact Departure Date & Time Hero Banner */}
        <div className="bg-slate-900 text-white rounded-xl p-2 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Calendar className="w-3 h-3" />
            </div>
            <div>
              <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block">Departure Date</span>
              <span className="text-xs font-black text-white tracking-tight">
                {tripPlan.departureDay || 'Wednesday, June 3'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <span className="text-[8.5px] font-bold text-amber-400 uppercase tracking-widest block">Bus Departure</span>
              <span className="text-xs font-black text-amber-300 font-mono">
                {tripPlan.busDepartureTime || '10:15 hrs'}
              </span>
            </div>
            <div className="bg-white/10 px-2 py-0.5 rounded-lg border border-white/15 text-[10px] font-bold text-slate-200 flex items-center gap-1">
              <span>🏟️</span>
              <span>{tripPlan.busDepartureLocation || 'Palacio de Deportes'}</span>
            </div>
          </div>
        </div>

        {/* Unified Transport Section (Cities, Schedules, Arrival) */}
        <div className="bg-white rounded-xl p-2 border border-stone-200 shadow-2xs space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-extrabold uppercase flex items-center gap-1">
                {getTransportIcon(tripPlan.transportType, tripPlan.flightOutboundDetails)}
                {getTransportLabel(tripPlan.transportType, tripPlan.flightOutboundDetails)}
              </span>
            </div>

            {/* Arrival Destination & Time Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-black shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{cleanOutboundArrival}</span>
            </div>
          </div>

          {/* Route Cities Flow */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 bg-stone-50 rounded-lg border border-stone-200/70">
            {outboundCities.map((city, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md bg-white border border-stone-200 text-xs font-bold text-slate-800 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>{city}</span>
                </div>
                {idx < outboundCities.length - 1 && (
                  <div className="flex items-center text-slate-400 shrink-0 px-0.5">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Transport Schedule */}
          <div className="flex items-center gap-2 pt-1 border-t border-stone-100 text-xs">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Schedule / Flight Details:</span>
            <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100">
              {tripPlan.flightOutboundDetails.includes(':') 
                ? tripPlan.flightOutboundDetails.split(':').slice(1).join(':').trim() 
                : tripPlan.flightOutboundDetails}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Two-Column Grid: Accommodation & Weather Forecast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        {/* Hotel Card - Centered (No stars, clean hotel name & location) */}
        <div className="rounded-xl border border-stone-200 bg-white p-2.5 shadow-sm flex flex-col justify-between items-center text-center">
          <div className="w-full flex items-center justify-between border-b border-stone-100 pb-1 mb-1">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                2. Accommodation
              </h3>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-2 space-y-1 w-full my-auto">
            <div className="text-sm font-black text-slate-900 leading-tight">
              {cleanHotelName}
            </div>
            <div className="text-[11px] font-bold text-stone-600 flex items-center justify-center gap-1.5">
              <MapPin className="w-3 h-3 text-amber-600" />
              <span>{tripPlan.city || 'Barcelona'}</span>
            </div>
          </div>
        </div>

        {/* Weather Forecast Card */}
        <div className="rounded-xl border border-stone-200 bg-white p-2.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-stone-100 pb-1 mb-1">
            <div className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                3. Weather Forecast
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 my-auto">
            {tripPlan.weatherForecasts.map((w) => (
              <div key={w.id} className="bg-stone-50 rounded-lg p-1.5 border border-stone-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[9.5px] font-bold text-stone-500 block uppercase">{w.dayLabel}</span>
                  <span className="text-xs font-extrabold text-slate-900">{w.tempRange}</span>
                </div>
                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Sun className="w-3 h-3 fill-amber-400 text-amber-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Two-Column Grid: Practice Sessions on Left (Point 4) & Game Day & Arena on Right (Point 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        {/* Point 4 on Left: Practice Sessions */}
        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50/40 via-white to-stone-50 p-2.5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between border-b border-purple-200/70 pb-1">
            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-purple-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                4. Practice Sessions
              </h3>
            </div>
          </div>

          <div className="space-y-1">
            {tripPlan.practices && tripPlan.practices.length > 0 ? (
              tripPlan.practices.map((p, idx) => {
                const parts = p.split(':');
                const dayText = parts[0]?.trim() || `Session ${idx + 1}`;
                const timeText = parts.slice(1).join(':').trim() || '';

                return (
                  <div key={idx} className="bg-white rounded-lg p-1.5 border border-purple-100 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-black uppercase text-purple-900 tracking-wider flex items-center gap-1">
                        <span>🏀</span>
                        <span>{dayText}</span>
                      </span>
                      <span className="text-[8.5px] font-extrabold uppercase text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                        Session #{idx + 1}
                      </span>
                    </div>
                    {timeText && (
                      <div className="flex items-center gap-1.5 bg-slate-900 text-white px-2 py-0.5 rounded-md">
                        <Clock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                        <span className="font-mono text-[11px] font-black text-amber-300 tracking-wide">
                          {timeText}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-stone-400 italic p-2 bg-white rounded-lg border border-stone-200 text-center">
                No scheduled training sessions
              </div>
            )}
          </div>
        </div>

        {/* Point 5 on Right: Game Day & Arena */}
        <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50/40 via-white to-stone-50 p-2.5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between border-b border-red-200/70 pb-1">
            <div className="flex items-center gap-1.5">
              <Shirt className="w-3.5 h-3.5 text-red-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                5. Game Day & Arena
              </h3>
            </div>
          </div>

          {/* Two Distinct Match Date & Match Time Panels */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* 1. Match Date Panel */}
            <div className="bg-red-900 text-white rounded-lg p-1.5 shadow-sm flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 font-bold text-xs shrink-0">
                📅
              </div>
              <div className="overflow-hidden">
                <span className="text-[8.5px] font-bold text-red-200 uppercase tracking-widest block">Date</span>
                <span className="text-[11px] font-black text-white tracking-tight truncate block">
                  {matchDateClean}
                </span>
              </div>
            </div>

            {/* 2. Match Time Panel */}
            <div className="bg-slate-900 text-white rounded-lg p-1.5 shadow-sm flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                ⏰
              </div>
              <div className="overflow-hidden">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block">Time</span>
                <span className="text-[11px] font-black text-amber-300 font-mono tracking-wide truncate block">
                  {matchTimeClean}
                </span>
              </div>
            </div>
          </div>

          {/* Arena & Uniform / Kit Badges */}
          <div className="bg-white rounded-lg p-1.5 border border-stone-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">🏟️</span>
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                  {tripPlan.arenaName || 'Palau Blaugrana'}
                </span>
              </div>
              <span className="text-[9.5px] font-bold text-stone-500 uppercase">{tripPlan.city || 'Barcelona'}</span>
            </div>

            {/* Uniform & Kit Distinct Badges */}
            <div className="pt-1 border-t border-stone-100 flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[9.5px] font-bold text-stone-500 uppercase">Uniform:</span>
                <span className={`px-2 py-0.5 rounded text-[9.5px] font-black border ${
                  (tripPlan.uniformColor || 'Cream').toLowerCase() === 'red'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : (tripPlan.uniformColor || 'Cream').toLowerCase() === 'blue'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}>
                  {tripPlan.uniformColor || 'Cream'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9.5px] font-bold text-stone-500 uppercase">Kit:</span>
                <span className={`px-2 py-0.5 rounded text-[9.5px] font-black border ${
                  (tripPlan.kitColor || 'White').toLowerCase() === 'black'
                    ? 'bg-stone-900 text-white border-stone-700'
                    : 'bg-stone-100 text-stone-800 border-stone-300'
                }`}>
                  {tripPlan.kitColor || 'White'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Return Journey Card */}
      <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 mb-2 shadow-sm space-y-1.5">
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              {getTransportIcon(tripPlan.returnTransportType, tripPlan.flightReturnDetails)}
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                6. Return Journey
              </h3>
            </div>
          </div>
        </div>

        {/* High-impact Return Date & Bus Departure Time Banner */}
        <div className="bg-slate-900 text-white rounded-xl p-2 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
              <Calendar className="w-3 h-3" />
            </div>
            <div>
              <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block">Return Date</span>
              <span className="text-xs font-black text-white tracking-tight">
                {tripPlan.returnDepartureDay || 'Friday, June 5'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="text-right whitespace-nowrap">
              <span className="text-[8.5px] font-bold text-amber-400 uppercase tracking-widest block leading-tight">Bus Departure</span>
              <span className="text-xs font-black text-amber-300 font-mono tracking-wider">
                {cleanReturnBusTime}
              </span>
            </div>
            <div className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/15 text-[10px] font-bold text-slate-200 flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
              <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-extrabold tracking-tight truncate max-w-[180px]">
                {returnDeparturePoint}
              </span>
            </div>
          </div>
        </div>

        {/* Unified Transport Section (Cities, Schedules, Arrival in Murcia) */}
        <div className="bg-white rounded-xl p-2 border border-stone-200 shadow-2xs space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-extrabold uppercase flex items-center gap-1">
                {getTransportIcon(tripPlan.returnTransportType, tripPlan.flightReturnDetails)}
                {getTransportLabel(tripPlan.returnTransportType, tripPlan.flightReturnDetails)}
              </span>
            </div>

            {/* Arrival Destination & Time Pill (with 'arrival' in lowercase) */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-black shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="normal-case">{cleanReturnArrival}</span>
            </div>
          </div>

          {/* Route Cities Flow */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 bg-stone-50 rounded-lg border border-stone-200/70">
            {returnCities.map((city, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md bg-white border border-stone-200 text-xs font-bold text-slate-800 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <span>{city}</span>
                </div>
                {idx < returnCities.length - 1 && (
                  <div className="flex items-center text-slate-400 shrink-0 px-0.5">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Transport Schedule */}
          <div className="flex items-center gap-2 pt-1 border-t border-stone-100 text-xs">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Schedule / Flight Details:</span>
            <span className="font-mono text-[11px] font-bold text-indigo-900 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-100">
              {tripPlan.flightReturnDetails.includes(':') 
                ? tripPlan.flightReturnDetails.split(':').slice(1).join(':').trim() 
                : tripPlan.flightReturnDetails}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Two-Column Grid: Staff Roster (Point 7) & Travel Roster (Point 8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        {/* Point 7: Staff Roster (Strictly English cargo, fully visible without scrolling) */}
        <div className="rounded-xl border border-stone-200 bg-white p-2.5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-1">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                7. Staff Roster
              </h3>
            </div>
            <span className="text-[9.5px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              {resolvedStaff.length} Staff
            </span>
          </div>

          <div className="space-y-1 text-[10px]">
            {resolvedStaff.length > 0 ? (
              resolvedStaff.map((st) => (
                <div key={st.id} className="flex items-center justify-between gap-1.5 px-2 py-0.5 rounded bg-stone-50 border border-stone-200/60">
                  <span className="text-[9px] font-semibold text-stone-600 truncate max-w-[190px]">
                    {st.roleTitle}
                  </span>
                  <span className="font-extrabold text-slate-900 text-[9.5px] uppercase truncate tracking-tight text-right">
                    {st.name}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-stone-400 italic text-xs">No staff members selected</span>
            )}
          </div>
        </div>

        {/* Point 8: Travel Roster Players (Fully visible without scrolling) */}
        <div className="rounded-xl border border-stone-200 bg-white p-2.5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-1">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                8. Travel Roster
              </h3>
            </div>
            <span className="text-[9.5px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {playerMembers.length} Players
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[10px]">
            {playerMembers.length > 0 ? (
              playerMembers.map((p) => {
                const visual = getLicenseVisual(p.license);
                return (
                  <div key={p.id} className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-stone-50 border border-stone-200/60">
                    <span 
                      className="w-4 h-4 rounded font-extrabold text-[8.5px] flex items-center justify-center shrink-0 shadow-xs"
                      style={visual.pdfBadgeStyle}
                      title={`${p.name} - Licencia: ${visual.label}`}
                    >
                      {p.jerseyNumber !== undefined ? p.jerseyNumber : '•'}
                    </span>
                    <span className="font-extrabold text-slate-900 text-[9.5px] uppercase truncate tracking-tight">
                      {p.name}
                    </span>
                  </div>
                );
              })
            ) : (
              <span className="text-stone-400 italic text-xs col-span-2">No players selected</span>
            )}
          </div>

          {/* License Color Code Legend */}
          <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-stone-100 text-[7.5px] font-bold text-stone-600">
            <span className="text-stone-400 uppercase font-black tracking-wider text-[7px]">Lic.:</span>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-0.5" title="Foreign player: número amarillo con fondo negro">
                <span className="w-2.5 h-2.5 rounded-xs inline-block" style={{ backgroundColor: '#0f172a' }}></span>
                <span className="text-stone-700">Foreign</span>
              </span>
              <span className="flex items-center gap-0.5" title="European - Cotonou: número amarillo con fondo azul">
                <span className="w-2.5 h-2.5 rounded-xs inline-block" style={{ backgroundColor: '#1d4ed8' }}></span>
                <span className="text-stone-700">Cotonou</span>
              </span>
              <span className="flex items-center gap-0.5" title="Home grown (ACB): número amarillo con fondo rojo">
                <span className="w-2.5 h-2.5 rounded-xs inline-block" style={{ backgroundColor: '#dc2626' }}></span>
                <span className="text-stone-700">JFL (ACB)</span>
              </span>
              <span className="flex items-center gap-0.5" title="Home grown (BCL): número amarillo con fondo rojo y azul diagonal">
                <span 
                  className="w-2.5 h-2.5 rounded-xs inline-block border border-stone-300"
                  style={{ backgroundImage: 'linear-gradient(135deg, #dc2626 50%, #1d4ed8 50%)' }}
                ></span>
                <span className="text-stone-700">JFL (BCL)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Dress Code, Guidelines & Mandatory Documentation */}
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-2.5 shadow-sm text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-amber-200/80 pb-1.5 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900">Dress Code:</span>
            <span className="font-extrabold text-amber-900 uppercase bg-amber-100 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
              {tripPlan.dressCodeTravel || 'official team clothing'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900">Guidelines:</span>
            <span className="font-extrabold text-amber-900 uppercase bg-amber-100 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
              {tripPlan.comments || 'internal rules team'}
            </span>
          </div>
        </div>

        {/* Mandatory Documentation */}
        <div className="flex items-center justify-center gap-2 text-center font-black text-xs uppercase tracking-wider text-red-700 bg-red-100/70 border border-red-200 py-1 px-3 rounded-lg">
          <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span>ID / Passport: {tripPlan.importantNotice || "Don't forget your documentation"}</span>
        </div>
      </div>
    </div>
  );
});

TripDocumentPreview.displayName = 'TripDocumentPreview';

