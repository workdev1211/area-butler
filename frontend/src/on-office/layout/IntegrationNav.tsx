import { FunctionComponent, useContext, useState } from "react";
import { NavLink } from "react-router-dom";

import "./IntegrationNav.scss";

import AreaButlerLogo from "assets/img/logo.svg";
import { SearchContext } from "../../context/SearchContext";
import { onOfficeRootEntries } from "../OnOfficeContainer";

const IntegrationNav: FunctionComponent = () => {
  const { searchContextState } = useContext(SearchContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!searchContextState.integrationSnapshotId) {
    return null;
  }

  let mobileMenuClass = "hidden";
  if (mobileMenuOpen) {
    mobileMenuClass = "nav-mobile-menu lg:hidden";
  }

  return (
    <nav>
      <div className="nav">
        {/* Mobile menu button */}
        <div className="nav-button">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-controls="mobile-menu"
            aria-expanded="false"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
            }}
          >
            <span className="sr-only">Menü</span>
            <svg
              className="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>

            <svg
              className="hidden h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Desktop main menu */}
        <div className="h-full flex-1 flex items-center justify-center lg:items-stretch lg:justify-start">
          {/* AreaButler logo link */}
          <NavLink
            to="/search"
            className="nav-logo"
            isActive={(match, { pathname }) =>
              onOfficeRootEntries.includes(pathname)
            }
          >
            <img
              className="block lg:hidden h-full w-auto"
              src={AreaButlerLogo}
              alt="AreaButlerLogo"
            />
            <img
              className="hidden lg:block h-full w-auto"
              src={AreaButlerLogo}
              alt="AreaButlerLogo"
            />
          </NavLink>

          <div className="hidden lg:flex lg:items-center">
            <div className="nav-links">
              <NavLink
                to="/search"
                className="nav-link"
                aria-current="page"
                isActive={(match, { pathname }) =>
                  onOfficeRootEntries.includes(pathname)
                }
              >
                Umgebungsanalyse
              </NavLink>
              <NavLink to="/open-ai" className="nav-link" aria-current="page">
                Mein KI-Assistent
              </NavLink>
              <NavLink
                to="/potential-customers"
                className="nav-link"
                aria-current="page"
              >
                Meine Zielgruppen
              </NavLink>
              <NavLink
                to={`/map/${searchContextState.integrationSnapshotId}`}
                className="nav-link"
                aria-current="page"
              >
                Meine Karte
              </NavLink>
              <NavLink to="/products" className="nav-link" aria-current="page">
                Meine Produkte
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile main menu */}
      <div className={mobileMenuClass} id="mobile-menu">
        <div className="ml-5 flex flex-col gap-5 px-2 pt-2 pb-3 space-y-1 bg-white">
          <NavLink
            to="/search"
            className="nav-mobile-menu-link"
            aria-current="page"
            isActive={(match, { pathname }) =>
              onOfficeRootEntries.includes(pathname)
            }
          >
            Umgebungsanalyse
          </NavLink>
          <NavLink
            to="/open-ai"
            className="nav-mobile-menu-link"
            aria-current="page"
          >
            Mein KI-Assistent
          </NavLink>
          <NavLink
            to="/potential-customers"
            className="nav-link"
            aria-current="page"
          >
            Meine Zielgruppen
          </NavLink>
          <NavLink
            to={`/map/${searchContextState.integrationSnapshotId}`}
            className="nav-link"
            aria-current="page"
          >
            Meine Karte
          </NavLink>
          <NavLink to="/products" className="nav-link" aria-current="page">
            Meine Produkte
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default IntegrationNav;
