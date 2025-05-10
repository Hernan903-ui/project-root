import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  ShoppingCart as OrderIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  Event as EventIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SupplierDetails = ({ supplier, onCreateOrder }) => {
  const navigate = useNavigate();

  if (!supplier) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>No se encontró información del proveedor</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" gutterBottom>{supplier.name}</Typography>
            <Chip 
              label={supplier.active ? 'Activo' : 'Inactivo'} 
              color={supplier.active ? 'success' : 'default'}
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip 
              label={supplier.category || 'General'} 
              color="primary" 
              variant="outlined"
              size="small"
            />
          </Box>
          <Box>
            <Tooltip title="Editar proveedor">
              <IconButton 
                color="primary" 
                onClick={() => navigate(`/suppliers/edit/${supplier.id}`)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="primary"
              startIcon={<OrderIcon />}
              onClick={() => onCreateOrder(supplier.id)}
            >
              Nueva Orden
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader title="Información de Contacto" />
              <CardContent>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Contacto"
                      secondary={supplier.contactName}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={supplier.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Teléfono"
                      secondary={supplier.phone}
                    />
                  </ListItem>
                  {supplier.website && (
                    <ListItem>
                      <ListItemIcon>
                        <WebsiteIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Sitio Web"
                        secondary={supplier.website}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader title="Dirección" />
              <CardContent>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Dirección"
                      secondary={supplier.address}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Ciudad / Estado / CP"
                      secondary={`${supplier.city || ''} ${supplier.state || ''} ${supplier.postalCode || ''}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="País"
                      secondary={supplier.country}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader title="Información Fiscal" />
              <CardContent>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <ReceiptIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Identificación Fiscal"
                      secondary={supplier.taxId || 'No especificado'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EventIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Términos de Pago"
                      secondary={supplier.paymentTerms || 'No especificado'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader title="Notas" />
              <CardContent>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <NotesIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Información Adicional"
                      secondary={supplier.notes || 'Sin notas'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SupplierDetails;