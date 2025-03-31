import { FunctionComponent } from "react";
import { Link, useLocation } from "react-router-dom";

import { kudibaCompany } from "../../../shared/constants/constants";
import { snapshotEditorPath } from "../shared/shared.constants";

const Footer: FunctionComponent = () => {
  const path = useLocation().pathname.replace(/^\/(.*)\/.*$/, "$1");

  if (path === snapshotEditorPath) {
    return null;
  }

  return (
    <div
      id="footer"
      className={
        "container mx-auto px-2 pb-2 sm:px-0 pt-0 sm:pt-2 mt-auto text-tiny"
      }
    >
      <div className="flex flex-wrap h-full items-baseline justify-center gap-5">
        <div className="text-gray-400 text-sm text-center w-full md:w-auto">
          Copyright &copy; {new Date().getFullYear()} {kudibaCompany.name}. Alle
          All rights reserved.
        </div>
        <Link to="/impress" className="link-neutral" aria-current="page">
          Imprint
        </Link>
        <Link to="/privacy" className="link-neutral" aria-current="page">
          Data protection
        </Link>
        <Link to="/terms" className="link-neutral" aria-current="page">
          General terms and conditions of business
        </Link>
      </div>
    </div>
  );
};

export default Footer;
