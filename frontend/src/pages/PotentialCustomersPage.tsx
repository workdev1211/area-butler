import React, { useContext, useEffect, useState } from "react";
import DefaultLayout from "../layout/defaultLayout";
import { useHttp } from "../hooks/http";
import {
  PotentialCustomerActions,
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
import { Link, useHistory, useLocation } from "react-router-dom";
import FormModal from "../components/FormModal";
import { PotentialCustomerFormDeleteHandler } from "../potential-customer/PotentialCustomerDeleteHandler";
import QuestionnaireRequestFormHandler from "../potential-customer/QuestionnaireRequestFormHandler";
import { UserActions, UserContext } from "context/UserContext";
import { osmEntityTypes } from "../../../shared/constants/constants";
import { SearchContext, SearchContextActions } from "context/SearchContext";
import { ApiUser } from "../../../shared/types/types";

const deleteCustomerModalConfig = {
  modalTitle: "Interessent löschen",
  submitButtonTitle: "Löschen",
};

const createCustomerQuestionnaireModalConfig = {
  modalTitle: "Fragebogen versenden",
  submitButtonTitle: "Senden",
};

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
      Mit dem automatisch versendeten Fragebogen erfasst Ihr Area Butler die
      Mobilitätspräferenz und die persönlichen Kriterien Ihrer Interessenten.
      Sie müssen diese so nicht mehr manuell eingeben. Ein noch persönlicheres
      Betreuungserlebnis für ihre Interessenten.
    </p>
  </div>
);

const PotentialCustomersPage: React.FunctionComponent = () => {
  const { get } = useHttp();
  const history = useHistory();
  const queryParams = new URLSearchParams(useLocation().search);
  const customerHighlightId = queryParams.get('id');
  const { potentialCustomerState, potentialCustomerDispatch } = useContext(
    PotentialCustomerContext
  );

  const { searchContextDispatch } = useContext(SearchContext);

  const [questionnaireModalOpen, setQuestionnaireModalOpen] = useState(false);
  const { userState, userDispatch } = useContext(UserContext);
  const user: ApiUser = userState.user;
  const canSendCustomerRequest =
    user.subscriptionPlan?.config.appFeatures.sendCustomerQuestionnaireRequest;

  const startSearchFromCustomer = (customer: ApiPotentialCustomer) => {
    const localityParams = osmEntityTypes.filter((entity) =>
      customer.preferredAmenities.includes(entity.name)
    );
    searchContextDispatch({
      type: SearchContextActions.SET_LOCALITY_PARAMS,
      payload: localityParams,
    });
    searchContextDispatch({
      type: SearchContextActions.SET_TRANSPORTATION_PARAMS,
      payload: customer.routingProfiles,
    });
    searchContextDispatch({
      type: SearchContextActions.SET_PREFERRED_LOCATIONS,
      payload: customer.preferredLocations,
    });
    history.push("/");
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      const response = await get<ApiPotentialCustomer[]>(
        "/api/potential-customers"
      );
      potentialCustomerDispatch({
        type: PotentialCustomerActions.SET_POTENTIAL_CUSTOMERS,
        payload: response.data,
      });
    };
    fetchCustomers();
  }, [true]); // eslint-disable-line react-hooks/exhaustive-deps

  const ActionsTop: React.FunctionComponent = () => {
    return (
      <>
        <li>
          <Link to="/potential-customers/new" className="btn btn-link">
            <img src={plusIcon} alt="pdf-icon" /> Interessent anlegen
          </Link>
        </li>
        <li>
          <button
            type="button"
            className="btn btn-link"
            onClick={() =>
              canSendCustomerRequest
                ? setQuestionnaireModalOpen(true)
                : userDispatch({
                    type: UserActions.SET_SUBSCRIPTION_MODAL_PROPS,
                    payload: {
                      open: true,
                      message: subscriptionUpgradeSendCustomerRequestMessage,
                    },
                  })
            }
          >
            <img src={plusIcon} alt="pdf-icon" /> Fragebogen versenden
          </button>
        </li>
      </>
    );
  };

  const questionnaireModalConfig = {
    ...createCustomerQuestionnaireModalConfig,
    modalOpen: questionnaireModalOpen,
    postSubmit: () => setQuestionnaireModalOpen(false),
  };

  return (
    <DefaultLayout
      title="Meine Interessenten"
      withHorizontalPadding={false}
      actionTop={<ActionsTop />}
    >
      <FormModal modalConfig={questionnaireModalConfig}>
        <QuestionnaireRequestFormHandler
          postSubmit={() => setQuestionnaireModalOpen(false)}
        />
      </FormModal>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Wichtige Adressen</th>
              <th>Wohnvorstellung</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {potentialCustomerState.customers.map(
              (customer: ApiPotentialCustomer) => (
                <tr key={customer.id} className={customer.id === customerHighlightId ? 'active': ''}>
                  <th>{customer.name}</th>
                  <td>
                    <a
                      href={`mailto:${customer.email}`}
                      className="link-primary"
                    >
                      {customer.email}
                    </a>
                  </td>
                  <td style={{ width: "25%", whiteSpace: "pre-wrap" }}>
                    {Array.isArray(customer.preferredLocations) &&
                    customer.preferredLocations.length
                      ? customer.preferredLocations
                          .map((location) => location.title || "")
                          .join(", ")
                      : "-"}
                  </td>
                  <td>
                    {!!customer?.realEstateCostStructure?.type &&
                    !!customer?.realEstateCostStructure.price
                      ? `${customer?.realEstateCostStructure.price.amount} € (${
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
                          customer?.realEstateCharacteristics?.furnishing.includes(
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
                        onClick={() => startSearchFromCustomer(customer)}
                      />
                      <img
                        src={editIcon}
                        alt="icon-edit"
                        className="cursor-pointer"
                        onClick={() =>
                          history.push(`/potential-customers/${customer.id}`)
                        }
                      />
                      <FormModal
                        modalConfig={{
                          ...deleteCustomerModalConfig,
                          modalButton: (
                            <img
                              src={deleteIcon}
                              alt="icon-delete"
                              className="cursor-pointer"
                            />
                          ),
                        }}
                      >
                        <PotentialCustomerFormDeleteHandler
                          potentialCustomer={customer}
                        />
                      </FormModal>
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
