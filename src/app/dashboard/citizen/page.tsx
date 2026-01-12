'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/premium/Button';
import { Card, CardContent } from '@/components/ui/premium/Card';
import { Badge } from '@/components/ui/premium/Badge';
import {
  AlertCircle,
  MapPin,
  Clock,
  ChevronRight,
  Bell,
  Shield,
  Heart,
  Flame,
  Car,
  Home,
  FileText,
  User,
  Plus,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ClientOnly } from '@/components/ui/ClientOnly';

export default function CitizenDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  const { data: myIncidents, isLoading } = trpc.incidents.getAll.useQuery(
    {
      page: 1,
      pageSize: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    { enabled: !!session?.user?.id, refetchInterval: 30000 }
  );

  // Calculate stats from incidents
  const stats = {
    totalReports: myIncidents?.incidents.length || 0,
    activeReports:
      myIncidents?.incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED')
        .length || 0,
    resolvedReports:
      myIncidents?.incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED')
        .length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* HERO SECTION - Emergency CTA */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Welcome Message */}
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mb-4 inline-flex items-center gap-3 rounded-full bg-white/10 px-6 py-3 backdrop-blur-sm"
              >
                <div className="h-3 w-3 animate-pulse rounded-full bg-green-400" />
                <span className="font-semibold text-white">System Online</span>
              </motion.div>

              <h1 className="mb-3 text-4xl font-black text-white sm:text-5xl">
                Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}
              </h1>
              <p className="text-xl text-red-100">Emergency help is one tap away</p>
            </div>

            {/* EMERGENCY BUTTON - Hero Element */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="xl"
                className="
                  group relative 
                  min-h-[80px]
                  overflow-hidden border-4
                  border-white/50
                  bg-white px-16
                  text-2xl
                  font-black
                  text-red-600
                  shadow-2xl
                  shadow-red-900/50
                  hover:bg-red-50
                  hover:shadow-red-900/70
                "
                onClick={() => router.push('/report')}
                icon={<AlertCircle className="h-10 w-10" />}
              >
                {/* Pulse animation */}
                <span className="absolute inset-0 animate-ping rounded-xl bg-white/30" />
                <span className="relative">REPORT EMERGENCY</span>
              </Button>
            </motion.div>

            {/* Quick Emergency Contacts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
            >
              <EmergencyContact
                icon={<Shield className="h-5 w-5" />}
                name="Police"
                number="191"
                color="blue"
              />
              <EmergencyContact
                icon={<Flame className="h-5 w-5" />}
                name="Fire"
                number="192"
                color="orange"
              />
              <EmergencyContact
                icon={<Heart className="h-5 w-5" />}
                name="Ambulance"
                number="193"
                color="green"
              />
              <EmergencyContact
                icon={<AlertCircle className="h-5 w-5" />}
                name="NADMO"
                number="0800"
                color="purple"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* STATS GRID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
          <StatsCard
            icon={<FileText className="h-6 w-6" />}
            label="Total Reports"
            value={stats.totalReports}
            trend={null}
            color="blue"
          />
          <StatsCard
            icon={<Clock className="h-6 w-6" />}
            label="Active Now"
            value={stats.activeReports}
            trend={null}
            color="orange"
            pulse={stats.activeReports > 0}
          />
          <StatsCard
            icon={<CheckCircle2 className="h-6 w-6" />}
            label="Resolved"
            value={stats.resolvedReports}
            trend={null}
            color="green"
          />
        </motion.div>

        {/* MY REPORTS SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">My Emergency Reports</h2>
              <p className="mt-1 text-gray-600">Track your submitted emergencies</p>
            </div>
            {myIncidents?.incidents && myIncidents.incidents.length > 0 && (
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/incidents')}
                icon={<ChevronRight className="h-5 w-5" />}
                iconPosition="right"
              >
                View All
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="mb-4 h-6 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !myIncidents?.incidents || myIncidents.incidents.length === 0 ? (
            <Card variant="gradient" className="border-2 border-dashed">
              <CardContent className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
                    <FileText className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">No Reports Yet</h3>
                  <p className="mx-auto mb-6 max-w-md text-gray-600">
                    You haven't reported any emergencies. When you do, they'll appear here for easy
                    tracking.
                  </p>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => router.push('/report')}
                    icon={<Plus className="h-5 w-5" />}
                  >
                    Report Your First Emergency
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myIncidents.incidents.map((incident, index) => (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <IncidentCard incident={incident} router={router} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* SAFETY TIPS SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12"
        >
          <h2 className="mb-6 text-3xl font-bold text-gray-900">Safety Tips</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <SafetyTipCard
              icon={<Flame className="h-6 w-6" />}
              title="Fire Safety"
              description="Keep a fire extinguisher at home and know how to use it. Check smoke detectors monthly."
              color="orange"
            />
            <SafetyTipCard
              icon={<Heart className="h-6 w-6" />}
              title="Medical Emergency"
              description="Learn basic first aid and CPR. Know your blood type and keep medical records handy."
              color="red"
            />
            <SafetyTipCard
              icon={<Car className="h-6 w-6" />}
              title="Road Safety"
              description="Always wear seatbelts. Keep emergency contacts in your phone. Have a first aid kit."
              color="blue"
            />
            <SafetyTipCard
              icon={<Home className="h-6 w-6" />}
              title="Home Preparedness"
              description="Create an emergency kit with water, food, flashlight, and batteries. Plan evacuation routes."
              color="green"
            />
          </div>
        </motion.div>
      </div>

      {/* FLOATING BOTTOM NAV - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-2xl lg:hidden">
        <div className="grid h-20 grid-cols-4">
          <NavButton icon={<Home />} label="Home" active />
          <NavButton
            icon={<FileText />}
            label="Reports"
            onClick={() => router.push('/dashboard/incidents')}
          />
          <NavButton
            icon={<Bell />}
            label="Alerts"
            onClick={() => router.push('/dashboard/notifications')}
          />
          <NavButton
            icon={<User />}
            label="Profile"
            onClick={() => router.push('/dashboard/settings')}
          />
        </div>
      </div>
    </div>
  );
}

// HELPER COMPONENTS

function EmergencyContact({
  icon,
  name,
  number,
  color,
}: {
  icon: React.ReactNode;
  name: string;
  number: string;
  color: 'blue' | 'orange' | 'green' | 'purple';
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  };

  return (
    <button
      onClick={() => (window.location.href = `tel:${number}`)}
      className={`
        bg-gradient-to-br ${colors[color]}
        group transform rounded-xl
        p-4 text-white
        shadow-lg transition-all duration-200
        hover:scale-105 hover:shadow-xl
        active:scale-95
      `}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-full bg-white/20 p-2 transition-colors group-hover:bg-white/30">
          {icon}
        </div>
        <div className="text-center">
          <p className="text-sm font-bold">{name}</p>
          <p className="text-xs opacity-90">{number}</p>
        </div>
      </div>
    </button>
  );
}

function StatsCard({
  icon,
  label,
  value,
  trend,
  color,
  pulse,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  trend: number | null;
  color: 'blue' | 'orange' | 'green';
  pulse?: boolean;
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600',
  };

  return (
    <Card variant="elevated" hoverable>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div
            className={`
            bg-gradient-to-br ${colors[color]}
            rounded-xl p-3 text-white
            shadow-lg
            ${pulse ? 'animate-pulse' : ''}
          `}
          >
            {icon}
          </div>
          {trend !== null && (
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${
                trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              {trend > 0 ? '+' : ''}
              {trend}%
            </div>
          )}
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-600">{label}</p>
          <p className="text-4xl font-black text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function IncidentCard({ incident, router }: { incident: any; router: any }) {
  const statusColors: Record<string, string> = {
    REPORTED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    DISPATCHED: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-200',
    RESOLVED: 'bg-green-100 text-green-800 border-green-200',
    CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const severityVariant: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
  };

  return (
    <Card
      variant="elevated"
      hoverable
      clickable
      onClick={() => router.push(`/dashboard/incidents/${incident.id}`)}
    >
      {/* Status bar */}
      <div
        className={`h-2 ${
          incident.status === 'RESOLVED' || incident.status === 'CLOSED'
            ? 'bg-green-500'
            : incident.status === 'IN_PROGRESS'
              ? 'bg-blue-500'
              : incident.status === 'DISPATCHED'
                ? 'bg-purple-500'
                : 'bg-yellow-500'
        }`}
      />

      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant={severityVariant[incident.severity] || 'default'} size="sm">
                {incident.severity}
              </Badge>
              <Badge variant="default" size="sm">
                {incident.category}
              </Badge>
              <span
                className={`
                rounded-full border-2 px-3 py-1 text-xs font-semibold
                ${statusColors[incident.status] || statusColors.REPORTED}
              `}
              >
                {incident.status}
              </span>
            </div>
            <h3 className="mb-2 line-clamp-1 text-xl font-bold text-gray-900">
              {incident.title || incident.description?.substring(0, 50) || 'Emergency Report'}
            </h3>
          </div>
          <ChevronRight className="ml-4 h-6 w-6 flex-shrink-0 text-gray-400" />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <ClientOnly>
              <span>{formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}</span>
            </ClientOnly>
          </div>
          {incident.region && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{incident.region}</span>
            </div>
          )}
        </div>

        {incident.assignedAgency && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Assigned to {incident.assignedAgency.name}
                </p>
                <p className="text-xs text-blue-700">Help is on the way</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SafetyTipCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'orange' | 'red' | 'blue' | 'green';
}) {
  const colors = {
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
  };

  return (
    <Card variant="elevated" hoverable>
      <CardContent className="p-6">
        <div
          className={`
          inline-flex items-center justify-center
          bg-gradient-to-br ${colors[color]}
          mb-4 rounded-xl p-3 text-white
          shadow-lg
        `}
        >
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
        <p className="leading-relaxed text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-1
        transition-all duration-200
        ${active ? 'text-red-600' : 'text-gray-600 hover:text-gray-900'}
      `}
    >
      <div
        className={`
        ${active ? 'scale-110' : 'scale-100'}
        transition-transform duration-200
      `}
      >
        {icon}
      </div>
      <span className="text-xs font-semibold">{label}</span>
      {active && <div className="h-1 w-1 rounded-full bg-red-600" />}
    </button>
  );
}
