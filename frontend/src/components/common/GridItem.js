// components/common/GridItem.js
import React from 'react';
import { Grid } from '@mui/material';

const GridItem = ({ xs, sm, md, lg, xl, item, children, ...props }) => {
  // Convertir las props antiguas al nuevo formato basado en gridColumn
  const gridColumnProps = {};
  
  if (xs !== undefined) {
    gridColumnProps.xs = `span ${xs}`;
  }
  
  if (sm !== undefined) {
    gridColumnProps.sm = `span ${sm}`;
  }
  
  if (md !== undefined) {
    gridColumnProps.md = `span ${md}`;
  }
  
  if (lg !== undefined) {
    gridColumnProps.lg = `span ${lg}`;
  }
  
  if (xl !== undefined) {
    gridColumnProps.xl = `span ${xl}`;
  }
  
  return (
    <Grid 
      gridColumn={gridColumnProps}
      {...props}
    >
      {children}
    </Grid>
  );
};

export default GridItem;