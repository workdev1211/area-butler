import { FunctionComponent } from "react";
import { useHistory } from "react-router-dom";

import { IntlKeys } from 'i18n/keys';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <button
      type="button"
      className="back-button btn w-full sm:w-auto mr-auto font-bold"
      style={{ background: backgroundColor, color: "white" }}
      onClick={() => {
        beforeGoBack();
        to ? history.push(to) : history.goBack();
      }}
    >
      <img className="mr-1 -mt-0.5" src={backIcon} alt="icon-back" /> {t(IntlKeys.common.back)}
    </button>
  );
};

export default BackButton;
