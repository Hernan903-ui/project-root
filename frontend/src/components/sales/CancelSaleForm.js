import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Paper
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Warning as WarningIcon } from '@mui/icons-material';

const CancelSaleForm = ({ sale, onCancel, loading, error }) => {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    if (!touched) setTouched(true);
  };

  const handleSubmit = () => {
    setTouched(true);
    if (!reason.trim()) {
      return;
    }
    onCancel({ id: sale.id, reason });
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  if (!sale) return null;

  const isReasonEmpty = touched && !reason.trim();

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Cancelar Venta #{sale.receiptNumber || sale.id}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Fecha de venta: {formatDate(sale.date)}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2, 
          mb: 3, 
          bgcolor: 'error.lightest', 
          borderColor: 'error.light',
          display: 'flex',
          gap: 2
        }}
      >
        <WarningIcon color="error" sx={{ mt: 0.5 }} />
        <Box>
          <Typography variant="subtitle1" color="error" fontWeight="medium" gutterBottom>
            Advertencia
          </Typography>
          <Typography variant="body2">
            Esta acción cancelará la venta y no se puede deshacer. Se reversan los inventarios y se registrará como cancelada en el sistema.
          </Typography>
        </Box>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'object' ? (error?.detail || error?.message || 'Error al cancelar la venta') : error}
        </Alert>
      )}
      
      <TextField
        label="Motivo de la cancelación"
        multiline
        rows={3}
        fullWidth
        value={reason}
        onChange={handleReasonChange}
        placeholder="Indique el motivo de la cancelación"
        required
        error={isReasonEmpty}
        helperText={isReasonEmpty ? "El motivo de cancelación es obligatorio" : ""}
        sx={{ mb: 3 }}
      />
      
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Total de la venta:
            </Typography>
            <Typography variant="h6">
              ${sale.total.toFixed(2)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Cliente:
            </Typography>
            <Typography variant="h6">
              {sale.customer ? sale.customer.name : 'Cliente no registrado'}
            </Typography>
          </Box>
          {sale.paymentMethod && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Método de pago:
              </Typography>
              <Typography variant="h6">
                {sale.paymentMethod}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Al confirmar, acepta que esta acción es irreversible
        </Typography>
        <Button
          variant="contained"
          color="error"
          disabled={!reason.trim() || loading}
          onClick={handleSubmit}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <WarningIcon />}
          size="large"
        >
          {loading ? 'Procesando...' : 'Confirmar Cancelación'}
        </Button>
      </Box>
    </Box>
  );
};

export default CancelSaleForm;