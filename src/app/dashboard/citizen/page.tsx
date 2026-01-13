'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Phone, 
  MapPin, 
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
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Activity,
  Zap,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { haptics } from '@/lib/haptics';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

export default function CitizenDashboardApp() {
  const { data: session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showReportModal, setShowReportModal] = useState(false);
  
  const { data: myIncidents, isLoading, refetch } = trpc.incidents.getAll.useQuery({ 
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  }, { enabled: !!session?.user?.id, refetchInterval: 30000 });

  const { data: notifications } = trpc.notifications.getMyNotifications.useQuery(
    { limit: 10, unreadOnly: false },
    { enabled: !!session?.user?.id }
  );

  // Pull to refresh
  usePullToRefresh(async () => {
    await refetch();
    haptics.success();
  });

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Calculate stats from incidents if getMyStats doesn't return what we need
  const displayStats = {
    totalReports: myIncidents?.incidents.length || 0,
    activeReports: myIncidents?.incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length || 0,
    resolvedReports: myIncidents?.incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length || 0,
    unreadNotifications: notifications?.notifications.filter(n => !n.isRead).length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      
      {/* TOP APP BAR - Glassmorphism */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Left: Menu + Greeting */}
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setMenuOpen(true);
                  haptics.light();
                }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30"
              >
                <Menu className="h-5 w-5 text-white" />
              </motion.button>
              <div>
                <p className="text-xs text-gray-500 font-medium">{getGreeting()}</p>
                <h1 className="text-lg font-black text-gray-900">
                  {session?.user?.name?.split(' ')[0] || 'User'}
                </h1>
              </div>
            </div>

            {/* Right: Notifications */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                router.push('/dashboard/notifications');
                haptics.light();
              }}
              className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <Bell className="h-5 w-5 text-gray-700" />
              {displayStats.unreadNotifications > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-white text-xs font-bold flex items-center justify-center"
                >
                  {displayStats.unreadNotifications}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - Scrollable */}
      <div className="px-4 pt-6 pb-8 space-y-6">
        
        {/* EMERGENCY HERO CARD - Floating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          {/* Background with animated gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-3xl" />
          
          {/* Animated circles */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl"
          />

          {/* Content */}
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white text-xs font-bold">READY 24/7</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">
                  Need Emergency Help?
                </h2>
                <p className="text-red-100 text-sm">
                  We're here for you. Help arrives in ~8 minutes
                </p>
              </div>
              <Shield className="h-12 w-12 text-white/30" />
            </div>

            {/* HUGE EMERGENCY BUTTON */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowReportModal(true);
                haptics.medium();
              }}
              className="w-full h-16 bg-white text-red-600 rounded-2xl font-black text-lg shadow-2xl shadow-red-900/50 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              {/* Shine effect */}
              <motion.div
                animate={{ x: [-200, 200] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform skew-x-12"
              />
              
              <AlertCircle className="h-6 w-6 group-hover:rotate-12 transition-transform" />
              <span>REPORT EMERGENCY</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>

        {/* QUICK STATS - Card Grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={FileText}
            label="Reports"
            value={displayStats.totalReports}
            color="blue"
            delay={0.1}
          />
          <StatCard
            icon={Activity}
            label="Active"
            value={displayStats.activeReports}
            color="orange"
            pulse={displayStats.activeReports > 0}
            delay={0.2}
          />
          <StatCard
            icon={CheckCircle2}
            label="Resolved"
            value={displayStats.resolvedReports}
            color="green"
            delay={0.3}
          />
        </div>

        {/* EMERGENCY CONTACTS - Horizontal Scroll */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900">Quick Contact</h3>
            <button className="text-sm text-blue-600 font-semibold">See All</button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar">
            <EmergencyContactCard
              icon={Shield}
              name="Police"
              number="191"
              gradient="from-blue-500 to-blue-600"
              delay={0.1}
            />
            <EmergencyContactCard
              icon={Flame}
              name="Fire Service"
              number="192"
              gradient="from-orange-500 to-orange-600"
              delay={0.2}
            />
            <EmergencyContactCard
              icon={Heart}
              name="Ambulance"
              number="193"
              gradient="from-red-500 to-red-600"
              delay={0.3}
            />
            <EmergencyContactCard
              icon={AlertCircle}
              name="NADMO"
              number="0800"
              gradient="from-purple-500 to-purple-600"
              delay={0.4}
            />
          </div>
        </div>

        {/* MY REPORTS SECTION */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-black text-gray-900">My Reports</h3>
              <p className="text-sm text-gray-500">Track your emergency reports</p>
            </div>
            {myIncidents?.incidents && myIncidents.incidents.length > 0 && (
              <button 
                onClick={() => router.push('/dashboard/incidents')}
                className="text-sm text-blue-600 font-semibold flex items-center gap-1"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Reports List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : !myIncidents?.incidents || myIncidents.incidents.length === 0 ? (
            <EmptyState router={router} />
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {myIncidents.incidents.slice(0, 5).map((incident, index) => (
                  <motion.div
                    key={incident.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <IncidentCard incident={incident} router={router} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* SAFETY TIPS - Carousel */}
        <div>
          <h3 className="text-lg font-black text-gray-900 mb-4">Safety Tips</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar">
            <SafetyTipCard
              icon={Flame}
              title="Fire Safety"
              tip="Keep a fire extinguisher at home"
              gradient="from-orange-500 to-red-500"
            />
            <SafetyTipCard
              icon={Car}
              title="Road Safety"
              tip="Always wear your seatbelt"
              gradient="from-blue-500 to-purple-500"
            />
            <SafetyTipCard
              icon={Home}
              title="Home Safety"
              tip="Create an emergency kit"
              gradient="from-green-500 to-teal-500"
            />
          </div>
        </div>
      </div>

      {/* BOTTOM NAVIGATION - iOS Style */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} router={router} />

      {/* SLIDE-OUT MENU */}
      <SlideMenu open={menuOpen} onClose={() => setMenuOpen(false)} router={router} session={session} />

      {/* REPORT MODAL */}
      <ReportModal 
        open={showReportModal} 
        onClose={() => setShowReportModal(false)}
        router={router}
      />

      {/* Hide scrollbar globally for this page */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

// ============================================
// CHILD COMPONENTS - Premium Mobile UI
// ============================================

function StatCard({ icon: Icon, label, value, color, pulse, delay }: any) {
  const colorMap: Record<string, { bg: string; light: string; text: string }> = {
    blue: { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', text: 'text-blue-600' },
    orange: { bg: 'from-orange-500 to-orange-600', light: 'bg-orange-50', text: 'text-orange-600' },
    green: { bg: 'from-green-500 to-green-600', light: 'bg-green-50', text: 'text-green-600' },
  };
  const colors = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-2xl ${colors.light} p-4 border-2 border-transparent hover:border-${color}-200 transition-all cursor-pointer`}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center mb-3 ${pulse ? 'animate-pulse' : ''}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-2xl font-black text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-600 font-semibold">{label}</p>
    </motion.div>
  );
}

function EmergencyContactCard({ icon: Icon, name, number, gradient, delay }: any) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        window.location.href = `tel:${number}`;
        haptics.medium();
      }}
      className={`flex-shrink-0 w-32 h-40 bg-gradient-to-br ${gradient} rounded-2xl p-4 shadow-xl relative overflow-hidden group`}
    >
      {/* Shine effect */}
      <motion.div
        animate={{ x: [-100, 100] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12"
      />
      
      <div className="relative h-full flex flex-col items-center justify-between text-white">
        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="h-7 w-7" />
        </div>
        <div className="text-center">
          <p className="font-bold text-sm mb-1">{name}</p>
          <p className="text-2xl font-black">{number}</p>
          <p className="text-xs opacity-80 mt-1">Tap to call</p>
        </div>
      </div>
    </motion.button>
  );
}

function IncidentCard({ incident, router }: any) {
  const statusConfig: Record<string, any> = {
    REPORTED: { 
      bg: 'bg-yellow-50', 
      border: 'border-yellow-200', 
      text: 'text-yellow-700',
      dot: 'bg-yellow-500',
      label: 'Reported'
    },
    DISPATCHED: { 
      bg: 'bg-blue-50', 
      border: 'border-blue-200', 
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      label: 'Help Dispatched'
    },
    IN_PROGRESS: { 
      bg: 'bg-purple-50', 
      border: 'border-purple-200', 
      text: 'text-purple-700',
      dot: 'bg-purple-500',
      label: 'In Progress'
    },
    RESOLVED: { 
      bg: 'bg-green-50', 
      border: 'border-green-200', 
      text: 'text-green-700',
      dot: 'bg-green-500',
      label: 'Resolved'
    },
    CLOSED: { 
      bg: 'bg-gray-50', 
      border: 'border-gray-200', 
      text: 'text-gray-700',
      dot: 'bg-gray-500',
      label: 'Closed'
    },
  };

  const config = statusConfig[incident.status] || statusConfig.REPORTED;

  const severityColor: Record<string, string> = {
    CRITICAL: 'text-red-600',
    HIGH: 'text-orange-600',
    MEDIUM: 'text-yellow-600',
    LOW: 'text-green-600',
  }[incident.severity] || 'text-gray-600';

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        router.push(`/dashboard/incidents/${incident.id}`);
        haptics.light();
      }}
      className={`
        relative rounded-2xl border-2 ${config.border} ${config.bg}
        p-4 cursor-pointer
        hover:shadow-lg transition-all
      `}
    >
      {/* Status Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 ${config.dot} rounded-full ${incident.status !== 'RESOLVED' && incident.status !== 'CLOSED' ? 'animate-pulse' : ''}`} />
          <span className={`text-xs font-bold ${config.text}`}>
            {config.label}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {formatTimeAgo(incident.createdAt)}
        </span>
      </div>

      {/* Content */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-black ${severityColor}`}>
              {incident.severity}
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-600 font-medium">
              {incident.category}
            </span>
          </div>
          
          <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">
            {incident.title || incident.description?.substring(0, 50) || 'Emergency Report'}
          </h4>
          
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{incident.region || 'Unknown Location'}</span>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
      </div>

      {/* Progress Indicator */}
      {incident.status !== 'RESOLVED' && incident.status !== 'CLOSED' && incident.agencies && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
            <p className="text-xs font-semibold text-blue-900">
              {incident.agencies.name} responding
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function EmptyState({ router }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 text-center border-2 border-dashed border-blue-200"
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
        className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl"
      >
        <Shield className="h-10 w-10 text-white" />
      </motion.div>
      
      <h3 className="text-xl font-black text-gray-900 mb-2">
        All Clear! 🎉
      </h3>
      <p className="text-gray-600 mb-6 leading-relaxed">
        You haven't reported any emergencies yet.<br/>
        We hope it stays that way!
      </p>
      
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          router.push('/report');
          haptics.medium();
        }}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
      >
        <Plus className="h-5 w-5" />
        Report Emergency
      </motion.button>
    </motion.div>
  );
}

function SafetyTipCard({ icon: Icon, title, tip, gradient }: any) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`flex-shrink-0 w-64 bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-xl relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="relative">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
          <Icon className="h-6 w-6" />
        </div>
        <h4 className="font-black text-lg mb-2">{title}</h4>
        <p className="text-sm opacity-90 leading-relaxed">{tip}</p>
      </div>
    </motion.div>
  );
}

function BottomNav({ activeTab, setActiveTab, router }: any) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home', action: () => {} },
    { id: 'reports', icon: FileText, label: 'Reports', action: () => router.push('/dashboard/incidents') },
    { id: 'help', icon: HelpCircle, label: 'Help', action: () => router.push('/help') },
    { id: 'profile', icon: User, label: 'Profile', action: () => router.push('/dashboard/settings') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setActiveTab(tab.id);
              tab.action();
              haptics.light();
            }}
            className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === tab.id ? 'text-red-600' : 'text-gray-400'
            }`}
          >
            <tab.icon className="h-6 w-6" />
            <span className="text-xs font-semibold">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t-full"
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function SlideMenu({ open, onClose, router, session }: any) {
  const menuItems = [
    { icon: Home, label: 'Dashboard', action: () => router.push('/dashboard') },
    { icon: FileText, label: 'My Reports', action: () => router.push('/dashboard/incidents') },
    { icon: Bell, label: 'Notifications', action: () => router.push('/dashboard/notifications') },
    { icon: User, label: 'Profile', action: () => router.push('/dashboard/settings') },
    { icon: Settings, label: 'Settings', action: () => router.push('/dashboard/settings') },
    { icon: HelpCircle, label: 'Help & Support', action: () => router.push('/help') },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl"
          >
            <div className="flex flex-col h-full">
              
              {/* Header */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-black text-xl">Menu</h2>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                  >
                    <X className="h-5 w-5 text-white" />
                  </motion.button>
                </div>
                
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-black text-xl">
                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{session?.user?.name}</p>
                    <p className="text-red-100 text-sm">{session?.user?.phone}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      item.action();
                      onClose();
                      haptics.light();
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-gray-100 group-hover:bg-red-100 rounded-xl flex items-center justify-center transition-colors">
                      <item.icon className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                    </div>
                    <span className="font-semibold text-gray-900">{item.label}</span>
                    <ChevronRight className="h-5 w-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                ))}
              </div>

              {/* Logout Button */}
              <div className="p-4 border-t border-gray-200">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    router.push('/api/auth/signout');
                    haptics.medium();
                  }}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ReportModal({ open, onClose, router }: any) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 max-w-md mx-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-gray-900">Report Emergency</h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </motion.button>
              </div>

              <p className="text-gray-600 mb-6">
                Choose how you want to report your emergency:
              </p>

              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    router.push('/report');
                    onClose();
                    haptics.medium();
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all group"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-lg">Fill Report Form</p>
                    <p className="text-sm text-red-100">Provide detailed information</p>
                  </div>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    router.push('/report');
                    onClose();
                    haptics.medium();
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all group"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-lg">Quick Report</p>
                    <p className="text-sm text-blue-100">Fast emergency alert</p>
                  </div>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    window.location.href = 'tel:191';
                    haptics.medium();
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all group"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-lg">Call 191</p>
                    <p className="text-sm text-green-100">Direct voice call</p>
                  </div>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
