import React from 'react';
import {
  findActionableCell,
  popupAtAnchorRight,
  isElementFullyVisible,
  bindScrollHandler,
  fromHTMlElement,
  useTableCellNode,
  anchorCellRight
} from './utils';

export default function useTableCellPosition(view) {
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const node = useTableCellNode(view);
  React.useEffect(() => {
    if (node) {
      if (node && isElementFullyVisible(node)) {
        setPos(fromHTMlElement(node));
      } else {
        setPos({ x: -1000, y: -1000, w: 0, h: 0 });
      }
    } else {
      setPos({ x: -1000, y: -1000, w: 0, h: 0 });
    }
  }, [node]);
  return pos;
}
