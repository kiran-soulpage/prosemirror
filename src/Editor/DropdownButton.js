import React from 'react';
import { MenuItem } from '@material-ui/core';

import { useView } from './ViewProvider';
import Button from './Button';
import Dropdown from './Dropdown';

const unwantedItems = [
  'code',
  'code_block',
  'footnote',
  'subscript',
  'superscript',
  'join_up'
];

export function DropdownButton({ onClick, title, ...item }) {
  const view = useView();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = React.useCallback(
    event => setAnchorEl(event.currentTarget),
    []
  );
  const onClose = React.useCallback(() => setAnchorEl(null), []);
  const { state, dom: editorElement } = view;
  const focus = React.useCallback(() => editorElement.focus(), [editorElement]);
  if (unwantedItems.includes(title.toLowerCase())) return null;
  return (
    <>
      <Button
        title={item.title}
        disabled={item.enable && !item.enable(state)}
        onClick={openMenu}
        type={title}
        content={item.content}
        active={item.active && item.active(state)}
      />
      <Dropdown onClose={onClose} focus={focus} anchorEl={anchorEl}>
        {Object.entries(item.children).map(([name, child]) => (
          <MenuItem
            key={name}
            selected={child.active(state)}
            onClick={() => onClick(child.run)}
          >
            {child.content}
          </MenuItem>
        ))}
      </Dropdown>
    </>
  );
}

export default React.memo(DropdownButton);
