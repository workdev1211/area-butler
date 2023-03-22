import { FunctionComponent, useContext, useState } from "react";

import { UserActionTypes, UserContext } from "context/UserContext";
import { toastError } from "shared/shared.functions";
import {
  ApiShowTour,
  ApiTourNameEnum,
  ApiUser,
} from "../../../shared/types/types";
import { useTour } from "../hooks/tour";

const tourDescriptions: Record<ApiTourNameEnum, string> = {
  [ApiTourNameEnum.SEARCH]:
    "Möchten Sie eine kurze Einführung zur Umgebungsanalyse bekommen?",
  [ApiTourNameEnum.RESULT]:
    "Möchten Sie eine kurze Einführung zur Ergebnisseite bekommen?",
  [ApiTourNameEnum.CUSTOMERS]:
    "Möchten Sie eine kurze Einführung zur Interessentenseite bekommen?",
  [ApiTourNameEnum.REAL_ESTATES]:
    "Möchten Sie eine kurze Einführung zur Objekteseite bekommen?",
  [ApiTourNameEnum.PROFILE]:
    "Möchten Sie eine kurze Einführung zur Profilseite bekommen?",
  [ApiTourNameEnum.EDITOR]:
    "Möchten Sie eine kurze Einführung zum Karten-Editor bekommen?",
};

interface IStartTourModalProps {
  tour: ApiTourNameEnum;
  showTour: ApiShowTour;
  onShowTour: () => void;
}

const StartTourModal: FunctionComponent<IStartTourModalProps> = ({
  tour,
  showTour,
  onShowTour = () => {},
}) => {
  const {
    userState: { integrationUser },
    userDispatch,
  } = useContext(UserContext);

  const { hideTour, hideTours } = useTour(!!integrationUser);

  const [showModal, setShowModal] = useState(showTour[tour]);
  const [showNoMoreTips, setShowNoMoreTips] = useState(false);

  const doNotShowTourAgain = (tour: ApiTourNameEnum) => {
    const postDoNotShowTour = async (tour: ApiTourNameEnum) => {
      try {
        const user = !showNoMoreTips ? await hideTour(tour) : await hideTours();
        console.log("StartTourModal", 1, user);

        if ("integrationUserId" in user) {
          userDispatch({
            type: UserActionTypes.SET_INTEGRATION_USER,
            payload: user,
          });
        } else {
          userDispatch({
            type: UserActionTypes.SET_USER,
            payload: user as ApiUser,
          });
        }

        setShowModal(false);
      } catch (err) {
        console.log(err);
        toastError("Fehler beim Beenden der Tour");
      }
    };

    void postDoNotShowTour(tour);
  };

  return (
    <>
      {showModal && (
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
                onClick={() => {
                  doNotShowTourAgain(tour);
                }}
                className="btn btn-sm"
              >
                Kein Interesse
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  doNotShowTourAgain(tour);
                  onShowTour();
                }}
                className="btn btn-primary btn-sm"
              >
                Einführung beginnen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StartTourModal;
