import { useField } from "formik";

export const Input = ({ label, ...props }: any) => {
  const [field, meta] = useField(props);
  return (
    <>
      <label htmlFor={props.id || props.name} className="label">
        <span className="label-text">{label}</span>
      </label>
      <input className="input input-bordered" {...field} {...props} />
      {meta.touched && meta.error ? (
        <label className="label">
          <span className="label-text-alt text-red-500">{meta.error}</span>
        </label>
      ) : null}
    </>
  );
};
