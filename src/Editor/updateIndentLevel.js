import { Fragment } from "prosemirror-model";
import { AllSelection, TextSelection } from "prosemirror-state";

// import {
//   clamp,
//   compareNumber,
//   isListNode,
//   transformAndPreserveTextSelection,
//   anchorCellRight,
//   bindScrollHandler,
//   findActionableCell,
//   findActionableCellFromSelection,
//   findNodesWithSameMark,
//   fromHTMlElement,
//   getCellRect,
//   isBulletListNode,
//   isElementFullyVisible,
//   isLinkActive,
//   isOrderedListNode,
//   isRectCollapsed,
//   isUrl,
//   popupAtAnchorRight,
//   useLinkHref,
//   usePrevious,
//   useTableCellNodes,
// } from "./utils";

const BLOCKQUOTE = "blockquote";
const HEADING = "heading";
const LIST_ITEM = "list_item";
const PARAGRAPH = "paragraph";
const MIN_INDENT_LEVEL = 0;
const MAX_INDENT_LEVEL = 3;

export default function updateIndentLevel(tr, schema, delta) {
  const { doc, selection } = tr;
  if (!doc || !selection) {
    return tr;
  }

  if (
    !(selection instanceof TextSelection || selection instanceof AllSelection)
  ) {
    return tr;
  }

  const { nodes } = schema;
  const { from, to } = selection;
  const listNodePoses = [];

  const blockquote = nodes[BLOCKQUOTE];
  const heading = nodes[HEADING];
  const paragraph = nodes[PARAGRAPH];

  doc.nodesBetween(from, to, (node, pos) => {
    const nodeType = node.type;
    if (
      nodeType === paragraph ||
      nodeType === heading ||
      nodeType === blockquote
    ) {
      tr = setNodeIndentMarkup(tr, schema, pos, delta);
      return false;
    }
    return true;
  });

  if (!listNodePoses.length) {
    return tr;
  }

  // tr = transformAndPreserveTextSelection(tr, schema, (memo) => {
  //   const { schema } = memo;
  //   let tr2 = memo.tr;
  //   listNodePoses
  //     .sort(compareNumber)
  //     .reverse()
  //     .forEach((pos) => {
  //       tr2 = setListNodeIndent(tr2, schema, pos, delta);
  //     });
  //   tr2 = consolidateListNodes(tr2);
  //   return tr2;
  // });

  return tr;
}

function setListNodeIndent(tr, schema, pos, delta) {
  const listItem = schema.nodes[LIST_ITEM];
  if (!listItem) {
    return tr;
  }

  const { doc, selection } = tr;
  if (!doc) {
    return tr;
  }

  const listNode = doc.nodeAt(pos);
  if (!listNode) {
    return tr;
  }

  // const indentNew = clamp(
  //   MIN_INDENT_LEVEL,
  //   listNode.attrs.indent + delta,
  //   MAX_INDENT_LEVEL
  // );
  // if (indentNew === listNode.attrs.indent) {
  //   return tr;
  // }

  const { from, to } = selection;

  if (from <= pos && to >= pos + listNode.nodeSize) {
    return setNodeIndentMarkup(tr, schema, pos, delta);
  }

  const listNodeType = listNode.type;

  // listNode is partially selected.
  const itemsBefore = [];
  const itemsSelected = [];
  const itemsAfter = [];

  doc.nodesBetween(pos, pos + listNode.nodeSize, (itemNode, itemPos) => {
    if (itemNode.type === listNodeType) {
      return true;
    }

    if (itemNode.type === listItem) {
      const listItemNode = listItem.create(
        itemNode.attrs,
        itemNode.content,
        itemNode.marks
      );
      if (itemPos + itemNode.nodeSize <= from) {
        itemsBefore.push(listItemNode);
      } else if (itemPos > to) {
        itemsAfter.push(listItemNode);
      } else {
        itemsSelected.push(listItemNode);
      }
      return false;
    }

    return true;
  });

  tr = tr.delete(pos, pos + listNode.nodeSize);
  if (itemsAfter.length) {
    const listNodeNew = listNodeType.create(
      listNode.attrs,
      Fragment.from(itemsAfter)
    );
    tr = tr.insert(pos, Fragment.from(listNodeNew));
  }

  // if (itemsSelected.length) {
  //   const listNodeAttrs = {
  //     ...listNode.attrs,
  //     indent: indentNew,
  //   };
  //   const listNodeNew = listNodeType.create(
  //     listNodeAttrs,
  //     Fragment.from(itemsSelected)
  //   );
  //   tr = tr.insert(pos, Fragment.from(listNodeNew));
  // }

  if (itemsBefore.length) {
    const listNodeNew = listNodeType.create(
      listNode.attrs,
      Fragment.from(itemsBefore)
    );
    tr = tr.insert(pos, Fragment.from(listNodeNew));
  }

  return tr;
}

function setNodeIndentMarkup(tr, schema, pos, delta) {
  if (!tr.doc) {
    return tr;
  }
  const node = tr.doc.nodeAt(pos);
  if (!node) {
    return tr;
  }
  // const indent = clamp(
  //   MIN_INDENT_LEVEL,
  //   (node.attrs.indent || 0) + delta,
  //   MAX_INDENT_LEVEL
  // );
  // if (indent === node.attrs.indent) {
  //   return tr;
  // }
  const nodeAttrs = {
    ...node.attrs,
  };
  return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
}
