import { FunctionComponent } from "react";
import { ApiPersonaType } from "../../../shared/types/persona";
import { allPersonas } from "../../../shared/constants/persona";

export interface PersonaRankingProps {
  rankings: Record<ApiPersonaType, number>;
}

const starRankings: Record<number, string> = {
  1: "★",
  2: "★★",
  3: "★★★",
  4: "★★★★",
  5: "★★★★★",
};

const PersonaRanking: FunctionComponent<PersonaRankingProps> = ({
  rankings,
}) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Personengruppe</th>
          <th>Bewertung</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(rankings)
          .sort(
            (r1, r2) =>
              rankings[r2 as ApiPersonaType] - rankings[r1 as ApiPersonaType]
          )
          .map((ranking: string) => (
            <tr>
              <td>
                {allPersonas.find((persona) => persona.type === ranking)
                  ?.label || "Unbekannt"}
              </td>
              <td>
                {starRankings[rankings[ranking as ApiPersonaType] as number]}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default PersonaRanking;
