import React from 'react';
import PropTypes from 'prop-types';

function Uploader({ onUpload, fileRef }) {
  const onChange = React.useCallback(
    async event => {
      const { target } = event;
      event.stopPropagation();
      event.preventDefault();
      const [file] = target.files;
      await onUpload(file);
      target.value = null; // ensures that onChange can be called again
    },
    [onUpload]
  );
  return (
    <input
      type="file"
      ref={fileRef}
      style={{ display: 'none' }}
      onChange={onChange}
      multiple={false}
      accept=".jpg,.jpeg,.png"
    />
  );
}

Uploader.propTypes = {
  onUpload: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  fileRef: PropTypes.any
};

export default React.memo(Uploader);
