import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Users,
  Target,
  CheckCircle,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  User,
} from 'lucide-react';
import { Card } from '../../../components/ui';
import apiClient from '../../../api/client';
import { AgentTrendChart } from './AgentTrendChart';

interface QaScorecard {
  id: string;
  formId: string;
  agentId: string;
  agentName?: string;
  evaluatorId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  status: string;
  passed: boolean;
  evaluationDate: string;
  createdAt: string;
}

interface AgentPerformance {
  agentId: string;
  agentName: string;
  averageScore: number;
  evaluationCount: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}


export const QaDashboardStats = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  // Fetch scorecards
  const { data: scorecards = [], isLoading } = useQuery<QaScorecard[]>({
    queryKey: ['qa-scorecards-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/qa/scorecards');
      return response.data.items || response.data || [];
    },
  });

  // Calculate overall stats
  const stats = useMemo(() => {
    if (scorecards.length === 0) {
      return {
        totalEvaluations: 0,
        averageScore: 0,
        passRate: 0,
        pendingCount: 0,
        completedThisWeek: 0,
        completedLastWeek: 0,
        weekOverWeekChange: 0,
      };
    }

    const totalEvaluations = scorecards.length;
    const averageScore =
      scorecards.reduce((sum, s) => sum + s.percentage, 0) / totalEvaluations;
    const passRate = (scorecards.filter((s) => s.passed).length / totalEvaluations) * 100;
    const pendingCount = scorecards.filter((s) => s.status === 'Draft' || s.status === 'Pending').length;

    // Week over week comparison
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const completedThisWeek = scorecards.filter((s) => {
      const date = new Date(s.createdAt);
      return date >= oneWeekAgo && date <= now;
    }).length;

    const completedLastWeek = scorecards.filter((s) => {
      const date = new Date(s.createdAt);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    }).length;

    const weekOverWeekChange =
      completedLastWeek > 0
        ? ((completedThisWeek - completedLastWeek) / completedLastWeek) * 100
        : 0;

    return {
      totalEvaluations,
      averageScore,
      passRate,
      pendingCount,
      completedThisWeek,
      completedLastWeek,
      weekOverWeekChange,
    };
  }, [scorecards]);

  // Calculate agent performance rankings
  const agentPerformance = useMemo(() => {
    const agentMap = new Map<string, { scores: number[]; name: string; recentScores: number[] }>();

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    scorecards.forEach((s) => {
      if (!agentMap.has(s.agentId)) {
        agentMap.set(s.agentId, { scores: [], name: s.agentName || 'Unknown', recentScores: [] });
      }
      const agent = agentMap.get(s.agentId)!;
      agent.scores.push(s.percentage);

      const date = new Date(s.createdAt);
      if (date >= oneWeekAgo) {
        agent.recentScores.push(s.percentage);
      }
    });

    const performances: AgentPerformance[] = [];
    agentMap.forEach((data, agentId) => {
      const averageScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      const recentAvg =
        data.recentScores.length > 0
          ? data.recentScores.reduce((a, b) => a + b, 0) / data.recentScores.length
          : averageScore;
      const trendValue = recentAvg - averageScore;

      performances.push({
        agentId,
        agentName: data.name,
        averageScore,
        evaluationCount: data.scores.length,
        trend: trendValue > 2 ? 'up' : trendValue < -2 ? 'down' : 'stable',
        trendValue,
      });
    });

    return performances.sort((a, b) => b.averageScore - a.averageScore);
  }, [scorecards]);

  const topPerformers = agentPerformance.slice(0, 3);
  const needsImprovement = [...agentPerformance]
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 3);

  // Score distribution
  const scoreDistribution = useMemo(() => {
    const ranges = [
      { label: '90-100%', min: 90, max: 100, count: 0, color: 'bg-green-500' },
      { label: '80-89%', min: 80, max: 89, count: 0, color: 'bg-blue-500' },
      { label: '70-79%', min: 70, max: 79, count: 0, color: 'bg-yellow-500' },
      { label: '60-69%', min: 60, max: 69, count: 0, color: 'bg-orange-500' },
      { label: '<60%', min: 0, max: 59, count: 0, color: 'bg-red-500' },
    ];

    scorecards.forEach((s) => {
      const range = ranges.find((r) => s.percentage >= r.min && s.percentage <= r.max);
      if (range) range.count++;
    });

    return ranges;
  }, [scorecards]);

  const maxDistribution = Math.max(...scoreDistribution.map((d) => d.count), 1);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Average Score</span>
            <BarChart3 className="w-5 h-5 text-primary-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.averageScore.toFixed(1)}%
          </p>
          <div className="flex items-center mt-2 text-sm">
            {stats.averageScore >= 80 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">Above target</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-yellow-600">Below target (80%)</span>
              </>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Pass Rate</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.passRate.toFixed(0)}%
          </p>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${stats.passRate}%` }}
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">This Week</span>
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.completedThisWeek}
          </p>
          <div className="flex items-center mt-2 text-sm">
            {stats.weekOverWeekChange > 0 ? (
              <>
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">+{stats.weekOverWeekChange.toFixed(0)}% vs last week</span>
              </>
            ) : stats.weekOverWeekChange < 0 ? (
              <>
                <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-red-600">{stats.weekOverWeekChange.toFixed(0)}% vs last week</span>
              </>
            ) : (
              <>
                <Minus className="w-4 h-4 text-gray-500 mr-1" />
                <span className="text-gray-500">Same as last week</span>
              </>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Evaluations</span>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalEvaluations}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {agentPerformance.length} agents evaluated
          </p>
        </Card>
      </div>

      {/* Score Distribution & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score Distribution */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            Score Distribution
          </h3>
          <div className="space-y-3">
            {scoreDistribution.map((range) => (
              <div key={range.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{range.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{range.count}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(range.count / maxDistribution) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className={`h-full ${range.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Performers */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Top Performers
          </h3>
          <div className="space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((agent, index) => (
                <button
                  key={agent.agentId}
                  onClick={() => setSelectedAgentId(agent.agentId)}
                  className="w-full flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : index === 1
                          ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {agent.agentName}
                      </p>
                      <p className="text-xs text-gray-500">{agent.evaluationCount} evals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{agent.averageScore.toFixed(1)}%</p>
                    {agent.trend === 'up' && (
                      <span className="text-xs text-green-500 flex items-center justify-end">
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                        +{agent.trendValue.toFixed(1)}
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </Card>

        {/* Needs Improvement */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Needs Improvement
          </h3>
          <div className="space-y-3">
            {needsImprovement.length > 0 && needsImprovement[0].averageScore < 80 ? (
              needsImprovement
                .filter((a) => a.averageScore < 80)
                .map((agent) => (
                  <button
                    key={agent.agentId}
                    onClick={() => setSelectedAgentId(agent.agentId)}
                    className="w-full flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <User className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {agent.agentName}
                        </p>
                        <p className="text-xs text-gray-500">{agent.evaluationCount} evals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">{agent.averageScore.toFixed(1)}%</p>
                      {agent.trend === 'down' && (
                        <span className="text-xs text-red-500 flex items-center justify-end">
                          <TrendingDown className="w-3 h-3 mr-0.5" />
                          {agent.trendValue.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </button>
                ))
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-gray-500">All agents meeting targets</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Agent Performance Trends */}
      <AgentTrendChart
        selectedAgentId={selectedAgentId || undefined}
        onAgentSelect={setSelectedAgentId}
      />
    </div>
  );
};

export default QaDashboardStats;
