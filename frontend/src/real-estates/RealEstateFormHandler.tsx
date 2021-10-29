import {FormModalData} from "components/FormModal";
import {useHttp} from "hooks/http";
import React from "react";
import {deriveGeocodeByAddress, toastError, toastSuccess} from "shared/shared.functions";
import {ApiFurnishing, ApiRealEstateListing, ApiUpsertRealEstateListing,} from "../../../shared/types/real-estate";
import {RealEstateActions, RealEstateContext} from "../context/RealEstateContext";
import RealEstateForm from "./RealEstateForm";
import {useHistory} from "react-router-dom";

const mapFormToApiUpsertRealEstateListing = async (
    values: any
): Promise<ApiUpsertRealEstateListing> => {
    const availableFurnishing = Object.keys(ApiFurnishing);
    const furnishing = Object.entries(values)
        .filter(([k, v]) => Boolean(v))
        .filter(([k, v]) => availableFurnishing.includes(k))
        .map(([k, v]) => k) as ApiFurnishing[];

    const {lat, lng} = await deriveGeocodeByAddress(values.address);
    return {
        name: values.name,
        address: values.address,
        coordinates: {
            lat,
            lng,
        },
        costStructure: {
            price: {
                amount: values.price,
                currency: "€",
            },
            type: values.type,
        },
        characteristics: {
            numberOfRooms: values.numberOfRooms,
            propertySizeInSquareMeters: values.propertySizeInSquareMeters,
            realEstateSizeInSquareMeters: values.realEstateSizeInSquareMeters,
            energyEfficiency: values.energyEfficiency,
            furnishing,
        },
    };
};

export interface RealEstateFormHandlerProps extends FormModalData {
    realEstate: Partial<ApiRealEstateListing>;
}

export const RealEstateFormHandler: React.FunctionComponent<RealEstateFormHandlerProps> =
    ({
         formId,
         beforeSubmit = () => {
         },
         postSubmit = () => {
         },
         realEstate,
     }) => {
        const history = useHistory();
        const {post, put} = useHttp();
        const {realEstateDispatch} = React.useContext(RealEstateContext);

        const onSubmit = async (values: any) => {
            const mappedRealEstateListing: ApiUpsertRealEstateListing =
                await mapFormToApiUpsertRealEstateListing(values);

            try {
                let response = null;
                beforeSubmit();
                if (realEstate.id) {
                    response = await put(
                        `/api/real-estate-listings/${realEstate.id}`,
                        mappedRealEstateListing
                    );
                } else {
                    response = await post(
                        "/api/real-estate-listings",
                        mappedRealEstateListing
                    );
                }
                const newRealEstate = response.data as ApiRealEstateListing;
                realEstateDispatch({
                    type: RealEstateActions.PUT_REAL_ESTATE,
                    payload: newRealEstate,
                });
                postSubmit(true);
                toastSuccess("Objekt erfolgreich gespeichert!");
                history.push(`/real-estates?id=${newRealEstate.id}`);
            } catch (err) {
                toastError("Fehler beim Speichern des Objektes");
                console.log(err);
                postSubmit(false);
            }
        };

        return (
            <RealEstateForm
                formId={formId!}
                onSubmit={onSubmit}
                realEstate={realEstate}
            />
        );
    };

export default RealEstateForm;
