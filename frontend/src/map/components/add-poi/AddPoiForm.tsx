import { FC, useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import Input from "components/inputs/formik/Input";
import LocationAutocomplete from "components/LocationAutocomplete";
import Select from "components/inputs/formik/Select";
import { ApiCoordinates, OsmName } from "../../../../../shared/types/types";
import { osmEntityTypes } from "../../../../../shared/constants/osm-entity-types";

interface IAddPoiFormProps {
  formId: string;
  onSubmit: (values: any) => any;
  coordinates?: ApiCoordinates;
  address?: string;
}

const AddPoiForm: FC<IAddPoiFormProps> = ({
  formId,
  coordinates,
  address,
  onSubmit,
}) => {
  const { t } = useTranslation();

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
              {osmEntityTypes
                .sort((a, b) =>
                  t(
                    (
                      IntlKeys.snapshotEditor.pointsOfInterest as Record<
                        string,
                        string
                      >
                    )[a.name]
                  ).localeCompare(
                    t(
                      (
                        IntlKeys.snapshotEditor.pointsOfInterest as Record<
                          string,
                          string
                        >
                      )[b.name]
                    )
                  )
                )
                .map(({ name }) => (
                  <option value={name} key={name}>
                    {t(
                      (
                        IntlKeys.snapshotEditor.pointsOfInterest as Record<
                          string,
                          string
                        >
                      )[name]
                    )}
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
