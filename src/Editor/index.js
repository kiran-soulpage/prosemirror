import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';

import { DOMSerializer, DOMParser } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { isInTable } from 'prosemirror-tables';
import debounce from 'lodash.debounce';
import TurndownService from 'turndown';

import schema from './schema';
import plugins from './plugins';
import menu from './menu';
import Menubar from './Menubar';
import Floater from './Floater';
import TableFloater from './TableFloater';
import TableCellMenu from './TableCellMenu';
import { ViewProvider } from './ViewProvider';

const turndown = new TurndownService();

turndown.addRule('strikethrough', {
  filter: node =>
    node.nodeName === 'SPAN' &&
    node.style.textDecorationLine === 'line-through',
  replacement: content => `~~${content}~~`
});
turndown.keep(['table', 'tbody', 'tr', 'td', 'colgroup', 'col']);
turndown.addRule('underline', {
  filter: node =>
    node.nodeName === 'SPAN' && node.style.textDecoration === 'underline',
  replacement: content => `<u>${content}</u>`
});

const useStyles = makeStyles({
  div: {
    border: '1px solid black'
  },
  floater: {
    border: '1.5px solid rgb(193, 199, 208)',
    backgroundColor: 'white',
    boxShadow: '4px 4px 35px -12px rgba(0,0,0,0.64)',
    borderRadius: 3,
    margin: 0
  }
});

const parser = schema => {
  const parser = DOMParser.fromSchema(schema);

  return content => {
    const container = document.createElement('article');
    container.innerHTML = content;

    return parser.parse(container);
  };
};

const serializer = schema => {
  const serializer = DOMSerializer.fromSchema(schema);

  return doc => {
    const container = document.createElement('article');
    container.appendChild(serializer.serializeFragment(doc.content));
    container.querySelectorAll('table').forEach(function(table) {
      const colgroup = document.createElement('colgroup');
      const tbody = table.querySelector('tbody');

      if (!table.rows || table.rows.length === 0) {
        return;
      }
      const cellLength = table.rows[0].cells.length;
      for (var i = 0; i < cellLength; i++) {
        const cell = table.rows[0].cells[i];
        const colwidth = cell.getAttribute('data-colwidth');
        let colwidths = [];
        let col;

        if (colwidth) {
          colwidths = colwidth.split(',');
          for (let w = 0, wlen = colwidths.length; w < wlen; w++) {
            col = document.createElement('col');
            col.style.width = colwidths[w] + 'px';
            colgroup.appendChild(col);
          }
        } else {
          col = document.createElement('col');
          colgroup.appendChild(col);
        }

        table.insertBefore(colgroup, tbody);
      }
    });

    return container.innerHTML;
  };
};

function Editor({ showMenu, showFloater, options, value, onChange, onUpload }) {
  const classes = useStyles();
  const ref = React.useRef(null);

  const [state] = React.useState(() => {
    const parse = parser(schema);
    return EditorState.create({
      doc: parse(value),
      plugins,
      schema
    });
  });
  const onChangeWrapper = React.useCallback(
    debounce(doc => {
      const serialize = serializer(schema);
      const html = serialize(doc);
      const markdown = turndown.turndown(html);
      onChange(markdown);
    }, 50),
    [onChange]
  );
  const [view, setView] = React.useState();
  const [position, setPosition] = React.useState({ top: 0, left: -1000 });
  const resetPosition = React.useCallback(
    () => setPosition({ top: 0, left: -1000 }),
    []
  );
  React.useEffect(() => {
    ref.current.addEventListener('blur', resetPosition);
    return () => ref.current.removeEventListener('blur', resetPosition);
  }, []);
  React.useEffect(() => {
    let newView = new EditorView(ref.current, {
      state,
      dispatchTransaction(transaction) {
        const { state } = newView.state.applyTransaction(transaction);

        newView.updateState(state);
        onChangeWrapper(state.doc);
        const { selection } = state;
        if (selection && !selection.empty) {
          const coords = newView.coordsAtPos(selection.$anchor.pos);
          setPosition({
            left: coords.left,
            top: coords.top
          });
        } else {
          resetPosition();
        }
        setView(newView);
      }
    });
    newView.dom.addEventListener('blur', resetPosition);
    setView(newView);
    newView.focus();
    return () => {
      newView.dom.removeEventListener('blur', resetPosition);
      newView.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const editor = <div ref={ref} />;
  const menuVisible = showMenu && !!view;
  const floaterVisible = showFloater && !!view;
  const onClick = (run, focusAfter) => {
    run(view.state, view.dispatch);
    if (focusAfter) {
      setTimeout(() => view.dom.focus(), 10);
    }
  };
  const table = view && isInTable(view.state);
  const textSelected = view && view.selected && !view.selected.empty;
  return (
    <div className={classes.div}>
      <ViewProvider value={view}>
        {menuVisible && (
          <Menubar
            {...position}
            onUpload={onUpload}
            onClick={onClick}
            menu={menu}
          />
        )}
        {table && floaterVisible && !textSelected && (
          <TableFloater position="right">
            {menuVisible && (
              <TableCellMenu onClick={onClick} cellColor="#fff" />
            )}
          </TableFloater>
        )}
        {editor}
      </ViewProvider>
    </div>
  );
}

Editor.propTypes = {
  plugins: PropTypes.array,
  value: PropTypes.string,
  showMenu: PropTypes.bool,
  showFloater: PropTypes.bool
};

Editor.defaultProps = {
  plugins: [],
  value: '',
  showMenu: true,
  showFloater: true
};

export default React.memo(Editor);
