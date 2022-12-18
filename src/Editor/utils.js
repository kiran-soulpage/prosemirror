import React from "react";
import { TextSelection } from "prosemirror-state";
import { CellSelection, TableMap } from "prosemirror-tables";
import { findParentNodeOfType } from "prosemirror-utils";

import { markActive } from "./menu";
import schema from "./schema";

const TABLE_CELL = "table_cell";
const TABLE_HEADER = "table_header";

export function usePrevious(value) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function findActionableCellFromSelection(selection) {
  const { $anchorCell } = selection;
  const start = $anchorCell.start(-1);
  const table = $anchorCell.node(-1);
  const tableMap = TableMap.get(table);
  let topRightRect;
  let posFound = null;
  let nodeFound = null;
  selection.forEachCell((cell, cellPos) => {
    const cellRect = tableMap.findCell(cellPos - start);
    if (
      !topRightRect ||
      (cellRect.top >= topRightRect.top && cellRect.left > topRightRect.left)
    ) {
      topRightRect = cellRect;
      posFound = cellPos;
      nodeFound = cell;
    }
  });

  return posFound === null
    ? null
    : {
        node: nodeFound,
        pos: posFound,
      };
}

export function findActionableCell(state) {
  const { doc, selection, schema } = state;
  const tdType = schema.nodes[TABLE_CELL];
  const thType = schema.nodes[TABLE_HEADER];
  if (!tdType && !thType) {
    return null;
  }

  let userSelection = selection;

  if (userSelection instanceof TextSelection) {
    const { from, to } = selection;
    if (from !== to) {
      return null;
    }
    const result =
      (tdType && findParentNodeOfType(tdType)(selection)) ||
      (thType && findParentNodeOfType(thType)(selection));

    if (!result) {
      return null;
    }

    userSelection = CellSelection.create(doc, result.pos);
  }

  if (userSelection instanceof CellSelection) {
    return findActionableCellFromSelection(userSelection);
  }

  return null;
}

export const isUrl = (url) =>
  /(?:^(https?|s?ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(
    url
  );

export function isBulletListNode(node) {
  return node.type.name === "bullet_list";
}

export function isOrderedListNode(node) {
  return node.type.name === "ordered_list";
}

export default function isListNode(node) {
  if (node instanceof Node) {
    return isBulletListNode(node) || isOrderedListNode(node);
  }
  return false;
}

export function compareNumber(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
}

export function isRectCollapsed(rect) {
  return rect.w === 0 || rect.h === 0;
}

export function getCellRect(view) {
  const node = useTableCellNode(view);
  return fromHTMlElement(node);
}

export function useTableCellNode(view) {
  const { state, readOnly } = view || {};
  const result = findActionableCell(state);
  let domFound = { node: null };
  if (result && !readOnly) {
    domFound = view.domAtPos(result.pos + 1);
  }
  return domFound.node;
}

export function fromHTMlElement(el) {
  const display = document.defaultView.getComputedStyle(el).display;
  if (display === "contents" && el.children.length === 1) {
    // el has no layout at all, use its children instead.
    return fromHTMlElement(el.children[0]);
  }
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    w: rect.width,
    h: rect.height,
  };
}

export function bindScrollHandler(target, callback) {
  const defaultView = target.ownerDocument.defaultView;
  const els = [];

  let rid = 0;

  let onScroll = () => {
    // Debounce the scroll handler.
    rid && cancelAnimationFrame(rid);
    rid = requestAnimationFrame(callback);
  };

  let el = target;

  // Scroll event does not bubble, so we need to look up all the scrollable
  // elements.
  while (el) {
    const overflow = defaultView.getComputedStyle(el).overflow;
    if ((onScroll && overflow === "auto") || overflow === "scroll") {
      el.addEventListener("scroll", onScroll, false);
      els.push(el);
    }
    el = el.parentElement;
  }

  return {
    dispose() {
      while (onScroll && els.length) {
        el = els.pop();
        el && el.removeEventListener("scroll", onScroll, false);
      }
      onScroll = null;
      rid && window.cancelAnimationFrame(rid);
      rid = 0;
    },
  };
}

export function isElementFullyVisible(el) {
  const { x, y, w, h } = fromHTMlElement(el);
  // Only checks the top-left point.
  const nwEl = w && h ? el.ownerDocument.elementFromPoint(x + 1, y + 1) : null;

  if (!nwEl) {
    return false;
  }

  if (nwEl === el) {
    return true;
  }

  if (el.contains(nwEl)) {
    return true;
  }

  return false;
}

export function anchorCellRight(editorRect, cellRect, width = 30, padding = 8) {
  const rect = { x: 0, y: 0, w: 0, h: 0 };
  if (editorRect && cellRect) {
    rect.x = cellRect.x + cellRect.w - width - padding - editorRect.x;
    rect.y = cellRect.y - editorRect.y + padding;
  }

  if (!cellRect || isRectCollapsed(cellRect)) {
    rect.x = -10000;
  }

  return rect;
}

export function popupAtAnchorRight(anchorRect, bodyRect) {
  const rect = { x: 0, y: 0, w: 0, h: 0 };
  if (anchorRect && bodyRect) {
    rect.x = anchorRect.x + anchorRect.w + 1;
    rect.y = anchorRect.y;
    const viewportWidth = window.innerWidth;
    if (rect.x + bodyRect.w > viewportWidth) {
      rect.x = Math.max(2, anchorRect.x - bodyRect.w);
    }
  }

  if (!anchorRect || isRectCollapsed(anchorRect)) {
    rect.x = -10000;
  }

  return rect;
}

export function findNodesWithSameMark(doc, from, to, markType) {
  let ii = from;
  const finder = (mark) => mark.type.name === markType;
  let firstMark = null;
  let fromNode = null;

  if (from === to) {
    const node = doc.nodeAt(from);
    if (!node || !node.marks) {
      return null;
    }
    const mark = node.marks.find(finder);
    if (!mark && !firstMark) {
      return null;
    }
    return mark;
  }

  while (ii < to) {
    const node = doc.nodeAt(ii);
    if (!node || !node.marks) {
      return null;
    }
    const mark = node.marks.find(finder);
    if (!mark && !firstMark) {
      return null;
    }
    fromNode = fromNode || node;
    firstMark = firstMark || mark;
    ii++;
  }

  return firstMark;
}

export function isLinkActive(state) {
  return markActive(schema.marks.link)(state);
}

export function useLinkHref(state) {
  const { doc, selection } = state;
  const { from, to } = selection;
  const mark = findNodesWithSameMark(doc, from, to, "link");
  return mark ? mark.attrs.href : "";
}
