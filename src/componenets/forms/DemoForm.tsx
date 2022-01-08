import React from 'react';
import {withFormik, FormikValues, Field} from "formik";

interface OwnProps {
}

const InnerForm: React.FC<OwnProps> = (props) => {
  const {
    values,
    errors,
    touched,
    handleSubmit,
    setFieldValue,
    setTouched,
    handleBlur,
    handleChange,
    isSubmitting,
  } = props;

  return (
      <form onSubmit={handleSubmit}>
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
