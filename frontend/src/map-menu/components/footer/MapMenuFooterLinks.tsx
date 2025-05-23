import { FunctionComponent } from "react";
import { Link } from "react-router-dom";

import { kudibaCompany } from "../../../../../shared/constants/constants";

const MapMenuFooterLinks: FunctionComponent = () => {
  return (
    <div id="footer" className="text-sm text-gray-400 w-full md:w-auto">
      <div className="flex flex-col">
        <div className="text-center">
          Copyright &copy; {new Date().getFullYear()} {kudibaCompany.name}.
          <br />
          Alle Rechte vorbehalten.
        </div>
        <div className="flex justify-center font-bold gap-3">
          <Link
            to="/impress"
            className="link"
            target="_blank"
            aria-current="page"
          >
            Impressum
          </Link>
          <Link
            to="/privacy"
            className="link"
            target="_blank"
            aria-current="page"
          >
            Datenschutz
          </Link>
          <Link
            to="/terms"
            className="link"
            aria-current="page"
            target="_blank"
          >
            AGB
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MapMenuFooterLinks;
