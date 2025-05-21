// src/hoc/withOfflineMode.js
import React, { useState, useEffect } from 'react';
import { Alert, Box, Button, Snackbar } from '@mui/material';
import { CloudOff, Refresh } from '@mui/icons-material';
import { isInOfflineMode, setOfflineMode } from '../api/axios';

const withOfflineMode = (WrappedComponent) => {
  return (props) => {
    const [isOffline, setIsOffline] = useState(isInOfflineMode());
    const [showSnackbar, setShowSnackbar] = useState(false);

    useEffect(() => {
      const handleConnectionChange = (event) => {
        setIsOffline(event.detail.isOffline);
        if (event.detail.isOffline) {
          setShowSnackbar(true);
        }
      };

      window.addEventListener('connection-status-change', handleConnectionChange);
      return () => {
        window.removeEventListener('connection-status-change', handleConnectionChange);
      };
    }, []);

    const handleRetryConnection = () => {
      setOfflineMode(false);
      setShowSnackbar(false);
      window.location.reload(); // Forma simple de reintentar todas las conexiones
    };

    return (
      <>
        <WrappedComponent {...props} isOffline={isOffline} />
        
        {isOffline && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <Button
              variant="contained"
              color="warning"
              startIcon={<Refresh />}
              onClick={handleRetryConnection}
              sx={{ mb: 2 }}
            >
              Reconectar
            </Button>
          </Box>
        )}
        
        <Snackbar 
          open={showSnackbar} 
          autoHideDuration={6000} 
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity="warning" 
            variant="filled"
            icon={<CloudOff />}
            onClose={() => setShowSnackbar(false)}
          >
            Modo sin conexión activado. Los datos mostrados pueden no estar actualizados.
          </Alert>
        </Snackbar>
      </>
    );
  };
};

export default withOfflineMode;