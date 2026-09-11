import React from 'react';
import { PlayerLicense } from '../types';

export const LICENSE_OPTIONS: { id: PlayerLicense; label: string; shortLabel: string; description: string }[] = [
  {
    id: 'JFL',
    label: 'JFL',
    shortLabel: 'JFL',
    description: 'Jugador Formación Local (España / ACB)',
  },
  {
    id: 'EUR',
    label: 'EUR',
    shortLabel: 'EUR',
    description: 'Comunitario / Cotonú (EUR y COT)',
  },
  {
    id: 'EXT',
    label: 'EXT',
    shortLabel: 'EXT',
    description: 'Extracomunitario',
  },
  {
    id: 'JFL BCL',
    label: 'JFL BCL',
    shortLabel: 'JFL BCL',
    description: 'Licencia especial JFL BCL (Marcis Steinbergs)',
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

export function normalizeLicense(license?: string): PlayerLicense {
  if (!license) return 'EXT';
  const clean = license.trim().toUpperCase();
  if (clean === 'JFL' || clean.includes('HOME GROWN (ACB)') || clean.includes('JFL ACB')) return 'JFL';
  if (clean === 'EUR' || clean.includes('EUROPEAN') || clean.includes('COTONOU') || clean === 'COT') return 'EUR';
  if (clean === 'JFL BCL' || clean.includes('BCL')) return 'JFL BCL';
  if (clean === 'EXT' || clean.includes('FOREIGN')) return 'EXT';
  return 'EXT';
}

export function getLicenseVisual(license?: PlayerLicense | string): LicenseVisual {
  const norm = normalizeLicense(license);

  switch (norm) {
    case 'JFL':
      return {
        id: 'JFL',
        label: 'JFL',
        shortLabel: 'JFL',
        badgeBgClass: 'bg-red-600',
        badgeTextClass: 'text-white',
        badgeBorderClass: 'border-red-500',
        cardPillActive: 'bg-red-600 text-white border-red-400 font-extrabold shadow-sm',
        style: {
          backgroundColor: '#dc2626', // Rojo
          color: '#ffffff',
        },
        pdfBadgeStyle: {
          backgroundColor: '#dc2626', // Rojo
          color: '#ffffff',
          fontWeight: '900',
        },
      };

    case 'EUR':
      return {
        id: 'EUR',
        label: 'EUR',
        shortLabel: 'EUR',
        badgeBgClass: 'bg-blue-600',
        badgeTextClass: 'text-white',
        badgeBorderClass: 'border-blue-500',
        cardPillActive: 'bg-blue-600 text-white border-blue-400 font-extrabold shadow-sm',
        style: {
          backgroundColor: '#2563eb', // Azul
          color: '#ffffff',
        },
        pdfBadgeStyle: {
          backgroundColor: '#2563eb', // Azul
          color: '#ffffff',
          fontWeight: '900',
        },
      };

    case 'JFL BCL':
      return {
        id: 'JFL BCL',
        label: 'JFL BCL',
        shortLabel: 'JFL BCL',
        badgeBgClass: '',
        badgeTextClass: 'text-white',
        badgeBorderClass: 'border-amber-400/80',
        cardPillActive: 'text-white border-amber-400 font-extrabold shadow-sm',
        style: {
          backgroundImage: 'linear-gradient(135deg, #dc2626 50%, #2563eb 50%)', // Mitad rojo, mitad azul diagonal
          color: '#ffffff',
          textShadow: '0 1px 2px rgba(0,0,0,0.85)',
        },
        pdfBadgeStyle: {
          backgroundImage: 'linear-gradient(135deg, #dc2626 50%, #2563eb 50%)', // Mitad rojo, mitad azul diagonal
          color: '#ffffff',
          fontWeight: '900',
          textShadow: '0 1px 2px rgba(0,0,0,0.9)',
        },
      };

    case 'EXT':
    default:
      return {
        id: 'EXT',
        label: 'EXT',
        shortLabel: 'EXT',
        badgeBgClass: 'bg-blue-950',
        badgeTextClass: 'text-white',
        badgeBorderClass: 'border-blue-900',
        cardPillActive: 'bg-blue-950 text-white border-blue-700 font-extrabold shadow-sm',
        style: {
          backgroundColor: '#172554', // Azul oscuro
          color: '#ffffff',
        },
        pdfBadgeStyle: {
          backgroundColor: '#172554', // Azul oscuro
          color: '#ffffff',
          fontWeight: '900',
        },
      };
  }
}
