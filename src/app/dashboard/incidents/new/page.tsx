'use client';

/**
 * New Incident Page
 * Page for reporting new incidents
 */

import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { IncidentForm } from '@/components/incidents/IncidentForm';
import { AlertTriangle } from 'lucide-react';

export default function NewIncidentPage() {
  return (
    <RootLayout>
      <DashboardShell
        title="Report New Incident"
        description="Provide details about the emergency situation"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 rounded-lg border-l-4 border-blue-600 bg-blue-50 p-4">
            <div className="flex items-start">
              <AlertTriangle className="mr-3 h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Important Information</h3>
                <p className="mt-1 text-sm text-blue-800">
                  Please provide accurate information about the incident. Your report will be
                  reviewed and dispatched to the appropriate emergency response agencies.
                </p>
              </div>
            </div>
          </div>

          <IncidentForm />
        </div>
      </DashboardShell>
    </RootLayout>
  );
}

