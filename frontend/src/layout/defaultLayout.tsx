import { FunctionComponent, ReactNode } from "react";

import "./defaultLayout.scss";
import caretDown from "../assets/icons/icons-12-x-12-outline-ic-caret.svg";
import Timeline from "./Timeline";

interface DefaultLayoutProps {
  withHorizontalPadding: boolean;
  children: ReactNode;
  title?: string;
  actionsTop?: ReactNode;
  isOverriddenActionsTop?: boolean;
  actionsBottom?: ReactNode[];
  timelineStep?: number;
}

const DefaultLayout: FunctionComponent<DefaultLayoutProps> = ({
  title,
  withHorizontalPadding,
  children,
  actionsTop,
  isOverriddenActionsTop,
  actionsBottom = [],
  timelineStep,
}) => {
  return (
    <div className="default-layout">
      {(title || timelineStep || actionsTop) && (
        <div className="default-layout-header">
          {title && !timelineStep && <h1>{title}</h1>}
          {timelineStep && <Timeline activeStep={timelineStep} />}
          {actionsTop && (
            <div
              className="dropdown z-2000"
              data-tour={isOverriddenActionsTop ? "" : "actions-top"}
            >
              {isOverriddenActionsTop ? (
                <>{actionsTop}</>
              ) : (
                <>
                  <div tabIndex={0} className="dropdown-btn">
                    <div className="dropdown-btn-content">
                      Aktionen <span className="divider" />
                      <img
                        src={caretDown}
                        alt="icon-dropdown"
                        className="caret-down"
                      />
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="sm:right-1 p-2 shadow menu dropdown-content bg-base-100 rounded-box w-80"
                  >
                    {actionsTop}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      )}
      <div
        className={`default-layout-content ${
          withHorizontalPadding ? "padding" : ""
        }`}
      >
        {children}
      </div>
      {actionsBottom.length > 0 && (
        <div className="action-bottom">{...actionsBottom}</div>
      )}
    </div>
  );
};

export default DefaultLayout;
