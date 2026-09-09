import { TripPlan } from '../types';

export interface RivalTeamOption {
  id: string;
  name: string;
  shortName: string;
  city: string;
  arena: string;
  logoUrl: string;
}

export const RIVAL_TEAMS: RivalTeamOption[] = [
  {
    id: 'barca',
    name: 'FC Barcelona (Barça)',
    shortName: 'BARÇA',
    city: 'Barcelona',
    arena: 'Palau Blaugrana',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/200px-FC_Barcelona_%28crest%29.svg.png',
  },
  {
    id: 'real-madrid',
    name: 'Real Madrid',
    shortName: 'REAL MADRID',
    city: 'Madrid',
    arena: 'WiZink Center',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/200px-Real_Madrid_CF.svg.png',
  },
  {
    id: 'valencia',
    name: 'Valencia Basket',
    shortName: 'VALENCIA BASKET',
    city: 'Valencia',
    arena: 'Pavelló Font de Sant Lluís (La Fonteta)',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/90/Valencia_BC_logo.svg/200px-Valencia_BC_logo.svg.png',
  },
  {
    id: 'unicaja',
    name: 'Unicaja Málaga',
    shortName: 'UNICAJA',
    city: 'Málaga',
    arena: 'Palacio de Deportes José María Martín Carpena',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c9/Unicaja_M%C3%A1laga_logo.svg/200px-Unicaja_M%C3%A1laga_logo.svg.png',
  },
  {
    id: 'baskonia',
    name: 'Baskonia (Saski Baskonia)',
    shortName: 'BASKONIA',
    city: 'Vitoria-Gasteiz',
    arena: 'Buesa Arena',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Saski_Baskonia_logo.svg/200px-Saski_Baskonia_logo.svg.png',
  },
  {
    id: 'joventut',
    name: 'Joventut Badalona',
    shortName: 'JOVENTUT',
    city: 'Badalona',
    arena: 'Palau Municipal d’Esports de Badalona',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Club_Joventut_Badalona_logo.svg/200px-Club_Joventut_Badalona_logo.svg.png',
  },
  {
    id: 'tenerife',
    name: 'La Laguna Tenerife (CB Canarias)',
    shortName: 'TENERIFE',
    city: 'San Cristóbal de La Laguna',
    arena: 'Pabellón de Deportes de Tenerife Santiago Martín',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/23/CB_1939_Canarias_logo.svg/200px-CB_1939_Canarias_logo.svg.png',
  },
  {
    id: 'manresa',
    name: 'BAXI Manresa',
    shortName: 'MANRESA',
    city: 'Manresa',
    arena: 'Pavelló Nou Congost',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/B%C3%A0squet_Manresa_logo.svg/200px-B%C3%A0squet_Manresa_logo.svg.png',
  },
  {
    id: 'gran-canaria',
    name: 'Dreamland Gran Canaria',
    shortName: 'GRAN CANARIA',
    city: 'Las Palmas',
    arena: 'Gran Canaria Arena',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/08/CB_Gran_Canaria_logo.svg/200px-CB_Gran_Canaria_logo.svg.png',
  },
  {
    id: 'zaragoza',
    name: 'Casademont Zaragoza',
    shortName: 'ZARAGOZA',
    city: 'Zaragoza',
    arena: 'Pabellón Príncipe Felipe',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/36/Basket_Zaragoza_logo.svg/200px-Basket_Zaragoza_logo.svg.png',
  },
  {
    id: 'bilbao',
    name: 'Surne Bilbao Basket',
    shortName: 'BILBAO BASKET',
    city: 'Bilbao',
    arena: 'Bilbao Arena (Miribilla)',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0e/Bilbao_Basket_logo.svg/200px-Bilbao_Basket_logo.svg.png',
  },
  {
    id: 'breogan',
    name: 'Río Breogán',
    shortName: 'BREOGÁN',
    city: 'Lugo',
    arena: 'Pazo dos Deportes',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/CB_Breog%C3%A1n_logo.svg/200px-CB_Breog%C3%A1n_logo.svg.png',
  },
  {
    id: 'andorra',
    name: 'MoraBanc Andorra',
    shortName: 'ANDORRA',
    city: 'Andorra la Vella',
    arena: 'Poliesportiu d’Andorra',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e9/BC_Andorra_logo.svg/200px-BC_Andorra_logo.svg.png',
  },
  {
    id: 'girona',
    name: 'Bàsquet Girona',
    shortName: 'GIRONA',
    city: 'Girona',
    arena: 'Pavelló Fontajau',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/be/B%C3%A0squet_Girona_logo.svg/200px-B%C3%A0squet_Girona_logo.svg.png',
  },
  {
    id: 'granada',
    name: 'Coviran Granada',
    shortName: 'GRANADA',
    city: 'Granada',
    arena: 'Palacio Municipal de Deportes de Granada',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/Fundaci%C3%B3n_CB_Granada_logo.svg/200px-Fundaci%C3%B3n_CB_Granada_logo.svg.png',
  },
  {
    id: 'coruna',
    name: 'Leyma Coruña',
    shortName: 'LEYMA CORUÑA',
    city: 'A Coruña',
    arena: 'Coliseum da Coruña',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/41/B%C3%A1squet_Coru%C3%B1a_logo.svg/200px-B%C3%A1squet_Coru%C3%B1a_logo.svg.png',
  }
];

export const DEFAULT_TRIP_STAFF = [
  { id: 's-1', roleTitle: 'General Director', names: 'Alejandro Gómez' },
  { id: 's-2', roleTitle: 'Commercial Director', names: 'José Miguel Garrido' },
  { id: 's-3', roleTitle: 'Communications Director', names: 'Felipe Meseguer' },
  { id: 's-4', roleTitle: 'Head Coach', names: 'Sito Alonso' },
  { id: 's-5', roleTitle: 'Assistant Coach', names: 'Dimitris Tsesmetzis' },
  { id: 's-6', roleTitle: 'Assistant Coach', names: 'Antonio Lozano' },
  { id: 's-7', roleTitle: 'Team Delegate', names: 'Lucas Pérez' },
  { id: 's-8', roleTitle: 'Strength & Conditioning', names: 'Manu Marín' },
  { id: 's-9', roleTitle: 'Physiotherapist', names: 'Rogelio Diz' },
  { id: 's-10', roleTitle: 'Physiotherapist', names: 'Pablo Ortín' },
  { id: 's-11', roleTitle: 'Team Doctor', names: 'Carlos Grávalos' },
  { id: 's-12', roleTitle: 'Team Doctor', names: 'José Antonio Pangua' },
  { id: 's-13', roleTitle: 'Technical Staff', names: 'Toze Mota' },
  { id: 's-14', roleTitle: 'Technical Staff', names: 'Adrián Díaz' },
  { id: 's-15', roleTitle: 'Equipment Staff', names: 'Ermes Renolfi' },
];

export const DEFAULT_TRIP_PLAN: TripPlan = {
  id: 'trip-barca-playoff',
  competition: 'Liga Endesa',
  roundTitle: 'Playoffs – Quarter-Finals',
  gameNumber: 'GAME 2',
  city: 'Barcelona',
  matchTitle: 'Barça vs. UCAM Murcia CB',
  rivalName: 'Barça',
  rivalLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/200px-FC_Barcelona_%28crest%29.svg.png',

  // Outbound Journey
  departureDay: 'Wednesday, June 3',
  busDepartureTime: '10:15 hrs',
  busDepartureLocation: 'Palacio de Deportes',
  departureLocationType: 'palacio',
  transportType: 'Avión',
  transportRoute: 'Alicante - Madrid - Barcelona',
  transportSchedule: '12:30 – 13:35 (UX4042) / 15:10 – 16:35 (UX7703)',
  outboundRouteCities: ['Alicante', 'Madrid', 'Barcelona', ''],
  outboundScheduleSlots: ['12:30 – 13:35 (UX4042)', '15:10 – 16:35 (UX7703)', '', ''],
  outboundArrivalCity: 'Barcelona',
  outboundArrivalTime: '17:30',
  flightOutboundDetails: 'Flight Alicante - Madrid - Barcelona: 12:30 – 13:35 (UX4042) / 15:10 – 16:35 (UX7703)',
  arrivalDestinationTime: 'Estimated arrival in Barcelona: 17:30 hrs',

  // Hotel & Weather
  hotelName: 'Hotel Eurostars Grand Marina',
  weatherForecasts: [
    { id: 'w-1', dayLabel: 'Wed, Jun 3', tempRange: '24ºC / 20ºC' },
    { id: 'w-2', dayLabel: 'Thu, Jun 4', tempRange: '24ºC / 18ºC' },
  ],

  // Arena & Match
  uniformColor: 'Cream',
  kitColor: 'White',
  uniformDetails: 'Cream Uniform / White Kit Accessories',
  arenaName: 'Palau Blaugrana',
  matchDate: '2026-06-04',
  matchTime: '19:00',
  matchDateTime: 'Thursday, June 4 – 19:00 hrs',

  // Practice Sessions
  practices: [
    'THURSDAY, JUNE 4: 12:00 – 13:00 HRS (SHOOTAROUND)'
  ],

  // Return Journey
  returnDayTitle: 'Return to Murcia – Friday, June 5',
  returnDepartureDay: 'Friday, June 5',
  returnDepartureTime: '06:45 hrs',
  hotelDepartureTime: 'Bus Departure: 06:45 hrs',
  returnDepartureLocation: 'Hotel Eurostars Grand Marina',
  returnTransportType: 'Avión',
  returnRouteCities: ['Barcelona', 'Alicante', '', ''],
  returnScheduleSlots: ['08:30 – 09:45 (VY1300)', '', '', ''],
  returnArrivalCity: 'Murcia',
  returnArrivalTime: '11:00',
  flightReturnDetails: 'Flight Barcelona - Alicante: 08:30 – 09:45 (VY1300)',
  returnArrivalMurciaTime: 'Estimated Arrival in Murcia: 11:00 hrs',

  // Delegation & Staff
  staffList: DEFAULT_TRIP_STAFF,
  selectedStaffIds: [
    's-sito-alonso',
    's-lucas-perez',
    's-dimitris-tsesmetzis',
    's-antonio-lozano',
    's-manu-marin',
    'm-rogelio-diz',
    'm-pablo-ortin',
    'm-carlos-gravalos',
    'm-jose-antonio-pangua',
    's-alejandro-gomez',
    's-jose-miguel-garrido',
    's-felipe-meseguer',
    's-toze-mota',
    's-adrian-diaz',
    's-ermes-renolfi'
  ],

  // 17 Roster Players
  selectedPlayerIds: [
    'p-juani-marcos',
    'p-souley-boum',
    'p-mike-forrest',
    'p-dani-gonzalez',
    'p-dylan-ennis',
    'p-jonah-radebaugh',
    'p-howard-sant-ross',
    'p-sander-raieste',
    'p-will-falk',
    'p-ruben-lopez',
    'p-kaiser-gates',
    'p-toni-nakic',
    'p-marcis-steinbergs',
    'p-jean-marc-pansa',
    'p-emanuel-cate',
    'p-moussa-diagne',
    'p-joao-neves',
    'p-pablo-sevilla'
  ],

  // Dress Code & Guidelines (Fixed Standard Policies)
  dressCodeTravel: 'official team clothing',
  dressCodeHotel: 'official team clothing',
  comments: 'internal rules team',
  importantNotice: "don't forget your documentation",
};
