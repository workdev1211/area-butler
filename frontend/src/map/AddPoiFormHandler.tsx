import { FormModalData } from "components/FormModal";
import { SearchContext, SearchContextActionTypes } from "context/SearchContext";
import { useContext } from "react";
import { distanceInMeters, toastError, toastSuccess } from "shared/shared.functions";
import { osmEntityTypes } from "../../../shared/constants/constants";
import { ApiCoordinates } from "../../../shared/types/types";
import AddPoiForm from "./AddPoiForm";
import {v4 as uuid} from 'uuid';

export interface AddPoiFormHandlerProps extends FormModalData {
  coordinates?: ApiCoordinates;
  address?: string;
}

const AddPoiFormHandler: React.FunctionComponent<AddPoiFormHandlerProps> = ({
  formId,
  beforeSubmit = () => {},
  postSubmit = () => {},
  coordinates,
  address,
}) => {

  const {searchContextState, searchContextDispatch} = useContext(SearchContext);

  const onSubmit = async (values: any) => {
    try {
      beforeSubmit();

      const coordinates = values.coordinates;
      const centerOfInterest = searchContextState.searchResponse?.centerOfInterest;
      const distanceInMeter = distanceInMeters(centerOfInterest?.coordinates!, coordinates);

      const entityType = osmEntityTypes.find(e => e.name === values.type)!;
      const poi = {
        address: {street: values.address.label},
        coordinates: values.coordinates,
        distanceInMeters: distanceInMeter,
        entity: {
          id: uuid(),
          name: values.name,
          label: entityType.label,
          type: entityType.name,
          category: entityType.category
        }
      }

      searchContextDispatch({type: SearchContextActionTypes.ADD_POI_TO_SEARCH_RESPONSE, payload: poi})
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
