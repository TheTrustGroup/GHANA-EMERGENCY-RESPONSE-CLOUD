'use client';

/**
 * Citizen Emergency Contacts Page
 * Shows emergency contact numbers and quick dial options
 */

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RootLayout } from '@/components/layout/RootLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, AlertTriangle, Flame, Heart, Shield } from 'lucide-react';
import Link from 'next/link';

const emergencyContacts = [
  {
    name: 'Police Emergency',
    number: '191',
    description: 'Ghana Police Service',
    icon: Shield,
    color: 'bg-blue-600',
  },
  {
    name: 'Fire Service',
    number: '192',
    description: 'Ghana National Fire Service',
    icon: Flame,
    color: 'bg-red-600',
  },
  {
    name: 'Ambulance',
    number: '193',
    description: 'National Ambulance Service',
    icon: Heart,
    color: 'bg-green-600',
  },
  {
    name: 'NADMO',
    number: '0302-662123',
    description: 'National Disaster Management',
    icon: AlertTriangle,
    color: 'bg-orange-600',
  },
];

export default function CitizenContactsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) {
    router.push('/auth/signin');
    return null;
  }

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <RootLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Emergency Contacts</h1>
          <p className="mt-2 text-sm text-gray-600">
            Quick access to emergency services in Ghana
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {emergencyContacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <Card key={contact.name} className="overflow-hidden">
                <CardHeader className={`${contact.color} text-white`}>
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6" />
                    <div>
                      <CardTitle className="text-white">{contact.name}</CardTitle>
                      <p className="text-sm text-white/90">{contact.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{contact.number}</p>
                    </div>
                    <Button
                      onClick={() => handleCall(contact.number)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 rounded-lg bg-blue-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Important Information
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Use these numbers only for genuine emergencies</li>
            <li>• Stay calm and provide clear information when calling</li>
            <li>• Your location will help responders reach you faster</li>
            <li>• For non-emergencies, use the incident reporting system</li>
          </ul>
        </div>

        <div className="mt-6">
          <Link href="/dashboard/incidents/new">
            <Button variant="outline" className="w-full">
              Report Non-Emergency Incident
            </Button>
          </Link>
        </div>
      </div>
    </RootLayout>
  );
}
