import React from 'react';
import {Link} from "react-router-dom";
import {kudibaCompany} from "../../../shared/constants/constants";

const Footer: React.FunctionComponent = () => {
    return (
        <div className="container mx-auto px-2 pb-2 sm:px-0 pt-0 sm:pt-2 mt-auto text-tiny">
            <div className="flex flex-wrap h-full items-baseline justify-center gap-5">
                <div className="text-gray-400 text-sm text-center w-full md:w-auto">Copyright &copy; {new Date().getFullYear()} {kudibaCompany.name}. Alle Rechte vorbehalten.</div>
                <Link to="/impress" className="link-neutral"
                      aria-current="page">Impressum</Link>
                <Link to="/privacy" className="link-neutral"
                      aria-current="page">Datenschutz</Link>
            </div>
        </div>
    )
}
export default Footer;
