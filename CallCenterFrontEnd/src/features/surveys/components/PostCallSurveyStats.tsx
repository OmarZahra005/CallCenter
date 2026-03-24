import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Star,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Clock,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, Button, Badge } from '../../../components/ui';
import { callSurveyApi } from '../api/callSurveyApi';
import type { SurveyReport } from '../api/callSurveyApi';

// Animation variants
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Rating star display
const RatingStars = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) => {
  const sizeClass = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

// Stat card component
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}) => (
  <motion.div variants={fadeUp}>
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> :
               trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Main component
export function PostCallSurveyStats() {
  const { t, i18n } = useTranslation();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Calculate date range
  const getDateRange = () => {
    const to = new Date().toISOString();
    const from = new Date();
    switch (dateRange) {
      case '7d':
        from.setDate(from.getDate() - 7);
        break;
      case '30d':
        from.setDate(from.getDate() - 30);
        break;
      case '90d':
        from.setDate(from.getDate() - 90);
        break;
    }
    return { from: from.toISOString(), to };
  };

  const { from, to } = getDateRange();

  // Fetch report data
  const { data: report, isLoading, refetch, isFetching } = useQuery<SurveyReport>({
    queryKey: ['callSurveyReport', dateRange],
    queryFn: () => callSurveyApi.getReport(from, to),
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const stats = report?.overallStats;

  return (
    <div className="space-y-6" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t('surveyPage.postCallSurveyAnalytics')}</h2>
          <p className="text-sm text-gray-500">{t('surveyPage.csatRating')}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date range selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  dateRange === range
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === '7d' ? t('surveyPage.sevenDays') : range === '30d' ? t('surveyPage.thirtyDays') : t('surveyPage.ninetyDays')}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            {t('surveyPage.refresh')}
          </Button>
        </div>
      </div>

      {/* Main stats cards */}
      <motion.div
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title={t('surveyPage.totalSurveysLabel')}
          value={stats?.totalSurveys || 0}
          subtitle={t('surveyPage.completed', { count: stats?.completedCount || 0 })}
          icon={MessageSquare}
          color="bg-blue-500"
        />
        <StatCard
          title={t('surveyPage.responseRateLabel')}
          value={`${stats?.responseRate || 0}%`}
          subtitle={t('surveyPage.ofSurveysCompleted')}
          icon={CheckCircle}
          color="bg-green-500"
          trend={stats?.responseRate && stats.responseRate > 50 ? 'up' : 'down'}
        />
        <StatCard
          title={t('surveyPage.averageRating')}
          value={stats?.averageRating?.toFixed(1) || '0.0'}
          subtitle={t('surveyPage.outOfFiveStars')}
          icon={Star}
          color="bg-yellow-500"
          trend={stats?.averageRating && stats.averageRating >= 4 ? 'up' :
                 stats?.averageRating && stats.averageRating < 3 ? 'down' : 'neutral'}
        />
        <StatCard
          title={t('surveyPage.pendingExpired')}
          value={`${stats?.pendingCount || 0} / ${stats?.expiredCount || 0}`}
          subtitle={t('surveyPage.failed', { count: stats?.failedCount || 0 })}
          icon={Clock}
          color="bg-orange-500"
        />
      </motion.div>

      {/* Rating distribution */}
      {stats?.ratingDistribution && Object.keys(stats.ratingDistribution).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('surveyPage.ratingDistribution')}</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating] || 0;
                const percentage = stats.completedCount > 0
                  ? Math.round((count / stats.completedCount) * 100)
                  : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-medium text-gray-700">{rating}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: (5 - rating) * 0.1 }}
                        className={`h-full rounded-full ${
                          rating >= 4 ? 'bg-green-500' :
                          rating === 3 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm text-gray-600">{count}</span>
                      <span className="text-xs text-gray-400 ml-1">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top and Bottom agents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top performers */}
        {report?.topAgents && report.topAgents.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-medium text-gray-900">{t('surveyPage.topPerformers')}</h3>
              </div>
              <div className="space-y-3">
                {report.topAgents.map((agent, index) => (
                  <div key={agent.agentId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{agent.agentName}</p>
                        <p className="text-xs text-gray-500">{t('surveyPage.responsesCount', { count: agent.completedCount })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RatingStars rating={Math.round(agent.averageRating)} />
                      <span className="text-sm font-medium text-gray-700">
                        {agent.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Needs improvement */}
        {report?.bottomAgents && report.bottomAgents.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-medium text-gray-900">{t('surveyPage.needsImprovement')}</h3>
              </div>
              <div className="space-y-3">
                {report.bottomAgents.map((agent) => (
                  <div key={agent.agentId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{agent.agentName}</p>
                      <p className="text-xs text-gray-500">{t('surveyPage.responsesCount', { count: agent.completedCount })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <RatingStars rating={Math.round(agent.averageRating)} />
                      <span className="text-sm font-medium text-gray-700">
                        {agent.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Channel breakdown */}
      {report?.channelBreakdown && Object.keys(report.channelBreakdown).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('surveyPage.surveyChannels')}</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(report.channelBreakdown).map(([channel, count]) => (
                <Badge key={channel} variant="default" className="px-3 py-1.5">
                  {channel}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PostCallSurveyStats;
