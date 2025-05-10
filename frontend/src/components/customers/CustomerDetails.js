import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Grid,
  Chip,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CustomerDetails = ({ customer, onEdit, onDelete }) => {
  const { sales } = useSelector(state => state.sales || { sales: [] });
  
  // Filtrar ventas del cliente
  const customerSales = sales.filter(sale => 
    sale.customerId === customer.id || sale.customerId === customer._id
  );
  
  // Calcular valor total de compras
  const totalPurchases = customerSales.reduce((sum, sale) => sum + sale.total, 0);
  
  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          {customer.name}
        </Typography>
        <Chip 
          label={customer.type === 'business' ? 'Empresa' : 'Individual'} 
          color={customer.type === 'business' ? 'primary' : 'secondary'}
          variant="outlined"
        />
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Información de contacto
            </Typography>
            
            <List dense>
              {customer.email && (
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email"
                    secondary={customer.email}
                  />
                </ListItem>
              )}
              
              {customer.phone && (
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Teléfono"
                    secondary={customer.phone}
                  />
                </ListItem>
              )}
              
              {customer.documentType && customer.document && (
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`${customer.documentType.toUpperCase()}`}
                    secondary={customer.document}
                  />
                </ListItem>
              )}
              
              {customer.type === 'individual' && customer.birthdate && (
                <ListItem>
                  <ListItemIcon>
                    <EventNoteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Fecha de nacimiento"
                    secondary={formatDate(customer.birthdate)}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Dirección
            </Typography>
            
            {(customer.address || customer.city || customer.state) ? (
              <List dense>
                {customer.address && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Dirección"
                      secondary={customer.address}
                    />
                  </ListItem>
                )}
                
                {(customer.city || customer.state) && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                                            primary="Ciudad/Estado"
                      secondary={`${customer.city || ''} ${customer.state ? ', ' + customer.state : ''} ${customer.zipCode ? customer.zipCode : ''}`}
                    />
                  </ListItem>
                )}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay información de dirección registrada
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {customer.type === 'business' && (customer.companyName || customer.companyTaxId) && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Información de empresa
              </Typography>
              
              <List dense>
                {customer.companyName && (
                  <ListItem>
                    <ListItemIcon>
                      <BusinessIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Nombre de empresa"
                      secondary={customer.companyName}
                    />
                  </ListItem>
                )}
                
                {customer.companyTaxId && (
                  <ListItem>
                    <ListItemIcon>
                      <BusinessIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="RUC / ID Fiscal"
                      secondary={customer.companyTaxId}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        )}
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Historial de compras
            </Typography>
            
            {customerSales.length > 0 ? (
              <Box>
                <Typography variant="body2">
                  Número de compras: <strong>{customerSales.length}</strong>
                </Typography>
                <Typography variant="body2">
                  Total gastado: <strong>${totalPurchases.toFixed(2)}</strong>
                </Typography>
                <Typography variant="body2">
                  Última compra: <strong>{formatDate(customerSales[0]?.date || null)}</strong>
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Este cliente aún no ha realizado compras
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Notas
            </Typography>
            
            {customer.notes ? (
              <Box sx={{ p: 1 }}>
                <Typography variant="body2">
                  {customer.notes}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay notas registradas para este cliente
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          startIcon={<DeleteIcon />}
          color="error"
          onClick={() => onDelete(customer)}
          sx={{ mr: 1 }}
        >
          Eliminar
        </Button>
        <Button
          startIcon={<EditIcon />}
          variant="contained"
          onClick={() => onEdit(customer)}
        >
          Editar
        </Button>
      </Box>
    </Box>
  );
};

export default CustomerDetails;