'use client';

import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/premium/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/premium/Card';
import { Badge } from '@/components/ui/premium/Badge';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Download,
  UserPlus,
  Award,
  Target,
  Shield
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ClientOnly } from '@/components/ui/ClientOnly';
import { AgencyLogo } from '@/components/agency/AgencyLogo';

export default function AgencyAdminDashboard() {
  const { data: session } = useSession();
  const agencyId = session?.user?.agencyId;

  const { data: stats } = trpc.agencies.getAgencyStats.useQuery(
    { agencyId: agencyId || '' },
    { enabled: !!agencyId }
  );

  const { data: team } = trpc.users.getByAgency.useQuery(
    { agencyId: agencyId || '' },
    { enabled: !!agencyId }
  );

  const { data: incidents } = trpc.incidents.getAll.useQuery({
    page: 1,
    pageSize: 50,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">

      {/* TOP HEADER - Professional */}
      <div className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {stats?.agency ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <AgencyLogo
                    agencyName={stats.agency.name}
                    agencyType={stats.agency.type}
                    size="lg"
                    className="rounded-2xl shadow-lg shadow-blue-500/50"
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/50"
                >
                  <Shield className="h-7 w-7 text-white" />
                </motion.div>
              )}
              <div>
                <h1 className="text-2xl font-black text-gray-900">
                  {stats?.agency.name || 'Agency Dashboard'}
                </h1>
                <p className="text-sm font-medium text-gray-600">
                  Agency Performance Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                icon={<Download className="h-4 w-4" />}
              >
                Export Report
              </Button>
              <Button
                variant="secondary"
                icon={<UserPlus className="h-4 w-4" />}
              >
                Add Team Member
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* KEY METRICS GRID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <MetricCard
            icon={AlertCircle}
            label="Active Incidents"
            value={stats?.activeIncidents || 0}
            change={12}
            trending="up"
            color="red"
            description="Currently assigned to your team"
          />
          <MetricCard
            icon={Users}
            label="Team Availability"
            value={`${stats?.availableResponders || 0}/${stats?.totalResponders || 0}`}
            change={null}
            trending={null}
            color="blue"
            description="Responders ready for dispatch"
          />
          <MetricCard
            icon={Clock}
            label="Avg Response Time"
            value={`${stats?.avgResponseTime || 0}m`}
            change={-18}
            trending="down"
            color="green"
            description="18% improvement this week"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Resolved Today"
            value={stats?.resolvedToday || 0}
            change={8}
            trending="up"
            color="purple"
            description={`${stats?.resolutionRate || 0}% success rate`}
          />
        </motion.div>

        {/* PERFORMANCE SCORE + TEAM STATUS */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">

          {/* TEAM STATUS - 2 columns */}
          <Card variant="elevated" className="lg:col-span-2">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-transparent">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Team Status
                </CardTitle>
                <Button variant="ghost" size="sm">
                  View All →
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {team?.slice(0, 6).map((member: any, index: number) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TeamMemberCard member={member} />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* PERFORMANCE SCORE - 1 column */}
          <Card variant="elevated">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Performance Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center p-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="relative mb-6 h-48 w-48"
              >
                {/* Circular progress */}
                <svg className="h-full w-full -rotate-90 transform">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#e5e7eb"
                    strokeWidth="16"
                    fill="none"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#gradient)"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - 0.92) }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-black text-transparent">
                    92
                  </div>
                  <div className="text-sm font-semibold text-gray-600">out of 100</div>
                </div>
              </motion.div>

              <Badge className="mb-6 border-0 bg-green-100 text-green-800">
                <TrendingUp className="mr-1 h-3 w-3" />
                +5 from last week
              </Badge>

              <div className="w-full space-y-3">
                <ScoreBreakdown label="Response Time" score={95} />
                <ScoreBreakdown label="Resolution Rate" score={90} />
                <ScoreBreakdown label="Team Efficiency" score={91} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ANALYTICS CHARTS */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">

          {/* RESPONSE TRENDS */}
          <Card variant="elevated">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Response Trends (30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={stats?.trendsData || []}>
                  <defs>
                    <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="day"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="incidents"
                    stroke="#3b82f6"
                    fill="url(#colorIncidents)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* INCIDENTS BY CATEGORY */}
          <Card variant="elevated">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Incidents by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats?.categoryData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="category"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#barGradient)"
                    radius={[12, 12, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* RECENT INCIDENTS TABLE */}
        <Card variant="elevated">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-600" />
                Recent Assignments
              </CardTitle>
              <Button variant="ghost" size="sm">
                View All →
              </Button>
            </div>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {incidents?.incidents.slice(0, 8).map((incident, index) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="cursor-pointer p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex flex-1 items-center justify-between gap-4">
                  <div className={`h-16 w-1 rounded-full ${
                    incident.severity === 'CRITICAL' ? 'bg-red-600' :
                    incident.severity === 'HIGH' ? 'bg-orange-500' :
                    incident.severity === 'MEDIUM' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge
                        variant={incident.severity === 'CRITICAL' ? 'critical' : 'high'}
                        size="sm"
                      >
                        {incident.severity}
                      </Badge>
                      <Badge variant="default" size="sm">
                        {incident.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        <ClientOnly fallback="Just now">
                          {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                        </ClientOnly>
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">{incident.title || 'Emergency Report'}</p>
                    <p className="text-sm text-gray-600">
                      {incident.region}, {incident.district}
                    </p>
                  </div>
                  <Badge
                    variant={incident.status === 'RESOLVED' ? 'success' : 'default'}
                    size="sm"
                  >
                    {incident.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, change, trending, color, description }: any) {
  const colors: Record<string, any> = {
    red: {
      bg: 'from-red-500 to-red-600',
      light: 'bg-red-100',
      text: 'text-red-600',
      border: 'border-l-red-600'
    },
    blue: {
      bg: 'from-blue-500 to-blue-600',
      light: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-l-blue-600'
    },
    green: {
      bg: 'from-green-500 to-green-600',
      light: 'bg-green-100',
      text: 'text-green-600',
      border: 'border-l-green-600'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      light: 'bg-purple-100',
      text: 'text-purple-600',
      border: 'border-l-purple-600'
    },
  };

  const config = colors[color] || colors.blue;

  return (
    <Card variant="elevated" hoverable className={`border-l-4 ${config.border}`}>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className={`rounded-xl bg-gradient-to-br ${config.bg} p-3 shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {change !== null && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              (trending === 'up' && change > 0) || (trending === 'down' && change < 0)
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {(trending === 'up' && change > 0) || (trending === 'down' && change < 0) ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold text-gray-600">{label}</p>
          <p className="mb-2 text-4xl font-black text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMemberCard({ member }: { member: { id: string; name: string | null; email: string; phone: string | null; role: string; isActive: boolean } }) {
  // Mock status - in real app, get from dispatch assignments
  const statusConfig: Record<string, any> = {
    AVAILABLE: { color: 'bg-green-500', label: 'Available', badge: 'default' },
    DISPATCHED: { color: 'bg-blue-500', label: 'Dispatched', badge: 'secondary' },
    EN_ROUTE: { color: 'bg-purple-500', label: 'En Route', badge: 'secondary' },
    ON_SCENE: { color: 'bg-orange-500', label: 'On Scene', badge: 'warning' },
    OFF_DUTY: { color: 'bg-gray-400', label: 'Off Duty', badge: 'outline' },
  };

  const status = 'AVAILABLE'; // Default
  const config = statusConfig[status] || { color: 'bg-gray-400', label: 'Unknown', badge: 'outline' };

  return (
    <div className="cursor-pointer rounded-xl border-2 p-4 transition-all hover:border-blue-300 hover:bg-blue-50">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-lg font-black text-white shadow-lg">
            {member.name?.[0] || 'U'}
          </div>
          <div className={`absolute -bottom-1 -right-1 h-4 w-4 ${config.color} rounded-full border-2 border-white`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-gray-900">{member.name}</p>
          <p className="truncate text-xs text-gray-600">{member.phone || member.email}</p>
        </div>
        <Badge variant={config.badge as any} size="sm">
          {config.label}
        </Badge>
      </div>
    </div>
  );
}

function ScoreBreakdown({ label, score }: any) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-bold text-gray-900">{score}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
        />
      </div>
    </div>
  );
}
