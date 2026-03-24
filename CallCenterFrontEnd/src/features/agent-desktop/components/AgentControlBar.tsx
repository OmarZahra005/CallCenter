import { useTranslation } from 'react-i18next';
import { Card, CardContent, Avatar, LiveClock } from '../../../components/ui';

type AgentState = 'available' | 'busy' | 'break' | 'acw' | 'offline';

interface AgentControlBarProps {
  agentName: string;
  agentState: AgentState;
  onChangeAgentState: (state: AgentState) => void;
  isCallActive: boolean;
}

export const AgentControlBar = ({
  agentName,
  agentState,
  onChangeAgentState,
  isCallActive,
}: AgentControlBarProps) => {
  const { t } = useTranslation();

  const agentStateColors: Record<AgentState, string> = {
    available: 'bg-green-500',
    busy: 'bg-blue-500',
    break: 'bg-yellow-500',
    acw: 'bg-purple-500',
    offline: 'bg-gray-500',
  };

  return (
    <Card variant="bordered" className="flex-shrink-0">
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar name={agentName} size="md" />
              <span
                className={`absolute bottom-0 end-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${agentStateColors[agentState]}`}
              />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{agentName}</p>
              <select
                value={agentState}
                onChange={(e) => onChangeAgentState(e.target.value as AgentState)}
                disabled={isCallActive}
                className={`text-sm border-0 bg-transparent p-0 pr-6 focus:ring-0 cursor-pointer ${
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
          </div>
          <LiveClock variant="compact" />
        </div>
      </CardContent>
    </Card>
  );
};
