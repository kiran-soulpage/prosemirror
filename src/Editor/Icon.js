import React from 'react';
import PropTypes from 'prop-types';

import {
  FormatListBulleted as ULIcon,
  FormatListNumbered as OLIcon,
  FormatQuote as BlockquoteIcon,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatStrikethrough,
  Link,
  Image,
  FormatSize as SizeIcon,
  Redo,
  Undo,
  TextFields,
  BorderAllRounded as TableIcon,
  FormatIndentDecrease as LiftIcon,
  FormatClear
} from '@material-ui/icons';

const titleToIcon = {
  em: <FormatItalic />,
  strong: <FormatBold />,
  undo: <Undo />,
  redo: <Redo />,
  h1: <TextFields />,
  strikethrough: <FormatStrikethrough />,
  link: <Link />,
  underline: <FormatUnderlined />,
  image: <Image />,
  bullet_list: <ULIcon />,
  ordered_list: <OLIcon />,
  blockquote: <BlockquoteIcon />,
  table: <TableIcon />,
  lift: <LiftIcon />,
  plain: <FormatClear />
};

export function Icon({ icon }) {
  const IconToUse = titleToIcon[icon.toLowerCase()];
  console.log({ IconToUse });
  if (!IconToUse) return icon;
  return <IconToUse />;
}

Icon.propTypes = {
  type: PropTypes.string
};

Icon.defaultProps = {
  type: ''
};

export default React.memo(Icon);
