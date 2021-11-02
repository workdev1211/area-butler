import { UserContext } from "context/UserContext";
import { useContext, useState } from "react";
import { ApiTour, ApiUser } from "../../../shared/types/types";
import SearchPageTour from "./SearchPageTour";
import StartTourModal from "./StartTourModal";

export interface TourStarterProps {
    tour: ApiTour;
}

const TourStarter: React.FunctionComponent<TourStarterProps> = ({tour}) => {

    const [runTour, setRunTour] = useState(false);
    const {userState} = useContext(UserContext);
    const user : ApiUser = userState.user;

    const onShowTour = () => setRunTour(true);


    return <div>
        <StartTourModal tour={tour} showTour={user.showTour} onShowTour={onShowTour}/>
        {tour === 'search' && <SearchPageTour runTour={runTour} setRunTour={setRunTour}></SearchPageTour>}
    </div>
}

export default TourStarter;