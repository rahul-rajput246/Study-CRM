import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function WeeklyStudyChart({ trendData = [] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textColor = isDark ? '#cbd5e1' : '#334155';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  const labels = trendData.map((d) => `${d.day} (${d.date})`);
  const plannedHours = trendData.map((d) => d.planned_hours);
  const actualHours = trendData.map((d) => d.actual_hours);

  const data = {
    labels,
    datasets: [
      {
        label: 'Planned Hours',
        data: plannedHours,
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(79, 70, 229, 0.3)',
        borderColor: isDark ? '#818cf8' : '#4f46e5',
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Actual Hours',
        data: actualHours,
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.85)' : 'rgba(16, 185, 129, 0.75)',
        borderColor: '#10b981',
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: { size: 12, weight: 'bold' },
          boxWidth: 14,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.raw} hrs`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { weight: '500' } },
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          font: { weight: '500' },
          stepSize: 1,
          callback: (value) => `${value}h`,
        },
      },
    },
  };

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
