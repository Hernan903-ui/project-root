import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesChart = ({ salesData = [], title = 'Ventas', period = 'últimos 30 días' }) => {
  // Formatear datos para el gráfico
  const chartData = {
    labels: salesData.map((item) => 
      format(new Date(item.date), 'dd MMM', { locale: es })
    ),
    datasets: [
      {
        label: 'Ventas',
        data: salesData.map((item) => item.revenue),
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Ventas: $${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return `$${value}`;
          }
        }
      }
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {period}
        </Typography>
        <Box sx={{ height: 300, position: 'relative' }}>
          <Line data={chartData} options={chartOptions} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default SalesChart;