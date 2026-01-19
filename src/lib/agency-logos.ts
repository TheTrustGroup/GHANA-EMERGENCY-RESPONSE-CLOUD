/**
 * Ghana Emergency Agency Logos
 * Maps agency names and types to their official logos
 */

import { AgencyType } from '@prisma/client';

export interface AgencyLogoConfig {
  url?: string;
  svg?: string;
  alt: string;
  fallback?: string;
}

/**
 * Get logo configuration for an agency based on name and type
 */
export function getAgencyLogo(agencyName: string, agencyType: AgencyType): AgencyLogoConfig {
  const name = agencyName.toLowerCase();
  
  // NADMO (National Disaster Management Organization)
  if (name.includes('nadmo') || agencyType === AgencyType.NADMO) {
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" fill="#FF6B35" stroke="#000" stroke-width="3"/>
        <text x="100" y="120" font-family="Arial, sans-serif" font-size="60" font-weight="bold" text-anchor="middle" fill="white">N</text>
        <text x="100" y="160" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="white">NADMO</text>
      </svg>`,
      alt: 'NADMO Logo',
      fallback: 'NADMO',
    };
  }
  
  // Ghana National Fire Service
  if (name.includes('fire') || agencyType === AgencyType.FIRE_SERVICE) {
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#DC2626" rx="10"/>
        <path d="M100 30 L130 80 L100 100 L70 80 Z" fill="#FFD700" stroke="#000" stroke-width="2"/>
        <circle cx="100" cy="130" r="30" fill="#FFD700" stroke="#000" stroke-width="2"/>
        <text x="100" y="180" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">GNFS</text>
      </svg>`,
      alt: 'Ghana National Fire Service Logo',
      fallback: 'GNFS',
    };
  }
  
  // Ghana Police Service
  if (name.includes('police') || agencyType === AgencyType.POLICE) {
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="85" fill="#1E40AF" stroke="#FFD700" stroke-width="4"/>
        <path d="M100 30 L120 70 L100 85 L80 70 Z" fill="#FFD700" stroke="#000" stroke-width="2"/>
        <circle cx="100" cy="120" r="25" fill="#FFD700" stroke="#000" stroke-width="2"/>
        <text x="100" y="175" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="white">GPS</text>
      </svg>`,
      alt: 'Ghana Police Service Logo',
      fallback: 'GPS',
    };
  }
  
  // National Ambulance Service
  if (name.includes('ambulance') || agencyType === AgencyType.AMBULANCE) {
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#059669" rx="10"/>
        <path d="M50 100 L100 50 L150 100 L100 150 Z" fill="white" stroke="#000" stroke-width="3"/>
        <circle cx="100" cy="100" r="20" fill="#DC2626"/>
        <text x="100" y="180" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">NAS</text>
      </svg>`,
      alt: 'National Ambulance Service Logo',
      fallback: 'NAS',
    };
  }
  
  // Private/Other agencies - use generic shield
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>`,
    alt: 'Agency Logo',
    fallback: agencyName.substring(0, 2).toUpperCase(),
  };
}

/**
 * Get logo URL or generate SVG data URL
 */
export function getLogoSource(config: AgencyLogoConfig): string {
  if (config.url) {
    return config.url;
  }
  
  if (config.svg) {
    const encoded = encodeURIComponent(config.svg);
    return `data:image/svg+xml,${encoded}`;
  }
  
  // Fallback to initials
  return '';
}
