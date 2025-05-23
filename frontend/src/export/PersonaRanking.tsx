// NOT USED FOR THE MOMENT

import { FunctionComponent } from "react";
import { Radar } from "react-chartjs-2";
import type * as Chart from "chart.js";

import { allPersonas } from "../../../shared/constants/persona";
import { ApiPersonaType } from "../../../shared/types/persona";

interface IPersonaRankingProps {
  rankings: Record<ApiPersonaType, number>;
}

const starRankings: Record<number, string> = {
  1: "★",
  2: "★★",
  3: "★★★",
  4: "★★★★",
  5: "★★★★★",
};

const PersonaRanking: FunctionComponent<IPersonaRankingProps> = ({
  rankings,
}) => {
  const radarChartData = {
    labels: Object.keys(rankings).map(
      (ranking) =>
        allPersonas.find((persona) => persona.type === ranking)?.label || ""
    ),
    datasets: [
      {
        label: "Personengruppen",
        data: Object.values(rankings),
        backgroundColor: "rgba(204, 30, 70, 0.2)",
        borderColor: "rgba(204, 30, 70, 1)",
        borderWidth: 5,
      },
    ],
  };

  const radarChartOptions: Chart.ChartOptions = {
    responsive: false,
    resizeDelay: 0,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 5,
        suggestedMin: 0,
        suggestedMax: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div>
      <div className="absolute mt-48 ml-80">
        <h1 className="text-2xl font-bold left-1/2 top-1/2">
          Die Eingruppierung steht Ihnen Anfang 2022 zur Verfügung
        </h1>
      </div>
      <div className="opacity-10 flex gap-40">
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
                  rankings[r2 as ApiPersonaType] -
                  rankings[r1 as ApiPersonaType]
              )
              .map((ranking: string) => (
                <tr key={`persona-${ranking}`}>
                  <td>
                    {allPersonas.find((persona) => persona.type === ranking)
                      ?.label || "Unbekannt"}
                  </td>
                  <td>
                    {
                      starRankings[
                        rankings[ranking as ApiPersonaType] as number
                      ]
                    }
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="h-96 w-96">
          <Radar
            width={400}
            height={400}
            id="persona-chart"
            data={radarChartData}
            options={radarChartOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonaRanking;
