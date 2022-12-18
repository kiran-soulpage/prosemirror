import React from 'react';
import { Menu } from '@material-ui/core';

export default function Dropdown({ anchorEl, onClose, focus, children }) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={!!anchorEl}
      onClose={onClose}
      onExiting={focus}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
    >
      {children}
    </Menu>
  );
}
