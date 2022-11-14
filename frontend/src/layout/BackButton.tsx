import { FunctionComponent } from "react";
import { useHistory } from "react-router-dom";

import backIcon from "../assets/icons/icons-16-x-16-outline-ic-back.svg";

interface IBackButtonProps {
  beforeGoBack?: () => void;
  to?: string;
  backgroundColor?: string;
}

const BackButton: FunctionComponent<IBackButtonProps> = ({
  beforeGoBack = () => {},
  to,
  backgroundColor = "var(--primary-gradient)",
}) => {
  const history = useHistory();

  return (
    <button
      type="button"
      className="btn w-full sm:w-auto mr-auto font-bold"
      style={{ background: backgroundColor, color: "white" }}
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
