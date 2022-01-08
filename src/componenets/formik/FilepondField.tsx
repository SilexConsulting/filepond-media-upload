import React from 'react';
import S3FilePond from "../media/S3FilePond";
import { useFormikContext } from 'formik';

interface OwnProps {
  preSignedUrlEndpoint: string,
  s3BaseUrl: string,
  field: FormikField,
  form: FormikForm,
}
const FilepondField: React.FC<OwnProps> = (props) => {
  const {
    preSignedUrlEndpoint,
    s3BaseUrl,
    field,
    form,
  } = props;
  const url = new URL(field.value.fileId, s3BaseUrl);
  const initialFiles = [{
    source: `${url.protocol}//${url.host}${url.pathname}`,
    options: {
      type: "local"
    }
  }];

  const handleFileChanged = (fileId) => {
    console.log('File change event fired');
    const e = new Event('change');
    e.target = {value: fileId}
    field.onChange(e)
    console.log(e);
  }

  return (
  <S3FilePond imageCropAspectRatio={0} presignedUrlEndpoint={preSignedUrlEndpoint} initialFiles={initialFiles} onChange={handleFileChanged}/>
  );
}

export default FilepondField;
