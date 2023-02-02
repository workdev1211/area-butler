import { FunctionComponent, useEffect } from "react";
import { useFormikContext } from "formik";

interface IFormikValuesChangeListenerProps {
  onValuesChange: (values: any) => void;
}

const FormikValuesChangeListener: FunctionComponent<
  IFormikValuesChangeListenerProps
> = ({ onValuesChange }) => {
  const { values } = useFormikContext();

  useEffect(() => {
    if (values) {
      onValuesChange(values);
    }
  }, [onValuesChange, values]);

  return null;
};

export default FormikValuesChangeListener;
