'use client';

/**
 * AgencyLogo Component
 * Displays agency logo with fallback support
 */

import { useState } from 'react';
import Image from 'next/image';
import { AgencyType } from '@prisma/client';
import { getAgencyLogo } from '@/lib/agency-logos';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgencyLogoProps {
  agencyName: string;
  agencyType: AgencyType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20',
};

export function AgencyLogo({
  agencyName,
  agencyType,
  size = 'md',
  className,
  showFallback = true,
}: AgencyLogoProps) {
  const [imageError, setImageError] = useState(false);
  const logoConfig = getAgencyLogo(agencyName, agencyType);
  const sizeClass = sizeClasses[size];

  // If we have a URL, try to display it
  if (logoConfig.url && !imageError) {
    return (
      <div className={cn('relative flex items-center justify-center overflow-hidden rounded-xl', sizeClass, className)}>
        <Image
          src={logoConfig.url}
          alt={logoConfig.alt}
          width={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 80}
          height={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 80}
          className="object-contain"
          unoptimized
          onError={() => {
            setImageError(true);
          }}
        />
      </div>
    );
  }

  // If we have SVG, render it
  if (logoConfig.svg && !imageError) {
    return (
      <div
        className={cn('relative flex items-center justify-center overflow-hidden rounded-xl bg-white p-2', sizeClass, className)}
        dangerouslySetInnerHTML={{ __html: logoConfig.svg }}
      />
    );
  }

  // Fallback to shield icon with initials
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg',
        sizeClass,
        className
      )}
    >
      {showFallback && logoConfig.fallback ? (
        <span className="text-xs font-black">{logoConfig.fallback}</span>
      ) : (
        <Shield className={size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : size === 'lg' ? 'h-8 w-8' : 'h-10 w-10'} />
      )}
    </div>
  );
}
