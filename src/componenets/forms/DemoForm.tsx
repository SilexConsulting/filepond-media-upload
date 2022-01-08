import React from 'react';
import {withFormik, FormikValues, Field} from "formik";
import FilepondField from "../formik/FilepondField";

interface OwnProps {
}

const InnerForm: React.FC<OwnProps> = (props) => {
  const PRE_SIGNED_URL_ENDPOINT = '/api/media/getUrlForFileUpload';
  const S3_BASE_URL = 'https://s3-media-upload-globalimpact-world.s3-accelerate.amazonaws.com';
  const fileId = 'uat/39f87176-9391-40d3-bfbd-4c72d0541c27';
  const fileType = 'image/jpeg';
  const {
    handleSubmit,
    // values,
    // errors,
    // touched,
    // setFieldValue,
    // setTouched,
    // handleBlur,
    // handleChange,
    // isSubmitting,
  } = props;

  return (
      <form onSubmit={handleSubmit}>
        <FilepondField s3BaseUrl={S3_BASE_URL} fileId={fileId} fileType={fileType} preSignedUrlEndpoint={PRE_SIGNED_URL_ENDPOINT}/>
        <Field type="email" name="email" placeholder="Email" />
        <Field type={"text"} name={"description"} placeholder={"Description"} />
        <input name={'Submit'} type={'submit'}/>

      </form>
  );
}

const DemoForm = withFormik<OwnProps, FormikValues> ({
  mapPropsToValues: () => ({
    description: ''
  }),
  handleSubmit: (values, action) => {
    console.log(values);
  }
})(InnerForm);

 export default DemoForm;
