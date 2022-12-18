import React from 'react';
import { Menu, MenuItem, Submenu } from '../ui';

export default function MenuWrapper({ anchorEl }) {
  return (
    anchorEl && (
      <Menu anchorEl={anchorEl}>
        <MenuItem>General</MenuItem>
        <Submenu label="Audio">
          <MenuItem>Audio Technica</MenuItem>
          <MenuItem>Bose</MenuItem>
        </Submenu>
      </Menu>
    )
  );
}
