import React, {useContext, useEffect} from "react";
import DefaultLayout from "../layout/defaultLayout";
import {useHttp} from "../hooks/http";
import {allFurnishing, allRealEstateCostTypes} from "../../../shared/constants/real-estate";
import plusIcon from "../assets/icons/icons-16-x-16-outline-ic-plus.svg";
import editIcon from "../assets/icons/icons-16-x-16-outline-ic-edit.svg";
import deleteIcon from "../assets/icons/icons-16-x-16-outline-ic-delete.svg";
import {Link, useHistory} from "react-router-dom";
import FormModal from "../components/FormModal";
import {RealEstateActions, RealEstateContext} from "../context/RealEstateContext";
import {ApiRealEstateListing} from "../../../shared/types/real-estate";
import {RealEstateDeleteHandler} from "../real-estates/RealEstateDeleteHandler";
import { UserActions, UserContext } from "context/UserContext";

const deleteRealEstateModalConfig = {
    modalTitle: "Objekt löschen",
    submitButtonTitle: "Löschen",
};

const noFurtherRealEstatesUpgradeSubscriptionMessage = 'In Ihrem aktuellen Abonnement können Sie keine weiteren Objekte anlegen.'

const RealEstatesPage: React.FunctionComponent = () => {
    const {get} = useHttp();
    const history = useHistory();
    const {realEstateState, realEstateDispatch} = useContext(RealEstateContext);

    const {userState, userDispatch} = useContext(UserContext);

    const realEstates = realEstateState.listings || [];
    const subscriptionPlan = userState.user.subscriptionPlan;
    const canCreateNewRealEstate = !subscriptionPlan.limits.numberOfRealEstates || realEstateState.listings.length < subscriptionPlan.limits.numberOfRealEstates;

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

    const ActionsTop: React.FunctionComponent = () => {
      return (
        <>
          <li>
            {canCreateNewRealEstate ? (
              <Link to="/real-estates/new" className="btn btn-link">
                <img src={plusIcon} alt="pdf-icon" /> Objekt anlegen
              </Link>
            ) : (
              <button className="btn btn-link"
                onClick={() => userDispatch({type: UserActions.SET_SUBSCRIPTION_MODAL_PROPS, payload: {open: true, message: noFurtherRealEstatesUpgradeSubscriptionMessage}})}
              
              >
                <img src={plusIcon} alt="pdf-icon" /> Objekt anlegen
              </button>
            )}
          </li>
        </>
      );
    };

    return (
        <DefaultLayout title="Meine Objekte" withHorizontalPadding={false} actionTop={<ActionsTop/>}>
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Addresse</th>
                        <th>Kosten</th>
                        <th>Ausstattung</th>
                        <th/>
                    </tr>
                    </thead>
                    <tbody>
                    {realEstates.map((realEstate: ApiRealEstateListing) => (
                        <tr key={realEstate.id}>
                            <th>{realEstate.name}</th>
                            <td>{realEstate.address}</td>
                            <td>
                                {!!realEstate?.costStructure?.type &&
                                !!realEstate?.costStructure?.price
                                    ? `${realEstate.costStructure.price.amount} € (${
                                        allRealEstateCostTypes.find(
                                            (t) => t.type === realEstate.costStructure?.type
                                        )?.label
                                    })`
                                    : ""}
                            </td>
                            <td>
                                {realEstate.characteristics?.furnishing &&
                                allFurnishing
                                    .filter((f) =>
                                        realEstate.characteristics?.furnishing.includes(f.type)
                                    )
                                    .map((f) => f.label)
                                    .join(", ")}
                            </td>
                            <td>
                                <div className="flex gap-4">
                                    <img src={editIcon} alt="icon-edit" className="cursor-pointer"
                                         onClick={() => history.push(`/real-estates/${realEstate.id}`)}/>
                                    <FormModal modalConfig={{
                                        ...deleteRealEstateModalConfig,
                                        modalButton: <img src={deleteIcon} alt="icon-delete"
                                                          className="cursor-pointer"/>
                                    }}>
                                        <RealEstateDeleteHandler realEstate={realEstate}/>
                                    </FormModal>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </DefaultLayout>
    );
};

export default RealEstatesPage;

