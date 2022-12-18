import React from 'react';
import PropTypes from 'prop-types';

import Menu from './Menu';
import MenuItem from './MenuItem';
import { ChevronRight } from '@material-ui/icons';

export default function Submenu({
  onClick,
  children,
  className,
  menuClassName,
  label
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const setAnchorElWrapper = React.useCallback(
    event => {
      console.log(event.target, event.currentTarget);

      setAnchorEl(
        event.currentTarget === event.target ? event.currentTarget : null
      );
    },
    [setAnchorEl]
  );

  const removeAnchorEl = React.useCallback(() => setAnchorEl(null), []);

  return (
    <MenuItem
      onClick={onClick || setAnchorElWrapper}
      className={className}
      selected={!!anchorEl}
    >
      {label}
      <ChevronRight />
      {children && (
        <Menu
          anchorEl={anchorEl}
          onClose={removeAnchorEl}
          className={menuClassName}
        >
          {children}
        </Menu>
      )}
    </MenuItem>
  );
}

Submenu.propTypes = {
  className: PropTypes.string,
  menuClassName: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
  label: PropTypes.node.isRequired
};

Submenu.defaultProps = {
  className: '',
  menuClassName: ''
};
