import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  Chip,
  Avatar
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

const SupplierCard = ({ supplier, onClick }) => {
  if (!supplier) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'suspended': return 'Suspendido';
      case 'pending': return 'Pendiente';
      default: return 'Desconocido';
    }
  };

  return (
    <Paper 
      elevation={2}
      sx={{ 
        p: 2, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
      onClick={() => onClick && onClick(supplier)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
          {supplier.name?.charAt(0) || <PersonIcon />}
        </Avatar>
        <Typography variant="h6" noWrap>{supplier.name || 'Sin nombre'}</Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {supplier.contact_person || 'Sin contacto'}
      </Typography>
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ mt: 'auto' }}>
        <Typography variant="body2" noWrap>
          {supplier.email || 'Sin email'}
        </Typography>
        <Typography variant="body2" noWrap>
          {supplier.phone || 'Sin teléfono'}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip 
            label={getStatusLabel(supplier.status)} 
            size="small"
            color={getStatusColor(supplier.status)} 
          />
          <Typography variant="caption" color="text.secondary">
            ID: {supplier.id || 'N/A'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default SupplierCard;