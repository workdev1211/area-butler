import { FunctionComponent } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import {
  FederalElectionDistrict,
  FederalElectionResult,
} from "hooks/federalelectiondata";
import { Loading } from "../../../components/Loading";

interface IFederalElectionTableProps {
  federalElectionData?: FederalElectionDistrict;
}

const FederalElectionTable: FunctionComponent<IFederalElectionTableProps> = ({
  federalElectionData,
}) => {
  const { t } = useTranslation();
  if (!federalElectionData || !Object.keys(federalElectionData).length) {
    return <Loading />;
  }

  return (
    <table className="table w-full">
      <thead>
        <tr>
          <th>{t(IntlKeys.snapshotEditor.socialDemographics.politicalParty)}</th>
          <th>
            <span>2021</span>
            <br />
            <span>(2017)</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {federalElectionData?.results?.map((p: FederalElectionResult) => (
          <tr style={{ borderBottom: "0.125rem solid darkgray" }} key={p.party}>
            <td>{p.party}</td>
            <td>
              <span>{p.percentage} %</span>
              <br />
              <span>({p.lastElectionPercentage} %)</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FederalElectionTable;
