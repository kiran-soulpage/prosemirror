import React from 'react';
import PropTypes from 'prop-types';

import { Menu as MuiMenu } from '@material-ui/core';

export function Menu({ anchorEl, children, className, onClose }) {
  return (
    <MuiMenu
      onClose={onClose}
      anchorEl={anchorEl}
      open={!!anchorEl}
      className={className}
      anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
      MenuListProps={{
        onMouseLeave: onClose,
        autoFocusItem: true,
        variant: 'menu'
      }}
    >
      {children}
    </MuiMenu>
  );
}

Menu.propTypes = {
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
  anchorEl: PropTypes.node
};

Menu.defaultProps = {
  className: '',
  anchorEl: null
};

export default Menu;
