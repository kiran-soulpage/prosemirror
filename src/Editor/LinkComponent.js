import React from 'react';
import ConnectedButton from './ConnectedButton';
import { useView } from './ViewProvider';
import { LinkPopover } from '../ui/LinkPopover';
import { useLinkHref, isLinkActive } from './utils';

export function LinkComponent({ onClick, top, left, ...item }) {
  const { state } = useView();
  const { run } = item;
  const [open, setOpen] = React.useState(false);
  const onClose = React.useCallback(() => setOpen(false), []);
  const position = React.useRef({ top, left });
  React.useEffect(() => {
    if (left !== -1000) {
      position.current = { top, left };
    }
  }, [top, left]);

  const onButtonClick = React.useCallback(() => setOpen(true), []);
  const onPopoverClick = React.useCallback(
    url => {
      setOpen(false);
      onClick(run(url), true);
    },
    [run, onClick]
  );
  const initialUrl = useLinkHref(state);
  const isEmpty = state.selection.empty;
  const isActive = !!isLinkActive(state);
  const enable = React.useCallback(() => !isEmpty, [isEmpty]);
  const active = React.useCallback(() => isActive, [isActive]);
  return (
    <>
      <ConnectedButton
        onClick={onButtonClick}
        active={active}
        enable={enable}
        {...item}
      />
      {open && (
        <LinkPopover
          initialUrl={initialUrl}
          onClose={onClose}
          onClick={onPopoverClick}
          open={open}
          {...position.current}
        />
      )}
    </>
  );
}

export default React.memo(LinkComponent);
