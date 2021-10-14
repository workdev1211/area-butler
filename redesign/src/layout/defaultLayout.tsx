import React from "react";
import "./defaultLayout.css";
import caretDown from "../assets/icons/icons-12-x-12-outline-ic-caret.svg";

interface DefaultLayoutProps {
    title: string;
    withHorizontalPadding: boolean;
    children: React.ReactNode;
    actionBottom?: React.ReactNode;
}

const DefaultLayout: React.FunctionComponent<DefaultLayoutProps> = ({title, withHorizontalPadding, actionBottom, children}) => {
    return (
        <div className="default-layout">
            <div className="default-layout-header">
                <h1>{title}</h1>
                <div className="dropdown">
                    <div tabIndex={0} className="dropdown-btn">
                        <div className="dropdown-btn-content">Optionen <span className="divider" /><img src={caretDown} alt="icon-dropdown" />
                        </div>
                    </div>
                    <ul tabIndex={0} className="right-1 p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52">
                        <li>
                            <a href="/">Item 1</a>
                        </li>
                        <li>
                            <a href="/">Item 2</a>
                        </li>
                        <li>
                            <a href="/">Item 3</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className={withHorizontalPadding ? 'default-layout-content padding' : 'default-layout-content'}>
                {children}
            </div>
            {actionBottom && <div className="action-bottom">
                {actionBottom}
            </div>}
        </div>
    )
}

export default DefaultLayout;
