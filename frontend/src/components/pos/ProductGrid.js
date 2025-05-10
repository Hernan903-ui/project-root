import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CardActionArea,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { styled } from '@mui/material/styles';
import { addItem } from '../../features/pos/cartSlice';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const PriceTag = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  display: 'inline-block',
  fontWeight: 'bold',
}));

const StockTag = styled(Box)(({ theme, stock }) => ({
  backgroundColor: stock > 0 ? theme.palette.success.main : theme.palette.error.main,
  color: theme.palette.common.white,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  display: 'inline-block',
  fontWeight: 'bold',
  fontSize: '0.75rem',
}));

const ProductGrid = ({ products, isLoading, error }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (product) => {
    dispatch(addItem({ product, quantity: 1 }));
  };

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
        Error al cargar productos: {error.message}
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
        <Grid item xs={6} sm={4} md={3} lg={2} key={product.id}>
          <StyledCard>
            <CardActionArea 
              sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
              onClick={() => handleAddToCart(product)}
              disabled={product.stock_quantity <= 0}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" component="h2" noWrap gutterBottom>
                  {product.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 1, flexGrow: 1 }}
                >
                  SKU: {product.sku}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <PriceTag>${product.price.toFixed(2)}</PriceTag>
                  <StockTag stock={product.stock_quantity}>
                    {product.stock_quantity > 0 
                      ? `Stock: ${product.stock_quantity}` 
                      : 'Sin stock'}
                  </StockTag>
                </Box>
              </CardContent>
            </CardActionArea>
            <Button
              variant="contained"
              startIcon={<AddShoppingCartIcon />}
              fullWidth
              onClick={() => handleAddToCart(product)}
              disabled={product.stock_quantity <= 0}
              sx={{ mt: 'auto' }}
            >
              Agregar
            </Button>
          </StyledCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductGrid;