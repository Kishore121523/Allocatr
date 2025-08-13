// components/analytics/main-spending-chart.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Line } from 'react-chartjs-2';
import { formatCurrency } from '@/lib/utils';

interface MainSpendingChartProps {
  spendingData: {
    labels: string[];
    daily: number[];
    cumulative: number[];
  };
  timeRange: string;
}

export function MainSpendingChart({ spendingData, timeRange }: MainSpendingChartProps) {
  const lineChartData = {
    labels: spendingData.labels,
    datasets: [
      {
        label: 'Daily Spending',
        data: spendingData.daily,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Cumulative',
        data: spendingData.cumulative,
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(236, 72, 153)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12,
          },
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-foreground">Spending Trend</CardTitle>
        <CardDescription className="text-muted-foreground">
          Your spending over the last {timeRange} days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 mb-6">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
        
        {/* Custom Legend */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <span className="text-sm text-muted-foreground">Daily Spending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span className="text-sm text-muted-foreground">Cumulative</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}