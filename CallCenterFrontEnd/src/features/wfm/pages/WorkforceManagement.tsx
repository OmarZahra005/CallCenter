import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle,
  XCircle,
  CalendarDays,
  Palmtree,
  Briefcase,
  GraduationCap,
  Timer,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, Button, Badge, Modal, Input, Select } from '../../../components/ui';
import apiClient from '../../../api/client';

interface Shift {
  id: string;
  agentId: string;
  agentName?: string;
  startTime: string;
  endTime: string;
  shiftType: number;
  notes?: string;
  createdAtUtc: string;
}

interface TimeOffRequest {
  id: string;
  agentId: string;
  agentName?: string;
  requestType: number;
  startDate: string;
  endDate: string;
  reason?: string;
  status: number;
  createdAtUtc: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const cardStagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const cardItem = {
  initial: { opacity: 0, y: 15, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
};

const WorkforceManagement = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
  const [isDeleteShiftModalOpen, setIsDeleteShiftModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'timeoff'>('schedule');

  const shiftTypeKeys = ['wfm.regular', 'wfm.overtime', 'wfm.training'] as const;
  const requestTypeKeys = ['wfm.vacation', 'wfm.sick', 'wfm.personal', 'wfm.other'] as const;
  const requestStatusKeys = ['wfm.pending', 'wfm.approved', 'wfm.rejected'] as const;
  const dayKeys = ['wfm.mon', 'wfm.tue', 'wfm.wed', 'wfm.thu', 'wfm.fri', 'wfm.sat', 'wfm.sun'] as const;

  const [newShift, setNewShift] = useState({
    agentId: '',
    startTime: '',
    endTime: '',
    shiftType: 0,
    notes: '',
  });

  const [newTimeOff, setNewTimeOff] = useState({
    agentId: '',
    requestType: 0,
    startDate: '',
    endDate: '',
    reason: '',
  });

  const { data: shiftsData, isLoading: shiftsLoading } = useQuery({
    queryKey: ['shifts'],
    queryFn: async () => {
      const response = await apiClient.get('/workforce/shifts', { params: { pageNumber: 1, pageSize: 100 } });
      return response.data;
    }
  });

  const { data: timeOffData, isLoading: timeOffLoading } = useQuery({
    queryKey: ['timeoff-requests'],
    queryFn: async () => {
      const response = await apiClient.get('/workforce/timeoff', { params: { pageNumber: 1, pageSize: 100 } });
      return response.data;
    }
  });

  const { data: pendingTimeOff } = useQuery({
    queryKey: ['timeoff-pending'],
    queryFn: async () => {
      const response = await apiClient.get('/workforce/timeoff/pending');
      return response.data;
    }
  });

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await apiClient.get('/agents');
      return response.data;
    }
  });

  const agents: Agent[] = Array.isArray(agentsData) ? agentsData : Array.isArray(agentsData?.items) ? agentsData.items : [];

  const createShiftMutation = useMutation({
    mutationFn: async (data: typeof newShift) => apiClient.post('/workforce/shifts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      setIsShiftModalOpen(false);
      setNewShift({ agentId: '', startTime: '', endTime: '', shiftType: 0, notes: '' });
    }
  });

  const deleteShiftMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/workforce/shifts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      setIsDeleteShiftModalOpen(false);
      setShiftToDelete(null);
    }
  });

  const createTimeOffMutation = useMutation({
    mutationFn: async (data: typeof newTimeOff) => apiClient.post('/workforce/timeoff', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeoff-requests'] });
      queryClient.invalidateQueries({ queryKey: ['timeoff-pending'] });
      setIsTimeOffModalOpen(false);
      setNewTimeOff({ agentId: '', requestType: 0, startDate: '', endDate: '', reason: '' });
    }
  });

  const approveTimeOffMutation = useMutation({
    mutationFn: async (id: string) => apiClient.post(`/workforce/timeoff/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeoff-requests'] });
      queryClient.invalidateQueries({ queryKey: ['timeoff-pending'] });
    }
  });

  const rejectTimeOffMutation = useMutation({
    mutationFn: async (id: string) => apiClient.post(`/workforce/timeoff/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeoff-requests'] });
      queryClient.invalidateQueries({ queryKey: ['timeoff-pending'] });
    }
  });

  const shifts: Shift[] = shiftsData?.items || shiftsData || [];
  const timeOffRequests: TimeOffRequest[] = timeOffData?.items || timeOffData || [];

  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

  const getWeekDates = () => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay() + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };
  const weekDates = getWeekDates();
  const today = new Date();

  const totalShifts = shifts.length;
  const pendingRequests = (pendingTimeOff as TimeOffRequest[] || []).length;
  const overtimeShifts = shifts.filter(s => s.shiftType === 1).length;

  const getShiftStyle = (type: number) => {
    const styles = [
      { bg: 'bg-blue-500/15 dark:bg-blue-500/25', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-500/30' },
      { bg: 'bg-purple-500/15 dark:bg-purple-500/25', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-500/30' },
      { bg: 'bg-emerald-500/15 dark:bg-emerald-500/25', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500/30' },
    ];
    return styles[type] || styles[0];
  };

  const getShiftIcon = (type: number) => {
    switch (type) {
      case 0: return <Briefcase className="w-3 h-3" />;
      case 1: return <Timer className="w-3 h-3" />;
      case 2: return <GraduationCap className="w-3 h-3" />;
      default: return <Briefcase className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: number): 'warning' | 'success' | 'danger' => {
    switch (status) { case 0: return 'warning'; case 1: return 'success'; case 2: return 'danger'; default: return 'warning'; }
  };

  const getRequestTypeIcon = (type: number) => {
    switch (type) {
      case 0: return <Palmtree className="w-4 h-4 text-amber-500" />;
      case 1: return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 2: return <CalendarDays className="w-4 h-4 text-blue-500" />;
      default: return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const agentOptions = useMemo(() => [
    { value: '', label: t('wfm.selectAgent') },
    ...agents.map(a => ({ value: a.id, label: a.name }))
  ], [agents, t]);

  const shiftTypeOptions = useMemo(() => shiftTypeKeys.map((key, i) => ({ value: String(i), label: t(key) })), [t]);
  const requestTypeOptions = useMemo(() => requestTypeKeys.map((key, i) => ({ value: String(i), label: t(key) })), [t]);

  const statCards = [
    { label: t('wfm.totalShifts'), value: totalShifts, icon: Calendar, color: 'blue' },
    { label: t('wfm.pendingRequests'), value: pendingRequests, icon: Clock, color: 'amber' },
    { label: t('wfm.overtimeShifts'), value: overtimeShifts, icon: TrendingUp, color: 'purple' },
    { label: t('wfm.agents'), value: agents.length, icon: Users, color: 'emerald' },
  ] as const;

  const colorMap: Record<string, { iconBg: string; iconText: string; valueTxt: string }> = {
    blue:    { iconBg: 'bg-blue-100 dark:bg-blue-900/30',    iconText: 'text-blue-600 dark:text-blue-400',    valueTxt: 'text-blue-600 dark:text-blue-400' },
    amber:   { iconBg: 'bg-amber-100 dark:bg-amber-900/30',  iconText: 'text-amber-600 dark:text-amber-400',  valueTxt: 'text-amber-600 dark:text-amber-400' },
    purple:  { iconBg: 'bg-purple-100 dark:bg-purple-900/30', iconText: 'text-purple-600 dark:text-purple-400', valueTxt: 'text-purple-600 dark:text-purple-400' },
    emerald: { iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconText: 'text-emerald-600 dark:text-emerald-400', valueTxt: 'text-emerald-600 dark:text-emerald-400' },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageVariants}
      className="space-y-6 p-1"
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('wfm.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('wfm.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tab toggle */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'schedule'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4 inline-block me-1.5 -mt-0.5" />
              {t('wfm.schedule')}
            </button>
            <button
              onClick={() => setActiveTab('timeoff')}
              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'timeoff'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Palmtree className="w-4 h-4 inline-block me-1.5 -mt-0.5" />
              {t('wfm.timeOff')}
              {pendingRequests > 0 && (
                <span className="ms-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                  {pendingRequests}
                </span>
              )}
            </button>
          </div>
          <Button onClick={() => activeTab === 'schedule' ? setIsShiftModalOpen(true) : setIsTimeOffModalOpen(true)}>
            <Plus className="w-4 h-4 me-2" />
            {activeTab === 'schedule' ? t('wfm.addShift') : t('wfm.requestTimeOff')}
          </Button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <motion.div variants={cardStagger} initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const c = colorMap[stat.color];
          return (
            <motion.div key={i} variants={cardItem}>
              <Card className="p-4 hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${c.valueTxt}`}>{stat.value}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${c.iconText}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'schedule' ? (
          /* ══════════ Schedule Calendar ══════════ */
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="overflow-hidden border border-gray-100 dark:border-gray-800">
              {/* Calendar header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary-500" />
                  {t('wfm.weeklySchedule')}
                </h2>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      const d = new Date(currentWeek);
                      d.setDate(d.getDate() - 7);
                      setCurrentWeek(d);
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[180px] text-center">
                    {weekDates[0].toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                    {' – '}
                    {weekDates[6].toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      const d = new Date(currentWeek);
                      d.setDate(d.getDate() + 7);
                      setCurrentWeek(d);
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-0">
                {shiftsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
                  </div>
                ) : agents.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 dark:text-gray-500">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">{t('wfm.agents')}: 0</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="p-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[180px]">
                              {t('wfm.agentColumn')}
                            </th>
                            {weekDates.map((date, i) => {
                              const isToday = date.toDateString() === today.toDateString();
                              return (
                                <th key={i} className={`p-3 text-center ${isToday ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                                  <div className={`text-xs font-semibold uppercase tracking-wider ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {t(dayKeys[i])}
                                  </div>
                                  <div className={`mt-0.5 text-sm font-bold ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                                    {date.getDate()}
                                  </div>
                                  {isToday && <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mx-auto mt-1" />}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {agents.map((agent) => {
                            const agentShifts = shifts.filter(s => s.agentId === agent.id);
                            return (
                              <tr key={agent.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="p-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-lg ${getAvatarColor(agent.name)} flex items-center justify-center text-white text-xs font-semibold`}>
                                      {getInitials(agent.name)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{agent.name}</span>
                                  </div>
                                </td>
                                {weekDates.map((date, i) => {
                                  const dayShifts = agentShifts.filter(s => new Date(s.startTime).toDateString() === date.toDateString());
                                  const isToday = date.toDateString() === today.toDateString();
                                  return (
                                    <td key={i} className={`p-1.5 align-top ${isToday ? 'bg-primary-50/30 dark:bg-primary-900/5' : ''}`}>
                                      <div className="space-y-1 min-h-[36px]">
                                        {dayShifts.map(shift => {
                                          const style = getShiftStyle(shift.shiftType);
                                          return (
                                            <div
                                              key={shift.id}
                                              className={`group relative ${style.bg} ${style.text} border ${style.border} text-[11px] font-medium px-2 py-1.5 rounded-lg cursor-pointer transition-all hover:shadow-sm`}
                                              onClick={() => {
                                                setShiftToDelete(shift.id);
                                                setIsDeleteShiftModalOpen(true);
                                              }}
                                            >
                                              <div className="flex items-center gap-1">
                                                {getShiftIcon(shift.shiftType)}
                                                <span>{formatTime(shift.startTime)}</span>
                                              </div>
                                              <div className="text-[10px] opacity-75 mt-0.5">{formatTime(shift.endTime)}</div>
                                              <Trash2 className="w-3 h-3 absolute top-1 end-1 opacity-0 group-hover:opacity-60 transition-opacity" />
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Legend */}
                    <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex items-center gap-5">
                      {[
                        { key: 'wfm.regular', color: 'bg-blue-500', border: 'border-blue-500/30' },
                        { key: 'wfm.overtime', color: 'bg-purple-500', border: 'border-purple-500/30' },
                        { key: 'wfm.training', color: 'bg-emerald-500', border: 'border-emerald-500/30' },
                      ].map(item => (
                        <div key={item.key} className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-sm ${item.color}`} />
                          <span className="text-xs text-gray-500 dark:text-gray-400">{t(item.key)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* ══════════ Time Off Requests ══════════ */
          <motion.div
            key="timeoff"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="overflow-hidden border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Palmtree className="w-5 h-5 text-amber-500" />
                  {t('wfm.timeOffRequests')}
                </h2>
                {pendingRequests > 0 && (
                  <Badge variant="warning" size="sm">{pendingRequests} {t('wfm.pending')}</Badge>
                )}
              </div>
              <CardContent className="p-0">
                {timeOffLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
                  </div>
                ) : timeOffRequests.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {timeOffRequests.map((request, idx) => {
                      const agentName = request.agentName || `${t('wfm.agent')} ${request.agentId.substring(0, 8)}`;
                      return (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(idx * 0.04, 0.3), duration: 0.25 }}
                          className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          {/* Avatar */}
                          <div className={`w-10 h-10 rounded-xl ${getAvatarColor(agentName)} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}>
                            {getInitials(agentName)}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">{agentName}</span>
                              <Badge variant={getStatusColor(request.status)} size="sm">
                                {t(requestStatusKeys[request.status])}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {getRequestTypeIcon(request.requestType)}
                              <span className="font-medium">{t(requestTypeKeys[request.requestType])}</span>
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              <span>{formatDate(request.startDate)} {t('wfm.to')} {formatDate(request.endDate)}</span>
                            </div>
                            {request.reason && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate max-w-md">{request.reason}</p>
                            )}
                          </div>

                          {/* Actions */}
                          {request.status === 0 && (
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => approveTimeOffMutation.mutate(request.id)}
                                disabled={approveTimeOffMutation.isPending}
                                className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                              >
                                <CheckCircle className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => rejectTimeOffMutation.mutate(request.id)}
                                disabled={rejectTimeOffMutation.isPending}
                                className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                              >
                                <XCircle className="w-4.5 h-4.5 text-red-600 dark:text-red-400" />
                              </motion.button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Palmtree className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('wfm.noTimeOffRequests')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Shift Confirmation ── */}
      <Modal
        isOpen={isDeleteShiftModalOpen}
        onClose={() => { setIsDeleteShiftModalOpen(false); setShiftToDelete(null); }}
        title={t('wfm.deleteShiftConfirm')}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <Trash2 className="w-5 h-5 text-red-500" />
            <p className="text-sm text-gray-700 dark:text-gray-300">{t('wfm.deleteShiftConfirm')}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setIsDeleteShiftModalOpen(false); setShiftToDelete(null); }}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => shiftToDelete && deleteShiftMutation.mutate(shiftToDelete)}
              isLoading={deleteShiftMutation.isPending}
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Create Shift Modal ── */}
      <Modal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} title={t('wfm.addNewShift')} size="lg">
        <form onSubmit={(e) => { e.preventDefault(); createShiftMutation.mutate(newShift); }} className="space-y-5">
          <Select
            label={t('wfm.agentColumn')}
            options={agentOptions}
            value={newShift.agentId}
            onChange={(e) => setNewShift({ ...newShift, agentId: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('wfm.startTime')}
              type="datetime-local"
              value={newShift.startTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewShift({ ...newShift, startTime: e.target.value })}
              required
            />
            <Input
              label={t('wfm.endTime')}
              type="datetime-local"
              value={newShift.endTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewShift({ ...newShift, endTime: e.target.value })}
              required
            />
          </div>
          <Select
            label={t('wfm.shiftType')}
            options={shiftTypeOptions}
            value={String(newShift.shiftType)}
            onChange={(e) => setNewShift({ ...newShift, shiftType: parseInt(e.target.value) })}
          />
          <Input
            label={t('wfm.notes')}
            value={newShift.notes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewShift({ ...newShift, notes: e.target.value })}
            placeholder={t('wfm.optionalNotes')}
          />
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setIsShiftModalOpen(false)} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!newShift.agentId || !newShift.startTime || !newShift.endTime}
              isLoading={createShiftMutation.isPending}
              className="w-full sm:w-auto"
            >
              {t('wfm.createShift')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Create Time Off Modal ── */}
      <Modal isOpen={isTimeOffModalOpen} onClose={() => setIsTimeOffModalOpen(false)} title={t('wfm.requestTimeOff')} size="lg">
        <form onSubmit={(e) => { e.preventDefault(); createTimeOffMutation.mutate(newTimeOff); }} className="space-y-5">
          <Select
            label={t('wfm.agentColumn')}
            options={agentOptions}
            value={newTimeOff.agentId}
            onChange={(e) => setNewTimeOff({ ...newTimeOff, agentId: e.target.value })}
          />
          <Select
            label={t('wfm.requestType')}
            options={requestTypeOptions}
            value={String(newTimeOff.requestType)}
            onChange={(e) => setNewTimeOff({ ...newTimeOff, requestType: parseInt(e.target.value) })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('wfm.startDate')}
              type="date"
              value={newTimeOff.startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTimeOff({ ...newTimeOff, startDate: e.target.value })}
              required
            />
            <Input
              label={t('wfm.endDate')}
              type="date"
              value={newTimeOff.endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTimeOff({ ...newTimeOff, endDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('wfm.reason')}
            </label>
            <textarea
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
              rows={3}
              value={newTimeOff.reason}
              onChange={(e) => setNewTimeOff({ ...newTimeOff, reason: e.target.value })}
              placeholder={t('wfm.optionalReason')}
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setIsTimeOffModalOpen(false)} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!newTimeOff.agentId || !newTimeOff.startDate || !newTimeOff.endDate}
              isLoading={createTimeOffMutation.isPending}
              className="w-full sm:w-auto"
            >
              {t('wfm.submitRequest')}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default WorkforceManagement;
