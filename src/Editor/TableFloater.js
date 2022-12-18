import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { makeStyles } from "@material-ui/styles";
import useTableCellPosition from "./useTableCellPosition";
import { isRectCollapsed, getCellRect } from "./utils";
import { useView } from "./ViewProvider";

const useStyles = makeStyles({
  base: {
    position: "absolute",
    zIndex: 10,
    display: "flex",
    whiteSpace: "nowrap",
  },
  position: ({ left, top }) => ({
    left,
    top,
  }),
});

const coordsFromPosition = (position, { x, y, w, h }, offsetWidth) => {
  if (position === "above") {
    const left = x;
    const top = y;
    return {
      left:
        window.innerWidth - offsetWidth < left
          ? left - offsetWidth + 30
          : left + 10,
      top: top - 60 > 0 ? top - 60 : top + 20,
    };
  }
  if (position === "right") {
    const rect = { x: 0, y: 0, w: 0, h: 0 };
    rect.x = x + w - 15 - 5;
    rect.y = y + 5;

    if (isRectCollapsed({ w, h })) {
      rect.x = -10000;
    }

    return {
      left: rect.x,
      top: rect.y,
    };
  }
};

function TableFloater({ children, position, className }) {
  const view = useView();
  const { x, y, h, w } = useTableCellPosition(view);
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });
  const ref = React.useRef();
  const classes = useStyles(coords);
  React.useEffect(() => {
    const { offsetWidth } = ref.current;
    setCoords(coordsFromPosition(position, { x, y, h, w }, offsetWidth));
  }, [x, y, h, w, position]);
  const requestRef = React.useRef();

  const animate = () => {
    const { offsetWidth } = ref.current;
    const tempCoords = coordsFromPosition(
      position,
      getCellRect(view),
      offsetWidth
    );
    setCoords(tempCoords);
    requestRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      ref={ref}
      className={classnames(className, classes.base, classes.position)}
    >
      {children}
    </div>
  );
}

TableFloater.propTypes = {
  view: PropTypes.any,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  position: PropTypes.oneOf(["above", "right", "left", "below"]),
};

TableFloater.defaultProps = {
  position: "above",
};

export default React.memo(TableFloater);
