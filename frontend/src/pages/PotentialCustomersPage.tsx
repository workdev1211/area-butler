import { FC, useContext, useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import DefaultLayout from "../layout/defaultLayout";
import {
  PotentialCustomerActionTypes,
  PotentialCustomerContext,
} from "../context/PotentialCustomerContext";
import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";
import {
  allFurnishing,
  allRealEstateCostTypes,
} from "../../../shared/constants/real-estate";
import plusIcon from "../assets/icons/icons-16-x-16-outline-ic-plus.svg";
import editIcon from "../assets/icons/icons-16-x-16-outline-ic-edit.svg";
import deleteIcon from "../assets/icons/icons-16-x-16-outline-ic-delete.svg";
import searchIcon from "../assets/icons/icons-16-x-16-outline-ic-search.svg";
import FormModal from "../components/FormModal";
import QuestionnaireRequestFormHandler from "../potential-customer/QuestionnaireRequestFormHandler";
import { UserActionTypes, UserContext } from "context/UserContext";
import { SearchContext, SearchContextActionTypes } from "context/SearchContext";
import { ApiTourNamesEnum } from "../../../shared/types/types";
import TourStarter from "tour/TourStarter";
import { getRealEstateCost } from "../shared/real-estate.functions";
import { IPotentialCustomersHistoryState } from "../shared/shared.types";
import { usePotentialCustomerData } from "../hooks/potentialcustomerdata";
import PotentialCustomerFormDeleteHandler from "../potential-customer/PotentialCustomerFormDeleteHandler";
import { osmEntityTypes } from "../../../shared/constants/osm-entity-types";

const subscriptionUpgradeSendCustomerRequestMessage = (
  <div>
    <p className="my-5">
      Der Versand eines Fragebogens ist in Ihrem aktuellen Abonnement nicht
      verfügbar.
    </p>
    <p className="my-5">
      Keine Zeit und Lust die Kriterien Ihrer Interessenten selbst einzugeben?
    </p>
    <p className="my-5">
      Mit dem automatisch versendeten Fragebogen erfasst Ihr AreaButler die
      Mobilitätspräferenz und die persönlichen Kriterien Ihrer Interessenten.
      Sie müssen diese so nicht mehr manuell eingeben. Ein noch persönlicheres
      Betreuungserlebnis für ihre Interessenten.
    </p>
  </div>
);

const PotentialCustomersPage: FC = () => {
  const { t } = useTranslation();
  const { potentialCustomerState, potentialCustomerDispatch } = useContext(
    PotentialCustomerContext
  );
  const { searchContextDispatch } = useContext(SearchContext);
  const { userState, userDispatch } = useContext(UserContext);

  const user = userState.user!;
  const integrationUser = userState.integrationUser!;
  const isIntegrationUser = !!integrationUser;

  const history = useHistory<IPotentialCustomersHistoryState>();
  const { fetchPotentialCustomers } = usePotentialCustomerData();

  const [questionnaireModalOpen, setQuestionnaireModalOpen] = useState(false);

  useEffect(() => {
    const getPotentialCustomers = async () => {
      const potentialCustomerData = await fetchPotentialCustomers();

      potentialCustomerDispatch({
        type: PotentialCustomerActionTypes.SET_POTENTIAL_CUSTOMERS,
        payload: potentialCustomerData,
      });
    };

    void getPotentialCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const queryParams = new URLSearchParams(useLocation().search);
  const customerHighlightId = queryParams.get("id");
  const subscriptionPlan = user?.subscription?.config;
  const canSendCustomerRequest =
    subscriptionPlan?.appFeatures.sendCustomerQuestionnaireRequest;

  const startSearchFromCustomer = ({
    preferredAmenities,
    routingProfiles,
    preferredLocations,
  }: ApiPotentialCustomer) => {
    const localityParams = osmEntityTypes.filter((entity) =>
      preferredAmenities?.includes(entity.name)
    );

    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCALITY_PARAMS,
      payload: localityParams,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_TRANSPORTATION_PARAMS,
      payload: routingProfiles || [],
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PREFERRED_LOCATIONS,
      payload: preferredLocations || [],
    });

    history.push("/search", { isFromPotentialCustomers: true });
  };

  const ActionsTop: FC = () => {
    return (
      <>
        <li>
          <Link to="/potential-customers/new" className="btn btn-link">
            <img src={plusIcon} alt="pdf-icon" />{" "}
            {t(IntlKeys.potentialCustomers.createTargetGroup)}
          </Link>
        </li>
        {!isIntegrationUser && (
          <li>
            <button
              type="button"
              className="btn btn-link"
              onClick={() =>
                canSendCustomerRequest
                  ? setQuestionnaireModalOpen(true)
                  : userDispatch({
                      type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
                      payload: {
                        open: true,
                        message: subscriptionUpgradeSendCustomerRequestMessage,
                      },
                    })
              }
            >
              <img src={plusIcon} alt="pdf-icon" />{" "}
              {t(IntlKeys.potentialCustomers.sendQuestionnaire)}
            </button>
          </li>
        )}
      </>
    );
  };

  const questionnaireModalConfig = {
    modalTitle: t(IntlKeys.potentialCustomers.customerCreateTitle),
    submitButtonTitle: t(IntlKeys.common.send),
    modalOpen: questionnaireModalOpen,
    postSubmit: () => setQuestionnaireModalOpen(false),
  };

  return (
    <DefaultLayout
      title={t(IntlKeys.nav.potentialCustomers)}
      withHorizontalPadding={false}
      actionsTop={<ActionsTop />}
    >
      <TourStarter tour={ApiTourNamesEnum.CUSTOMERS} />
      <FormModal modalConfig={questionnaireModalConfig}>
        <QuestionnaireRequestFormHandler
          postSubmit={() => setQuestionnaireModalOpen(false)}
        />
      </FormModal>
      <div className="overflow-x-auto" data-tour="customers-table">
        <table className="table w-full">
          <thead>
            <tr>
              <th>{t(IntlKeys.common.name)}</th>
              <th>{t(IntlKeys.potentialCustomers.importantAddresses)}</th>
              <th>{t(IntlKeys.potentialCustomers.livingConcept)}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {potentialCustomerState.customers.map(
              (customer: ApiPotentialCustomer, index: number) => (
                <tr
                  key={customer.id}
                  className={
                    customer.id === customerHighlightId ? "active" : ""
                  }
                >
                  <th>{customer.name}</th>
                  <td style={{ width: "25%", whiteSpace: "pre-wrap" }}>
                    {Array.isArray(customer.preferredLocations) &&
                    customer.preferredLocations.length
                      ? customer.preferredLocations
                          .map((location) => location.title || "")
                          .join(", ")
                      : "-"}
                  </td>
                  <td>
                    {customer?.realEstateCostStructure
                      ? `${getRealEstateCost(
                          customer.realEstateCostStructure
                        )} (${
                          allRealEstateCostTypes.find(
                            (t) =>
                              t.type === customer?.realEstateCostStructure?.type
                          )?.label
                        })`
                      : ""}
                    <br />
                    {customer?.realEstateCharacteristics?.furnishing &&
                      allFurnishing
                        .filter((f) =>
                          customer?.realEstateCharacteristics?.furnishing?.includes(
                            f.type
                          )
                        )
                        .map((f) => f.label)
                        .join(", ")}
                  </td>
                  <td>
                    <div className="flex gap-4">
                      <img
                        src={searchIcon}
                        alt="icon-search"
                        className="cursor-pointer"
                        onClick={() => {
                          startSearchFromCustomer(customer);
                        }}
                        data-tour={`customers-table-item-search-button-${index}`}
                      />
                      {!customer.isFromParent && (
                        <>
                          <img
                            src={editIcon}
                            alt="icon-edit"
                            className="cursor-pointer"
                            onClick={() => {
                              history.push(
                                `/potential-customers/${customer.id}`
                              );
                            }}
                            data-tour={`customers-table-item-edit-button-${index}`}
                          />
                          <FormModal
                            modalConfig={{
                              modalTitle: t(
                                IntlKeys.potentialCustomers.customerDeleteTitle
                              ),
                              submitButtonTitle: t(IntlKeys.common.delete),
                              modalButton: (
                                <img
                                  src={deleteIcon}
                                  alt="icon-delete"
                                  className="cursor-pointer"
                                  data-tour={`customers-table-item-delete-button-${index}`}
                                />
                              ),
                            }}
                          >
                            <PotentialCustomerFormDeleteHandler
                              potentialCustomer={customer}
                            />
                          </FormModal>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </DefaultLayout>
  );
};

export default PotentialCustomersPage;
