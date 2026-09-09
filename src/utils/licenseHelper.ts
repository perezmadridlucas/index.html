import React from 'react';
import { PlayerLicense } from '../types';

export const LICENSE_OPTIONS: { id: PlayerLicense; label: string; shortLabel: string; description: string }[] = [
  {
    id: 'Foreign player',
    label: 'Foreign player',
    shortLabel: 'Foreign',
    description: 'Extracomunitario (USA / otros)',
  },
  {
    id: 'European - Cotonou',
    label: 'European - Cotonou',
    shortLabel: 'Cotonou',
    description: 'Pasaporte comunitario europeo o país Cotonú',
  },
  {
    id: 'Home grown (ACB)',
    label: 'Home grown (ACB)',
    shortLabel: 'JFL ACB',
    description: 'Jugador de formación local (ACB)',
  },
  {
    id: 'Home grown (BCL)',
    label: 'Home grown (BCL)',
    shortLabel: 'JFL BCL',
    description: 'Jugador de formación local (Basketball Champions League)',
  },
];

export interface LicenseVisual {
  id: PlayerLicense;
  label: string;
  shortLabel: string;
  badgeBgClass: string;
  badgeTextClass: string;
  badgeBorderClass: string;
  cardPillActive: string;
  style: React.CSSProperties;
  pdfBadgeStyle: React.CSSProperties;
}

export function getLicenseVisual(license?: PlayerLicense | string): LicenseVisual {
  switch (license) {
    case 'European - Cotonou':
      return {
        id: 'European - Cotonou',
        label: 'European - Cotonou',
        shortLabel: 'Cotonou',
        badgeBgClass: 'bg-blue-700',
        badgeTextClass: 'text-amber-300',
        badgeBorderClass: 'border-blue-500',
        cardPillActive: 'bg-blue-600 text-amber-300 border-blue-400 font-extrabold shadow-sm',
        style: {
          backgroundColor: '#1d4ed8',
          color: '#fde047',
        },
        pdfBadgeStyle: {
          backgroundColor: '#1d4ed8', // Royal Blue
          color: '#fde047', // Yellow
        },
      };

    case 'Home grown (ACB)':
      return {
        id: 'Home grown (ACB)',
        label: 'Home grown (ACB)',
        shortLabel: 'JFL ACB',
        badgeBgClass: 'bg-red-700',
        badgeTextClass: 'text-amber-300',
        badgeBorderClass: 'border-red-500',
        cardPillActive: 'bg-red-600 text-amber-300 border-red-400 font-extrabold shadow-sm',
        style: {
          backgroundColor: '#dc2626',
          color: '#fde047',
        },
        pdfBadgeStyle: {
          backgroundColor: '#dc2626', // Red
          color: '#fde047', // Yellow
        },
      };

    case 'Home grown (BCL)':
      return {
        id: 'Home grown (BCL)',
        label: 'Home grown (BCL)',
        shortLabel: 'JFL BCL',
        badgeBgClass: '',
        badgeTextClass: 'text-amber-300',
        badgeBorderClass: 'border-amber-400/80',
        cardPillActive: 'text-amber-300 border-amber-400 font-extrabold shadow-sm',
        style: {
          backgroundImage: 'linear-gradient(135deg, #dc2626 50%, #1d4ed8 50%)',
          color: '#fde047',
          textShadow: '0 1px 2px rgba(0,0,0,0.85)',
        },
        pdfBadgeStyle: {
          backgroundImage: 'linear-gradient(135deg, #dc2626 50%, #1d4ed8 50%)', // Diagonal split red/blue
          color: '#fde047', // Yellow
          textShadow: '0 1px 2px rgba(0,0,0,0.9)',
        },
      };

    case 'Foreign player':
    default:
      return {
        id: 'Foreign player',
        label: 'Foreign player',
        shortLabel: 'Foreign',
        badgeBgClass: 'bg-slate-900',
        badgeTextClass: 'text-amber-300',
        badgeBorderClass: 'border-stone-700',
        cardPillActive: 'bg-slate-900 text-amber-300 border-amber-500/50 font-extrabold shadow-sm',
        style: {
          backgroundColor: '#0f172a',
          color: '#fde047',
        },
        pdfBadgeStyle: {
          backgroundColor: '#0f172a', // Black / Dark Slate
          color: '#fde047', // Yellow
        },
      };
  }
}
