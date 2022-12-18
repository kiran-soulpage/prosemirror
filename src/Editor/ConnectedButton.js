import React from 'react';
import PropTypes from 'prop-types';

import { useView } from './ViewProvider';
import Button from './Button';

const unwantedItems = [
  'code',
  'code_block',
  'footnote',
  'subscript',
  'superscript',
  'join_up',
  'undo',
  'redo'
];

export function ConnectedButton({
  onClick,
  title,
  name,
  run,
  focusAfter,
  enable,
  active,
  content
}) {
  const { state } = useView();
  const onClickWrapper = React.useCallback(
    event => {
      event.preventDefault();
      onClick(run, focusAfter);
    },
    [onClick, run, focusAfter]
  );
  if (unwantedItems.includes(name.toLowerCase())) return null;
  return (
    <Button
      title={title}
      disabled={!enable(state)}
      onClick={onClickWrapper}
      type={title}
      content={content}
      active={active(state)}
    />
  );
}

ConnectedButton.propTypes = {
  enable: PropTypes.func,
  onClick: PropTypes.func,
  focusAfter: PropTypes.bool,
  title: PropTypes.string,
  run: PropTypes.func,
  active: PropTypes.func,
  name: PropTypes.string,
  content: PropTypes.oneOfType([PropTypes.node, PropTypes.string])
};

ConnectedButton.defaultProps = {
  focusAfter: false,
  enable: () => true,
  active: () => false
};

export default React.memo(ConnectedButton);
