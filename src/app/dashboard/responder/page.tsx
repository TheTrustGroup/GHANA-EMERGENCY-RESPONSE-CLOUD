'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc/client';
import { useDispatchUpdates } from '@/lib/realtime/pusher-client';
import { Button } from '@/components/ui/premium/Button';
import { Card, CardContent } from '@/components/ui/premium/Card';
import { Badge } from '@/components/ui/premium/Badge';
import {
  AlertCircle,
  Navigation,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Radio,
  Target,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ClientOnly } from '@/components/ui/ClientOnly';

export default function ResponderFieldOps() {
  const { data: session } = useSession();
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [gpsActive, setGpsActive] = useState(false);

  const { data: assignment } = trpc.dispatch.getMyActiveAssignment.useQuery(undefined, {
    enabled: !!session?.user?.id,
    refetchInterval: 15000,
  });

  const updateStatus = trpc.dispatch.updateStatus.useMutation();

  // Real-time dispatch with LOUD notification
  useDispatchUpdates(session?.user?.id || '', (data: any) => {
    // Maximum alert
    toast.error('🚨 NEW DISPATCH ASSIGNMENT!', {
      description:
        data.incidents?.title || data.incident?.title || 'An emergency requires your attention.',
      duration: 30000,
      className: 'bg-red-600 text-white text-lg font-bold',
    });

    // Sound + vibration
    if (typeof window !== 'undefined') {
      try {
        const audio = new Audio('/sounds/dispatch-siren.mp3');
        audio.volume = 1.0;
        audio.play().catch(() => {});
      } catch {}

      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    }
  });

  // GPS tracking
  useEffect(() => {
    if (!assignment) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation(pos);
        setGpsActive(true);
      },
      (err) => {
        console.error('GPS error:', err);
        setGpsActive(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [assignment]);

  // Active assignment view
  if (assignment) {
    return (
      <ActiveMissionView
        assignment={assignment}
        location={location}
        gpsActive={gpsActive}
        updateStatus={updateStatus}
      />
    );
  }

  // Available status view
  return <AvailableStatusView />;
}

function ActiveMissionView({ assignment, location, gpsActive, updateStatus }: any) {
  const nextActionMap: Record<string, any> = {
    DISPATCHED: {
      label: 'ACCEPT MISSION',
      status: 'ACCEPTED',
      color: 'from-green-600 to-green-700',
      icon: CheckCircle2,
    },
    ACCEPTED: {
      label: 'MARK EN ROUTE',
      status: 'EN_ROUTE',
      color: 'from-blue-600 to-blue-700',
      icon: Navigation,
    },
    EN_ROUTE: {
      label: 'ARRIVED AT SCENE',
      status: 'ARRIVED',
      color: 'from-purple-600 to-purple-700',
      icon: MapPin,
    },
    ARRIVED: {
      label: 'MISSION COMPLETE',
      status: 'COMPLETED',
      color: 'from-green-600 to-green-700',
      icon: CheckCircle2,
    },
  };

  const nextAction = nextActionMap[assignment.status as keyof typeof nextActionMap];

  const Icon = nextAction?.icon || CheckCircle2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* URGENT HEADER - Pulsing */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          ${
            assignment.incidents.severity === 'CRITICAL'
              ? 'animate-pulse-slow bg-gradient-to-r from-red-600 via-red-700 to-red-600'
              : 'bg-gradient-to-r from-red-600 to-red-700'
          }
          text-white shadow-2xl
        `}
      >
        <div className="mx-auto max-w-7xl p-6">
          <div className="flex items-start gap-4">
            <motion.div
              animate={
                assignment.incidents.severity === 'CRITICAL'
                  ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 2 }}
              className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm"
            >
              <AlertCircle className="h-12 w-12" />
            </motion.div>
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Badge
                  variant="critical"
                  size="lg"
                  pulse={assignment.incidents.severity === 'CRITICAL'}
                  className="bg-white font-black text-red-600"
                >
                  {assignment.incidents.severity}
                </Badge>
                <Badge size="lg" className="border-0 bg-white/20 text-white">
                  {assignment.incidents.category}
                </Badge>
              </div>
              <h1 className="mb-2 text-3xl font-black">
                {assignment.incidents.title || 'Emergency Response'}
              </h1>
              <p className="flex items-center gap-2 text-lg text-red-100">
                <MapPin className="h-5 w-5" />
                {assignment.incidents.region}, {assignment.incidents.district}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* GPS STATUS BAR */}
      <div
        className={`
        ${gpsActive ? 'bg-green-600' : 'bg-yellow-600'}
        text-white shadow-lg
      `}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full bg-white ${gpsActive ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-bold">
              {gpsActive ? '📡 GPS TRACKING ACTIVE' : '⚠️ GPS SEARCHING...'}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-sm">
            <Clock className="h-4 w-4" />
            <span className="font-bold">
              <ClientOnly fallback="Just now">
                {formatDistanceToNow(new Date(assignment.dispatchedAt), { addSuffix: true })}
              </ClientOnly>
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* MISSION PROGRESS */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
              MISSION PROGRESS
            </h3>
            <div className="space-y-4">
              <MissionStep
                label="Dispatched"
                completed
                time={formatTime(assignment.dispatchedAt)}
                icon={<Radio className="h-5 w-5" />}
              />
              <MissionStep
                label="Accepted"
                completed={assignment.acceptedAt !== null}
                active={assignment.status === 'DISPATCHED'}
                time={assignment.acceptedAt ? formatTime(assignment.acceptedAt) : null}
                icon={<CheckCircle2 className="h-5 w-5" />}
              />
              <MissionStep
                label="En Route"
                completed={assignment.enRouteAt !== null}
                active={assignment.status === 'ACCEPTED'}
                time={assignment.enRouteAt ? formatTime(assignment.enRouteAt) : null}
                icon={<Navigation className="h-5 w-5" />}
              />
              <MissionStep
                label="On Scene"
                completed={assignment.arrivedAt !== null}
                active={assignment.status === 'EN_ROUTE'}
                time={assignment.arrivedAt ? formatTime(assignment.arrivedAt) : null}
                icon={<Target className="h-5 w-5" />}
              />
              <MissionStep
                label="Completed"
                completed={assignment.completedAt !== null}
                active={assignment.status === 'ARRIVED'}
                time={assignment.completedAt ? formatTime(assignment.completedAt) : null}
                icon={<CheckCircle2 className="h-5 w-5" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* MAP EMBED */}
        <Card className="overflow-hidden border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <div className="aspect-video bg-slate-900">
            {location ? (
              <iframe
                src={`https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}&origin=${location.coords.latitude},${location.coords.longitude}&destination=${assignment.incidents.latitude},${assignment.incidents.longitude}&mode=driving`}
                className="h-full w-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                <div className="text-center">
                  <MapPin className="mx-auto mb-4 h-12 w-12 animate-pulse" />
                  <p className="font-semibold">Acquiring GPS location...</p>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-slate-700 bg-slate-900 p-4 text-center">
            <div>
              <p className="mb-1 text-xs text-slate-400">DISTANCE</p>
              <p className="font-bold text-white">~2.3 km</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-400">ETA</p>
              <p className="font-bold text-white">~8 min</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-400">SPEED</p>
              <p className="font-bold text-white">
                {location?.coords.speed ? `${Math.round(location.coords.speed * 3.6)} km/h` : '--'}
              </p>
            </div>
          </div>
        </Card>

        {/* PRIMARY ACTION - HUGE BUTTON */}
        {nextAction && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="xl"
              className={`
                group relative h-24 w-full overflow-hidden
                bg-gradient-to-r ${nextAction.color}
                text-2xl font-black shadow-2xl
              `}
              onClick={() => {
                updateStatus.mutate({
                  assignmentId: assignment.id,
                  status: nextAction.status,
                  latitude: location?.coords.latitude,
                  longitude: location?.coords.longitude,
                });
              }}
              icon={<Icon className="h-10 w-10" />}
            >
              {/* Animated shine */}
              <span className="absolute inset-0 -translate-x-full -skew-x-12 transform bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              <span className="relative">{nextAction.label}</span>
            </Button>
          </motion.div>
        )}

        {/* SECONDARY ACTIONS */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            variant="outline"
            className="h-20 border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700"
            icon={<Navigation className="h-6 w-6" />}
            onClick={() => {
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${assignment.incidents.latitude},${assignment.incidents.longitude}`,
                '_blank'
              );
            }}
          >
            <span className="text-lg font-bold">Navigate</span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-20 border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700"
            icon={<Phone className="h-6 w-6" />}
            onClick={() => (window.location.href = 'tel:191')}
          >
            <span className="text-lg font-bold">Call HQ</span>
          </Button>
        </div>

        {/* EMERGENCY SOS */}
        <Button
          size="lg"
          variant="danger"
          className="h-20 w-full border-4 border-red-500 bg-red-700 text-xl font-black hover:bg-red-800"
          icon={<AlertCircle className="h-8 w-8" />}
        >
          🚨 REQUEST IMMEDIATE BACKUP
        </Button>
      </div>
    </div>
  );
}

function AvailableStatusView() {
  const { data: stats } = trpc.users.getMyStats.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* AVAILABLE STATUS HERO */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-green-800">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
          >
            <Activity className="h-16 w-16 animate-pulse text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-5xl font-black text-white"
          >
            READY FOR DUTY
          </motion.h1>

          <p className="mb-8 text-2xl text-green-100">Waiting for dispatch assignment</p>

          <div className="inline-flex items-center gap-3 rounded-full bg-white/20 px-8 py-4 backdrop-blur-sm">
            <div className="h-4 w-4 animate-pulse rounded-full bg-white" />
            <span className="text-lg font-bold text-white">GPS ACTIVE</span>
          </div>
        </div>
      </div>

      {/* STATS & PERFORMANCE */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="mb-8 text-3xl font-bold text-gray-900">Today's Performance</h2>

        <div className="mb-12 grid grid-cols-3 gap-6">
          <Card variant="elevated" hoverable>
            <CardContent className="p-6 text-center">
              <div className="mb-2 text-5xl font-black text-green-600">
                {stats?.completedToday || 0}
              </div>
              <div className="text-sm font-semibold text-gray-600">Missions Completed</div>
            </CardContent>
          </Card>
          <Card variant="elevated" hoverable>
            <CardContent className="p-6 text-center">
              <div className="mb-2 text-5xl font-black text-blue-600">
                {stats?.avgResponseTime || 0}m
              </div>
              <div className="text-sm font-semibold text-gray-600">Avg Response Time</div>
            </CardContent>
          </Card>
          <Card variant="elevated" hoverable>
            <CardContent className="p-6 text-center">
              <div className="mb-2 text-5xl font-black text-purple-600">
                {stats?.totalDistance || 0}km
              </div>
              <div className="text-sm font-semibold text-gray-600">Distance Traveled</div>
            </CardContent>
          </Card>
        </div>

        {/* QUICK CONTACTS */}
        <h2 className="mb-6 text-3xl font-bold text-gray-900">Quick Contact</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            variant="outline"
            className="h-20 justify-start"
            icon={<Phone className="h-6 w-6" />}
            onClick={() => (window.location.href = 'tel:191')}
          >
            <span className="text-lg font-bold">Call Dispatch Center</span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-20 justify-start"
            icon={<Phone className="h-6 w-6" />}
            onClick={() => (window.location.href = 'tel:192')}
          >
            <span className="text-lg font-bold">Call Agency HQ</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function MissionStep({ label, completed, active, time, icon }: any) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`
        relative flex h-12 w-12 items-center justify-center rounded-xl border-2
        transition-all duration-300
        ${
          completed
            ? 'border-green-600 bg-green-600'
            : active
              ? 'animate-pulse border-blue-600 bg-blue-600'
              : 'border-slate-600 bg-slate-700'
        }
      `}
      >
        {completed ? (
          <CheckCircle2 className="h-6 w-6 text-white" />
        ) : active ? (
          <div className="relative">
            <div className="absolute h-5 w-5 animate-ping rounded-full bg-white" />
            <div className="h-5 w-5 rounded-full bg-white" />
          </div>
        ) : (
          icon
        )}
      </div>
      <div className="flex-1">
        <p
          className={`text-lg font-bold ${
            completed ? 'text-green-400' : active ? 'text-blue-400' : 'text-slate-500'
          }`}
        >
          {label}
        </p>
        {time && <p className="font-mono text-sm text-slate-400">{time}</p>}
      </div>
      {completed && <CheckCircle2 className="h-6 w-6 text-green-400" />}
    </div>
  );
}

function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
