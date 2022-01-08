import React, {useState} from 'react';
import S3FilePond from "../media/S3FilePond";

interface OwnProps {

}
const FilepondField: React.FC<OwnProps> = (props) => {
  const API_ENDPOINT = '/api/media/getUrlForFileUpload';
  const url = `https://s3-media-upload-globalimpact-world.s3-accelerate.amazonaws.com/uat/39f87176-9391-40d3-bfbd-4c72d0541c27`
  const initialFiles = [{
    source: url,
    options: {
      type: "local"
    }
  }];

  return (
  <S3FilePond imageCropAspectRatio={0} presignedUrlEndpoint={API_ENDPOINT} initialFiles={initialFiles}/>
  );
}

export default FilepondField;
