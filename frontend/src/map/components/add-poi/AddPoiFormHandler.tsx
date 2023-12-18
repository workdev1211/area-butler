import { FunctionComponent } from "react";
import { v4 as uuid } from "uuid";

import { FormModalData } from "components/FormModal";
import {
  distanceInMeters,
  toastError,
  toastSuccess,
} from "shared/shared.functions";
import { ApiCoordinates, ApiOsmLocation } from "../../../../../shared/types/types";
import AddPoiForm from "./AddPoiForm";
import { getCombinedOsmEntityTypes } from "../../../../../shared/functions/shared.functions";

export interface AddPoiFormHandlerProps extends FormModalData {
  centerCoordinates: ApiCoordinates;
  coordinates?: ApiCoordinates;
  address?: string;
  onPoiAdd: (poi: ApiOsmLocation) => void;
}

const AddPoiFormHandler: FunctionComponent<AddPoiFormHandlerProps> = ({
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

      const entityType = getCombinedOsmEntityTypes().find(
        (e) => e.name === values.name
      )!;
      const poi: ApiOsmLocation = {
        address: { street: values.address.label },
        coordinates: values.coordinates,
        distanceInMeters: distanceInMeter,
        entity: {
          id: uuid(),
          title: values.title,
          name: values.name,
          type: entityType.type,
          label: entityType.label,
          category: entityType.category,
        },
      };

      onPoiAdd(poi);
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
