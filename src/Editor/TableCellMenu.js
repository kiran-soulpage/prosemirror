import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";

import { setCellAttr } from "prosemirror-tables";
import { Tooltip, Divider } from "@material-ui/core";
import { KeyboardArrowDown } from "@material-ui/icons";
import { makeStyles } from "@material-ui/styles";

import { Menu, Submenu, MenuItem, ColorPicker } from "../ui";

import { TABLE_MENU } from "./menu";
import { useTableCellNode } from "./utils";
import { useView } from "./ViewProvider";

const useStyles = makeStyles({
  base: {
    position: "absolute",
    // border: '1px solid rgb(193, 199, 208)',
    borderRadius: 2,
  },
  icon: {
    width: 15,
    height: 15,
  },
  dropdown: {
    // border: '1px solid black',
    borderRadius: 2,
    color: "white",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ed1d7c",
  },
});

export default function TableCellMenu({ onClick, cellColor }) {
  const classes = useStyles();
  const view = useView();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [colorPickerAnchor, setColorAnchor] = React.useState(null);
  const openColorPickerAnchor = React.useCallback((event) => {
    // if (event.target === event.currentTarget)
    setColorAnchor(event.currentTarget);
  }, []);
  const changeCellColor = (hex) =>
    onClick(setCellAttr("background", hex), true);
  const removeAnchors = React.useCallback(() => {
    setColorAnchor(null);
    setAnchorEl(null);
  }, []);
  const node = useTableCellNode(view);
  const bgColor =
    node && node.style.backgroundColor ? node.style.backgroundColor : "";

  const run = (func) => () => {
    setAnchorEl(null);
    onClick(func, true);
  };
  return (
    <div className={classnames(classes.base, classes.position)}>
      <Tooltip placement="bottom" title="Edit" arrow>
        <div
          className={classes.dropdown}
          onClick={(event) => setAnchorEl(event.target)}
        >
          <KeyboardArrowDown className={classes.icon} />
        </div>
      </Tooltip>
      {anchorEl && (
        <Menu onClose={removeAnchors} anchorEl={anchorEl}>
          <MenuItem onClick={openColorPickerAnchor}>
            Change cell color
            <ColorPicker
              color={bgColor}
              onClick={changeCellColor}
              onClose={removeAnchors}
              anchorEl={colorPickerAnchor}
            />
          </MenuItem>
          {TABLE_MENU.map((group, index) => (
            <>
              {Object.entries(group).map(([groupName, groupValue]) =>
                typeof groupValue === "function" ? (
                  <MenuItem onClick={run(groupValue)}>{groupName}</MenuItem>
                ) : (
                  <Submenu label={groupName}>
                    {Object.entries(groupValue).map(([name, value]) => (
                      <MenuItem onClick={run(value)}>{name}</MenuItem>
                    ))}
                  </Submenu>
                )
              )}
              {index !== TABLE_MENU.length - 1 && <Divider />}
            </>
          ))}
        </Menu>
      )}
    </div>
  );
}

TableCellMenu.propTypes = {
  onClick: PropTypes.func,
};

TableCellMenu.defaultProps = {
  onClick: () => {},
};
