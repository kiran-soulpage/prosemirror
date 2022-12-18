import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  base: {
    position: 'absolute',
    zIndex: 10,
    border: '1.5px solid rgb(193, 199, 208)',
    backgroundColor: 'white',
    boxShadow: '4px 4px 35px -12px rgba(0,0,0,0.64)',
    borderRadius: 3,
    whiteSpace: 'nowrap',
    margin: 0,
    display: 'flex'
  },
  position: ({ left, top }) => ({
    left,
    top
  })
});

function Floater({ children, top, left }) {
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const ref = React.useRef();
  const classes = useStyles(position);
  React.useEffect(() => {
    const { offsetWidth } = ref.current;
    setPosition({
      left:
        window.innerWidth - offsetWidth < left ? left - offsetWidth + 20 : left,
      top: top - 40 > 0 ? top - 40 : top + 20
    });
  }, [top, left]);
  return (
    <div ref={ref} className={classnames(classes.base, classes.position)}>
      {children}
    </div>
  );
}

Floater.propTypes = {
  top: PropTypes.number,
  left: PropTypes.number,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.node)
  ])
};

export default React.memo(Floater);
