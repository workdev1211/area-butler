import { FunctionComponent, useContext, useState } from "react";

import { UserActionTypes, UserContext } from "context/UserContext";
import { toastError } from "shared/shared.functions";
import { ApiTourNamesEnum, ApiUser } from "../../../shared/types/types";
import { useTour } from "../hooks/tour";
import { IApiIntegrationUser } from "../../../shared/types/integration-user";

const tourDescriptions: Record<ApiTourNamesEnum, string> = {
  [ApiTourNamesEnum.SEARCH]:
    "Möchten Sie eine kurze Einführung zur Umgebungsanalyse bekommen?",
  [ApiTourNamesEnum.RESULT]:
    "Möchten Sie eine kurze Einführung zur Ergebnisseite bekommen?",
  [ApiTourNamesEnum.CUSTOMERS]:
    "Möchten Sie eine kurze Einführung zur Interessentenseite bekommen?",
  [ApiTourNamesEnum.REAL_ESTATES]:
    "Möchten Sie eine kurze Einführung zur Objekteseite bekommen?",
  [ApiTourNamesEnum.PROFILE]:
    "Möchten Sie eine kurze Einführung zur Profilseite bekommen?",
  [ApiTourNamesEnum.EDITOR]:
    "Möchten Sie eine kurze Einführung zum Karten-Editor bekommen?",
  [ApiTourNamesEnum.INT_MAP]:
    "Möchten Sie eine kurze Einführung in die Kartenausschnittsseite?",
  [ApiTourNamesEnum.INT_SEARCH]:
    "Möchten Sie eine kurze Einführung zur Umgebungsanalyse bekommen?",
};

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

  const isIntegrationUser = !!integrationUser;
  const { hideTour, hideTours } = useTour();

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
      toastError("Fehler beim Beenden der Tour");
    }
  };

  return (
    <div id="my-modal" className="modal modal-open z-2000">
      <div className="modal-box max-h-screen overflow-y-auto">
        <h1 className="text-xl mb-5">Dürfen wir helfen?</h1>
        {tourDescriptions[tour]}
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
            Ich möchte keine weiteren Tipps angezeigt bekommen
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
            Kein Interesse
          </button>
          <button
            onClick={async () => {
              await doNotShowTourAgain(tour);
              onShowTour();
              closeModal();
            }}
            className="btn btn-primary btn-sm"
          >
            Einführung beginnen
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartTourModal;
