import { FunctionComponent, useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import Input from "components/Input";
import LocationAutocomplete from "components/LocationAutocomplete";
import Select from "components/Select";
import { ApiCoordinates, OsmName } from "../../../../shared/types/types";
import { getCombinedOsmEntityTypes } from "../../../../shared/functions/shared.functions";

export interface AddPoiFormProps {
  formId: string;
  onSubmit: (values: any) => any;
  coordinates?: ApiCoordinates;
  address?: string;
}

const AddPoiForm: FunctionComponent<AddPoiFormProps> = ({
  formId,
  coordinates,
  address,
  onSubmit,
}) => {
  const [localCoordinates, setLocalCoordinates] = useState(coordinates);
  const [localAddress, setLocalAddress] = useState(address);

  const onLocationAutocompleteChange = (payload: any) => {
    setLocalAddress(payload.value);
    setLocalCoordinates(payload.coordinates);
  };

  return (
    <Formik
      initialValues={{
        title: "",
        address: address,
        name: OsmName.doctors,
      }}
      validationSchema={Yup.object({
        title: Yup.string().required("Bitte geben Sie einen Objektnamen an"),
        name: Yup.string().required("Bitte geben Sie einen Objektnamen an"),
      })}
      enableReinitialize={true}
      onSubmit={(values) => {
        onSubmit({ coordinates: localCoordinates, ...values });
      }}
    >
      <Form id={formId}>
        <div className="form-control">
          <Input
            label="Objektname"
            name="title"
            type="text"
            placeholder="Objektname eingeben"
            className="input input-bordered w-full"
          />
        </div>
        <LocationAutocomplete
          value={localAddress}
          setValue={() => {}}
          afterChange={onLocationAutocompleteChange}
          menuZIndex={2000}
        />
        <div className="flex flex-wrap items-end gap-6">
          <div className="form-control flex-1">
            <Select
              label="Objekttyp"
              name="name"
              placeholder="Objekttype angeben"
            >
              {getCombinedOsmEntityTypes()
                .sort((e1, e2) => e1.label.localeCompare(e2.label))
                .map((entityType) => (
                  <option value={entityType.name} key={entityType.name}>
                    {entityType.label}
                  </option>
                ))}
            </Select>
          </div>
        </div>
      </Form>
    </Formik>
  );
};

export default AddPoiForm;
