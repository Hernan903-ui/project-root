import React from 'react';
import { Button, styled } from '@mui/material';

const SkipLinkButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  left: '-999px',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  zIndex: theme.zIndex.tooltip + 1,
  '&:focus, &:active': {
    left: '8px',
    top: '8px',
    width: 'auto',
    height: 'auto',
    overflow: 'visible',
  },
}));

const SkipLink = ({ mainContentId = 'main-content' }) => {
  return (
    <SkipLinkButton
      variant="contained"
      color="primary"
      href={`#${mainContentId}`}
    >
      Saltar al contenido principal
    </SkipLinkButton>
  );
};

export default SkipLink;