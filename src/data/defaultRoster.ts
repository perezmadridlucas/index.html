import { TeamMember } from '../types';
import savedRosterData from './savedRoster.json';

// Plantilla oficial con todos los teléfonos reales, dorsales, cargos del staff y licencias actualizadas
export const DEFAULT_ROSTER: TeamMember[] = savedRosterData as TeamMember[];
