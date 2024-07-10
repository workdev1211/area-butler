import { FC } from "react";
import { v4 as uuid } from "uuid";

import { FormModalData } from "components/FormModal";
import {
  distanceInMeters,
  toastError,
  toastSuccess,
} from "shared/shared.functions";
import {
  ApiCoordinates,
  ApiOsmLocation,
} from "../../../../../shared/types/types";
import AddPoiForm from "./AddPoiForm";
import { osmEntityTypes } from "../../../../../shared/constants/constants";

interface IAddPoiFormHandlerProps extends FormModalData {
  centerCoordinates: ApiCoordinates;
  coordinates?: ApiCoordinates;
  address?: string;
  onPoiAdd: (poi: ApiOsmLocation) => void;
}

const AddPoiFormHandler: FC<IAddPoiFormHandlerProps> = ({
  formId,
  beforeSubmit = () => {},
  postSubmit = () => {},
  centerCoordinates,
  coordinates,
  address,
  onPoiAdd,
}) => {
  const onSubmit = async (values: any) => {
    try {
      beforeSubmit();

      const coordinates = values.coordinates;
      const distanceInMeter = distanceInMeters(centerCoordinates, coordinates);
      const osmEntity = osmEntityTypes.find((e) => e.name === values.name)!;

      const osmLocation: ApiOsmLocation = {
        address: { street: values.address.label },
        coordinates: values.coordinates,
        distanceInMeters: distanceInMeter,
        entity: {
          id: uuid(),
          title: values.title,
          name: values.name,
          type: osmEntity.type,
          label: osmEntity.label,
          category: osmEntity.category,
        },
      };

      onPoiAdd(osmLocation);
      postSubmit(true);
      toastSuccess("Objekt erfolgreich hinzugefügt!");
    } catch (err) {
      toastError("Fehler beim Speichern des Objektes");
      console.error(err);
      postSubmit(false);
    }
  };

  return (
    <AddPoiForm
      formId={formId!}
      onSubmit={onSubmit}
      coordinates={coordinates}
      address={address}
    />
  );
};

export default AddPoiFormHandler;
