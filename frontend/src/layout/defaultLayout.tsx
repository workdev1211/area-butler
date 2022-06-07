import { FunctionComponent, ReactNode } from "react";

import "./defaultLayout.scss";
import caretDown from "../assets/icons/icons-12-x-12-outline-ic-caret.svg";
import Timeline from "./Timeline";

interface DefaultLayoutProps {
  title: string;
  withHorizontalPadding: boolean;
  children: ReactNode;
  actionTop?: ReactNode;
  actionBottom?: ReactNode[];
  timelineStep?: number;
}

const DefaultLayout: FunctionComponent<DefaultLayoutProps> = ({
  title,
  withHorizontalPadding,
  children,
  actionTop,
  actionBottom = [],
  timelineStep,
}) => {
  return (
    <div className="default-layout">
      <div className="default-layout-header">
        <h1>{title}</h1>
        {timelineStep && <Timeline activeStep={timelineStep} />}
        {actionTop && (
          <div className="dropdown z-2000" data-tour="actions-top">
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
              {actionTop}
            </ul>
          </div>
        )}
      </div>
      <div
        className={
          withHorizontalPadding
            ? "default-layout-content padding"
            : "default-layout-content"
        }
      >
        {children}
      </div>
      {actionBottom.length > 0 && (
        <div className="action-bottom">{...actionBottom}</div>
      )}
    </div>
  );
};

export default DefaultLayout;
