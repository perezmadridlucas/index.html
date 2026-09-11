export type ActivityType =
  | 'arrival'
  | 'individual_workout'
  | 'positional_workout'
  | 'team_practice'
  | 'taping_session'
  | 'weights'
  | 'video_meeting'
  | 'recovery'
  | 'team_event'
  | 'team_meal'
  | 'departure_time'
  | 'custom';

export type TapedOption = 'taped' | 'not_taped';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type LuggageOption = 'with_luggage' | 'without_luggage';

export type TargetAudience = 'all' | 'basketball_coaches' | 'staff_only' | 'selected_members' | 'players_only';

export interface ScheduleItem {
  id: string;
  type: ActivityType;
  customTitle?: string;
  time: string; // e.g. "10:45 AM" or "19:30"
  endTime?: string;
  location?: string;
  locationUrl?: string; // Google Maps URL link
  notes?: string;
  
  // Specific Options
  tapedOption?: TapedOption;
  mealType?: MealType;
  luggageOption?: LuggageOption;
  
  // Audience
  targetAudience: TargetAudience;
  assignedMemberIds: string[]; // List of member IDs if selected_members or individual slots
}

export type MemberRole = 'player' | 'staff' | 'medical';

export type PlayerLicense = 
  | 'JFL'
  | 'EUR'
  | 'EXT'
  | 'JFL BCL'
  | 'Foreign player'
  | 'Home grown (ACB)'
  | 'Home grown (BCL)'
  | 'European - Cotonou';

export interface TeamMember {
  id: string;
  name: string;
  role: MemberRole;
  position?: string;
  jerseyNumber?: number | string;
  license?: PlayerLicense;
  phone: string; // e.g. "+34612345678"
  avatarUrl?: string;
  isActive: boolean;
  notes?: string;
}

export type DispatchChannel = 
  | 'individual_players'
  | 'individual_staff'
  | 'collective_staff'
  | 'all_team';

export interface DailyPlan {
  id: string;
  date: string; // YYYY-MM-DD
  title?: string;
  items: ScheduleItem[];
  notesForTeam?: string;
  
  // Group Links
  playersGroupUrl?: string;
  staffGroupUrl?: string;
  coachesGroupUrl?: string;
  allTeamGroupUrl?: string;

  // Scheduled dispatch
  isScheduled: boolean;
  scheduledTime?: string; // HH:mm
  scheduledDate?: string; // YYYY-MM-DD
  lastSentAt?: string;
}

export interface DispatchLog {
  id: string;
  planId: string;
  planDate: string;
  timestamp: string;
  channel: DispatchChannel;
  recipientName: string;
  recipientPhone?: string;
  status: 'sent' | 'scheduled' | 'copied';
  messageSnippet: string;
}

export interface ActivityDefinition {
  type: ActivityType;
  label: string;
  defaultLocation: string;
  defaultLocationUrl?: string;
  iconName: string;
  color: string;
  badgeBg: string;
  description: string;
}

export interface TripStaffMember {
  id: string;
  roleTitle: string; // e.g. "Dir. General", "Entrenador", "Fisioterapeutas"
  names: string; // e.g. "Alejandro Gómez", "Sito Alonso"
}

export interface TripWeatherDay {
  id: string;
  dayLabel: string; // e.g. "Miércoles 3"
  tempRange: string; // e.g. "24ºC / 20ºC"
}

export interface TripPlan {
  id: string;
  competition: string; // e.g. "LIGA ENDESA" or "BCL"
  roundTitle: string; // e.g. "PLAY OFF – ¼ FINAL"
  gameNumber: string; // e.g. "2º PARTIDO"
  city: string; // e.g. "Barcelona"
  matchTitle: string; // e.g. "BARÇA – UCAM MURCIA CB"
  rivalName: string; // e.g. "BARÇA"
  rivalLogoUrl?: string;

  // Salida
  departureDay: string; // e.g. "miércoles 3 de junio"
  busDepartureTime: string; // e.g. "10:15 horas"
  busDepartureLocation: string; // e.g. "Palacio de Deportes"
  departureLocationType?: 'palacio' | 'custom';
  transportType?: 'Autobús' | 'Tren' | 'Avión';
  transportRoute?: string; // e.g. "Alicante - Madrid - Barcelona"
  transportSchedule?: string; // e.g. "12:30 – 13:35 (UX4042) / 15:10 – 16:35 (UX7703)"
  outboundRouteCities?: string[]; // 4 slots e.g. ["Alicante", "Madrid", "Barcelona", ""]
  outboundScheduleSlots?: string[]; // slots e.g. ["12:30 – 13:35 (UX4042)", "15:10 – 16:35 (UX7703)", "", ""]
  outboundArrivalCity?: string; // e.g. "Barcelona"
  outboundArrivalTime?: string; // e.g. "17:30"
  flightOutboundDetails: string; // e.g. "Vuelo Alicante - Madrid - Barcelona: 12.30 – 13.35 (UX4042) / 15:10 – 16:35 (UX7703)"
  arrivalDestinationTime: string; // e.g. "Llegada a Barcelona: 17:30 horas"

  // Hotel & Clima
  hotelName: string; // e.g. "Hotel Eurostars Grand Marina"
  weatherForecasts: TripWeatherDay[];

  // Pabellón / Partido
  uniformColor?: 'Red' | 'Cream' | 'Blue';
  kitColor?: 'White' | 'Black';
  uniformDetails: string; // e.g. "Equipación crema / complementos blancos"
  arenaName: string; // e.g. "Palau Blaugrana"
  matchDate?: string; // e.g. "2026-06-04"
  matchTime?: string; // e.g. "19:00"
  matchDateTime: string; // e.g. "Jueves 4 – 19:00"

  // Entrenamientos
  practices: string[]; // e.g. ["JUEVES 4: 12:00 – 13:00"]

  // Regreso
  returnDayTitle: string; // e.g. "Regreso a Murcia Viernes 5"
  returnDepartureDay?: string; // e.g. "viernes 5 de junio"
  returnDepartureTime?: string; // e.g. "6:45 horas"
  hotelDepartureTime: string; // e.g. "Salida del hotel: 6:45"
  returnDepartureLocation?: string; // e.g. "Hotel Eurostars Grand Marina"
  returnTransportType?: 'Autobús' | 'Tren' | 'Avión';
  returnRouteCities?: string[]; // 4 slots e.g. ["Barcelona", "Alicante", "", ""]
  returnScheduleSlots?: string[]; // slots e.g. ["8:30 – 9:45 (VY1300)", "", "", ""]
  returnArrivalCity?: string; // e.g. "Murcia"
  returnArrivalTime?: string; // e.g. "11:00"
  flightReturnDetails: string; // e.g. "Vuelo Barcelona - Alicante: 8:30 – 9:45 (VY1300)"
  returnArrivalMurciaTime: string; // e.g. "Llegada a Murcia: 11:00 horas"

  // Directiva / Staff & Jugadores
  staffList: TripStaffMember[];
  selectedStaffIds: string[];
  selectedPlayerIds: string[];

  // Ropa & Normas
  dressCodeTravel: string; // e.g. "Camiseta y Chandal o bermuda del club"
  dressCodeHotel: string; // e.g. "Polo y Bermuda del club"
  comments: string; // e.g. "Observancia en las normas de Régimen Interno del equipo."
  importantNotice: string; // e.g. "IMPORTANTE D.N.I. ó PASAPORTE"
}
