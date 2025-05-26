//src/components/common/DebugInfo.js
import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';

const DebugInfo = ({ title, data, show = true }) => {
  if (!show || process.env.NODE_ENV === 'production') return null;
  
  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100', maxHeight: '200px', overflow: 'auto' }}>
      <Typography variant="subtitle2">{title || 'Información de depuración'}</Typography>
      <Divider sx={{ my: 1 }} />
      <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
        {typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data)}
      </Typography>
    </Paper>
  );
};

export default DebugInfo;