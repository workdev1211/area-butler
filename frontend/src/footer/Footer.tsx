import React from 'react';
import {Link} from "react-router-dom";
import {kudibaCompany} from "../../../shared/constants/constants";

const Footer: React.FunctionComponent = () => {
    return (
        <div className="container mx-auto px-2 sm:px-0 pt-0 sm:pt-2 mt-auto h-16 text-xs">
            <div className="flex h-full items-center justify-end gap-5">
                <span className="text-gray-400">Copyright &copy; {new Date().getFullYear()} {kudibaCompany.name}. Alle Rechte vorbehalten.</span>
                <Link to="/impress" className="link-neutral"
                      aria-current="page">Impressum</Link>
                <Link to="/privacy" className="link-neutral"
                      aria-current="page">Datenschutz</Link>
            </div>
        </div>
    )
}
export default Footer;
