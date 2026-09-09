import React, { useState, useRef, useEffect } from 'react';
import { 
  Plane, Download, Printer, Copy, Check, Sparkles, 
  MapPin, Building, Sun, Shirt, Users, Calendar, 
  Clock, Plus, Trash2, RotateCcw, Eye, Edit3, ShieldAlert, ChevronDown, ChevronUp
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TripPlan, TeamMember } from '../types';
import { DEFAULT_TRIP_PLAN, RIVAL_TEAMS, DEFAULT_TRIP_STAFF } from '../data/defaultTripPlan';
import { TripDocumentPreview } from './TripDocumentPreview';
import { IosAlarmTimePicker } from './IosAlarmTimePicker';
import { exportTripPlanToPDF, exportTripPlanToImage } from '../utils/pdfExport';
import { safeStorage } from '../utils/safeStorage';
import { getLicenseVisual } from '../utils/licenseHelper';

interface TripPlannerProps {
  members: TeamMember[];
}

export const TripPlanner: React.FC<TripPlannerProps> = ({ members }) => {
  const [tripPlan, setTripPlan] = useState<TripPlan>(() => {
    const saved = safeStorage.getItem('ucam_trip_plan_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Sanitize any previous parentheses injected into hotelDepartureTime
        if (parsed.hotelDepartureTime && parsed.hotelDepartureTime.includes('(')) {
          const match = parsed.hotelDepartureTime.match(/\(([^)]+)\)/);
          if (match && !parsed.returnDepartureLocation) {
            parsed.returnDepartureLocation = match[1].trim();
          }
          parsed.hotelDepartureTime = parsed.hotelDepartureTime.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved trip plan', e);
      }
    }
    return DEFAULT_TRIP_PLAN;
  });

  const [activeView, setActiveView] = useState<'split' | 'editor' | 'preview'>('split');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // States for interactive Date & iOS Time Pickers
  const [showDepartureTimePicker, setShowDepartureTimePicker] = useState(false);
  const [showOutboundArrivalTimePicker, setShowOutboundArrivalTimePicker] = useState(false);
  const [showReturnDepartureTimePicker, setShowReturnDepartureTimePicker] = useState(false);
  const [showReturnArrivalTimePicker, setShowReturnArrivalTimePicker] = useState(false);
  const [showMatchTimePicker, setShowMatchTimePicker] = useState(false);
  const [activePracticeClockIndex, setActivePracticeClockIndex] = useState<number | null>(null);

  const [dateInputValue, setDateInputValue] = useState(() => '2026-06-03');
  const [returnDateInputValue, setReturnDateInputValue] = useState(() => '2026-06-05');
  const [matchDateInputValue, setMatchDateInputValue] = useState(() => '2026-06-04');

  const previewRef = useRef<HTMLDivElement>(null);

  // Save to safeStorage
  useEffect(() => {
    safeStorage.setItem('ucam_trip_plan_v2', JSON.stringify(tripPlan));
  }, [tripPlan]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper for Rival input that auto-generates match title
  const handleRivalNameChange = (newRivalName: string) => {
    const trimmed = newRivalName.trim();
    const autoTitle = trimmed ? `${trimmed} vs. UCAM Murcia CB` : 'vs. UCAM Murcia CB';
    
    // Check if rival exists in database to suggest arena and logo
    const matchedRival = RIVAL_TEAMS.find(r => 
      r.name.toLowerCase().includes(trimmed.toLowerCase()) || 
      r.shortName.toLowerCase() === trimmed.toLowerCase() ||
      trimmed.toLowerCase().includes(r.shortName.toLowerCase())
    );

    setTripPlan(prev => ({
      ...prev,
      rivalName: newRivalName,
      matchTitle: autoTitle,
      arenaName: matchedRival ? matchedRival.arena : prev.arenaName,
      city: matchedRival ? matchedRival.city : prev.city,
      rivalLogoUrl: matchedRival ? matchedRival.logoUrl : prev.rivalLogoUrl,
    }));
  };

  // Helper for departure calendar date change -> English formatting
  const handleDepartureDateChange = (isoDate: string) => {
    setDateInputValue(isoDate);
    if (!isoDate) return;
    try {
      const [year, month, day] = isoDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const formatted = `${days[d.getDay()]}, ${months[month - 1]} ${day}`;
      setTripPlan(prev => ({ ...prev, departureDay: formatted }));
    } catch (e) {
      console.error('Error formatting date', e);
    }
  };

  // Helper for departure time picker
  const handleDepartureTimeChange = (timeStr: string) => {
    setTripPlan(prev => ({ ...prev, busDepartureTime: `${timeStr} hrs` }));
  };

  // Helper for Departure Location presets
  const handleSetDepartureLocationType = (type: 'palacio' | 'custom') => {
    if (type === 'palacio') {
      setTripPlan(prev => ({
        ...prev,
        departureLocationType: 'palacio',
        busDepartureLocation: 'Palacio de Deportes'
      }));
      showToast('Departure location set to Palacio de Deportes');
    } else {
      setTripPlan(prev => ({
        ...prev,
        departureLocationType: 'custom',
        busDepartureLocation: prev.busDepartureLocation === 'Palacio de Deportes' ? '' : prev.busDepartureLocation
      }));
    }
  };

  // Helper for Outbound Route slots
  const handleOutboundRouteSlotChange = (slotIndex: number, value: string) => {
    setTripPlan(prev => {
      const currentSlots = [...(prev.outboundRouteCities || ['Alicante', 'Madrid', 'Barcelona', ''])];
      while (currentSlots.length < 4) currentSlots.push('');
      currentSlots[slotIndex] = value;
      
      const filledCities = currentSlots.map(c => c.trim()).filter(Boolean);
      const routeStr = filledCities.join(' - ');
      
      const currentType = prev.transportType || 'Avión';
      const typeWord = currentType === 'Avión' ? 'Flight' : currentType === 'Tren' ? 'Train' : 'Bus';
      const currentSched = prev.transportSchedule || '';
      const combined = currentSched ? `${typeWord} ${routeStr}: ${currentSched}` : `${typeWord} ${routeStr}`;

      return {
        ...prev,
        outboundRouteCities: currentSlots,
        transportRoute: routeStr,
        flightOutboundDetails: combined
      };
    });
  };

  // Helper for Outbound Schedule slots
  const handleOutboundScheduleSlotChange = (slotIndex: number, value: string) => {
    setTripPlan(prev => {
      const currentSlots = [...(prev.outboundScheduleSlots || ['12:30 – 13:35 (UX4042)', '15:10 – 16:35 (UX7703)', '', ''])];
      while (currentSlots.length < 4) currentSlots.push('');
      currentSlots[slotIndex] = value;

      const filledScheds = currentSlots.map(s => s.trim()).filter(Boolean);
      const schedStr = filledScheds.join(' / ');

      const currentType = prev.transportType || 'Avión';
      const typeWord = currentType === 'Avión' ? 'Flight' : currentType === 'Tren' ? 'Train' : 'Bus';
      const currentRoute = prev.transportRoute || '';
      const combined = currentRoute ? `${typeWord} ${currentRoute}: ${schedStr}` : `${typeWord}: ${schedStr}`;

      return {
        ...prev,
        outboundScheduleSlots: currentSlots,
        transportSchedule: schedStr,
        flightOutboundDetails: combined
      };
    });
  };

  // Helper for Outbound Transport Type
  const handleOutboundTransportTypeChange = (type: 'Autobús' | 'Tren' | 'Avión') => {
    setTripPlan(prev => {
      const typeWord = type === 'Avión' ? 'Flight' : type === 'Tren' ? 'Train' : 'Bus';
      const routeStr = prev.transportRoute || '';
      const schedStr = prev.transportSchedule || '';
      let combined = '';
      if (routeStr && schedStr) {
        combined = `${typeWord} ${routeStr}: ${schedStr}`;
      } else if (routeStr) {
        combined = `${typeWord} ${routeStr}`;
      } else if (schedStr) {
        combined = `${typeWord}: ${schedStr}`;
      } else {
        combined = typeWord;
      }
      return {
        ...prev,
        transportType: type,
        flightOutboundDetails: combined
      };
    });
  };

  // Helper for Outbound Arrival destination
  const handleOutboundArrivalUpdate = (city: string, time: string) => {
    const finalCity = city.trim() || 'Barcelona';
    const finalTime = time.trim() || '17:30';
    const arrivalText = `Estimated arrival in ${finalCity}: ${finalTime} hrs`;
    setTripPlan(prev => ({
      ...prev,
      outboundArrivalCity: city,
      outboundArrivalTime: time,
      arrivalDestinationTime: arrivalText
    }));
  };

  // Helper for Return Date
  const handleReturnDateChange = (isoDate: string) => {
    setReturnDateInputValue(isoDate);
    if (!isoDate) return;
    try {
      const [year, month, day] = isoDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const formattedDay = `${days[d.getDay()]}, ${months[month - 1]} ${day}`;
      const title = `Return to Murcia – ${days[d.getDay()]}, ${months[month - 1]} ${day}`;
      setTripPlan(prev => ({
        ...prev,
        returnDepartureDay: formattedDay,
        returnDayTitle: title
      }));
    } catch (e) {
      console.error(e);
    }
  };

  // Helper for Return Departure Time
  const handleReturnDepartureTimeChange = (timeStr: string) => {
    setTripPlan(prev => ({
      ...prev,
      returnDepartureTime: `${timeStr} hrs`,
      hotelDepartureTime: `Bus Departure: ${timeStr} hrs`
    }));
  };

  // Helper for Return Route slots
  const handleReturnRouteSlotChange = (slotIndex: number, value: string) => {
    setTripPlan(prev => {
      const currentSlots = [...(prev.returnRouteCities || ['Barcelona', 'Alicante', '', ''])];
      while (currentSlots.length < 4) currentSlots.push('');
      currentSlots[slotIndex] = value;

      const filledCities = currentSlots.map(c => c.trim()).filter(Boolean);
      const routeStr = filledCities.join(' - ');

      const currentType = prev.returnTransportType || 'Avión';
      const typeWord = currentType === 'Avión' ? 'Flight' : currentType === 'Tren' ? 'Train' : 'Bus';
      const currentSched = (prev.returnScheduleSlots || ['08:30 – 09:45 (VY1300)']).map(s => s.trim()).filter(Boolean).join(' / ');
      const combined = currentSched ? `${typeWord} ${routeStr}: ${currentSched}` : `${typeWord} ${routeStr}`;

      return {
        ...prev,
        returnRouteCities: currentSlots,
        flightReturnDetails: combined
      };
    });
  };

  // Helper for Return Schedule slots
  const handleReturnScheduleSlotChange = (slotIndex: number, value: string) => {
    setTripPlan(prev => {
      const currentSlots = [...(prev.returnScheduleSlots || ['08:30 – 09:45 (VY1300)', '', '', ''])];
      while (currentSlots.length < 4) currentSlots.push('');
      currentSlots[slotIndex] = value;

      const filledScheds = currentSlots.map(s => s.trim()).filter(Boolean);
      const schedStr = filledScheds.join(' / ');

      const currentType = prev.returnTransportType || 'Avión';
      const typeWord = currentType === 'Avión' ? 'Flight' : currentType === 'Tren' ? 'Train' : 'Bus';
      const routeStr = (prev.returnRouteCities || ['Barcelona', 'Alicante']).map(c => c.trim()).filter(Boolean).join(' - ');
      const combined = routeStr ? `${typeWord} ${routeStr}: ${schedStr}` : `${typeWord}: ${schedStr}`;

      return {
        ...prev,
        returnScheduleSlots: currentSlots,
        flightReturnDetails: combined
      };
    });
  };

  // Helper for Return Transport Type
  const handleReturnTransportTypeChange = (type: 'Autobús' | 'Tren' | 'Avión') => {
    setTripPlan(prev => {
      const typeWord = type === 'Avión' ? 'Flight' : type === 'Tren' ? 'Train' : 'Bus';
      const routeStr = (prev.returnRouteCities || ['Barcelona', 'Alicante']).map(c => c.trim()).filter(Boolean).join(' - ');
      const schedStr = (prev.returnScheduleSlots || ['08:30 – 09:45 (VY1300)']).map(s => s.trim()).filter(Boolean).join(' / ');
      let combined = '';
      if (routeStr && schedStr) {
        combined = `${typeWord} ${routeStr}: ${schedStr}`;
      } else if (routeStr) {
        combined = `${typeWord} ${routeStr}`;
      } else if (schedStr) {
        combined = `${typeWord}: ${schedStr}`;
      } else {
        combined = typeWord;
      }
      return {
        ...prev,
        returnTransportType: type,
        flightReturnDetails: combined
      };
    });
  };

  // Helper for Return Arrival
  const handleReturnArrivalUpdate = (city: string, time: string) => {
    const finalCity = city.trim() || 'Murcia';
    const finalTime = time.trim() || '11:00';
    const arrivalText = `Estimated Arrival in ${finalCity}: ${finalTime} hrs`;
    setTripPlan(prev => ({
      ...prev,
      returnArrivalCity: city,
      returnArrivalTime: time,
      returnArrivalMurciaTime: arrivalText
    }));
  };

  // Helper for Uniform and Kit
  const handleUniformSelection = (uniform: 'Red' | 'Cream' | 'Blue', kit?: 'White' | 'Black') => {
    const selectedKit = kit || tripPlan.kitColor || 'White';
    const details = `${uniform} Uniform / ${selectedKit} Kit Accessories`;

    setTripPlan(prev => ({
      ...prev,
      uniformColor: uniform,
      kitColor: selectedKit,
      uniformDetails: details
    }));
  };

  const handleKitColorSelection = (kit: 'White' | 'Black') => {
    const selectedUniform = tripPlan.uniformColor || 'Cream';
    const details = `${selectedUniform} Uniform / ${kit} Kit Accessories`;

    setTripPlan(prev => ({
      ...prev,
      kitColor: kit,
      uniformDetails: details
    }));
  };

  // Helper for Match Date change
  const handleMatchDateChange = (isoDate: string) => {
    setMatchDateInputValue(isoDate);
    if (!isoDate) return;
    try {
      const [year, month, day] = isoDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const dayLabel = `${days[d.getDay()]}, ${months[month - 1]} ${day}`;
      const timeStr = tripPlan.matchTime || '19:00';
      const formatted = `${dayLabel} – ${timeStr} hrs`;
      setTripPlan(prev => ({
        ...prev,
        matchDate: isoDate,
        matchDateTime: formatted
      }));
    } catch (e) {
      console.error(e);
    }
  };

  // Helper for Match Time change
  const handleMatchTimeChange = (timeStr: string) => {
    let dayLabel = 'Thursday, June 4';
    if (matchDateInputValue) {
      try {
        const [year, month, day] = matchDateInputValue.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        dayLabel = `${days[d.getDay()]}, ${months[month - 1]} ${day}`;
      } catch (e) {}
    } else if (tripPlan.matchDateTime && tripPlan.matchDateTime.includes('–')) {
      dayLabel = tripPlan.matchDateTime.split('–')[0].trim();
    }

    const formatted = `${dayLabel} – ${timeStr} hrs`;
    setTripPlan(prev => ({
      ...prev,
      matchTime: timeStr,
      matchDateTime: formatted
    }));
  };

  // Player selection helpers
  const handleTogglePlayer = (playerId: string) => {
    setTripPlan(prev => {
      const exists = prev.selectedPlayerIds.includes(playerId);
      const updated = exists 
        ? prev.selectedPlayerIds.filter(id => id !== playerId)
        : [...prev.selectedPlayerIds, playerId];
      return { ...prev, selectedPlayerIds: updated };
    });
  };

  const handleSelectAllPlayers = () => {
    const allPlayerIds = members.filter(m => m.role === 'player').map(m => m.id);
    setTripPlan(prev => ({ ...prev, selectedPlayerIds: allPlayerIds }));
  };

  const handleDeselectAllPlayers = () => {
    setTripPlan(prev => ({ ...prev, selectedPlayerIds: [] }));
  };

  // Weather helpers
  const handleAddWeatherDay = () => {
    const newDay = {
      id: `w-${Date.now()}`,
      dayLabel: 'Fri, Jun 5',
      tempRange: '25ºC / 19ºC'
    };
    setTripPlan(prev => ({ ...prev, weatherForecasts: [...prev.weatherForecasts, newDay] }));
  };

  const handleRemoveWeatherDay = (id: string) => {
    setTripPlan(prev => ({
      ...prev,
      weatherForecasts: prev.weatherForecasts.filter(w => w.id !== id)
    }));
  };

  const handleWeatherChange = (id: string, field: 'dayLabel' | 'tempRange', value: string) => {
    setTripPlan(prev => ({
      ...prev,
      weatherForecasts: prev.weatherForecasts.map(w => w.id === id ? { ...w, [field]: value } : w)
    }));
  };

  // Practices helpers
  const handleAddPractice = () => {
    const newPractice = 'FRIDAY, JUNE 5: 10:30 – 11:30 HRS (SHOOTAROUND)';
    setTripPlan(prev => ({
      ...prev,
      practices: [...prev.practices, newPractice]
    }));
  };

  const handleRemovePractice = (index: number) => {
    setTripPlan(prev => ({
      ...prev,
      practices: prev.practices.filter((_, idx) => idx !== index)
    }));
    if (activePracticeClockIndex === index) {
      setActivePracticeClockIndex(null);
    }
  };

  const handlePracticeChange = (index: number, value: string) => {
    setTripPlan(prev => ({
      ...prev,
      practices: prev.practices.map((p, idx) => idx === index ? value : p)
    }));
  };

  const handlePracticeTimeFromClock = (index: number, timeStr: string) => {
    setTripPlan(prev => {
      const current = prev.practices[index] || '';
      let updated = current;
      if (current.includes(':')) {
        const parts = current.split(':');
        const dayPart = parts[0].trim();
        updated = `${dayPart}: ${timeStr} HRS`;
      } else {
        updated = `SESSION: ${timeStr} HRS`;
      }
      return {
        ...prev,
        practices: prev.practices.map((p, idx) => idx === index ? updated : p)
      };
    });
  };

  const handlePracticeDateChange = (index: number, isoDate: string) => {
    if (!isoDate) return;
    try {
      const [year, month, day] = isoDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const dayLabel = `${days[d.getDay()]}, ${months[month - 1]} ${day}`;
      
      setTripPlan(prev => {
        const current = prev.practices[index] || '';
        let timePart = '10:30 – 11:30 HRS (SHOOTAROUND)';
        if (current.includes(':')) {
          timePart = current.substring(current.indexOf(':') + 1).trim();
        }
        const updated = `${dayLabel}: ${timePart}`;
        return {
          ...prev,
          practices: prev.practices.map((p, idx) => idx === index ? updated : p)
        };
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Staff selection helpers matching Travel Roster
  const activeStaff = members.filter(m => m.role === 'staff' || m.role === 'medical');
  const currentStaffIds = (tripPlan.selectedStaffIds && tripPlan.selectedStaffIds.some(id => activeStaff.some(s => s.id === id)))
    ? tripPlan.selectedStaffIds
    : activeStaff.map(s => s.id);

  const handleToggleStaff = (staffId: string) => {
    setTripPlan(prev => {
      const current = (prev.selectedStaffIds && prev.selectedStaffIds.some(id => activeStaff.some(s => s.id === id)))
        ? prev.selectedStaffIds
        : activeStaff.map(s => s.id);
      const updated = current.includes(staffId)
        ? current.filter(id => id !== staffId)
        : [...current, staffId];
      return { ...prev, selectedStaffIds: updated };
    });
  };

  const handleSelectAllStaff = () => {
    setTripPlan(prev => ({ ...prev, selectedStaffIds: activeStaff.map(s => s.id) }));
  };

  const handleDeselectAllStaff = () => {
    setTripPlan(prev => ({ ...prev, selectedStaffIds: [] }));
  };

  // Reset to default sample
  const handleResetTrip = () => {
    if (confirm('Reset trip plan to default example (Playoffs vs Barça)?')) {
      setTripPlan(DEFAULT_TRIP_PLAN);
      showToast('Trip plan reset to default');
    }
  };

  // PDF Generation with robust helper
  const handleDownloadPDF = async () => {
    if (!previewRef.current) {
      showToast('Document preview is preparing, please try again in a moment...');
      return;
    }
    setIsGeneratingPdf(true);

    try {
      const safeRival = (tripPlan.rivalName || 'Match').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Official_Trip_Plan_UCAM_Murcia_${safeRival}.pdf`;

      await exportTripPlanToPDF({
        element: previewRef.current,
        filename,
        onProgress: (msg) => showToast(msg),
      });

      showToast(`PDF downloaded: ${filename}`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Failed to auto-download PDF. You can use the Print button to Save as PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // High-res image download
  const handleDownloadImage = async () => {
    if (!previewRef.current) return;
    setIsGeneratingPdf(true);
    showToast('Generating high-resolution image...');

    try {
      const safeRival = (tripPlan.rivalName || 'Match').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Official_Trip_Plan_UCAM_Murcia_${safeRival}.png`;
      await exportTripPlanToImage(previewRef.current, filename);
      showToast(`Image downloaded: ${filename}`);
    } catch (err) {
      console.error(err);
      showToast('Could not generate image');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Native Print
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp Summary copy
  const handleCopyWhatsAppSummary = () => {
    const playersList = members
      .filter(m => m.role === 'player' && tripPlan.selectedPlayerIds.includes(m.id))
      .sort((a, b) => Number(a.jerseyNumber || 99) - Number(b.jerseyNumber || 99))
      .map(p => `• ${p.jerseyNumber !== undefined ? `${p.jerseyNumber}. ` : ''}${p.name}`)
      .join('\n');

    const msg = `🏀 *UCAM MURCIA CB - OFFICIAL TRIP PLAN* ✈️
🏆 *${tripPlan.competition} - ${tripPlan.roundTitle} (${tripPlan.gameNumber})*
📍 *${tripPlan.matchTitle}*

📅 *OUTBOUND:* ${tripPlan.departureDay}
🚌 *Bus Departure:* ${tripPlan.busDepartureTime} (${tripPlan.busDepartureLocation})
✈️ ${tripPlan.flightOutboundDetails}
🏁 ${tripPlan.arrivalDestinationTime}

🏨 *HOTEL:* ${tripPlan.hotelName}
🏟️ *ARENA:* ${tripPlan.arenaName}
⏰ *GAME:* ${tripPlan.matchDateTime}
🎽 *Kit / Uniform:* ${tripPlan.uniformDetails}

🏀 *PRACTICES:*
${tripPlan.practices.join('\n') || 'TBD'}

🔙 *RETURN:* ${tripPlan.returnDayTitle}
🏨 ${tripPlan.hotelDepartureTime}
✈️ ${tripPlan.flightReturnDetails}
🏁 ${tripPlan.returnArrivalMurciaTime}

👥 *TRAVEL ROSTER:*
${playersList}

👔 *Dress Code:*
• Travel & Hotel: ${tripPlan.dressCodeTravel}
• Rules: ${tripPlan.comments}
⚠️ *ID / Passport: ${tripPlan.importantNotice}*`;

    navigator.clipboard.writeText(msg);
    setCopiedSummary(true);
    showToast('Trip summary copied to clipboard for WhatsApp');
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const activePlayers = members.filter(m => m.role === 'player');

  const competitionOptions = [
    { label: 'Liga Endesa', value: 'Liga Endesa' },
    { label: 'Basketball Champions League', value: 'Basketball Champions League' },
    { label: 'Copa del Rey', value: 'Copa del Rey' },
  ];

  const phaseOptions = [
    { label: 'Regular Season', value: 'Regular Season' },
    { label: 'Playoffs', value: 'Playoffs' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 border border-amber-500 text-amber-300 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold animate-in fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Controls */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Plane className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-xl font-black text-white tracking-wide">
              Trip Planner
            </h2>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Switcher */}
            <div className="bg-stone-950 p-1 rounded-xl border border-stone-800 flex items-center text-xs font-bold text-stone-400">
              <button
                onClick={() => setActiveView('split')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeView === 'split' ? 'bg-stone-800 text-white shadow' : 'hover:text-stone-200'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setActiveView('editor')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  activeView === 'editor' ? 'bg-stone-800 text-white shadow' : 'hover:text-stone-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Form</span>
              </button>
              <button
                onClick={() => setActiveView('preview')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  activeView === 'preview' ? 'bg-stone-800 text-white shadow' : 'hover:text-stone-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            {/* Download PDF Button Only */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2 text-xs font-black text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-950/60 transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
              title="Download Official Trip Plan PDF"
            >
              <Download className="w-4 h-4 text-stone-950" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* Rival text input bar */}
        <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-bold text-amber-400 whitespace-nowrap flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Opponent Team:
          </label>
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={tripPlan.rivalName}
              onChange={e => handleRivalNameChange(e.target.value)}
              placeholder="Enter opponent team name (e.g., Barça, Real Madrid, Unicaja, Valencia Basket...)"
              className="w-full bg-stone-950 border border-amber-500/40 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs font-bold text-white placeholder-stone-600 focus:outline-none shadow-inner"
            />
            <button
              onClick={handleResetTrip}
              className="px-3 py-2 text-xs text-stone-400 hover:text-stone-200 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-xl transition flex items-center gap-1 shrink-0 cursor-pointer"
              title="Reset default values"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Editor & Document Live Preview */}
      <div className={`grid gap-6 ${
        activeView === 'split' ? 'grid-cols-1 xl:grid-cols-12' : 'grid-cols-1'
      }`}>
        {/* Left Column: Form Editor */}
        {(activeView === 'split' || activeView === 'editor') && (
          <div className={`${activeView === 'split' ? 'xl:col-span-6' : 'max-w-4xl mx-auto w-full'} space-y-4`}>
            
            {/* 1. Competition & Game */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>1. Competition & Game</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                {/* Competition Visible Options */}
                <div>
                  <label className="block text-stone-400 font-semibold mb-1.5">Competition</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {competitionOptions.map(opt => {
                      const isSelected = tripPlan.competition === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setTripPlan(p => ({ ...p, competition: opt.value }))}
                          className={`px-3 py-2 rounded-xl text-xs font-bold text-center border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-extrabold'
                              : 'bg-stone-950 text-stone-300 border-stone-800 hover:bg-stone-800/80 hover:text-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Phase Visible Options */}
                <div>
                  <label className="block text-stone-400 font-semibold mb-1.5">Phase</label>
                  <div className="grid grid-cols-2 gap-2">
                    {phaseOptions.map(opt => {
                      const isSelected = tripPlan.roundTitle === opt.value || (opt.value === 'Playoffs' && tripPlan.roundTitle.toLowerCase().includes('playoff'));
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setTripPlan(p => ({ ...p, roundTitle: opt.value }))}
                          className={`px-3 py-2 rounded-xl text-xs font-bold text-center border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-red-800 text-white border-red-500 shadow-md font-extrabold'
                              : 'bg-stone-950 text-stone-300 border-stone-800 hover:bg-stone-800/80 hover:text-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Round / Game Info */}
                  <div>
                    <label className="block text-stone-400 font-semibold mb-1">Round / Game Number</label>
                    <input
                      type="text"
                      value={tripPlan.gameNumber}
                      onChange={e => setTripPlan(p => ({ ...p, gameNumber: e.target.value }))}
                      placeholder="e.g. Game 2 / Round 24"
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Destination City */}
                  <div>
                    <label className="block text-stone-400 font-semibold mb-1">Destination City</label>
                    <input
                      type="text"
                      value={tripPlan.city}
                      onChange={e => setTripPlan(p => ({ ...p, city: e.target.value }))}
                      placeholder="e.g. Barcelona / Madrid / Málaga"
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Match Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-stone-400 font-semibold">Match Title</label>
                  </div>
                  <input
                    type="text"
                    value={tripPlan.matchTitle}
                    onChange={e => setTripPlan(p => ({ ...p, matchTitle: e.target.value }))}
                    placeholder="Opponent team vs. UCAM Murcia CB"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Departure & Outbound Journey */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plane className="w-4 h-4 text-green-400" />
                  <span>2. Departure & Outbound Journey</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Departure Day with Native Calendar Date Picker */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-stone-400 font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-400" /> Departure Date
                      </label>
                    </div>
                    <div className="space-y-1.5">
                      <input
                        type="date"
                        value={dateInputValue}
                        onChange={e => handleDepartureDateChange(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 cursor-pointer font-sans"
                      />
                      <input
                        type="text"
                        value={tripPlan.departureDay}
                        onChange={e => setTripPlan(p => ({ ...p, departureDay: e.target.value }))}
                        placeholder="e.g.: Wednesday, June 3"
                        className="w-full bg-stone-950/60 border border-stone-800/80 rounded-lg px-3 py-1.5 text-[11px] text-stone-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Departure Time with iOS Clock picker toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-stone-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" /> Departure Time
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowDepartureTimePicker(!showDepartureTimePicker)}
                        className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
                      >
                        {showDepartureTimePicker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {showDepartureTimePicker ? 'Close Clock' : 'Set Time'}
                      </button>
                    </div>
                    
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={tripPlan.busDepartureTime}
                        onChange={e => setTripPlan(p => ({ ...p, busDepartureTime: e.target.value }))}
                        placeholder="10:15 hrs"
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 font-mono font-bold focus:outline-none focus:border-amber-500"
                      />
                      
                      {/* Interactive iOS Alarm Time Drum */}
                      {showDepartureTimePicker && (
                        <div className="mt-2 animate-fade-in">
                          <IosAlarmTimePicker
                            value={tripPlan.busDepartureTime}
                            onChange={handleDepartureTimeChange}
                            label="Departure Time"
                            format24h={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Departure Location with "Palacio de Deportes" preset and custom text */}
                <div className="space-y-2 pt-1 border-t border-stone-800/60">
                  <div className="flex items-center justify-between">
                    <label className="block text-stone-400 font-semibold">Departure Location</label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetDepartureLocationType('palacio')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold text-center border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        tripPlan.busDepartureLocation === 'Palacio de Deportes' || tripPlan.departureLocationType === 'palacio'
                          ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-extrabold'
                          : 'bg-stone-950 text-stone-300 border-stone-800 hover:bg-stone-800/80 hover:text-white'
                      }`}
                    >
                      {(tripPlan.busDepartureLocation === 'Palacio de Deportes' || tripPlan.departureLocationType === 'palacio') && (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                      <span>🏟️ Palacio de Deportes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetDepartureLocationType('custom')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold text-center border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        tripPlan.busDepartureLocation !== 'Palacio de Deportes' && tripPlan.departureLocationType === 'custom'
                          ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-extrabold'
                          : 'bg-stone-950 text-stone-300 border-stone-800 hover:bg-stone-800/80 hover:text-white'
                      }`}
                    >
                      {tripPlan.busDepartureLocation !== 'Palacio de Deportes' && tripPlan.departureLocationType === 'custom' && (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                      <span>✍️ Custom Location</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={tripPlan.busDepartureLocation}
                    onChange={e => setTripPlan(p => ({ ...p, busDepartureLocation: e.target.value, departureLocationType: 'custom' }))}
                    placeholder="Palacio de Deportes"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                {/* Transport Details (Bus / Train / Flight + Route Cities + Transit Schedule) */}
                <div className="space-y-2.5 pt-1 border-t border-stone-800/60">
                  <div className="flex items-center justify-between">
                    <label className="block text-stone-400 font-semibold">Transport Details</label>
                  </div>

                  {/* 1. Mode Selector */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Transport Mode</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'Autobús', label: 'Bus', icon: '🚌' },
                        { key: 'Tren', label: 'Train', icon: '🚆' },
                        { key: 'Avión', label: 'Flight', icon: '✈️' },
                      ].map((item) => {
                        const currentMode = tripPlan.transportType || (tripPlan.flightOutboundDetails.toLowerCase().includes('tren') || tripPlan.flightOutboundDetails.toLowerCase().includes('train') ? 'Tren' : tripPlan.flightOutboundDetails.toLowerCase().includes('autobús') || tripPlan.flightOutboundDetails.toLowerCase().includes('bus') ? 'Autobús' : 'Avión');
                        const isSelected = currentMode === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => handleOutboundTransportTypeChange(item.key as 'Autobús' | 'Tren' | 'Avión')}
                            className={`py-2 px-2 rounded-xl text-xs font-bold text-center border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-extrabold'
                                : 'bg-stone-950 text-stone-400 border-stone-800 hover:bg-stone-800 hover:text-stone-200'
                            }`}
                          >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Route Cities */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">
                        Route Cities
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[0, 1, 2, 3].map((slotIdx) => {
                        const defaultCities = ['Alicante', 'Madrid', 'Barcelona', ''];
                        const currentCity = (tripPlan.outboundRouteCities && tripPlan.outboundRouteCities[slotIdx] !== undefined)
                          ? tripPlan.outboundRouteCities[slotIdx]
                          : defaultCities[slotIdx];
                        return (
                          <div key={slotIdx} className="space-y-0.5">
                            <span className="text-[9px] text-stone-500 block font-semibold">City {slotIdx + 1}</span>
                            <input
                              type="text"
                              value={currentCity}
                              onChange={e => handleOutboundRouteSlotChange(slotIdx, e.target.value)}
                              placeholder={`City ${slotIdx + 1}`}
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Transit Schedule */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">
                        Transit Schedule
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[0, 1, 2, 3].map((slotIdx) => {
                        const defaultScheds = ['12:30 – 13:35 (UX4042)', '15:10 – 16:35 (UX7703)', '', ''];
                        const currentSched = (tripPlan.outboundScheduleSlots && tripPlan.outboundScheduleSlots[slotIdx] !== undefined)
                          ? tripPlan.outboundScheduleSlots[slotIdx]
                          : defaultScheds[slotIdx];
                        return (
                          <div key={slotIdx} className="space-y-0.5">
                            <span className="text-[9px] text-stone-500 block font-semibold">Schedule {slotIdx + 1}</span>
                            <input
                              type="text"
                              value={currentSched}
                              onChange={e => handleOutboundScheduleSlotChange(slotIdx, e.target.value)}
                              placeholder={`e.g. 12:30 – 13:35 (UX4042)`}
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Document Generated Line */}
                  <div className="pt-1">
                    <span className="text-[9px] text-stone-500 uppercase font-bold block mb-0.5">Generated Line for PDF:</span>
                    <input
                      type="text"
                      value={tripPlan.flightOutboundDetails}
                      onChange={e => setTripPlan(p => ({ ...p, flightOutboundDetails: e.target.value }))}
                      placeholder="Flight Alicante - Madrid - Barcelona: 12:30 – 13:35 (UX4042) / 15:10 – 16:35 (UX7703)"
                      className="w-full bg-stone-950/60 border border-stone-800/80 rounded-lg px-3 py-1.5 text-[11px] text-stone-300 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Destination Arrival */}
                <div className="pt-2 border-t border-stone-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-stone-400 font-semibold">Destination Arrival</label>
                    <button
                      type="button"
                      onClick={() => setShowOutboundArrivalTimePicker(!showOutboundArrivalTimePicker)}
                      className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
                    >
                      {showOutboundArrivalTimePicker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {showOutboundArrivalTimePicker ? 'Close Clock' : 'Set Time'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-stone-500 block mb-0.5 font-semibold">Destination City</span>
                      <input
                        type="text"
                        value={tripPlan.outboundArrivalCity ?? 'Barcelona'}
                        onChange={e => handleOutboundArrivalUpdate(e.target.value, tripPlan.outboundArrivalTime || '17:30')}
                        placeholder="Barcelona"
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-500 font-semibold"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-500 block mb-0.5 font-semibold">Arrival Time</span>
                      <input
                        type="text"
                        value={tripPlan.outboundArrivalTime ?? '17:30'}
                        onChange={e => handleOutboundArrivalUpdate(tripPlan.outboundArrivalCity || 'Barcelona', e.target.value)}
                        placeholder="17:30"
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Clock for Outbound Arrival Time */}
                  {showOutboundArrivalTimePicker && (
                    <div className="mt-2 animate-fade-in">
                      <IosAlarmTimePicker
                        value={tripPlan.outboundArrivalTime || '17:30'}
                        onChange={(timeStr) => handleOutboundArrivalUpdate(tripPlan.outboundArrivalCity || 'Barcelona', timeStr)}
                        label="Outbound Arrival Time"
                        format24h={true}
                      />
                    </div>
                  )}

                  <input
                    type="text"
                    value={tripPlan.arrivalDestinationTime}
                    onChange={e => setTripPlan(p => ({ ...p, arrivalDestinationTime: e.target.value }))}
                    placeholder="Arrival in Barcelona: 17:30 hrs"
                    className="w-full bg-stone-950/60 border border-stone-800/80 rounded-lg px-3 py-1.5 text-[11px] text-stone-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. Hotel & Weather Forecast */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-400" />
                  <span>3. Hotel & Weather Forecast</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Hotel Name</label>
                  <input
                    type="text"
                    value={tripPlan.hotelName}
                    onChange={e => setTripPlan(p => ({ ...p, hotelName: e.target.value }))}
                    placeholder="Hotel Eurostars Grand Marina 5*"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Weather items */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-stone-400 font-semibold">Temperature Forecast</label>
                    <button
                      onClick={handleAddWeatherDay}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Day
                    </button>
                  </div>

                  <div className="space-y-2">
                    {tripPlan.weatherForecasts.map((w) => (
                      <div key={w.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={w.dayLabel}
                          onChange={e => handleWeatherChange(w.id, 'dayLabel', e.target.value)}
                          placeholder="Wed, Jun 3"
                          className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200"
                        />
                        <input
                          type="text"
                          value={w.tempRange}
                          onChange={e => handleWeatherChange(w.id, 'tempRange', e.target.value)}
                          placeholder="24ºC / 20ºC"
                          className="w-36 bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200"
                        />
                        <button
                          onClick={() => handleRemoveWeatherDay(w.id)}
                          className="text-stone-500 hover:text-red-400 p-1.5 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Arena, Match & Practices */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-purple-400" />
                  <span>4. Arena, Match & Practices</span>
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Row 1: Uniform (Red, Cream, Blue) & Kit Color (White, Black) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Uniform: Red, Cream, Blue */}
                  <div className="space-y-1.5 bg-stone-950/60 border border-stone-800/80 rounded-xl p-3">
                    <label className="block text-stone-300 font-bold text-[11px] uppercase tracking-wider">
                      Uniform Color
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'Red', label: 'Red', colorClass: 'bg-red-600 text-white border-red-500' },
                        { id: 'Cream', label: 'Cream', colorClass: 'bg-amber-100 text-stone-900 border-amber-300' },
                        { id: 'Blue', label: 'Blue', colorClass: 'bg-blue-600 text-white border-blue-500' },
                      ].map((item) => {
                        const currentUniform = tripPlan.uniformColor || (tripPlan.uniformDetails.toLowerCase().includes('roja') || tripPlan.uniformDetails.toLowerCase().includes('red') ? 'Red' : tripPlan.uniformDetails.toLowerCase().includes('azul') || tripPlan.uniformDetails.toLowerCase().includes('blue') ? 'Blue' : 'Cream');
                        const isSelected = currentUniform === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleUniformSelection(item.id as 'Red' | 'Cream' | 'Blue')}
                            className={`py-2 px-2 rounded-lg text-xs font-extrabold border transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              isSelected
                                ? `${item.colorClass} ring-2 ring-amber-400 shadow-md scale-[1.02]`
                                : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800 hover:text-stone-200'
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Kit Color: White, Black */}
                  <div className="space-y-1.5 bg-stone-950/60 border border-stone-800/80 rounded-xl p-3">
                    <label className="block text-stone-300 font-bold text-[11px] uppercase tracking-wider">
                      Kit Accessories
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'White', label: 'White', colorClass: 'bg-white text-stone-950 border-stone-300' },
                        { id: 'Black', label: 'Black', colorClass: 'bg-stone-900 text-white border-stone-600' },
                      ].map((item) => {
                        const currentKit = tripPlan.kitColor || (tripPlan.uniformDetails.toLowerCase().includes('negros') || tripPlan.uniformDetails.toLowerCase().includes('black') ? 'Black' : 'White');
                        const isSelected = currentKit === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleKitColorSelection(item.id as 'White' | 'Black')}
                            className={`py-2 px-3 rounded-lg text-xs font-extrabold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? `${item.colorClass} ring-2 ring-amber-400 shadow-md scale-[1.02]`
                                : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800 hover:text-stone-200'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Combined Uniform Details text line */}
                <div>
                  <input
                    type="text"
                    value={tripPlan.uniformDetails}
                    onChange={e => setTripPlan(p => ({ ...p, uniformDetails: e.target.value }))}
                    placeholder="Cream Uniform / White Kit Accessories"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-300 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Arena */}
                <div className="pt-2 border-t border-stone-800/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-stone-400 font-semibold">Game Arena</label>
                  </div>
                  <input
                    type="text"
                    value={tripPlan.arenaName}
                    onChange={e => setTripPlan(p => ({ ...p, arenaName: e.target.value }))}
                    placeholder="Palau Blaugrana / WiZink Center / Martín Carpena"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Match Date & Time */}
                <div className="pt-2 border-t border-stone-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-stone-400 font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Game Date & Tip-Off Time</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMatchTimePicker(!showMatchTimePicker)}
                      className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
                    >
                      {showMatchTimePicker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {showMatchTimePicker ? 'Close Clock' : 'Set Time'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-[10px] text-stone-500 uppercase font-bold block mb-1">Match Date</span>
                      <input
                        type="date"
                        value={matchDateInputValue}
                        onChange={e => handleMatchDateChange(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 cursor-pointer font-sans text-xs"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-500 uppercase font-bold block mb-1">Document Format</span>
                      <input
                        type="text"
                        value={tripPlan.matchDateTime}
                        onChange={e => setTripPlan(p => ({ ...p, matchDateTime: e.target.value }))}
                        placeholder="Thursday, June 4 – 19:00 hrs"
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 font-bold focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </div>
                  </div>

                  {/* Clock Drum for Match Time */}
                  {showMatchTimePicker && (
                    <div className="mt-2 animate-fade-in">
                      <IosAlarmTimePicker
                        value={tripPlan.matchTime || '19:00'}
                        onChange={handleMatchTimeChange}
                        label="Match Tip-Off Time"
                        format24h={true}
                      />
                    </div>
                  )}
                </div>

                {/* Practice Sessions */}
                <div className="pt-2 border-t border-stone-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-stone-400 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Practice Sessions</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddPractice}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
                    >
                      <Plus className="w-3 h-3" /> Add Session
                    </button>
                  </div>

                  <div className="space-y-3">
                    {tripPlan.practices.map((practice, idx) => (
                      <div key={idx} className="bg-stone-950/80 border border-stone-800 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-400">
                            Session #{idx + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setActivePracticeClockIndex(activePracticeClockIndex === idx ? null : idx)}
                              className="text-[10px] font-bold text-stone-300 hover:text-amber-400 flex items-center gap-1 bg-stone-900 border border-stone-700 px-2 py-0.5 rounded cursor-pointer"
                            >
                              <Clock className="w-3 h-3 text-amber-400" />
                              {activePracticeClockIndex === idx ? 'Close Clock' : 'Set Time'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePractice(idx)}
                              className="text-stone-500 hover:text-red-400 p-1 rounded cursor-pointer"
                              title="Remove session"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className="sm:col-span-5">
                            <span className="text-[10px] text-stone-500 block mb-0.5 font-semibold">Date</span>
                            <input
                              type="date"
                              onChange={e => handlePracticeDateChange(idx, e.target.value)}
                              className="w-full bg-stone-900 border border-stone-700/80 rounded-lg px-2.5 py-1.5 text-stone-200 text-xs cursor-pointer font-sans"
                            />
                          </div>

                          <div className="sm:col-span-7">
                            <span className="text-[10px] text-stone-500 block mb-0.5 font-semibold">Official Session Text</span>
                            <input
                              type="text"
                              value={practice}
                              onChange={e => handlePracticeChange(idx, e.target.value)}
                              placeholder="THURSDAY, JUNE 4: 12:00 – 13:00 HRS (SHOOTAROUND)"
                              className="w-full bg-stone-900 border border-stone-700/80 rounded-lg px-2.5 py-1.5 text-stone-200 text-xs font-semibold uppercase focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        {/* Interactive iOS Clock for this practice session */}
                        {activePracticeClockIndex === idx && (
                          <div className="mt-2 pt-2 border-t border-stone-800 animate-fade-in">
                            <IosAlarmTimePicker
                              value={practice.includes(':') ? practice.split(':')[1].trim() : '11:00'}
                              onChange={(timeStr) => handlePracticeTimeFromClock(idx, timeStr)}
                              label={`Session #${idx + 1} Time`}
                              format24h={true}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* 5. Return Journey */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plane className="w-4 h-4 text-amber-400 transform rotate-180" />
                  <span>5. Return Journey</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Return Day with Native Calendar Date Picker */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-stone-400 font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-400" /> Return Date
                      </label>
                    </div>
                    <div className="space-y-1.5">
                      <input
                        type="date"
                        onChange={e => handleReturnDateChange(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 cursor-pointer font-sans"
                      />
                      <input
                        type="text"
                        value={tripPlan.returnDayTitle}
                        onChange={e => setTripPlan(p => ({ ...p, returnDayTitle: e.target.value }))}
                        placeholder="Return to Murcia – Friday, June 5"
                        className="w-full bg-stone-950/60 border border-stone-800/80 rounded-lg px-3 py-1.5 text-[11px] text-stone-400 focus:outline-none focus:border-amber-500 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Return Bus Departure Time with iOS Clock */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-stone-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" /> Bus Departure Time
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowReturnDepartureTimePicker(!showReturnDepartureTimePicker)}
                        className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
                      >
                        {showReturnDepartureTimePicker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {showReturnDepartureTimePicker ? 'Close Clock' : 'Set Time'}
                      </button>
                    </div>
                    
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={tripPlan.hotelDepartureTime}
                        onChange={e => {
                          const val = e.target.value;
                          setTripPlan(p => ({
                            ...p,
                            hotelDepartureTime: val,
                            returnDepartureTime: val.includes(':') ? val.split(':').slice(1).join(':').trim() : val
                          }));
                        }}
                        placeholder="Bus Departure: 06:45 hrs"
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 font-mono font-bold focus:outline-none focus:border-amber-500"
                      />
                      
                      {/* Interactive iOS Alarm Time Drum */}
                      {showReturnDepartureTimePicker && (
                        <div className="mt-2 animate-fade-in">
                          <IosAlarmTimePicker
                            value={(() => {
                              const raw = tripPlan.hotelDepartureTime || '06:45';
                              const clean = raw.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
                              if (clean.includes(':')) {
                                const parts = clean.split(':');
                                return parts[parts.length - 1].replace(/hrs|horas/gi, '').trim() || '06:45';
                              }
                              return clean.replace(/hrs|horas/gi, '').trim() || '06:45';
                            })()}
                            onChange={handleReturnDepartureTimeChange}
                            label="Return Departure Time"
                            format24h={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Return Departure Location */}
                <div className="space-y-1.5 pt-1 border-t border-stone-800/60">
                  <label className="block text-stone-400 font-semibold">Return Departure Point</label>
                  <input
                    type="text"
                    value={tripPlan.returnDepartureLocation !== undefined ? tripPlan.returnDepartureLocation : (tripPlan.hotelName || '')}
                    onChange={e => {
                      const val = e.target.value;
                      setTripPlan(p => ({
                        ...p,
                        returnDepartureLocation: val
                      }));
                    }}
                    placeholder="Hotel Eurostars Grand Marina"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                {/* Return Transport Details */}
                <div className="space-y-2.5 pt-1 border-t border-stone-800/60">
                  <div className="flex items-center justify-between">
                    <label className="block text-stone-400 font-semibold">Return Transport Details</label>
                  </div>

                  {/* 1. Mode Selector */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Transport Mode</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'Autobús', label: 'Bus', icon: '🚌' },
                        { key: 'Tren', label: 'Train', icon: '🚆' },
                        { key: 'Avión', label: 'Flight', icon: '✈️' },
                      ].map((item) => {
                        const currentMode = tripPlan.returnTransportType || (tripPlan.flightReturnDetails.toLowerCase().includes('tren') || tripPlan.flightReturnDetails.toLowerCase().includes('train') ? 'Tren' : tripPlan.flightReturnDetails.toLowerCase().includes('autobús') || tripPlan.flightReturnDetails.toLowerCase().includes('bus') ? 'Autobús' : 'Avión');
                        const isSelected = currentMode === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => handleReturnTransportTypeChange(item.key as 'Autobús' | 'Tren' | 'Avión')}
                            className={`py-2 px-2 rounded-xl text-xs font-bold text-center border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-extrabold'
                                : 'bg-stone-950 text-stone-400 border-stone-800 hover:bg-stone-800 hover:text-stone-200'
                            }`}
                          >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Return Route Cities */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">
                        Return Route Cities
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[0, 1, 2, 3].map((slotIdx) => {
                        const defaultCities = ['Barcelona', 'Alicante', '', ''];
                        const currentCity = (tripPlan.returnRouteCities && tripPlan.returnRouteCities[slotIdx] !== undefined)
                          ? tripPlan.returnRouteCities[slotIdx]
                          : defaultCities[slotIdx];
                        return (
                          <div key={slotIdx} className="space-y-0.5">
                            <span className="text-[9px] text-stone-500 block font-semibold">City {slotIdx + 1}</span>
                            <input
                              type="text"
                              value={currentCity}
                              onChange={e => handleReturnRouteSlotChange(slotIdx, e.target.value)}
                              placeholder={`City ${slotIdx + 1}`}
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Return Transit Schedule */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">
                        Return Transit Schedule
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[0, 1, 2, 3].map((slotIdx) => {
                        const defaultScheds = ['08:30 – 09:45 (VY1300)', '', '', ''];
                        const currentSched = (tripPlan.returnScheduleSlots && tripPlan.returnScheduleSlots[slotIdx] !== undefined)
                          ? tripPlan.returnScheduleSlots[slotIdx]
                          : defaultScheds[slotIdx];
                        return (
                          <div key={slotIdx} className="space-y-0.5">
                            <span className="text-[9px] text-stone-500 block font-semibold">Schedule {slotIdx + 1}</span>
                            <input
                              type="text"
                              value={currentSched}
                              onChange={e => handleReturnScheduleSlotChange(slotIdx, e.target.value)}
                              placeholder={`e.g. 08:30 – 09:45 (VY1300)`}
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Generated Return Line */}
                  <div className="pt-1">
                    <span className="text-[9px] text-stone-500 uppercase font-bold block mb-0.5">Generated Line for PDF:</span>
                    <input
                      type="text"
                      value={tripPlan.flightReturnDetails}
                      onChange={e => setTripPlan(p => ({ ...p, flightReturnDetails: e.target.value }))}
                      placeholder="Flight Barcelona - Alicante: 08:30 – 09:45 (VY1300)"
                      className="w-full bg-stone-950/60 border border-stone-800/80 rounded-lg px-3 py-1.5 text-[11px] text-stone-300 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Return Arrival at Murcia */}
                <div className="pt-2 border-t border-stone-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-stone-400 font-semibold">Return Arrival Destination</label>
                    <button
                      type="button"
                      onClick={() => setShowReturnArrivalTimePicker(!showReturnArrivalTimePicker)}
                      className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
                    >
                      {showReturnArrivalTimePicker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {showReturnArrivalTimePicker ? 'Close Clock' : 'Set Time'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-stone-500 block mb-0.5 font-semibold">Arrival City</span>
                      <input
                        type="text"
                        value={tripPlan.returnArrivalCity ?? 'Murcia'}
                        onChange={e => handleReturnArrivalUpdate(e.target.value, tripPlan.returnArrivalTime || '11:00')}
                        placeholder="Murcia"
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-amber-500 font-semibold"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-500 block mb-0.5 font-semibold">Estimated Arrival Time</span>
                      <input
                        type="text"
                        value={tripPlan.returnArrivalTime ?? '11:00'}
                        onChange={e => handleReturnArrivalUpdate(tripPlan.returnArrivalCity || 'Murcia', e.target.value)}
                        placeholder="11:00"
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Clock for Return Arrival Time */}
                  {showReturnArrivalTimePicker && (
                    <div className="mt-2 animate-fade-in">
                      <IosAlarmTimePicker
                        value={tripPlan.returnArrivalTime || '11:00'}
                        onChange={(timeStr) => handleReturnArrivalUpdate(tripPlan.returnArrivalCity || 'Murcia', timeStr)}
                        label="Return Arrival Time"
                        format24h={true}
                      />
                    </div>
                  )}

                  <input
                    type="text"
                    value={tripPlan.returnArrivalMurciaTime}
                    onChange={e => setTripPlan(p => ({ ...p, returnArrivalMurciaTime: e.target.value }))}
                    placeholder="Estimated Arrival in Murcia: 11:00 hrs"
                    className="w-full bg-stone-950/60 border border-stone-800/80 rounded-lg px-3 py-1.5 text-[11px] text-stone-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 6. Travel Roster */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>6. Travel Roster ({tripPlan.selectedPlayerIds.length} / {activePlayers.length} players)</span>
                </h3>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={handleSelectAllPlayers}
                    className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-stone-600">|</span>
                  <button
                    onClick={handleDeselectAllPlayers}
                    className="text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activePlayers.map((player) => {
                  const isSelected = tripPlan.selectedPlayerIds.includes(player.id);
                  const visual = getLicenseVisual(player.license);
                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => handleTogglePlayer(player.id)}
                      className={`flex items-center justify-between p-2 rounded-lg border transition text-left cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-950/40 border-amber-500/50 text-white' 
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-5 h-5 rounded font-extrabold text-[9.5px] flex items-center justify-center shrink-0 border border-stone-700/50"
                          style={visual.pdfBadgeStyle}
                        >
                          {player.jerseyNumber !== undefined ? player.jerseyNumber : '•'}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-semibold truncate uppercase leading-tight">{player.name}</span>
                          <span className="text-[9px] text-stone-400 font-medium">
                            {visual.shortLabel}
                          </span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-500 text-stone-950' : 'border border-stone-700'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Staff Roster */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">
                    7. Staff Roster ({currentStaffIds.length} / {activeStaff.length} staff)
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={handleSelectAllStaff}
                    className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-stone-600">|</span>
                  <button
                    onClick={handleDeselectAllStaff}
                    className="text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activeStaff.map((staffMember) => {
                  const isSelected = currentStaffIds.includes(staffMember.id);
                  return (
                    <button
                      key={staffMember.id}
                      type="button"
                      onClick={() => handleToggleStaff(staffMember.id)}
                      className={`flex items-center justify-between p-2 rounded-lg border transition text-left cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-950/40 border-purple-500/50 text-white' 
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-purple-400 w-4">
                          •
                        </span>
                        <span className="font-semibold truncate uppercase">{staffMember.name}</span>
                      </div>
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-purple-600 text-white' : 'border border-stone-700'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 8. Dress Code, Guidelines & Documentation */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>8. Dress Code, Guidelines & Documentation</span>
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-stone-950 border border-stone-800/80 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <span className="text-stone-400 font-bold w-44 shrink-0">Travel & hotel dress code:</span>
                    <span className="text-amber-300 font-bold uppercase text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">official team clothing</span>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-stone-800/40">
                    <span className="text-stone-400 font-bold w-44 shrink-0">Guidelines:</span>
                    <span className="text-amber-300 font-bold uppercase text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">internal rules team</span>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-stone-800/40">
                    <span className="text-stone-400 font-bold w-44 shrink-0">ID / Passport:</span>
                    <span className="text-red-400 font-bold uppercase">don't forget your documentation</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Right Column: Live Document Preview (Always kept in DOM for reliable PDF/Image downloads) */}
        <div 
          className={`${
            activeView === 'editor' 
              ? 'fixed -left-[9999px] -top-[9999px] w-[820px] pointer-events-none opacity-0' 
              : activeView === 'split' 
                ? 'xl:col-span-6 sticky top-24 space-y-3' 
                : 'max-w-4xl mx-auto w-full space-y-3'
          }`}
        >
          <div className="flex items-center justify-between px-2 text-xs text-stone-400">
            <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Official Print Preview (A4 Sheet • 2026 Edition)
            </span>
            <span>Real-time update</span>
          </div>

          {/* Document Container */}
          <div className="overflow-x-auto rounded-2xl bg-stone-950 p-2 sm:p-4 border border-stone-800 shadow-2xl flex justify-center">
            <TripDocumentPreview
              ref={previewRef}
              tripPlan={tripPlan}
              members={members}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
