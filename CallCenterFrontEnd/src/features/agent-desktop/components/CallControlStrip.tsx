import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Phone,
  PhoneOff,
  PhoneIncoming,
  Mic,
  MicOff,
  Pause,
  Play,
  ArrowRightLeft,
} from 'lucide-react';
import { Avatar, Badge, LiveClock } from '../../../components/ui';
import { CallDurationTimer, LiveIndicator } from '../../../components/ui';
import type { AgentState } from '../hooks/useAgentDesktop';

interface CallControlStripProps {
  agentName: string;
  agentState: AgentState;
  onChangeAgentState: (state: AgentState) => void;
  callState: 'idle' | 'ringing' | 'active' | 'onhold' | 'dialing';
  callerNumber?: string;
  callerName?: string;
  callStartTime?: Date;
  isMuted: boolean;
  isOnHold: boolean;
  onAnswer?: () => void;
  onReject?: () => void;
  onMute: () => void;
  onHold: () => void;
  onResume: () => void;
  onTransfer: () => void;
  onHangup: () => void;
}

const agentStateColors: Record<AgentState, string> = {
  available: 'bg-green-500',
  busy: 'bg-blue-500',
  break: 'bg-yellow-500',
  acw: 'bg-purple-500',
  offline: 'bg-gray-500',
};

const callStateBorders: Record<string, string> = {
  idle: 'border-gray-200 dark:border-gray-700',
  ringing: 'border-red-400 dark:border-red-500',
  active: 'border-green-400 dark:border-green-500',
  onhold: 'border-yellow-400 dark:border-yellow-500',
  dialing: 'border-blue-400 dark:border-blue-500',
};

export const CallControlStrip = ({
  agentName,
  agentState,
  onChangeAgentState,
  callState,
  callerNumber,
  callerName,
  callStartTime,
  isMuted,
  isOnHold,
  onAnswer,
  onReject,
  onMute,
  onHold,
  onResume,
  onTransfer,
  onHangup,
}: CallControlStripProps) => {
  const { t } = useTranslation();
  const isCallActive = callState === 'active' || callState === 'ringing' || callState === 'onhold' || callState === 'dialing';

  const displayName = callerName || callerNumber || '';

  return (
    <div
      className={`flex-shrink-0 glass-card px-4 py-2.5 border-2 transition-colors duration-300 ${callStateBorders[callState] || callStateBorders.idle}`}
    >
      <div className="flex items-center justify-between">
        {/* LEFT: Agent Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar name={agentName} size="md" />
            <span
              className={`absolute bottom-0 end-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${agentStateColors[agentState]}`}
            />
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900 dark:text-white">{agentName}</p>
            <select
              value={agentState}
              onChange={(e) => onChangeAgentState(e.target.value as AgentState)}
              disabled={isCallActive}
              className={`text-xs border-0 bg-transparent p-0 pe-5 focus:ring-0 cursor-pointer ${
                isCallActive
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <option value="available">{t('agentState.available')}</option>
              <option value="busy">{t('agentState.busy')}</option>
              <option value="break">{t('agentState.break')}</option>
              <option value="acw">{t('agentState.acw')}</option>
              <option value="offline">{t('agentState.offline')}</option>
            </select>
          </div>
          <div className="hidden sm:block ms-2">
            <LiveClock variant="compact" />
          </div>
        </div>

        {/* RIGHT: Call Controls */}
        <AnimatePresence mode="wait">
          {callState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Badge variant="default" size="sm">
                {t('agentDesktop.ready')}
              </Badge>
            </motion.div>
          )}

          {callState === 'ringing' && (
            <motion.div
              key="ringing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3"
            >
              {/* Caller Info */}
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <PhoneIncoming className="w-5 h-5 text-green-500" />
                </motion.div>
                <div className="text-end">
                  {callerName && (
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{callerName}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{callerNumber}</p>
                </div>
              </div>

              {/* Answer / Reject */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAnswer}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium shadow-lg shadow-green-500/25"
                >
                  <Phone className="w-4 h-4" />
                  {t('agentDesktop.answer')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onReject}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium shadow-lg shadow-red-500/25"
                >
                  <PhoneOff className="w-4 h-4" />
                  {t('agentDesktop.reject')}
                </motion.button>
              </div>
            </motion.div>
          )}

          {(callState === 'active' || callState === 'onhold' || callState === 'dialing') && (
            <motion.div
              key="active"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-4"
            >
              {/* Caller Info + Timer */}
              <div className="flex items-center gap-3">
                <div className="text-end">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {displayName}
                  </p>
                  {callerName && callerNumber && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{callerNumber}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                  {callStartTime && (
                    <CallDurationTimer startTime={callStartTime} size="sm" />
                  )}
                  <LiveIndicator
                    variant={isOnHold ? 'paused' : 'live'}
                    label={isOnHold ? t('agentDesktop.onHold') : t('agentDesktop.live')}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />

              {/* Control Buttons */}
              <div className="flex items-center gap-1.5">
                {/* Mute */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onMute}
                  className={`p-2 rounded-lg transition-colors ${
                    isMuted
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  title={isMuted ? t('agentDesktop.unmute') : t('agentDesktop.mute')}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </motion.button>

                {/* Hold / Resume */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isOnHold ? onResume : onHold}
                  className={`p-2 rounded-lg transition-colors ${
                    isOnHold
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 ring-1 ring-yellow-500'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  title={isOnHold ? t('agentDesktop.resume') : t('agentDesktop.hold')}
                >
                  {isOnHold ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </motion.button>

                {/* Transfer */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onTransfer}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title={t('agentDesktop.transfer')}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </motion.button>

                {/* End Call */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onHangup}
                  className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 transition-colors"
                  title={t('agentDesktop.endCall')}
                >
                  <PhoneOff className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
