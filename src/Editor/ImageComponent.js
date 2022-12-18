import React from 'react';
import ConnectedButton from './ConnectedButton';
import Uploader from '../ui/Uploader';

function ImageComponent({ onClick, onUpload, ...item }) {
  const uploadRef = React.useRef(null);
  const { run } = item;
  const triggerUpload = React.useCallback(() => uploadRef.current.click(), []);
  const onUploadWrapper = React.useCallback(
    async image => {
      const src = await onUpload(image);
      onClick(run(src));
    },
    [onClick, run, onUpload]
  );
  return (
    <>
      <ConnectedButton onClick={triggerUpload} {...item} />
      <Uploader fileRef={uploadRef} onUpload={onUploadWrapper} />
    </>
  );
}

export default React.memo(ImageComponent);
