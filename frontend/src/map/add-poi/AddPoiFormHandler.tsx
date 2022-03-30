import { FormModalData } from "components/FormModal";
import { Poi } from "context/SearchContext";
import React from "react";
import {
  distanceInMeters,
  toastError,
  toastSuccess
} from "shared/shared.functions";
import { v4 as uuid } from "uuid";
import { osmEntityTypes } from "../../../../shared/constants/constants";
import { ApiCoordinates } from "../../../../shared/types/types";
import AddPoiForm from "./AddPoiForm";

export interface AddPoiFormHandlerProps extends FormModalData {
  centerCoordinates: ApiCoordinates;
  coordinates?: ApiCoordinates;
  address?: string;
  onPoiAdd: (poi: Poi) => void;
}

const AddPoiFormHandler: React.FunctionComponent<AddPoiFormHandlerProps> = ({
  formId,
  beforeSubmit = () => {},
  postSubmit = () => {},
  centerCoordinates,
  coordinates,
  address,
  onPoiAdd
}) => {
  const onSubmit = async (values: any) => {
    try {
      beforeSubmit();

      const coordinates = values.coordinates;
      const distanceInMeter = distanceInMeters(centerCoordinates, coordinates);

      const entityType = osmEntityTypes.find(e => e.name === values.type)!;
      const poi = {
        address: { street: values.address.label },
        coordinates: values.coordinates,
        distanceInMeters: distanceInMeter,
        entity: {
          id: uuid(),
          name: values.name,
          label: entityType.label,
          type: entityType.name,
          category: entityType.category
        }
      };
      onPoiAdd(poi);
      postSubmit(true);
      toastSuccess("Objekt erfolgreich hinzugefügt!");
    } catch (err) {
      toastError("Fehler beim Speichern des Objektes");
      console.log(err);
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
