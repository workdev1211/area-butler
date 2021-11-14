import { UserActions, UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import { useContext, useState } from "react";
import { toastError } from "shared/shared.functions";
import { ApiShowTour, ApiTour, ApiUser } from "../../../shared/types/types";

const tourDescriptions: Record<ApiTour, string> = {
  search: "Möchten Sie eine kurze Einführung zur Umgebungsanalyse bekommen?",
  result: "Möchten Sie eine kurze Einführung zur Ergebnisseite bekommen?",
  customers:
    "Möchten Sie eine kurze Einführung zur Interessentenseite bekommen?",
  realEstates: "Möchten Sie eine kurze Einführung zur Objekteseite bekommen?",
  profile: "Möchten Sie eine kurze Einführung zur Profilseite bekommen?",
};

export interface StartTourModalProps {
  tour: ApiTour;
  showTour: ApiShowTour;
  onShowTour: () => void;
}

const StartTourModal: React.FunctionComponent<StartTourModalProps> = ({
  tour,
  showTour,
  onShowTour = () => {},
}) => {
  const [showModal, setShowModal] = useState(showTour[tour]);
  const [showNoMoreTips, setShowNoMoreTips] = useState(false);
  const {userDispatch} = useContext(UserContext);

  const { post } = useHttp();

  const doNotShowTourAgain = (tour: ApiTour) => {
    const postDoNotShowTour = async (tour: ApiTour) => {
      try {
        let user = {};
        if (!showNoMoreTips) {
          user = (await post<ApiUser>(`/api/users/me/hide-tour/${tour}`, {}))
            .data;
        } else {
          user = (await post<ApiUser>(`/api/users/me/hide-tour`, {})).data;
        }
        userDispatch({ type: UserActions.SET_USER, payload: user });
        setShowModal(false);

      } catch (err) {
        console.log(err);
        toastError("Fehler beim Beenden der Tour");
      }
    };

    postDoNotShowTour(tour);
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
                onChange={(event) => setShowNoMoreTips(event.target.checked)}
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
