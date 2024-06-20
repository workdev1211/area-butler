import { FunctionComponent, useContext, useState } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import { UserActionTypes, UserContext } from "context/UserContext";
import { toastError } from "shared/shared.functions";
import { ApiTourNamesEnum, ApiUser } from "../../../shared/types/types";
import { IApiIntegrationUser } from "../../../shared/types/integration-user";
import { useTools } from "../hooks/tools";

interface IStartTourModalProps {
  tour: ApiTourNamesEnum;
  closeModal: () => void;
  onShowTour: () => void;
}

const StartTourModal: FunctionComponent<IStartTourModalProps> = ({
  tour,
  closeModal,
  onShowTour,
}) => {
  const {
    userState: { integrationUser },
    userDispatch,
  } = useContext(UserContext);
  const { t } = useTranslation();

  const isIntegrationUser = !!integrationUser;
  const { hideTour, hideTours } = useTools();

  const [showNoMoreTips, setShowNoMoreTips] = useState(false);

  const doNotShowTourAgain = async (tour: ApiTourNamesEnum) => {
    try {
      const user = showNoMoreTips ? await hideTours() : await hideTour(tour);

      if (isIntegrationUser) {
        userDispatch({
          type: UserActionTypes.SET_INTEGRATION_USER,
          payload: user as IApiIntegrationUser,
        });
      } else {
        userDispatch({
          type: UserActionTypes.SET_USER,
          payload: user as ApiUser,
        });
      }

      closeModal();
    } catch (err) {
      console.error(err);
      toastError(t(IntlKeys.tour.tourEndingError));
    }
  };

  return (
    <div id="my-modal" className="modal modal-open z-2000">
      <div className="modal-box max-h-screen overflow-y-auto">
        <h1 className="text-xl mb-5">{t(IntlKeys.tour.mayWeHelp)}</h1>
        {t(IntlKeys.tour.tourDescription[tour])}
        <label className="cursor-pointer flex items-center mt-5">
          <input
            type="checkbox"
            checked={showNoMoreTips}
            className="checkbox checkbox-primary checkbox-sm"
            onChange={(event) => {
              setShowNoMoreTips(event.target.checked);
            }}
          />
          <span className="text-sm font-bold ml-5">
            {t(IntlKeys.tour.doNotShowAnyMore)}
          </span>
        </label>
        <div className="modal-action">
          <button
            type="button"
            onClick={async () => {
              await doNotShowTourAgain(tour);
            }}
            className="btn btn-sm"
          >
            {t(IntlKeys.tour.noInterest)}
          </button>
          <button
            onClick={async () => {
              await doNotShowTourAgain(tour);
              onShowTour();
              closeModal();
            }}
            className="btn btn-primary btn-sm"
          >
            {t(IntlKeys.tour.startIntroduction)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartTourModal;
