import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, TrendingUp, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Badge, Select } from '../../../components/ui';
import { staggerContainer, staggerItem, fadeUp } from '../../../utils/animations';

interface Shift {
  id: string;
  agentId: string;
  agentName: string;
  start: number; // hour
  duration: number; // hours
  type: 'regular' | 'overtime' | 'training';
}

interface Agent {
  id: string;
  name: string;
  adherence: number;
  status: 'on-schedule' | 'early' | 'late' | 'absent';
}

const WorkforceManagement = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

  const shifts: Shift[] = [
    { id: '1', agentId: '1', agentName: 'John Smith', start: 8, duration: 8, type: 'regular' },
    { id: '2', agentId: '2', agentName: 'Sarah Johnson', start: 9, duration: 8, type: 'regular' },
    { id: '3', agentId: '3', agentName: 'Mike Brown', start: 12, duration: 6, type: 'overtime' },
    { id: '4', agentId: '4', agentName: 'Emily Davis', start: 8, duration: 4, type: 'training' },
    { id: '5', agentId: '1', agentName: 'John Smith', start: 14, duration: 2, type: 'overtime' },
  ];

  const agents: Agent[] = [
    { id: '1', name: 'John Smith', adherence: 98, status: 'on-schedule' },
    { id: '2', name: 'Sarah Johnson', adherence: 95, status: 'on-schedule' },
    { id: '3', name: 'Mike Brown', adherence: 87, status: 'late' },
    { id: '4', name: 'Emily Davis', adherence: 100, status: 'on-schedule' },
    { id: '5', name: 'Chris Wilson', adherence: 0, status: 'absent' },
  ];

  const getShiftColor = (type: Shift['type']) => {
    switch (type) {
      case 'regular': return 'bg-blue-500';
      case 'overtime': return 'bg-purple-500';
      case 'training': return 'bg-green-500';
    }
  };

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 95) return 'text-green-500';
    if (adherence >= 85) return 'text-yellow-500';
    return 'text-red-500';
  };

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
          <p className="text-gray-500 dark:text-gray-400">Schedule shifts and monitor adherence</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={[
              { value: 'week', label: 'Week View' },
              { value: 'day', label: 'Day View' },
              { value: 'month', label: 'Month View' },
            ]}
          />
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Shift
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Scheduled Agents', value: '24', icon: Users, color: 'blue' },
          { label: 'Avg Adherence', value: '94%', icon: TrendingUp, color: 'green' },
          { label: 'Open Shifts', value: '3', icon: Calendar, color: 'purple' },
          { label: 'Overtime Hours', value: '12h', icon: Clock, color: 'orange' },
        ].map((stat, index) => (
          <Card key={index} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Schedule Calendar */}
        <motion.div variants={staggerItem} className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Weekly Schedule</h2>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium">Jan 15 - 21, 2024</span>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header */}
                  <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
                    <div className="p-3 text-sm font-medium text-gray-500">Time</div>
                    {days.map((day) => (
                      <div key={day} className="p-3 text-sm font-medium text-gray-900 dark:text-white text-center">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Time slots */}
                  {hours.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-800">
                      <div className="p-2 text-xs text-gray-500 border-e border-gray-100 dark:border-gray-800">
                        {hour}:00
                      </div>
                      {days.map((day, dayIndex) => {
                        const dayShifts = shifts.filter(
                          (s) => s.start <= hour && s.start + s.duration > hour
                        );
                        return (
                          <div
                            key={`${day}-${hour}`}
                            className="p-1 min-h-[40px] border-e border-gray-100 dark:border-gray-800 relative"
                          >
                            {dayIndex === 0 && dayShifts.map((shift) => (
                              shift.start === hour && (
                                <motion.div
                                  key={shift.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  whileHover={{ scale: 1.02 }}
                                  className={`absolute inset-x-1 ${getShiftColor(shift.type)} text-white text-xs p-1 rounded cursor-pointer`}
                                  style={{ height: `${shift.duration * 40 - 4}px` }}
                                >
                                  <div className="font-medium truncate">{shift.agentName}</div>
                                  <div className="opacity-75">{shift.duration}h</div>
                                </motion.div>
                              )
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Adherence Panel */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Today's Adherence</h2>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {agents.map((agent) => (
                  <div key={agent.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</p>
                      <Badge
                        variant={
                          agent.status === 'on-schedule' ? 'success' :
                          agent.status === 'late' ? 'warning' : 'danger'
                        }
                        size="sm"
                      >
                        {agent.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <span className={`text-lg font-bold ${getAdherenceColor(agent.adherence)}`}>
                      {agent.adherence}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WorkforceManagement;
