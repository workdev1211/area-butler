import React, {useContext, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {v4 as uuid} from 'uuid';
import DefaultLayout from "../layout/defaultLayout";
import {useHttp} from "../hooks/http";
import BackButton from "../layout/BackButton";
import {ApiRealEstateListing} from "../../../shared/types/real-estate";
import {RealEstateActions, RealEstateContext} from "../context/RealEstateContext";
import {RealEstateFormHandler} from "../real-estates/RealEstateFormHandler";

export interface RealEstatePageRouterProps {
    realEstateId: string;
}

const newRealEstate: Partial<ApiRealEstateListing> = {
    name: 'Neues Objekt',

}

const RealEstatePage: React.FunctionComponent = () => {
    const {realEstateId} = useParams<RealEstatePageRouterProps>();
    const isNewRealEstate = realEstateId === 'new';
    const [realEstate, setRealEstate] = useState<Partial<ApiRealEstateListing>>(newRealEstate);
    const [busy, setBusy] = useState(false);

    const {get} = useHttp();
    const {realEstateState, realEstateDispatch} = useContext(RealEstateContext);

    useEffect(() => {
        const fetchRealEstates = async () => {
            const response = await get<ApiRealEstateListing[]>("/api/real-estate-listings")
            realEstateDispatch({
                type: RealEstateActions.SET_REAL_ESTATES,
                payload: response.data
            })
        };
        fetchRealEstates();
    }, [true]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!isNewRealEstate) {
            setRealEstate(realEstateState.listings.find((e: ApiRealEstateListing) => e.id === realEstateId) ?? newRealEstate);
        } else {
            setRealEstate(newRealEstate);
        }
    }, [realEstateState.listings, isNewRealEstate, realEstateId, setRealEstate]);

    const formId = `form-${uuid()}`;
    const beforeSubmit = () => setBusy(true);
    const postSubmit = (success: boolean) => {
        setBusy(false);
    }

    const baseClasses = 'btn bg-primary-gradient w-full sm:w-auto';

    const SubmitButton: React.FunctionComponent = () => {
        const classes = baseClasses + ' ml-auto';
        return (
            <button form={formId} key="submit" type="submit" disabled={busy}
                    className={busy ? 'busy ' + classes : classes}>{ realEstate.id ? 'Speichern' : 'Anlegen' }</button>
        )
    }

    return (
        <DefaultLayout title={realEstate.name || 'Unbekanntes Objekt'} withHorizontalPadding={true}
                       actionBottom={[<BackButton to="/real-estates" key="real-estates-back"/>, <SubmitButton key="real-estates-submit" />]}>
            <div className="py-20">
                <RealEstateFormHandler realEstate={realEstate} formId={formId} beforeSubmit={beforeSubmit} postSubmit={postSubmit}/>
            </div>
        </DefaultLayout>
    );
};

export default RealEstatePage;

