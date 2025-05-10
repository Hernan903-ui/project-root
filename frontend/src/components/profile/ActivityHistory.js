import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  ReceiptLong as ReceiptIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserActivityHistory } from '../../features/user/userProfileSlice';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ActivityHistory = () => {
  const dispatch = useDispatch();
  const { activityHistory, activityLoading } = useSelector(state => state.userProfile);
  
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const itemsPerPage = 10;
  
  useEffect(() => {
    dispatch(fetchUserActivityHistory({ page, limit: itemsPerPage, type: filter !== 'all' ? filter : undefined }));
  }, [dispatch, page, filter]);
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(1); // Reset to first page when filter changes
  };
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'login':
        return <LoginIcon color="primary" />;
      case 'logout':
        return <LogoutIcon color="secondary" />;
      case 'edit':
        return <EditIcon color="info" />;
      case 'delete':
        return <DeleteIcon color="error" />;
      case 'sale':
        return <ShoppingCartIcon color="success" />;
      case 'create':
        return <AddIcon color="primary" />;
      case 'settings':
        return <SettingsIcon color="warning" />;
      case 'report':
        return <ReceiptIcon color="info" />;
      default:
        return <SettingsIcon />;
    }
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'PPp', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };
  
  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Historial de Actividad
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filtrar por</InputLabel>
          <Select
            value={filter}
            onChange={handleFilterChange}
            label="Filtrar por"
          >
            <MenuItem value="all">Todas las actividades</MenuItem>
            <MenuItem value="login">Inicio de sesión</MenuItem>
            <MenuItem value="logout">Cierre de sesión</MenuItem>
            <MenuItem value="edit">Ediciones</MenuItem>
            <MenuItem value="sale">Ventas</MenuItem>
            <MenuItem value="create">Creaciones</MenuItem>
            <MenuItem value="settings">Configuración</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {activityLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : activityHistory.items && activityHistory.items.length > 0 ? (
        <>
          <List>
            {activityHistory.items.map((activity, index) => (
              <React.Fragment key={activity.id || index}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    {getActivityIcon(activity.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.description}
                    secondary={
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(activity.timestamp)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            IP: {activity.ipAddress || 'No disponible'}
                          </Typography>
                        </Grid>
                        {activity.details && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {activity.details}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    }
                  />
                </ListItem>
                {index < activityHistory.items.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={Math.ceil(activityHistory.total / itemsPerPage)} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No se encontraron actividades
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ActivityHistory;