'use client';

/**
 * SeveritySelector Component
 * Radio group with color-coded severity options
 */

import { IncidentSeverity } from '@prisma/client';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

interface SeverityOption {
  value: IncidentSeverity;
  label: string;
  description: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const severities: SeverityOption[] = [
  {
    value: IncidentSeverity.LOW,
    label: 'Low',
    description: 'Minor issue, no immediate danger',
    color: 'border-green-500 bg-green-50 text-green-700',
    icon: Info,
  },
  {
    value: IncidentSeverity.MEDIUM,
    label: 'Medium',
    description: 'Requires attention, limited impact',
    color: 'border-yellow-500 bg-yellow-50 text-yellow-700',
    icon: AlertCircle,
  },
  {
    value: IncidentSeverity.HIGH,
    label: 'High',
    description: 'Serious situation, rapid response needed',
    color: 'border-orange-500 bg-orange-50 text-orange-700',
    icon: AlertTriangle,
  },
  {
    value: IncidentSeverity.CRITICAL,
    label: 'Critical',
    description: 'Life-threatening, immediate action required',
    color: 'border-red-500 bg-red-50 text-red-700',
    icon: XCircle,
  },
];

interface SeveritySelectorProps {
  value?: IncidentSeverity;
  onChange: (severity: IncidentSeverity) => void;
}

export function SeveritySelector({ value, onChange }: SeveritySelectorProps) {
  return (
    <RadioGroup value={value} onValueChange={(val: string) => onChange(val as IncidentSeverity)}>
      <div className="grid gap-4 md:grid-cols-2">
        {severities.map((severity) => {
          const Icon = severity.icon;
          const isSelected = value === severity.value;

          return (
            <div key={severity.value}>
              <RadioGroupItem
                value={severity.value}
                id={severity.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={severity.value}
                className={cn(
                  'flex cursor-pointer items-center space-x-4 rounded-lg border-2 p-4 transition-all',
                  severity.color,
                  isSelected && 'ring-2 ring-blue-600 ring-offset-2'
                )}
              >
                <Icon className="h-6 w-6" />
                <div className="flex-1">
                  <div className="font-semibold">{severity.label}</div>
                  <div className="text-sm opacity-75">{severity.description}</div>
                </div>
              </Label>
            </div>
          );
        })}
      </div>
    </RadioGroup>
  );
}

