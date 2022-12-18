import React from 'react';

import { Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import ConnectedButton from './ConnectedButton';
import DropdownButton from './DropdownButton';

const useStyles = makeStyles({
  group: {
    marginRight: 5,
    height: '100%',
    display: 'flex'
  },
  bar: {
    display: 'flex',
    alignItems: 'baseline',
    minHeight: 30
  }
});

function Item({ left, top, onClick, title, ...item }) {
  let Component = ConnectedButton;
  if (item.children) {
    Component = DropdownButton;
  }
  if (item.component) {
    Component = item.component;
  }
  return (
    <Component
      left={left}
      top={top}
      onClick={onClick}
      title={title}
      {...item}
    />
  );
}

const MemoItem = React.memo(Item);

export default function Menubar({
  onUpload,
  top,
  left,
  onClick,
  menu,
  children
}) {
  const classes = useStyles();
  const menuEntries = Object.entries(menu);
  return (
    <div className={classes.bar}>
      {children && <span className={classes.group}>{children}</span>}
      {menuEntries.map(([groupKey, group], index) => (
        <span key={groupKey} className={classes.group}>
          {Object.entries(group).map(([key, item]) => (
            <MemoItem
              key={key}
              top={top}
              left={left}
              onClick={onClick}
              name={key}
              onUpload={onUpload}
              {...item}
            />
          ))}
          {index !== menuEntries.length - 1 && (
            <Divider flexItem orientation="vertical" />
          )}
        </span>
      ))}
    </div>
  );
}
