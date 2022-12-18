import React from 'react';

import { Tooltip, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  active: {
    color: 'pink'
  },
  icons: {
    display: 'flex',
    flexDirection: 'row'
  },
  divider: {
    marginLeft: 10,
    marginRight: 10
  }
});

function Button({ content, title, onClick, disabled, active, type }) {
  const classes = useStyles();
  return (
    <Tooltip placement="top" title={title} arrow>
      <span>
        <IconButton
          key={type}
          disabled={disabled}
          onClick={onClick}
          className={active && classes.active}
        >
          {content}
        </IconButton>
      </span>
    </Tooltip>
  );
}

export default React.memo(Button);
