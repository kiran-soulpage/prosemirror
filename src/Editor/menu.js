import {
  joinUp,
  lift,
  setBlockType,
  toggleMark,
  wrapIn
} from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import { wrapInList } from 'prosemirror-schema-list';
import {
  addColumnAfter,
  deleteColumn,
  addRowAfter,
  deleteRow,
  setCellAttr,
  deleteTable
} from 'prosemirror-tables';

import schema from './schema';
import icons from './icons';
import LinkComponent from './LinkComponent';
import ImageComponent from './ImageComponent';

export const markActive = type => state => {
  const { from, $from, to, empty } = state.selection;

  return empty
    ? type.isInSet(state.storedMarks || $from.marks())
    : state.doc.rangeHasMark(from, to, type);
};

export const blockActive = (type, attrs = {}) => state => {
  const { $from, to, node } = state.selection;

  if (node) {
    return node.hasMarkup(type, attrs);
  }

  return to <= $from.end() && $from.parent.hasMarkup(type, attrs);
};

export const canInsert = type => state => {
  const { $from } = state.selection;

  for (let d = $from.depth; d >= 0; d--) {
    const index = $from.index(d);

    if ($from.node(d).canReplaceWith(index, index, type)) {
      return true;
    }
  }

  return false;
};

export const addMarkWrapper = (state, markType, attrs = {}) => {
  const { selection } = state;
  const [{ $from, $to }] = selection.ranges;
  return state.tr.addMark($from.pos, $to.pos, markType.create(attrs));
};

const headingItem = level => {
  return {
    active: blockActive(schema.nodes.heading, { level }),
    content: `Heading ${level}`,
    run: (state, dispatch, view) => {
      const isActive = blockActive(schema.nodes.heading, { level })(state);
      if (isActive) {
        return setBlockType(schema.nodes.paragraph)(state, dispatch, view);
      }
      setBlockType(schema.nodes.heading, { level })(state, dispatch, view);
    }
  };
};

export default {
  heading: {
    heading: {
      title: 'Change heading level',
      content: icons.heading,
      enable: () => true,
      children: {
        h1: headingItem(1),
        h2: headingItem(2),
        h3: headingItem(3),
        // h4: headingItem(4),
        // h5: headingItem(5),
        // h6: headingItem(6),
        normal: {
          content: 'Normal text',
          active: state => blockActive(schema.nodes.paragraph)(state),
          run: setBlockType(schema.nodes.paragraph)
        }
      }
    }
  },
  marks: {
    strong: {
      title: 'Toggle strong',
      content: icons.strong,
      active: markActive(schema.marks.strong),
      run: toggleMark(schema.marks.strong)
    },
    em: {
      title: 'Toggle emphasis',
      content: icons.em,
      active: markActive(schema.marks.em),
      run: toggleMark(schema.marks.em)
    },
    code: {
      title: 'Toggle code',
      content: icons.code,
      active: markActive(schema.marks.code),
      run: toggleMark(schema.marks.code)
    },
    subscript: {
      title: 'Toggle subscript',
      content: icons.subscript,
      active: markActive(schema.marks.subscript),
      run: toggleMark(schema.marks.subscript)
    },
    superscript: {
      title: 'Toggle superscript',
      content: icons.superscript,
      active: markActive(schema.marks.superscript),
      run: toggleMark(schema.marks.superscript)
    },
    underline: {
      title: 'Toggle underline',
      content: icons.underline,
      active: markActive(schema.marks.underline),
      run: toggleMark(schema.marks.underline)
    },
    strikethrough: {
      title: 'Toggle strikethrough',
      content: icons.strikethrough,
      active: markActive(schema.marks.strikethrough),
      run: toggleMark(schema.marks.strikethrough)
    }
  },
  blocks: {
    blockquote: {
      title: 'Wrap in block quote',
      content: icons.blockquote,
      active: blockActive(schema.nodes.blockquote),
      enable: wrapIn(schema.nodes.blockquote),
      run: wrapIn(schema.nodes.blockquote)
    },
    bullet_list: {
      title: 'Wrap in bullet list',
      content: icons.bullet_list,
      active: blockActive(schema.nodes.bullet_list),
      enable: () => true,
      run: (state, dispatch, view) => {
        const isActive = lift(state);
        if (isActive) {
          return lift(state, dispatch, view);
        }
        wrapInList(schema.nodes.bullet_list)(state, dispatch, view);
      }
    },
    ordered_list: {
      title: 'Wrap in ordered list',
      content: icons.ordered_list,
      active: blockActive(schema.nodes.ordered_list),
      enable: () => true,
      run: (state, dispatch, view) => {
        const isActive = lift(state);
        if (isActive) {
          return lift(state, dispatch, view);
        }
        wrapInList(schema.nodes.ordered_list)(state, dispatch, view);
      }
    },
    join_up: {
      title: 'Join with above block',
      content: icons.join_up,
      enable: joinUp,
      run: joinUp
    }
  },
  insert: {
    link: {
      title: 'Add or remove link',
      content: icons.link,
      component: LinkComponent,
      run(url) {
        if (!url) return false;
        let href = url;
        if (href && !/^https?:\/\//i.test(href)) {
          href = 'http://' + href;
        }
        return (state, dispatch) => {
          if (markActive(schema.marks.link)(state)) {
            const mark = schema.marks['link'];
            return dispatch(addMarkWrapper(state, mark, { href }));
          }
          toggleMark(schema.marks.link, { href })(state, dispatch);
        };
      }
    },
    image: {
      title: 'Insert image',
      content: icons.image,
      enable: canInsert(schema.nodes.image),
      component: ImageComponent,
      run: src => (state, dispatch) => {
        const img = schema.nodes.image.createAndFill({ src });
        dispatch(state.tr.replaceSelectionWith(img));
      }
    },
    footnote: {
      title: 'Insert footnote',
      content: icons.footnote,
      enable: canInsert(schema.nodes.footnote),
      run: (state, dispatch) => {
        const footnote = schema.nodes.footnote.create();
        dispatch(state.tr.replaceSelectionWith(footnote));
      }
    },
    table: {
      title: 'Insert table',
      content: icons.table,
      enable: canInsert(schema.nodes.table),
      run: (state, dispatch) => {
        let rowCount = 2;
        let colCount = 2;

        const cells = [];
        while (colCount--) {
          cells.push(schema.nodes.table_cell.createAndFill());
        }
        const rows = [];
        while (rowCount--) {
          rows.push(schema.nodes.table_row.createAndFill(null, cells));
        }
        const table = schema.nodes.table.createAndFill(null, rows);
        dispatch(state.tr.replaceSelectionWith(table));
      }
    }
  },
  history: {
    undo: {
      title: 'Undo last change',
      content: icons.undo,
      enable: undo,
      run: undo
    },
    redo: {
      title: 'Redo last undone change',
      content: icons.redo,
      enable: redo,
      run: redo
    }
  }
};

export const TABLE_MENU = [
  {
    'Remove cell color': setCellAttr('background', null)
  },
  {
    'Insert column': addColumnAfter,
    'Insert row': addRowAfter
  },
  {
    'Delete column': deleteColumn,
    'Delete row': deleteRow
  },
  // {
  //   'Merge Cells': mergeCells,
  //   'Split Row': splitCell
  // },
  {
    'Delete table': deleteTable
  }
];
