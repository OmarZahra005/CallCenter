import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  Target,
  BarChart3,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { Card, Button } from '../../../components/ui';
import apiClient from '../../../api/client';

interface QaScorecard {
  id: string;
  formId: string;
  agentId: string;
  agentName?: string;
  evaluatorId: string;
  evaluatorName?: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  status: string;
  passed: boolean;
  evaluationDate: string;
  createdAt: string;
  details?: {
    criteriaId: string;
    criteriaName: string;
    pointsEarned: number;
    maxPoints: number;
  }[];
}

interface DailyScore {
  date: string;
  score: number;
  teamAverage: number;
}

interface CriteriaBreakdown {
  criteriaName: string;
  averageScore: number;
  maxScore: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}


interface AgentTrendChartProps {
  selectedAgentId?: string;
  onAgentSelect?: (agentId: string) => void;
}

export const AgentTrendChart = ({
  selectedAgentId,
  onAgentSelect,
}: AgentTrendChartProps) => {
  const [timeRange, setTimeRange] = useState<'7' | '14' | '30' | '60'>('30');
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [internalSelectedAgent, setInternalSelectedAgent] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const currentAgentId = selectedAgentId || internalSelectedAgent;

  // Fetch scorecards
  const { data: scorecards = [], isLoading } = useQuery<QaScorecard[]>({
    queryKey: ['qa-scorecards-trends'],
    queryFn: async () => {
      const response = await apiClient.get('/qa/scorecards');
      return response.data.items || response.data || [];
    },
  });

  // Get unique agents from scorecards
  const agents = useMemo(() => {
    const agentMap = new Map<string, string>();
    scorecards.forEach((s) => {
      if (s.agentId && s.agentName) {
        agentMap.set(s.agentId, s.agentName);
      }
    });
    return Array.from(agentMap.entries()).map(([id, name]) => ({ id, name }));
  }, [scorecards]);

  // Calculate daily scores for selected agent and team average
  const dailyScores = useMemo((): DailyScore[] => {
    const days = parseInt(timeRange);
    const result: DailyScore[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Get all scorecards for this date
      const dayCards = scorecards.filter((s) => {
        const cardDate = new Date(s.evaluationDate).toISOString().split('T')[0];
        return cardDate === dateStr;
      });

      // Calculate agent score
      const agentCards = dayCards.filter((s) => s.agentId === currentAgentId);
      const agentScore =
        agentCards.length > 0
          ? agentCards.reduce((sum, s) => sum + s.percentage, 0) / agentCards.length
          : 0;

      // Calculate team average
      const teamAvg =
        dayCards.length > 0
          ? dayCards.reduce((sum, s) => sum + s.percentage, 0) / dayCards.length
          : 0;

      result.push({
        date: dateStr,
        score: agentScore,
        teamAverage: teamAvg,
      });
    }

    return result;
  }, [scorecards, currentAgentId, timeRange]);

  // Calculate criteria breakdown
  const criteriaBreakdown = useMemo((): CriteriaBreakdown[] => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const midpointDate = new Date();
    midpointDate.setDate(midpointDate.getDate() - days / 2);

    const agentCards = scorecards.filter(
      (s) =>
        s.agentId === currentAgentId &&
        new Date(s.evaluationDate) >= cutoffDate &&
        s.details
    );

    const criteriaMap = new Map<
      string,
      { total: number; count: number; maxScore: number; recentTotal: number; recentCount: number }
    >();

    agentCards.forEach((s) => {
      s.details?.forEach((d) => {
        if (!criteriaMap.has(d.criteriaName)) {
          criteriaMap.set(d.criteriaName, {
            total: 0,
            count: 0,
            maxScore: d.maxPoints,
            recentTotal: 0,
            recentCount: 0,
          });
        }
        const criteria = criteriaMap.get(d.criteriaName)!;
        criteria.total += d.pointsEarned;
        criteria.count += 1;
        criteria.maxScore = Math.max(criteria.maxScore, d.maxPoints);

        if (new Date(s.evaluationDate) >= midpointDate) {
          criteria.recentTotal += d.pointsEarned;
          criteria.recentCount += 1;
        }
      });
    });

    return Array.from(criteriaMap.entries()).map(([name, data]) => {
      const averageScore = data.count > 0 ? data.total / data.count : 0;
      const recentAvg = data.recentCount > 0 ? data.recentTotal / data.recentCount : averageScore;
      const trendDiff = recentAvg - averageScore;

      return {
        criteriaName: name,
        averageScore,
        maxScore: data.maxScore,
        percentage: data.maxScore > 0 ? (averageScore / data.maxScore) * 100 : 0,
        trend: trendDiff > 1 ? 'up' : trendDiff < -1 ? 'down' : 'stable',
      };
    });
  }, [scorecards, currentAgentId, timeRange]);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const agentCards = scorecards.filter(
      (s) => s.agentId === currentAgentId && new Date(s.evaluationDate) >= cutoffDate
    );

    const allCards = scorecards.filter((s) => new Date(s.evaluationDate) >= cutoffDate);

    const avgScore = agentCards.length > 0
      ? agentCards.reduce((sum, s) => sum + s.percentage, 0) / agentCards.length
      : 0;

    const teamAvg = allCards.length > 0
      ? allCards.reduce((sum, s) => sum + s.percentage, 0) / allCards.length
      : 0;

    const passRate = agentCards.length > 0
      ? (agentCards.filter((s) => s.passed).length / agentCards.length) * 100
      : 0;

    const compareToTeam = avgScore - teamAvg;

    return {
      evaluationCount: agentCards.length,
      averageScore: avgScore,
      teamAverage: teamAvg,
      passRate,
      compareToTeam,
    };
  }, [scorecards, currentAgentId, timeRange]);

  const handleAgentSelect = (agentId: string) => {
    if (onAgentSelect) {
      onAgentSelect(agentId);
    } else {
      setInternalSelectedAgent(agentId);
    }
    setShowAgentDropdown(false);
  };

  // Find the max value for chart scaling
  const maxChartValue = Math.max(
    ...dailyScores.map((d) => Math.max(d.score, d.teamAverage)),
    100
  );

  const selectedAgent = agents.find((a) => a.id === currentAgentId);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t('agentTrendChart.title')}
            </h3>
            <p className="text-sm text-gray-500">{t('agentTrendChart.subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Agent Selector */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAgentDropdown(!showAgentDropdown)}
              className="min-w-[160px] justify-between"
            >
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {selectedAgent?.name || t('agentTrendChart.selectAgent')}
              </span>
              <ChevronDown className="w-4 h-4" />
            </Button>

            {showAgentDropdown && (
              <div className="absolute end-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => handleAgentSelect(agent.id)}
                      className={`w-full px-4 py-2 text-start text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        agent.id === currentAgentId
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {agent.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Time Range Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {(['7', '14', '30', '60'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {range}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {!currentAgentId ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">{t('agentTrendChart.selectAgentPrompt')}</p>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overallStats.evaluationCount}
              </p>
              <p className="text-xs text-gray-500">{t('agentTrendChart.evaluations')}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">
                {overallStats.averageScore.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">{t('agentTrendChart.avgScore')}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {overallStats.passRate.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500">{t('agentTrendChart.passRate')}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-center gap-1">
                {overallStats.compareToTeam > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : overallStats.compareToTeam < 0 ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : (
                  <Minus className="w-4 h-4 text-gray-500" />
                )}
                <span
                  className={`text-2xl font-bold ${
                    overallStats.compareToTeam > 0
                      ? 'text-green-600'
                      : overallStats.compareToTeam < 0
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {overallStats.compareToTeam > 0 ? '+' : ''}
                  {overallStats.compareToTeam.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-gray-500">{t('agentTrendChart.vsTeamAvg')}</p>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {t('agentTrendChart.scoreTrend')}
              </h4>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-primary-500 rounded-full" />
                  {t('agentTrendChart.agent')}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  {t('agentTrendChart.teamAvg')}
                </span>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-48 flex items-end gap-0.5 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3">
              {dailyScores.map((day, index) => {
                const agentHeight = day.score > 0 ? (day.score / maxChartValue) * 100 : 0;
                const teamHeight = day.teamAverage > 0 ? (day.teamAverage / maxChartValue) * 100 : 0;

                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-0.5 group relative"
                  >
                    <div className="flex-1 w-full flex items-end justify-center gap-0.5">
                      {/* Team Average Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${teamHeight}%` }}
                        transition={{ duration: 0.3, delay: index * 0.01 }}
                        className="w-1/3 bg-gray-300 dark:bg-gray-600 rounded-t opacity-50"
                      />
                      {/* Agent Score Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${agentHeight}%` }}
                        transition={{ duration: 0.3, delay: index * 0.01 }}
                        className={`w-1/3 rounded-t ${
                          day.score >= 80
                            ? 'bg-green-500'
                            : day.score >= 70
                            ? 'bg-yellow-500'
                            : day.score > 0
                            ? 'bg-red-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                      <div className="font-medium">{new Date(day.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}</div>
                      {day.score > 0 && <div>Score: {day.score.toFixed(1)}%</div>}
                      {day.teamAverage > 0 && <div>Team: {day.teamAverage.toFixed(1)}%</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>{new Date(dailyScores[0]?.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}</span>
              <span>{new Date(dailyScores[dailyScores.length - 1]?.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Criteria Breakdown */}
          {criteriaBreakdown.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                {t('agentTrendChart.criteriaBreakdown')}
              </h4>
              <div className="space-y-3">
                {criteriaBreakdown.map((criteria) => (
                  <div key={criteria.criteriaName}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {criteria.criteriaName}
                      </span>
                      <div className="flex items-center gap-2">
                        {criteria.trend === 'up' && (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        )}
                        {criteria.trend === 'down' && (
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {criteria.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${criteria.percentage}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${
                          criteria.percentage >= 80
                            ? 'bg-green-500'
                            : criteria.percentage >= 70
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default AgentTrendChart;
