import React from 'react';
import { SketchPicker } from 'react-color';
import { Popover } from '@material-ui/core';

function ColorPicker({ color, anchorEl, onClose, onClick }) {
  const [localColor, setLocalColor] = React.useState(color);
  const onCloseWrapper = React.useCallback(() => {
    onClick(localColor);
    onClose();
  }, [onClose, onClick, localColor]);
  React.useEffect(() => {
    setLocalColor(color);
  }, [color]);
  const setColor = React.useCallback((color, event) => {
    const { rgb } = color;
    const { r, g, b, a } = rgb;
    event.stopPropagation();
    setLocalColor(`rgba(${r}, ${g}, ${b}, ${a})`);
  }, []);
  React.useEffect(() => {
    if (anchorEl && anchorEl.ownerDocument !== document) {
      onClose();
    }
  }, [anchorEl]);
  return (
    <Popover
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'left'
      }}
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={onCloseWrapper}
    >
      <SketchPicker color={localColor} onChange={setColor} />
    </Popover>
  );
}

export default ColorPicker;
