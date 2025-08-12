import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CardActionArea,
  CircularProgress,
  Alert,
  Stack,
  useTheme
} from '@mui/material';
import { Grid } from '@mui/material'; // Usando Grid estable
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { styled } from '@mui/material/styles';
import { addItem } from '../../features/pos/cartSlice';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
  },
}));

const PriceTag = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  display: 'inline-flex',
  fontWeight: 'bold',
  alignItems: 'center',
}));

const StockTag = styled(Box)(({ theme, stock }) => ({
  backgroundColor: stock > 0 ? theme.palette.success.main : theme.palette.error.main,
  color: theme.palette.common.white,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  display: 'inline-flex',
  fontWeight: 'bold',
  fontSize: '0.75rem',
  alignItems: 'center',
}));

const ProductGrid = ({ products, isLoading, error }) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const handleAddToCart = useCallback((product) => {
    dispatch(addItem({ product, quantity: 1 }));
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        Error al cargar productos: {typeof error === 'object' ? error.message : error}
      </Alert>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No se encontraron productos. Intente con otra búsqueda o categoría.
      </Alert>
    );
  }

  return (
    <Grid container spacing={2}>
      {products.map((product) => (
        <Grid xs={6} sm={4} md={3} lg={2} key={product.id}>
          <StyledCard
            elevation={2}
            sx={{
              opacity: product.stock_quantity <= 0 ? 0.7 : 1,
              position: 'relative',
            }}
          >
            <CardActionArea 
              sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'stretch',
                p: 1,
              }}
              onClick={() => product.stock_quantity > 0 && handleAddToCart(product)}
              disabled={product.stock_quantity <= 0}
              aria-label={`Agregar ${product.name} al carrito`}
            >
              <CardContent sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column',
                p: 1,
                '&:last-child': { pb: 1 }
              }}>
                <Typography 
                  variant="h6" 
                  component="h2" 
                  noWrap 
                  title={product.name}
                  gutterBottom
                >
                  {product.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 1, flexGrow: 1 }}
                >
                  SKU: {product.sku || 'N/A'}
                </Typography>
                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  spacing={1}
                >
                  <PriceTag>${product.price.toFixed(2)}</PriceTag>
                  <StockTag stock={product.stock_quantity}>
                    {product.stock_quantity > 0 
                      ? `Stock: ${product.stock_quantity}` 
                      : 'Sin stock'}
                  </StockTag>
                </Stack>
              </CardContent>
            </CardActionArea>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddShoppingCartIcon />}
              fullWidth
              onClick={() => handleAddToCart(product)}
              disabled={product.stock_quantity <= 0}
              sx={{ 
                mt: 'auto',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }}
            >
              Agregar
            </Button>
            
            {product.stock_quantity <= 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    bgcolor: theme.palette.error.main,
                    color: theme.palette.error.contrastText,
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    transform: 'rotate(-15deg)',
                    fontWeight: 'bold',
                  }}
                >
                  AGOTADO
                </Typography>
              </Box>
            )}
          </StyledCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductGrid;