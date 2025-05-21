import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  CardActionArea,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

const CustomerCard = ({ customer, onClick }) => {
  // Genera iniciales para el avatar con validación para evitar errores
  const getInitials = (name) => {
    // Verificar si name existe y es un string
    if (!name || typeof name !== 'string') {
      // Si el cliente tiene firstName y lastName, usarlos para crear el nombre
      if (customer?.firstName && customer?.lastName) {
        const fullName = `${customer.firstName} ${customer.lastName}`;
        return fullName
          .split(' ')
          .map(word => word[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();
      }
      // Si no hay nombre disponible, retornar valor por defecto
      return 'CL';
    }
    
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Determina el color del avatar basado en el tipo de cliente
  const getAvatarColor = (type) => {
    return type === 'business' ? 'primary.main' : 'secondary.main';
  };

  // Si no hay cliente, mostrar una tarjeta de fallback
  if (!customer) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Cliente no disponible
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Crear un nombre para mostrar si no existe la propiedad name
  const displayName = customer.name || 
    (customer.firstName && customer.lastName 
      ? `${customer.firstName} ${customer.lastName}`
      : customer.firstName || customer.lastName || "Cliente sin nombre");

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 3
      }
    }}>
      <CardActionArea onClick={() => onClick(customer)} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: getAvatarColor(customer.type), 
                mr: 2 
              }}
            >
              {customer.type === 'business' ? <BusinessIcon /> : getInitials(displayName)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" noWrap title={displayName}>
                {displayName}
              </Typography>
              {customer.type === 'business' && customer.companyName && (
                <Typography variant="body2" color="text.secondary" noWrap title={customer.companyName}>
                  {customer.companyName}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {customer.email && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" noWrap title={customer.email}>
                  {customer.email}
                </Typography>
              </Box>
            )}
            
            {customer.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" noWrap>
                  {customer.phone}
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip 
              size="small"
              icon={customer.type === 'business' ? <BusinessIcon /> : <PersonIcon />}
              label={customer.type === 'business' ? 'Empresa' : 'Individual'} 
              variant="outlined"
              color={customer.type === 'business' ? 'primary' : 'secondary'}
            />
            
            {(customer.city || customer.state) && (
              <Tooltip title={`${customer.city || ''} ${customer.state ? ', ' + customer.state : ''}`}>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {customer.city || ''} {customer.state ? ', ' + customer.state : ''}
                </Typography>
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CustomerCard;