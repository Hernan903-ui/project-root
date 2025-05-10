import React, { useState } from 'react';
import { Grid, Box, Paper, Divider } from '@mui/material';
import { useQuery } from 'react-query';
import { searchProducts } from '../api/posApi';

import ProductSearch from '../components/pos/ProductSearch';
import CategoryFilter from '../components/pos/CategoryFilter';
import ProductGrid from '../components/pos/ProductGrid';
import Cart from '../components/pos/Cart';
import BarcodeScanner from '../components/pos/BarcodeScanner';

const POSPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  
  const { isLoading, error } = useQuery(
    ['products', selectedCategory],
    () => searchProducts('', selectedCategory),
    {
      onSuccess: (data) => {
        setProducts(data);
      },
      refetchOnWindowFocus: false,
    }
  );

  const handleSearch = (searchResults) => {
    setProducts(searchResults);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Sección izquierda: Búsqueda y productos */}
        <Grid item xs={12} md={8} lg={9} sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <BarcodeScanner />
            <Divider sx={{ my: 2 }} />
            <ProductSearch onSearch={handleSearch} categoryId={selectedCategory} />
            <CategoryFilter 
              selectedCategory={selectedCategory} 
              onCategoryChange={handleCategoryChange} 
            />
          </Paper>
          
          <Box sx={{ flexGrow: 1, overflow: 'auto', pb: 2 }}>
            <ProductGrid 
              products={products} 
              isLoading={isLoading} 
              error={error} 
            />
          </Box>
        </Grid>
        
        {/* Sección derecha: Carrito */}
        <Grid item xs={12} md={4} lg={3} sx={{ height: '100%', display: 'flex' }}>
          <Cart />
        </Grid>
      </Grid>
    </Box>
  );
};

export default POSPage;