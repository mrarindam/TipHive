'use client';

import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Heart
} from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Activity {
  type: 'received' | 'sent' | 'withdrawn';
  created_at: string;
  amount: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface AnalyticsProps {
  activities: Activity[];
  isCreator: boolean;
}

export default function AnalyticsDashboard({ activities, isCreator }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Filter activities based on role
  // Creators see 'received' (Earnings)
  // Fans see 'sent' (Spending)
  const filteredData = useMemo(() => {
    return activities.filter(a => isCreator ? a.type === 'received' : a.type === 'sent');
  }, [activities, isCreator]);

  const chartData = useMemo(() => {
    const now = new Date();
    const dataMap: { [key: string]: number } = {};
    const labels: string[] = [];

    if (timeRange === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dateKey = d.toISOString().split('T')[0];
        labels.push(label);
        dataMap[dateKey] = 0;
      }
    } else if (timeRange === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - (i * 7));
        const label = `Week ${4 - i}`;
        labels.push(label);
        const weekKey = `w-${i}`;
        dataMap[weekKey] = 0;
      }
    } else {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const label = d.toLocaleDateString('en-US', { month: 'short' });
        const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
        labels.push(label);
        dataMap[monthKey] = 0;
      }
    }

    filteredData.forEach(e => {
      const eDate = new Date(e.created_at);
      let key = '';

      if (timeRange === 'daily') {
        key = eDate.toISOString().split('T')[0];
      } else if (timeRange === 'weekly') {
        const diff = Math.floor((now.getTime() - eDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        if (diff >= 0 && diff < 4) key = `w-${diff}`;
      } else {
        key = `${eDate.getFullYear()}-${eDate.getMonth()}`;
      }

      if (dataMap[key] !== undefined) {
        dataMap[key] += Number(e.amount || 0);
      }
    });

    const values = Object.values(dataMap);
    
    // Calculate Growth Rate dynamically
    let rate = 0;
    if (values.length >= 2) {
      const current = values[values.length - 1];
      const previous = values[values.length - 2];
      if (previous > 0) {
        rate = ((current - previous) / previous) * 100;
      } else if (current > 0) {
        rate = 100;
      }
    }

    return {
      labels,
      growthRate: (rate >= 0 ? '+' : '') + rate.toFixed(1) + '%',
      datasets: [
        {
          label: isCreator ? 'Earnings (MUSD)' : 'Spending (MUSD)',
          data: values,
          borderColor: isCreator ? '#F7931A' : '#22d3ee',
          backgroundColor: isCreator ? 'rgba(247, 147, 26, 0.1)' : 'rgba(34, 211, 238, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: isCreator ? '#F7931A' : '#22d3ee',
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
        },
      ],
    };
  }, [filteredData, timeRange, isCreator]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: isCreator ? '#F7931A' : '#22d3ee',
        bodyColor: '#fff',
        bodyFont: { weight: 'bold' as const },
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: { weight: 'bold' as const },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#64748b',
          font: { weight: 'bold' as const },
        },
      },
    },
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4 space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2 mb-4">Time Analysis</p>
            <TimeButton 
              label="Daily View" 
              active={timeRange === 'daily'} 
              onClick={() => setTimeRange('daily')} 
              icon={<Calendar className="w-4 h-4" />}
            />
            <TimeButton 
              label="Weekly View" 
              active={timeRange === 'weekly'} 
              onClick={() => setTimeRange('weekly')} 
              icon={<BarChart3 className="w-4 h-4" />}
            />
            <TimeButton 
              label="Monthly View" 
              active={timeRange === 'monthly'} 
              onClick={() => setTimeRange('monthly')} 
              icon={<PieChartIcon className="w-4 h-4" />}
            />
          </div>

          <div className="glass-card p-4 space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2 mb-4">Chart Style</p>
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
              <button 
                onClick={() => setChartType('line')}
                className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${chartType === 'line' ? (isCreator ? 'bg-[#F7931A]' : 'bg-cyan-500') + ' text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                <LineChartIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setChartType('bar')}
                className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${chartType === 'bar' ? (isCreator ? 'bg-[#F7931A]' : 'bg-cyan-500') + ' text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card p-8 h-[600px] relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full -mr-32 -mt-32 ${isCreator ? 'bg-[#F7931A]/5' : 'bg-cyan-500/5'}`} />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-3xl md:text-4xl font-black text-white font-outfit uppercase tracking-tighter">
                  {isCreator ? 'Earnings' : 'Spending'} <span className={isCreator ? 'text-[#F7931A]' : 'text-cyan-400'}>Analytics</span>
                </h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                  {isCreator ? 'Revenue Growth' : 'Supporter History'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isCreator ? 'Growth Rate' : 'Activity Status'}</p>
                  <p className={`text-xl font-black flex items-center justify-end gap-1 font-outfit ${isCreator ? (parseFloat(chartData.growthRate) >= 0 ? 'text-green-400' : 'text-red-400') : 'text-cyan-400'}`}>
                    {isCreator ? chartData.growthRate : 'Active'} 
                    {isCreator ? (
                      parseFloat(chartData.growthRate) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
                    ) : <Heart className="w-4 h-4" />}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-[480px] w-full relative z-10">
              {chartType === 'line' ? (
                <Line data={chartData} options={options} />
              ) : (
                <Bar data={chartData} options={options} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeButton({ label, active, onClick, icon }: { label: string, active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all ${
        active 
          ? 'bg-white/5 border border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.02)]' 
          : 'bg-transparent border border-transparent text-slate-500 hover:text-white hover:bg-white/5'
      }`}
    >
      <div className={`p-1.5 rounded-lg ${active ? 'bg-white/10' : 'bg-white/5'}`}>
        {icon}
      </div>
      {label}
    </button>
  );
}
