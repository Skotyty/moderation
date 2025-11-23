import { useState } from 'react';
import {
  useStatsSummary,
  useActivityChart,
  useDecisionsChart,
  useCategoriesChart,
} from '@/hooks/useStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Loading } from '@/components/ui/Loading';
import { PageTransition } from '@/components/ui/PageTransition';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatTime } from '@/lib/utils';
import { exportStatsToCSV, exportStatsToPDF } from '@/utils/exportUtils';
import type { StatsPeriod } from '@/types';
import { FileText, Download } from 'lucide-react';

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const value = data.value;
  const total = data.payload.total;
  const percent = total > 0 ? ((value / total) * 100).toFixed(2) : '0.00';

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium">{data.name}</p>
      <p className="text-sm text-muted-foreground">
        {value} ({percent}%)
      </p>
    </div>
  );
};

const StatsPage = () => {
  const [period, setPeriod] = useState<StatsPeriod>('week');

  const { data: summary, isLoading: summaryLoading } = useStatsSummary({ period });
  const { data: activityData, isLoading: activityLoading } = useActivityChart({ period });
  const { data: decisionsData, isLoading: decisionsLoading } = useDecisionsChart({ period });
  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesChart({ period });

  const isLoading = summaryLoading || activityLoading || decisionsLoading || categoriesLoading;

  const COLORS = {
    approved: '#10b981',
    rejected: '#ef4444',
    requestChanges: '#f59e0b',
  };

  // Пересчитываем проценты в количества для корректного отображения
  const pieData = decisionsData && summary
    ? (() => {
        const total = summary.totalReviewed;
        const approved = Math.round((decisionsData.approved / 100) * total);
        const rejected = Math.round((decisionsData.rejected / 100) * total);
        const requestChanges = Math.round((decisionsData.requestChanges / 100) * total);
        
        return [
          { name: 'Одобрено', value: approved, color: COLORS.approved, total },
          { name: 'Отклонено', value: rejected, color: COLORS.rejected, total },
          {
            name: 'На доработку',
            value: requestChanges,
            color: COLORS.requestChanges,
            total,
          },
        ];
      })()
    : [];

  const formattedActivityData =
    activityData?.map((item) => ({
      date: new Date(item.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      Одобрено: item.approved,
      Отклонено: item.rejected,
      'На доработку': item.requestChanges,
    })) || [];

  const categoriesChartData = categoriesData
    ? Object.entries(categoriesData).map(([name, value]) => ({ name, value }))
    : [];

  const handleExportCSV = () => {
    if (!summary || !activityData) return;
    exportStatsToCSV(summary, activityData, period);
  };

  const handleExportPDF = async () => {
    if (!summary || !activityData) return;
    await exportStatsToPDF(summary, activityData, period);
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loading size="lg" showProgress message="Загрузка статистики..." />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Статистика</h1>
        <div className="flex gap-2 items-center">
          <Select value={period} onChange={(e) => setPeriod(e.target.value as StatsPeriod)}>
            <option value="today">Сегодня</option>
            <option value="week">Последние 7 дней</option>
            <option value="month">Последние 30 дней</option>
          </Select>

          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileText className="h-4 w-4 mr-2" />
            Экспорт CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт PDF
          </Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Всего проверено
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.totalReviewed}</div>
              <div className="text-xs text-muted-foreground mt-2">
                Сегодня: {summary.totalReviewedToday}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Одобрено
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {summary.approvedPercentage.toFixed(2)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Отклонено
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {summary.rejectedPercentage.toFixed(2)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Среднее время проверки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatTime(summary.averageReviewTime)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Активность по дням</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formattedActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Одобрено" fill={COLORS.approved} />
                <Bar dataKey="Отклонено" fill={COLORS.rejected} />
                <Bar dataKey="На доработку" fill={COLORS.requestChanges} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Распределение решений</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(2)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Проверено по категориям</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoriesChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageTransition>
  );
};

export default StatsPage;

