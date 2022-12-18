import React from 'react';
import PropTypes from 'prop-types';

import { MenuItem as MuiMenuItem } from '@material-ui/core';

export default function MenuItem({ children, className, onClick, selected }) {
  return (
    <MuiMenuItem selected={selected} onClick={onClick} className={className}>
      {children}
    </MuiMenuItem>
  );
}

MenuItem.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  selected: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.node)
  ]).isRequired
};

MenuItem.defaultProps = {
  className: ''
};
