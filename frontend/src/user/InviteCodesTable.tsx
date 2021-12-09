import { useHttp } from "hooks/http";
import { useEffect, useState } from "react";
import { toastSuccess } from "shared/shared.functions";
import { ApiInviteCode } from "../../../shared/types/types";
import copy from "copy-to-clipboard";

const InviteCodesTable: React.FunctionComponent = () => {
  const [inviteCodes, setInviteCodes] = useState<ApiInviteCode[]>([]);
  const { get } = useHttp();

  useEffect(() => {
    const fetchUserCodes = async () => {
      const userCodes = (
        await get<ApiInviteCode[]>("/api/users/me/invite-codes")
      ).data;
      setInviteCodes(userCodes);
    };

    fetchUserCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyCodeToClipBoard = (code: string) => {
    const success = copy(code);
    if (success) {
      toastSuccess("Einladungscode in die Zwischenablage kopiert!");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="table w-full table-compact">
        <thead>
          <tr>
            <th>Code</th>
            <th>Verwendet am</th>
          </tr>
        </thead>
        <tbody>
          {inviteCodes.map(inviteCode => (
            <tr className={!!inviteCode.used ? "inactive" : ""} key={`invite-code-${inviteCode.code}`}>
              <th className="uppercase flex items-end">
                <span
                  className={
                    inviteCode.used ? "font-mono line-through" : "font-mono"
                  }
                >
                  {inviteCode.code}
                </span>
                {!inviteCode.used && (
                  <button
                    className="ml-5 rounded btn-xs btn-primary"
                    onClick={() => copyCodeToClipBoard(inviteCode.code)}
                  >
                    Kopieren
                  </button>
                )}
              </th>
              <td>
                {inviteCode.used
                  ? new Date(inviteCode.used).toLocaleDateString("de-DE")
                  : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InviteCodesTable;
