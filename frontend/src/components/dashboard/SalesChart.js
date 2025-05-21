import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler // Añade el plugin Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';

// Registra todos los componentes necesarios, incluido Filler
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Registra el plugin Filler
);

const SalesChart = ({ salesData }) => {
  const theme = useTheme();

  // Prepara los datos para el gráfico
  const chartData = {
    labels: salesData?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Ventas',
        data: salesData?.map(item => item.total) || [],
        fill: true, // Esta opción requiere el plugin Filler
        backgroundColor: theme.palette.primary.lighter,
        borderColor: theme.palette.primary.main,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: theme.palette.background.paper,
        pointBorderWidth: 2,
      },
    ],
  };

  // Opciones del gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 10,
        usePointStyle: true,
        callbacks: {
          label: (context) => `Ventas: ${context.parsed.y.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
          callback: (value) => value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }),
        },
      },
    },
  };

  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Ventas Recientes
        </Typography>
        <Box sx={{ height: 300, position: 'relative', mt: 2 }}>
          {salesData?.length > 0 ? (
            <Line data={chartData} options={options} />
          ) : (
            <Box
              sx={{
                display: 'flex',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No hay datos de ventas disponibles
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SalesChart;