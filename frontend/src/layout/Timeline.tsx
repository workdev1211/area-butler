import { FunctionComponent } from "react";

import "./Timeline.scss";

const timelineSteps = [
  { number: 1, name: "Suche" },
  { number: 2, name: "Analyse" },
  { number: 3, name: "Editor" },
];

interface TimelineProps {
  activeStep: number;
}

const Timeline: FunctionComponent<TimelineProps> = ({ activeStep }) => {
  return (
    <div className="timeline">
      {timelineSteps.map(({ number, name }, i) => (
        <div
          className={`timeline-step${
            activeStep === i + 1 ? " timeline-step-active" : ""
          }`}
          key={name}
        >
          <div className="timeline-step-line" />
          <div className="timeline-step-title">{`${number}. ${name}`}</div>
          <div className="timeline-step-line" />
          {i === timelineSteps.length - 1 && (
            <div className="timeline-step-arrow" />
          )}
        </div>
      ))}
    </div>
  );
};

export default Timeline;
