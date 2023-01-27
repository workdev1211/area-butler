import { useField } from "formik";

const Select = ({ label, ...props }: any) => {
  const [field, meta] = useField(props);

  return (
    <div>
      <label htmlFor={props.id || props.name} className="label">
        <span className="label-text">{label}</span>
      </label>
      <select
        {...field}
        {...props}
        className="select select-bordered w-full max-w-xs"
      />
      {meta.touched && meta.error ? (
        <label className="label">
          <span className="error">{meta.error}</span>
        </label>
      ) : null}
    </div>
  );
};

export default Select;
