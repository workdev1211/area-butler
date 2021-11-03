import useOnClickOutside from "hooks/onclickoutside";
import { useRef, useState } from "react";
import { ApiRequestContingent, ApiRequestContingentType } from "../../../shared/types/subscription-plan";

export interface RequestContingentDropDownProps {
  requestContingents: ApiRequestContingent[];
}

const RequestContingentDropDown: React.FunctionComponent<RequestContingentDropDownProps> =
  ({ requestContingents = [] }) => {
    const dropDownRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const contingentTypeLabels = {
        [ApiRequestContingentType.INCREASE]: 'Erhöhung',
        [ApiRequestContingentType.RECURRENT]: 'Monatl. Kontingent'
    }

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
                <th className="w-48 text-left" >Art</th>
                <th className="w-24 text-left">Menge</th>
                <th className="w-24 text-left">Datum</th>
              </tr>
            </thead>
            <tbody>
              {requestContingents.reverse().map(
                (requestContingent: ApiRequestContingent) => {
                  const date = new Date(requestContingent.date!);

                  return (
                    <tr className="text-left"
                      key={
                        "request-contingent-drop-down-" + requestContingent.date
                      }
                    >
                      <td className="w-48 text-left">{contingentTypeLabels[requestContingent.type]}</td>
                      <td className="w-24 text-left">{requestContingent.amount}</td>
                      <td className="w-24 text-left">
                        {date.getFullYear()}-{date.getMonth() + 1}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        )}
      </div>
    ) : null;
  };

export default RequestContingentDropDown;
