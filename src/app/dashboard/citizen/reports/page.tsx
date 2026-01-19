'use client';

/**
 * Citizen Reports Page
 * Shows all incidents reported by the citizen
 */

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { RootLayout } from '@/components/layout/RootLayout';
import { IncidentCard } from '@/components/incidents/IncidentCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CitizenReportsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const {
    data: incidentsData,
    isLoading,
    error,
  } = trpc.incidents.getAll.useQuery(
    {
      page: 1,
      pageSize: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    { enabled: !!session?.user?.id }
  );

  if (!session?.user) {
    router.push('/auth/signin');
    return null;
  }

  const incidents = incidentsData?.incidents || [];

  return (
    <RootLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">My Reports</h1>
            <p className="mt-2 text-sm text-gray-600">
              View and track all incidents you've reported
            </p>
          </div>
          <Link href="/dashboard/incidents/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Report New Incident
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <EmptyState
            icon={FileText}
            title="Error Loading Reports"
            description={error.message || 'Failed to load your reports. Please try again.'}
            action={{
              label: 'Retry',
              onClick: () => window.location.reload(),
            }}
          />
        ) : incidents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Reports Yet"
            description="You haven't reported any incidents yet. Click the button below to report your first incident."
            action={{
              label: 'Report Incident',
              onClick: () => router.push('/dashboard/incidents/new'),
            }}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {incidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                id={incident.id}
                title={incident.title}
                status={incident.status}
                severity={incident.severity}
                region={incident.region || ''}
                district={incident.district || ''}
                reportedBy={incident.users ? { name: incident.users.name } : undefined}
                createdAt={new Date(incident.createdAt)}
                assignedAgency={incident.agencies ? { name: incident.agencies.name } : null}
              />
            ))}
          </div>
        )}
      </div>
    </RootLayout>
  );
}
