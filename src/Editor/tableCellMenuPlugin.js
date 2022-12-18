import React from 'react';
import ReactDOM from 'react-dom';
import { Plugin } from 'prosemirror-state';
import {
  findActionableCell,
  popupAtAnchorRight,
  isElementFullyVisible,
  bindScrollHandler,
  fromHTMlElement,
  anchorCellRight
} from './utils';
import TableCellMenu from './TableCellMenu';

class TableCellTooltipView {
  constructor(view) {
    this.view = view;
    this.update(view, null);
    this.left = -1000;
    this.top = 0;
    this.cellElement = null;
    this.tooltip = null;
    this.viewElement = view.dom;
    this.requestId = requestAnimationFrame(this.requestFrame);
    console.log({
      requestId: this.requestFrame,
      requestFrame: this.requestFrame
    });
  }

  render(view) {
    return <TableCellMenu left={this.left} top={this.top} view={view} />;
  }

  createTooltip() {
    console.log('creating tooltip');
    if (!this.cellElement) {
      return;
    }
    this.tooltip = document.createElement('span');
    this.tooltip.id = 'tooltip';
    debugger;
    this.cellElement
      // .parentElement.parentElement.parentElement.parentElement
      .appendChild(this.tooltip);
  }

  update(view, lastState) {
    this.view = view;
    const { state, readOnly } = view;
    const result = findActionableCell(state);

    if (!result || readOnly) {
      return this.destroy();
    }

    // These is screen coordinate.
    const domFound = view.domAtPos(result.pos + 1);
    if (!domFound) {
      return this.destroy();
    }

    let cellElement = domFound.node;

    if (cellElement && !isElementFullyVisible(cellElement)) {
      console.log('not visible or not equal', {
        cellElement,
        isElementFullyVisible: isElementFullyVisible(cellElement)
      });
      this.cellElement = null;
      return this.destroy();
    }

    if (cellElement !== this.cellElement) {
      console.log('cells not equal');
      this.destroy();
      this.unbind(this.cellElement);
      this.cellElement = cellElement;
      this.bind(this.cellElement);
      this.createTooltip();
    }
    const cellRect = fromHTMlElement(this.cellElement);
    const editorRect = fromHTMlElement(this.viewElement);
    const { x, y } = anchorCellRight(editorRect, cellRect);
    this.left = x;
    this.top = y;

    const tooltipComponent = this.render(view);
    console.log({
      tooltip: this.tooltip,
      tooltipComponent
    });
    return ReactDOM.render(tooltipComponent, this.tooltip);
  }

  requestFrame() {
    if (!this.viewElement || !this.cellElement) {
      console.log('bad frame');
      this.requestId = requestAnimationFrame(this.requestFrame);
      return;
    }
    const cellRect = fromHTMlElement(this.cellElement);
    const editorRect = fromHTMlElement(this.viewElement);
    const { x, y } = anchorCellRight(editorRect, cellRect);
    console.log({
      'this.left': this.left,
      'this.top': this.top,
      x,
      y
    });
    if (this.left !== x || this.top !== y) {
      this.left = x;
      this.top = y;
      const tooltipComponent = this.render(this.view);
      ReactDOM.render(tooltipComponent, this.tooltip);
    }
    this.requestId = requestAnimationFrame(this.requestFrame);
  }

  bind(elem) {
    elem.addEventListener('scroll', this.scroll);
    elem.addEventListener('mousemove', this.mousemove);
  }

  unbind(elem) {
    elem.removeEventListener('scroll', this.scroll);
    elem.removeEventListener('mousemove', this.mousemove);
  }

  scroll(event) {
    console.log('scroll', event);
  }

  mousemove(event) {
    console.log('mousemove', event);
  }

  destroy() {
    if (this.tooltip) {
      console.log('destroying ');
      ReactDOM.unmountComponentAtNode(this.tooltip);
      this.tooltip.remove();
    }
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }
  }
}

const TableCellMenuPlugin = new Plugin({
  view(editorView) {
    return new TableCellTooltipView(editorView);
  }
});

export default TableCellMenuPlugin;
