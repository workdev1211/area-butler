import { FunctionComponent } from "react";
import { useHistory } from "react-router-dom";

import backIcon from "../assets/icons/icons-16-x-16-outline-ic-back.svg";

export interface BackButtonProps {
  beforeGoBack?: () => void;
  to?: string;
}

const BackButton: FunctionComponent<BackButtonProps> = ({
  beforeGoBack = () => undefined,
  to,
}) => {
  const history = useHistory();

  return (
    <button
      type="button"
      className="btn bg-primary-gradient w-full sm:w-auto mr-auto"
      onClick={() => {
        beforeGoBack();
        to ? history.push(to) : history.goBack();
      }}
    >
      <img className="mr-1 -mt-0.5" src={backIcon} alt="icon-back" /> Zurück
    </button>
  );
};

export default BackButton;
