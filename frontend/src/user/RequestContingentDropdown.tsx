import useOnClickOutside from "hooks/onclickoutside";
import { useRef, useState } from "react";
import {
  ApiRequestContingent,
  ApiRequestContingentType,
} from "../../../shared/types/subscription-plan";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

export interface RequestContingentDropDownProps {
  requestContingents: ApiRequestContingent[];
}

const RequestContingentDropDown: React.FunctionComponent<
  RequestContingentDropDownProps
> = ({ requestContingents = [] }) => {
  const { t } = useTranslation();
  const dropDownRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const contingentTypeLabels = {
    [ApiRequestContingentType.INCREASE]: t(IntlKeys.subscriptions.increase),
    [ApiRequestContingentType.RECURRENT]: t(
      IntlKeys.subscriptions.monthlyQuota
    ),
  };

  useOnClickOutside(dropDownRef, () => menuOpen && setMenuOpen(false));

  const dropDownListStyle = menuOpen
    ? "p-2 shadow menu text-left menu-open w-96 dropdown-content bg-base-100 rounded-box overflow-y-scroll"
    : "p-2 shadow menu text-left dropdown-content bg-base-100 rounded-box overflow-y-scroll";

  return requestContingents.length > 0 ? (
    <div ref={dropDownRef} className="dropdown">
      <button
        className="ml-2 btn btn-circle btn-secondary btn-xs"
        tabIndex={0}
        onClick={(e) => setMenuOpen(!menuOpen)}
      >
        i
      </button>
      {menuOpen && (
        <table tabIndex={0} className={dropDownListStyle}>
          <thead>
            <tr className="text-left">
              <th className="w-48 text-left">
                {t(IntlKeys.subscriptions.type)}
              </th>
              <th className="w-24 text-left">
                {t(IntlKeys.subscriptions.quantity)}
              </th>
              <th className="w-24 text-left">
                {t(IntlKeys.subscriptions.data)}
              </th>
            </tr>
          </thead>
          <tbody>
            {requestContingents
              .reverse()
              .map((requestContingent: ApiRequestContingent) => {
                const date = new Date(requestContingent.date!);

                return (
                  <tr
                    className="text-left"
                    key={
                      "request-contingent-drop-down-" + requestContingent.date
                    }
                  >
                    <td className="w-48 text-left">
                      {contingentTypeLabels[requestContingent.type]}
                    </td>
                    <td className="w-24 text-left">
                      {requestContingent.amount}
                    </td>
                    <td className="w-24 text-left">
                      {date.getFullYear()}-{date.getMonth() + 1}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
    </div>
  ) : null;
};

export default RequestContingentDropDown;
