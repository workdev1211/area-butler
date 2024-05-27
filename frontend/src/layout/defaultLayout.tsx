import { FC, ReactNode } from "react";

import "./defaultLayout.scss";

import caretDown from "../assets/icons/icons-12-x-12-outline-ic-caret.svg";
import Timeline from "./Timeline";
import { Loading } from "../components/Loading";

interface IDefaultLayoutProps {
  children: ReactNode;
  withHorizontalPadding: boolean;
  actionsBottom?: ReactNode[];
  actionsTop?: ReactNode;
  isContentLoaded?: boolean;
  isOverriddenActionsTop?: boolean;
  timelineStep?: number;
  title?: string;
}

const DefaultLayout: FC<IDefaultLayoutProps> = ({
  actionsBottom = [],
  actionsTop,
  children,
  isContentLoaded = true,
  isOverriddenActionsTop,
  timelineStep,
  title,
  withHorizontalPadding,
}) => {
  return (
    <div className={`default-layout ${isContentLoaded ? "" : "flex-1"}`}>
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
        } ${isContentLoaded ? "" : "flex flex-1 justify-center"}`}
      >
        {isContentLoaded ? children : <Loading />}
      </div>
      {actionsBottom.length > 0 && isContentLoaded && (
        <div className="action-bottom">{...actionsBottom}</div>
      )}
    </div>
  );
};

export default DefaultLayout;
