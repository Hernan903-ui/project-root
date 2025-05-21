import React from 'react';
import { Box, Card, CardContent, Typography, Avatar } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

// Componente de tarjeta estadística mejorado con mejores prácticas de Material-UI
const StatCard = ({ title, value, description, icon, color = 'primary' }) => {
  const theme = useTheme();
  
  // Obtener colores dinámicamente del tema, con fallbacks seguros
  const getColor = (colorName, variant) => {
    return theme.palette[colorName]?.[variant] || 
           theme.palette.primary[variant];
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: 2,
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        overflow: 'visible',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6,
          '& .MuiAvatar-root': {
            transform: 'scale(1.1)',
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          backgroundColor: getColor(color, 'main'),
          borderTopLeftRadius: theme.shape.borderRadius,
          borderTopRightRadius: theme.shape.borderRadius,
        }
      }}
    >
      <CardContent sx={{ flex: 1, p: 3 }}>
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between" 
          mb={2}
        >
          <Typography 
            variant="h6" 
            fontWeight="medium"
            color="text.primary"
          >
            {title}
          </Typography>
          <Avatar
            sx={{
              backgroundColor: alpha(getColor(color, 'main'), 0.1),
              color: getColor(color, 'main'),
              transition: 'transform 0.3s ease',
              width: 48,
              height: 48,
              boxShadow: `0 2px 10px 0 ${alpha(getColor(color, 'main'), 0.2)}`,
            }}
            aria-hidden="true"
          >
            {icon}
          </Avatar>
        </Box>
        
        <Typography 
          variant="h4" 
          fontWeight="bold"
          color="text.primary"
          sx={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mt: 1, minHeight: '2.5em', lineHeight: 1.5 }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatCard;