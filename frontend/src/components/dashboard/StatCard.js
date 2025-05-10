import React from 'react';
import { Box, Card, CardContent, Typography, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
}));

const StatCard = ({ title, value, description, icon, color }) => {
  return (
    <StyledCard>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight="medium">
            {title}
          </Typography>
          <Avatar
            sx={{
              backgroundColor: `${color}.light`,
              color: `${color}.dark`,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          {description}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default StatCard;