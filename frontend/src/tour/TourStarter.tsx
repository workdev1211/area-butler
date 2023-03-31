import { FunctionComponent, useContext, useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step, Styles } from "react-joyride";

import { UserActionTypes, UserContext } from "context/UserContext";
import { ApiShowTour, ApiTourNamesEnum } from "../../../shared/types/types";
import StartTourModal from "./StartTourModal";

import RealEstatesSteps from "./RealEstatesPageSteps";
import CustomersSteps from "./CustomersPageSteps";
import SearchResulSteps from "./SearchResultPageSteps";
import SearchSteps from "./SearchPageSteps";
import ProfileSteps from "./ProfilePageSteps";
import SnippetEditorSteps from "./SnippetEditorPageSteps";
import IntMapPageSteps from "./IntMapPageSteps";
import IntSearchPageSteps from "./IntSearchPageSteps";

interface ITourStarterProps {
  tour: ApiTourNamesEnum;
}

export const defaultStyles: Styles = {
  options: {
    zIndex: 10000,
    primaryColor: "#c91444",
  },
  spotlight: {
    backgroundColor: "white",
  },
  overlay: {
    mixBlendMode: "darken",
  },
};

const fallbackShowTour: ApiShowTour = {
  [ApiTourNamesEnum.SEARCH]: false,
  [ApiTourNamesEnum.RESULT]: false,
  [ApiTourNamesEnum.REAL_ESTATES]: false,
  [ApiTourNamesEnum.CUSTOMERS]: false,
  [ApiTourNamesEnum.PROFILE]: false,
  [ApiTourNamesEnum.EDITOR]: false,
  [ApiTourNamesEnum.INT_MAP]: false,
  [ApiTourNamesEnum.INT_SEARCH]: false,
};

const tourSteps: Record<ApiTourNamesEnum, Step[]> = {
  [ApiTourNamesEnum.SEARCH]: SearchSteps,
  [ApiTourNamesEnum.RESULT]: SearchResulSteps,
  [ApiTourNamesEnum.REAL_ESTATES]: RealEstatesSteps,
  [ApiTourNamesEnum.CUSTOMERS]: CustomersSteps,
  [ApiTourNamesEnum.PROFILE]: ProfileSteps,
  [ApiTourNamesEnum.EDITOR]: SnippetEditorSteps,
  [ApiTourNamesEnum.INT_MAP]: IntMapPageSteps,
  [ApiTourNamesEnum.INT_SEARCH]: IntSearchPageSteps,
};

const TourStarter: FunctionComponent<ITourStarterProps> = ({ tour }) => {
  const {
    userState: { startTour, user, integrationUser },
    userDispatch,
  } = useContext(UserContext);

  const showTour =
    user?.showTour || integrationUser?.config.showTour || fallbackShowTour;
  const isTourToBePlayed = showTour[tour];

  const [isRunTour, setIsRunTour] = useState(false);
  const [isShownModal, setIsShownModal] = useState(isTourToBePlayed);

  useEffect(() => {
    if (!startTour) {
      return;
    }

    setIsRunTour(true);

    userDispatch({
      type: UserActionTypes.SET_START_TOUR,
      payload: false,
    });
  }, [userDispatch, startTour]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setIsRunTour(false);
    }
  };

  if (!isRunTour && !isShownModal) {
    return null;
  }

  return (
    <div>
      {isShownModal && (
        <StartTourModal
          tour={tour}
          closeModal={() => {
            setIsShownModal(false);
          }}
          onShowTour={() => {
            setIsRunTour(true);
          }}
        />
      )}
      <Joyride
        callback={handleJoyrideCallback}
        continuous={true}
        run={isRunTour}
        scrollToFirstStep={true}
        showProgress={true}
        showSkipButton={true}
        steps={tourSteps[tour]}
        styles={{
          ...defaultStyles,
        }}
      />
    </div>
  );
};

export default TourStarter;
