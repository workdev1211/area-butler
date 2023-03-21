import { FunctionComponent, useContext, useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step, Styles } from "react-joyride";

import { UserActionTypes, UserContext } from "context/UserContext";
import { ApiTour } from "../../../shared/types/types";
import RealEstatesSteps from "./RealEstatesPageSteps";
import CustomersSteps from "./CustomersPageSteps";
import SearchResulSteps from "./SearchResultPageSteps";
import SearchSteps from "./SearchPageSteps";
import ProfileSteps from "./ProfilePageSteps";
import SnippetEditorSteps from "./SnippetEditorPageSteps";
import StartTourModal from "./StartTourModal";

interface ITourStarterProps {
  tour: ApiTour;
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

const defaultShowTour = {
  search: false,
  result: false,
  realEstates: false,
  customers: false,
  profile: false,
  editor: false,
};

const tourSteps: Record<ApiTour, Step[]> = {
  search: SearchSteps,
  result: SearchResulSteps,
  realEstates: RealEstatesSteps,
  customers: CustomersSteps,
  profile: ProfileSteps,
  editor: SnippetEditorSteps,
};

const TourStarter: FunctionComponent<ITourStarterProps> = ({ tour }) => {
  const {
    userState: { startTour, user, integrationUser },
    userDispatch,
  } = useContext(UserContext);

  const [runTour, setRunTour] = useState(false);

  const onShowTour = () => {
    setRunTour(true);
  };

  useEffect(() => {
    if (!startTour) {
      return;
    }

    setRunTour(true);

    userDispatch({
      type: UserActionTypes.SET_START_TOUR,
      payload: false,
    });
  }, [userDispatch, startTour]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
    }
  };

  console.log(
    "TourStarter",
    1,
    user?.showTour,
    integrationUser?.config.showTour
  );

  return (
    <div>
      <StartTourModal
        tour={tour}
        showTour={
          user?.showTour || integrationUser?.config?.showTour || defaultShowTour
        }
        onShowTour={onShowTour}
      />
      <Joyride
        callback={handleJoyrideCallback}
        continuous={true}
        run={runTour}
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
