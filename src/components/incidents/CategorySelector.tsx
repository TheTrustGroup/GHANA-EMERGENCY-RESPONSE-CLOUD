'use client';

/**
 * CategorySelector Component
 * Grid of category cards with icons for incident type selection
 */

import { Flame, Heart, Car, CloudRain, Shield, Wrench, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export type IncidentCategory =
  | 'fire'
  | 'medical'
  | 'accident'
  | 'natural_disaster'
  | 'crime'
  | 'infrastructure'
  | 'other';

interface Category {
  value: IncidentCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

const categories: Category[] = [
  {
    value: 'fire',
    label: 'Fire',
    icon: Flame,
    description: 'Fire emergencies, smoke, burning structures',
    color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
  },
  {
    value: 'medical',
    label: 'Medical Emergency',
    icon: Heart,
    description: 'Medical emergencies, injuries, health crises',
    color: 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100',
  },
  {
    value: 'accident',
    label: 'Accident',
    icon: Car,
    description: 'Traffic accidents, vehicle collisions',
    color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
  },
  {
    value: 'natural_disaster',
    label: 'Natural Disaster',
    icon: CloudRain,
    description: 'Floods, earthquakes, storms, landslides',
    color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
  },
  {
    value: 'crime',
    label: 'Crime',
    icon: Shield,
    description: 'Criminal activities, theft, violence',
    color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
  },
  {
    value: 'infrastructure',
    label: 'Infrastructure Failure',
    icon: Wrench,
    description: 'Power outages, water leaks, road damage',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100',
  },
  {
    value: 'other',
    label: 'Other',
    icon: AlertCircle,
    description: 'Other emergencies not listed above',
    color: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
  },
];

interface CategorySelectorProps {
  value?: IncidentCategory;
  onChange: (category: IncidentCategory) => void;
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = value === category.value;

        return (
          <Card
            key={category.value}
            className={cn(
              'cursor-pointer border-2 p-4 transition-all',
              category.color,
              isSelected && 'ring-2 ring-blue-600 ring-offset-2'
            )}
            onClick={() => onChange(category.value)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(category.value);
              }
            }}
          >
            <div className="flex flex-col items-center text-center">
              <Icon className={cn('mb-2 h-8 w-8', isSelected && 'scale-110')} />
              <h3 className="font-semibold">{category.label}</h3>
              <p className="mt-1 text-xs opacity-75">{category.description}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

