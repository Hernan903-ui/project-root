// components/common/LoadingOverlay.js
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingOverlay = ({ message = 'Cargando...' }) => {
  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        width: '100%',
        p: 3
      }}
    >
      <CircularProgress sx={{ mb: 2 }} />
      <Typography variant="body1">{message}</Typography>
    </Box>
  );
};

export default LoadingOverlay;