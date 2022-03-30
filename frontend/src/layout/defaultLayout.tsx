import React from "react";
import "./defaultLayout.scss";
import caretDown from "../assets/icons/icons-12-x-12-outline-ic-caret.svg";

interface DefaultLayoutProps {
  title: string;
  withHorizontalPadding: boolean;
  children: React.ReactNode;
  actionTop?: React.ReactNode;
  actionBottom?: React.ReactNode[];
}

const DefaultLayout: React.FunctionComponent<DefaultLayoutProps> = ({
  title,
  withHorizontalPadding,
  actionTop,
  actionBottom = [],
  children
}) => {
  return (
    <div className="default-layout">
      <div className="default-layout-header">
        <h1>{title}</h1>
        {actionTop && (
          <div className="dropdown z-2000" data-tour="actions-top">
            <div tabIndex={0} className="dropdown-btn">
              <div className="dropdown-btn-content">
                Aktionen <span className="divider" />
                <img src={caretDown} alt="icon-dropdown" />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="sm:right-1 p-2 shadow menu dropdown-content bg-base-100 rounded-box w-72"
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
