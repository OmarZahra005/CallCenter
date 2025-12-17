import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, TrendingUp, ChevronLeft, ChevronRight, Plus, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Badge, Modal, Input } from '../../../components/ui';
import { staggerContainer, staggerItem, fadeUp } from '../../../utils/animations';
import apiClient from '../../../api/client';

interface Shift {
  id: string;
  agentId: string;
  agentName?: string;
  startTime: string;
  endTime: string;
  shiftType: number; // 0=Regular, 1=Overtime, 2=Training
  notes?: string;
  createdAtUtc: string;
}

interface TimeOffRequest {
  id: string;
  agentId: string;
  agentName?: string;
  requestType: number; // 0=Vacation, 1=Sick, 2=Personal, 3=Other
  startDate: string;
  endDate: string;
  reason?: string;
  status: number; // 0=Pending, 1=Approved, 2=Rejected
  createdAtUtc: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
}

const shiftTypes = ['Regular', 'Overtime', 'Training'];
const requestTypes = ['Vacation', 'Sick', 'Personal', 'Other'];
const requestStatuses = ['Pending', 'Approved', 'Rejected'];

const WorkforceManagement = () => {
  const queryClient = useQueryClient();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'timeoff'>('schedule');

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

  // Fetch shifts from backend
  const { data: shiftsData, isLoading: shiftsLoading } = useQuery({
    queryKey: ['shifts'],
    queryFn: async () => {
      const response = await apiClient.get('/workforce/shifts', {
        params: { pageNumber: 1, pageSize: 100 }
      });
      return response.data;
    }
  });

  // Fetch time-off requests
  const { data: timeOffData, isLoading: timeOffLoading } = useQuery({
    queryKey: ['timeoff-requests'],
    queryFn: async () => {
      const response = await apiClient.get('/workforce/timeoff', {
        params: { pageNumber: 1, pageSize: 100 }
      });
      return response.data;
    }
  });

  // Fetch pending time-off requests
  const { data: pendingTimeOff } = useQuery({
    queryKey: ['timeoff-pending'],
    queryFn: async () => {
      const response = await apiClient.get('/workforce/timeoff/pending');
      return response.data;
    }
  });

  // Fetch agents for dropdown
  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await apiClient.get('/agents');
      return response.data;
    }
  });

  // Ensure agents is always an array
  const agents: Agent[] = Array.isArray(agentsData)
    ? agentsData
    : Array.isArray(agentsData?.items)
      ? agentsData.items
      : [];

  // Create shift mutation
  const createShiftMutation = useMutation({
    mutationFn: async (data: typeof newShift) => {
      return apiClient.post('/workforce/shifts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      setIsShiftModalOpen(false);
      setNewShift({
        agentId: '',
        startTime: '',
        endTime: '',
        shiftType: 0,
        notes: '',
      });
    }
  });

  // Delete shift mutation
  const deleteShiftMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/workforce/shifts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    }
  });

  // Create time-off request mutation
  const createTimeOffMutation = useMutation({
    mutationFn: async (data: typeof newTimeOff) => {
      return apiClient.post('/workforce/timeoff', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeoff-requests'] });
      queryClient.invalidateQueries({ queryKey: ['timeoff-pending'] });
      setIsTimeOffModalOpen(false);
      setNewTimeOff({
        agentId: '',
        requestType: 0,
        startDate: '',
        endDate: '',
        reason: '',
      });
    }
  });

  // Approve time-off mutation
  const approveTimeOffMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.post(`/workforce/timeoff/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeoff-requests'] });
      queryClient.invalidateQueries({ queryKey: ['timeoff-pending'] });
    }
  });

  // Reject time-off mutation
  const rejectTimeOffMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.post(`/workforce/timeoff/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeoff-requests'] });
      queryClient.invalidateQueries({ queryKey: ['timeoff-pending'] });
    }
  });

  const shifts: Shift[] = shiftsData?.items || shiftsData || [];
  const timeOffRequests: TimeOffRequest[] = timeOffData?.items || timeOffData || [];

  const getShiftColor = (type: number) => {
    switch (type) {
      case 0: return 'bg-blue-500';
      case 1: return 'bg-purple-500';
      case 2: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: number): 'warning' | 'success' | 'danger' => {
    switch (status) {
      case 0: return 'warning';
      case 1: return 'success';
      case 2: return 'danger';
      default: return 'warning';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWeekDates = () => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay() + 1); // Start from Monday
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  // Calculate stats
  const totalShifts = shifts.length;
  const pendingRequests = (pendingTimeOff as TimeOffRequest[] || []).length;
  const overtimeShifts = shifts.filter(s => s.shiftType === 1).length;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workforce Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Schedule shifts and manage time-off requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'schedule'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('timeoff')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'timeoff'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Time Off {pendingRequests > 0 && (
                <Badge variant="danger" size="sm" className="ml-2">{pendingRequests}</Badge>
              )}
            </button>
          </div>
          <Button onClick={() => activeTab === 'schedule' ? setIsShiftModalOpen(true) : setIsTimeOffModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === 'schedule' ? 'Add Shift' : 'Request Time Off'}
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Shifts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalShifts}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingRequests}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Overtime Shifts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{overtimeShifts}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Agents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{(agents as Agent[] || []).length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {activeTab === 'schedule' ? (
        /* Schedule Calendar */
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Weekly Schedule</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(currentWeek);
                      newDate.setDate(newDate.getDate() - 7);
                      setCurrentWeek(newDate);
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(currentWeek);
                      newDate.setDate(newDate.getDate() + 7);
                      setCurrentWeek(newDate);
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {shiftsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="p-3 text-left text-sm font-medium text-gray-500">Agent</th>
                          {weekDates.map((date, i) => (
                            <th key={i} className="p-3 text-center text-sm font-medium text-gray-900 dark:text-white">
                              <div>{days[i]}</div>
                              <div className="text-xs text-gray-500">{date.getDate()}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(agents as Agent[] || []).map((agent) => {
                          const agentShifts = shifts.filter(s => s.agentId === agent.id);
                          return (
                            <tr key={agent.id} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="p-3 text-sm font-medium text-gray-900 dark:text-white">
                                {agent.name}
                              </td>
                              {weekDates.map((date, i) => {
                                const dayShifts = agentShifts.filter(s => {
                                  const shiftDate = new Date(s.startTime);
                                  return shiftDate.toDateString() === date.toDateString();
                                });
                                return (
                                  <td key={i} className="p-2 text-center">
                                    {dayShifts.map(shift => (
                                      <div
                                        key={shift.id}
                                        className={`${getShiftColor(shift.shiftType)} text-white text-xs p-1 rounded mb-1 cursor-pointer`}
                                        onClick={() => {
                                          if (confirm('Delete this shift?')) {
                                            deleteShiftMutation.mutate(shift.id);
                                          }
                                        }}
                                      >
                                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                      </div>
                                    ))}
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
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-500" />
                      <span className="text-xs text-gray-500">Regular</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-purple-500" />
                      <span className="text-xs text-gray-500">Overtime</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span className="text-xs text-gray-500">Training</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        /* Time Off Requests */
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Time Off Requests</h2>
            </CardHeader>
            <CardContent className="p-0">
              {timeOffLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {timeOffRequests.length > 0 ? (
                    timeOffRequests.map((request) => (
                      <div key={request.id} className="p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {request.agentName || `Agent ${request.agentId.substring(0, 8)}`}
                            </p>
                            <Badge variant={getStatusColor(request.status)}>
                              {requestStatuses[request.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {requestTypes[request.requestType]} - {formatDate(request.startDate)} to {formatDate(request.endDate)}
                          </p>
                          {request.reason && (
                            <p className="text-sm text-gray-400 mt-1">{request.reason}</p>
                          )}
                        </div>
                        {request.status === 0 && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => approveTimeOffMutation.mutate(request.id)}
                              disabled={approveTimeOffMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => rejectTimeOffMutation.mutate(request.id)}
                              disabled={rejectTimeOffMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No time-off requests found.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Create Shift Modal */}
      <Modal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        title="Add New Shift"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Agent
            </label>
            <select
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              value={newShift.agentId}
              onChange={(e) => setNewShift({ ...newShift, agentId: e.target.value })}
            >
              <option value="">Select an agent</option>
              {(agents as Agent[] || []).map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="datetime-local"
              value={newShift.startTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewShift({ ...newShift, startTime: e.target.value })}
            />
            <Input
              label="End Time"
              type="datetime-local"
              value={newShift.endTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewShift({ ...newShift, endTime: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Shift Type
            </label>
            <select
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              value={newShift.shiftType}
              onChange={(e) => setNewShift({ ...newShift, shiftType: parseInt(e.target.value) })}
            >
              {shiftTypes.map((type, i) => (
                <option key={i} value={i}>{type}</option>
              ))}
            </select>
          </div>
          <Input
            label="Notes"
            value={newShift.notes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewShift({ ...newShift, notes: e.target.value })}
            placeholder="Optional notes"
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsShiftModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createShiftMutation.mutate(newShift)}
              disabled={!newShift.agentId || !newShift.startTime || !newShift.endTime || createShiftMutation.isPending}
            >
              {createShiftMutation.isPending ? 'Creating...' : 'Create Shift'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Time Off Request Modal */}
      <Modal
        isOpen={isTimeOffModalOpen}
        onClose={() => setIsTimeOffModalOpen(false)}
        title="Request Time Off"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Agent
            </label>
            <select
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              value={newTimeOff.agentId}
              onChange={(e) => setNewTimeOff({ ...newTimeOff, agentId: e.target.value })}
            >
              <option value="">Select an agent</option>
              {(agents as Agent[] || []).map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Request Type
            </label>
            <select
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              value={newTimeOff.requestType}
              onChange={(e) => setNewTimeOff({ ...newTimeOff, requestType: parseInt(e.target.value) })}
            >
              {requestTypes.map((type, i) => (
                <option key={i} value={i}>{type}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={newTimeOff.startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTimeOff({ ...newTimeOff, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={newTimeOff.endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTimeOff({ ...newTimeOff, endDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason
            </label>
            <textarea
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              rows={3}
              value={newTimeOff.reason}
              onChange={(e) => setNewTimeOff({ ...newTimeOff, reason: e.target.value })}
              placeholder="Optional reason for time off"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsTimeOffModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createTimeOffMutation.mutate(newTimeOff)}
              disabled={!newTimeOff.agentId || !newTimeOff.startDate || !newTimeOff.endDate || createTimeOffMutation.isPending}
            >
              {createTimeOffMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default WorkforceManagement;
