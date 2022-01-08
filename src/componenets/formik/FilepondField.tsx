import React from 'react';
import S3FilePond from "../media/S3FilePond";

interface OwnProps {
  preSignedUrlEndpoint: string,
  s3BaseUrl: string,
  fileId: string,
  fileType: string
}
const FilepondField: React.FC<OwnProps> = (props) => {
  const {
    preSignedUrlEndpoint,
    s3BaseUrl,
    fileId,
    //fileType
  } = props;
  const url = new URL(fileId, s3BaseUrl);
  const initialFiles = [{
    source: `${url.protocol}//${url.host}${url.pathname}`,
    options: {
      type: "local"
    }
  }];

  return (
  <S3FilePond imageCropAspectRatio={0} presignedUrlEndpoint={preSignedUrlEndpoint} initialFiles={initialFiles}/>
  );
}

export default FilepondField;
