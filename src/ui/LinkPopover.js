import React from 'react';
import PropTypes from 'prop-types';
import { Popover, Button, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { isUrl } from '../Editor/utils';

const useStyles = makeStyles({
  popover: {
    padding: 15,
    width: 400,
    overflow: 'visible',
    backgroundColor: 'rgb(239, 239, 239)'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  tab: {
    position: 'absolute',
    top: -30,
    left: 5,

    width: 0,
    height: 0,
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    borderBottom: '20px solid rgb(239, 239, 239)'
  },
  textField: {
    marginBottom: 15
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
});

function checkValid(string, url = false) {
  const trimmedStr = string.toString().trim();
  if (trimmedStr.length === 0) {
    return { valid: false, message: 'This field is required.' };
  }
  if (url) {
    if (!isUrl(string)) {
      return { valid: false, message: 'This is not a valid URL.' };
    }
  }
  return { valid: true, message: '' };
}

export function LinkPopover({ initialUrl, left, onClick, onClose, open, top }) {
  const classes = useStyles();
  const [showUrlWarning, setShowUrlWarning] = React.useState(false);
  const [url, setLocalUrl] = React.useState(initialUrl);

  React.useEffect(() => setLocalUrl(initialUrl), [initialUrl, setLocalUrl]);
  const setBothUrls = React.useCallback(event => {
    setLocalUrl(event.target.value);
    setShowUrlWarning(false);
  }, []);
  const { valid: urlValid, message: urlMessage } = checkValid(url, true);
  const disabled = !urlValid;
  const onClickWrapper = React.useCallback(
    (...args) => {
      if (disabled) {
        setShowUrlWarning(true);
        return;
      }
      onClick(url);
    },
    [url, disabled, onClick]
  );
  const urlRef = React.useRef(null);
  // React.useEffect(() => {
  //   urlRef.current.focus();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
  return (
    <Popover
      anchorOrigin={{
        horizontal: 'left',
        vertical: 'top'
      }}
      classes={{ paper: classes.popover }}
      open={open}
      anchorPosition={{ top: top + 30, left: left - 25 }}
      anchorReference="anchorPosition"
      onClose={onClose}
    >
      <div className={classes.container}>
        <div className={classes.tab} />
        <TextField
          label="URL"
          variant="filled"
          onChange={setBothUrls}
          value={url}
          inputRef={urlRef}
          error={showUrlWarning ? !urlValid : false}
          helperText={showUrlWarning && urlMessage}
          className={classes.textField}
        />
        <div className={classes.buttonContainer}>
          <Button variant="contained" color="primary" onClick={onClickWrapper}>
            Add
          </Button>
        </div>
      </div>
    </Popover>
  );
}

LinkPopover.propTypes = {
  initialUrl: PropTypes.string.isRequired,
  left: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  setLabel: PropTypes.func.isRequired,
  setURL: PropTypes.func.isRequired,
  top: PropTypes.number.isRequired
};

export default React.memo(LinkPopover);
