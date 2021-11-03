import { UserActions, UserContext } from "context/UserContext";
import { useContext, useEffect, useState } from "react";
import Joyride, {
  CallBackProps,
  STATUS,
  Step,
  StoreHelpers,
  Styles,
} from "react-joyride";
import { ApiTour, ApiUser } from "../../../shared/types/types";
import RealEstatesSteps from "./RealEstatesPageSteps";
import CustomersSteps from "./CustomersPageSteps";
import SearchResulSteps from "./SearchResultPageSteps";
import SearchSteps from "./SearchPageSteps";
import ProfileSteps from "./ProfilePageSteps";
import StartTourModal from "./StartTourModal";

export interface TourStarterProps {
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

const tourSteps: Record<ApiTour, Step[]> = {
  search: SearchSteps,
  result: SearchResulSteps,
  realEstates: RealEstatesSteps,
  customers: CustomersSteps,
  profile: ProfileSteps,
};

const TourStarter: React.FunctionComponent<TourStarterProps> = ({ tour }) => {
  const [runTour, setRunTour] = useState(false);
  const { userState, userDispatch } = useContext(UserContext);
  const user: ApiUser = userState.user;

  const onShowTour = () => setRunTour(true);

  useEffect(() => {
    if (!!userState.startTour) {
      setRunTour(true);
      userDispatch({ type: UserActions.SET_START_TOUR, payload: false });
    }
  }, [userState.startTour]);

  const [helpers, setHelpers] = useState<StoreHelpers | undefined>();

  const getHelpers = (helpers: StoreHelpers) => {
    setHelpers(helpers);
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
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
        getHelpers={getHelpers}
        run={runTour}
        scrollToFirstStep={true}
        showProgress={true}
        showSkipButton={true}
        steps={tourSteps[tour]}
        styles={{ ...defaultStyles }}
      />
    </div>
  );
};

export default TourStarter;
