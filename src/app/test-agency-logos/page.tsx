'use client';

/**
 * Test Page for Agency Logos
 * Displays all agency logos to verify they work correctly
 */

import { AgencyLogo } from '@/components/agency/AgencyLogo';
import { AgencyType } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const testAgencies = [
  {
    name: 'NADMO Headquarters',
    type: AgencyType.NADMO,
  },
  {
    name: 'Ghana National Fire Service - Tema',
    type: AgencyType.FIRE_SERVICE,
  },
  {
    name: 'Ghana Police Service - Kumasi',
    type: AgencyType.POLICE,
  },
  {
    name: 'National Ambulance Service - Takoradi',
    type: AgencyType.AMBULANCE,
  },
  {
    name: 'SecureGuard Emergency Services',
    type: AgencyType.PRIVATE_RESPONDER,
  },
];

export default function TestAgencyLogosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Agency Logo Test Page
          </h1>
          <p className="text-gray-600">
            Testing agency logos for all Ghana emergency response agencies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testAgencies.map((agency) => (
            <Card key={agency.name} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="text-lg">{agency.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Large Logo */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-sm font-semibold text-gray-600">Large (xl)</div>
                    <AgencyLogo
                      agencyName={agency.name}
                      agencyType={agency.type}
                      size="xl"
                      className="shadow-lg"
                    />
                  </div>

                  {/* Medium Logo */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-sm font-semibold text-gray-600">Medium (lg)</div>
                    <AgencyLogo
                      agencyName={agency.name}
                      agencyType={agency.type}
                      size="lg"
                      className="shadow-md"
                    />
                  </div>

                  {/* Small Logo */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-sm font-semibold text-gray-600">Small (md)</div>
                    <AgencyLogo
                      agencyName={agency.name}
                      agencyType={agency.type}
                      size="md"
                    />
                  </div>

                  {/* Extra Small Logo */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-sm font-semibold text-gray-600">Extra Small (sm)</div>
                    <AgencyLogo
                      agencyName={agency.name}
                      agencyType={agency.type}
                      size="sm"
                    />
                  </div>

                  {/* Agency Info */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div><strong>Type:</strong> {agency.type}</div>
                      <div><strong>Name:</strong> {agency.name}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard Preview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Dashboard Header Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {testAgencies.map((agency) => (
                <div
                  key={agency.name}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-white"
                >
                  <AgencyLogo
                    agencyName={agency.name}
                    agencyType={agency.type}
                    size="lg"
                    className="rounded-2xl shadow-lg shadow-blue-500/50"
                  />
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      {agency.name}
                    </h2>
                    <p className="text-sm font-medium text-gray-600">
                      Agency Performance Dashboard
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
