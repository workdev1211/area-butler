import React from 'react';
import {Link} from "react-router-dom";
import {kudibaCompany} from "../../../shared/constants/constants";

const Footer: React.FunctionComponent = () => {
    return (
        <div className="container mx-auto px-2 sm:px-0 pt-0 sm:pt-2 mt-auto">
            <div className="relative flex flex-wrap items-center justify-between h-16 text-xs">
                <div>
                    <Link to="/impress" className="link-neutral"
                          aria-current="page">Impressum</Link>
                </div>
                <span className="text-gray-400">Copyright &copy; {new Date().getFullYear()} {kudibaCompany.name}. Alle Rechte vorbehalten.</span>
            </div>
        </div>
    )
}
export default Footer;
