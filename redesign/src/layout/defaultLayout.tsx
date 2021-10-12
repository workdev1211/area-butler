import React from "react";
import "./defaultLayout.css";

interface DefaultLayoutProps {
    title: string;
    withHorizontalPadding: boolean;
    children: React.ReactNode;
}

const DefaultLayout: React.FunctionComponent<DefaultLayoutProps> = ({title, withHorizontalPadding, children}) => {
    return (
        <div className="default-layout">
            <div className="default-layout-header">
                {title}
            </div>
            <div className={withHorizontalPadding ? 'default-layout-content padding' : 'default-layout-content'}>
                {children}
            </div>
        </div>
    )
}

export default DefaultLayout;
