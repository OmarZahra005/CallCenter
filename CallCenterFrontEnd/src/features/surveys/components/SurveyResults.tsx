import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  Download,
  RefreshCw,
  MessageSquare,
  ThumbsUp,
  Minus,
  Clock,
  Target,
  X,
} from 'lucide-react';
import { Card, Button, Badge } from '../../../components/ui';
import apiClient from '../../../api/client';

interface SurveyResponse {
  id: string;
  surveyId: string;
  customerId?: string;
  customerName?: string;
  agentId?: string;
  agentName?: string;
  responses: {
    questionId: string;
    questionText: string;
    questionType: string;
    answer: string | number;
  }[];
  overallScore?: number;
  submittedAt: string;
  channel?: string;
}

interface SurveyResultsProps {
  surveyId: string;
  surveyName: string;
  surveyType: 'CSAT' | 'NPS' | 'Custom';
  onClose: () => void;
}


export const SurveyResults = ({
  surveyId,
  surveyName,
  surveyType,
  onClose,
}: SurveyResultsProps) => {
  const [timeRange, setTimeRange] = useState<'7' | '14' | '30' | 'all'>('30');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');

  // Fetch responses
  const { data: responses = [], isLoading } = useQuery<SurveyResponse[]>({
    queryKey: ['survey-responses', surveyId],
    queryFn: async () => {
      const response = await apiClient.get(`/surveys/${surveyId}/responses`);
      return response.data.items || response.data || [];
    },
  });

  // Get unique agents
  const agents = useMemo(() => {
    const agentSet = new Map<string, string>();
    responses.forEach((r) => {
      if (r.agentId && r.agentName) {
        agentSet.set(r.agentId, r.agentName);
      }
    });
    return Array.from(agentSet.entries()).map(([id, name]) => ({ id, name }));
  }, [responses]);

  // Filter responses
  const filteredResponses = useMemo(() => {
    let filtered = responses;

    // Time filter
    if (timeRange !== 'all') {
      const days = parseInt(timeRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      filtered = filtered.filter((r) => new Date(r.submittedAt) >= cutoff);
    }

    // Agent filter
    if (selectedAgent !== 'all') {
      filtered = filtered.filter((r) => r.agentId === selectedAgent);
    }

    return filtered;
  }, [responses, timeRange, selectedAgent]);

  // Calculate stats
  const stats = useMemo(() => {
    if (filteredResponses.length === 0) {
      return {
        totalResponses: 0,
        averageScore: 0,
        satisfactionRate: 0,
        npsScore: 0,
        trendDirection: 'stable' as const,
        trendValue: 0,
      };
    }

    const totalResponses = filteredResponses.length;
    const avgScore =
      filteredResponses.reduce((sum, r) => sum + (r.overallScore || 0), 0) / totalResponses;

    // Calculate satisfaction rate (4 or 5 stars)
    const satisfiedCount = filteredResponses.filter((r) => (r.overallScore || 0) >= 4).length;
    const satisfactionRate = (satisfiedCount / totalResponses) * 100;

    // Calculate NPS if applicable
    let npsScore = 0;
    if (surveyType === 'NPS') {
      const promoters = filteredResponses.filter((r) => (r.overallScore || 0) >= 9).length;
      const detractors = filteredResponses.filter((r) => (r.overallScore || 0) <= 6).length;
      npsScore = ((promoters - detractors) / totalResponses) * 100;
    }

    // Calculate trend (compare last 7 days vs previous 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recentResponses = filteredResponses.filter((r) => new Date(r.submittedAt) >= weekAgo);
    const previousResponses = filteredResponses.filter(
      (r) => new Date(r.submittedAt) >= twoWeeksAgo && new Date(r.submittedAt) < weekAgo
    );

    const recentAvg =
      recentResponses.length > 0
        ? recentResponses.reduce((sum, r) => sum + (r.overallScore || 0), 0) / recentResponses.length
        : avgScore;
    const previousAvg =
      previousResponses.length > 0
        ? previousResponses.reduce((sum, r) => sum + (r.overallScore || 0), 0) /
          previousResponses.length
        : avgScore;

    const trendValue = recentAvg - previousAvg;
    const trendDirection: 'up' | 'down' | 'stable' =
      trendValue > 0.2 ? 'up' : trendValue < -0.2 ? 'down' : 'stable';

    return {
      totalResponses,
      averageScore: avgScore,
      satisfactionRate,
      npsScore,
      trendDirection,
      trendValue,
    };
  }, [filteredResponses, surveyType]);

  // Score distribution
  const scoreDistribution = useMemo(() => {
    const distribution = surveyType === 'NPS'
      ? [
          { label: 'Promoters (9-10)', min: 9, max: 10, count: 0, color: 'bg-green-500' },
          { label: 'Passives (7-8)', min: 7, max: 8, count: 0, color: 'bg-yellow-500' },
          { label: 'Detractors (0-6)', min: 0, max: 6, count: 0, color: 'bg-red-500' },
        ]
      : [
          { label: '5 Stars', value: 5, count: 0, color: 'bg-green-500' },
          { label: '4 Stars', value: 4, count: 0, color: 'bg-green-400' },
          { label: '3 Stars', value: 3, count: 0, color: 'bg-yellow-500' },
          { label: '2 Stars', value: 2, count: 0, color: 'bg-orange-500' },
          { label: '1 Star', value: 1, count: 0, color: 'bg-red-500' },
        ];

    filteredResponses.forEach((r) => {
      const score = r.overallScore || 0;
      if (surveyType === 'NPS') {
        const bucket = distribution.find(
          (d) => 'min' in d && score >= d.min && score <= d.max
        );
        if (bucket) bucket.count++;
      } else {
        const bucket = distribution.find((d) => 'value' in d && d.value === Math.round(score));
        if (bucket) bucket.count++;
      }
    });

    return distribution;
  }, [filteredResponses, surveyType]);

  const maxDistribution = Math.max(...scoreDistribution.map((d) => d.count), 1);

  // Agent performance
  const agentPerformance = useMemo(() => {
    const agentMap = new Map<string, { name: string; scores: number[]; count: number }>();

    filteredResponses.forEach((r) => {
      if (!r.agentId) return;
      if (!agentMap.has(r.agentId)) {
        agentMap.set(r.agentId, { name: r.agentName || 'Unknown', scores: [], count: 0 });
      }
      const agent = agentMap.get(r.agentId)!;
      if (r.overallScore) {
        agent.scores.push(r.overallScore);
        agent.count++;
      }
    });

    return Array.from(agentMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        averageScore:
          data.scores.length > 0
            ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
            : 0,
        responseCount: data.count,
      }))
      .sort((a, b) => b.averageScore - a.averageScore);
  }, [filteredResponses]);

  // Recent feedback
  const recentFeedback = useMemo(() => {
    return filteredResponses
      .filter((r) => r.responses.some((resp) => resp.questionType === 'text' && resp.answer))
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 5);
  }, [filteredResponses]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{surveyName}</h2>
          <p className="text-sm text-gray-500">Survey Results</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Time Range */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['7', '14', '30', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {range === 'all' ? 'All Time' : `${range} Days`}
            </button>
          ))}
        </div>

        {/* Agent Filter */}
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="all">All Agents</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalResponses}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Score</p>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.averageScore.toFixed(1)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {stats.trendDirection === 'up' && (
                <TrendingUp className="w-5 h-5 text-green-500" />
              )}
              {stats.trendDirection === 'down' && (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
              {stats.trendDirection === 'stable' && (
                <Minus className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Satisfaction Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.satisfactionRate.toFixed(0)}%
              </p>
            </div>
            <ThumbsUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        {surveyType === 'NPS' ? (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">NPS Score</p>
                <p
                  className={`text-2xl font-bold ${
                    stats.npsScore >= 50
                      ? 'text-green-600'
                      : stats.npsScore >= 0
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {stats.npsScore.toFixed(0)}
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        ) : (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">68%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            Score Distribution
          </h3>
          <div className="space-y-3">
            {scoreDistribution.map((bucket) => (
              <div key={bucket.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{bucket.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {bucket.count} ({((bucket.count / (stats.totalResponses || 1)) * 100).toFixed(0)}
                    %)
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(bucket.count / maxDistribution) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${bucket.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Agent Performance */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            Agent Performance
          </h3>
          <div className="space-y-3">
            {agentPerformance.slice(0, 5).map((agent, index) => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {agent.name}
                    </p>
                    <p className="text-xs text-gray-500">{agent.responseCount} responses</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-gray-900 dark:text-white">
                    {agent.averageScore.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
            {agentPerformance.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No agent data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Feedback */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-600" />
          Recent Feedback
        </h3>
        <div className="space-y-3">
          {recentFeedback.map((feedback) => {
            const textResponse = feedback.responses.find((r) => r.questionType === 'text');
            return (
              <div
                key={feedback.id}
                className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (feedback.overallScore || 0)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    {feedback.agentName && (
                      <Badge variant="default" size="sm">
                        {feedback.agentName}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(feedback.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                {textResponse && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    "{textResponse.answer}"
                  </p>
                )}
              </div>
            );
          })}
          {recentFeedback.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No feedback comments yet</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SurveyResults;
