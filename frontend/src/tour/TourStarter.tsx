import { UserActionTypes, UserContext } from "context/UserContext";
import React, { useContext, useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step, Styles } from "react-joyride";
import { ApiTour, ApiUser } from "../../../shared/types/types";
import RealEstatesSteps from "./RealEstatesPageSteps";
import CustomersSteps from "./CustomersPageSteps";
import SearchResulSteps from "./SearchResultPageSteps";
import SearchSteps from "./SearchPageSteps";
import ProfileSteps from "./ProfilePageSteps";
import SnippetEditorSteps from "./SnippetEditorPageSteps";
import StartTourModal from "./StartTourModal";

export interface TourStarterProps {
  tour: ApiTour;
}

export const defaultStyles: Styles = {
  options: {
    zIndex: 10000,
    primaryColor: "#c91444"
  },
  spotlight: {
    backgroundColor: "white"
  },
  overlay: {
    mixBlendMode: "darken"
  }
};

const tourSteps: Record<ApiTour, Step[]> = {
  search: SearchSteps,
  result: SearchResulSteps,
  realEstates: RealEstatesSteps,
  customers: CustomersSteps,
  profile: ProfileSteps,
  editor: SnippetEditorSteps
};

const TourStarter: React.FunctionComponent<TourStarterProps> = ({ tour }) => {
  const [runTour, setRunTour] = useState(false);
  const { userState, userDispatch } = useContext(UserContext);
  const user: ApiUser = userState.user!;

  const onShowTour = () => setRunTour(true);

  useEffect(() => {
    if (userState.startTour) {
      setRunTour(true);
      userDispatch({
        type: UserActionTypes.SET_START_TOUR,
        payload: false
      });
    }
  }, [userDispatch, userState.startTour]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
    }
  };

  return (
    <div>
      <StartTourModal
        tour={tour}
        showTour={user.showTour}
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
          ...defaultStyles
        }}
      />
    </div>
  );
};

export default TourStarter;
