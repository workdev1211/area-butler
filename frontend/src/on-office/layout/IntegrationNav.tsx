import { FC, useContext, useState } from "react";
import { NavLink } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import "./IntegrationNav.scss";

import AreaButlerLogo from "assets/img/logo.svg";
import SettingsIcon from "assets/icons/map-menu/04-konfiguration.svg";
import { onOfficeRootEntries } from "../OnOfficeContainer";
import { useIntegrationTools } from "../../hooks/integration/integrationtools";
import { UserContext } from "../../context/UserContext";

// TODO translation required

const IntegrationNav: FC = () => {
  const {
    userState: { integrationUser },
  } = useContext(UserContext);

  const { checkIsSubActive } = useIntegrationTools();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mobileMenuClass = !isMobileMenuOpen
    ? "hidden"
    : "nav-mobile-menu lg:hidden";

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
              setIsMobileMenuOpen(!isMobileMenuOpen);
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

        {/* Desktop nav menu */}
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
                {t(IntlKeys.nav.environmentalAnalysis)}
              </NavLink>

              <NavLink to="/open-ai" className="nav-link" aria-current="page">
                {t(IntlKeys.nav.aiAssistant)}
              </NavLink>

              <NavLink
                to="/real-estates"
                className="nav-link"
                aria-current="page"
              >
                {t(IntlKeys.nav.realEstates)}
              </NavLink>

              <NavLink
                to="/potential-customers"
                className="nav-link"
                aria-current="page"
              >
                {t(IntlKeys.nav.potentialCustomers)}
              </NavLink>

              <NavLink
                to="/map-snapshots"
                className="nav-link"
                aria-current="page"
              >
                {t(IntlKeys.nav.cards)}
              </NavLink>

              {!checkIsSubActive() && (
                <NavLink
                  to="/products"
                  className="nav-link"
                  aria-current="page"
                >
                  {t(IntlKeys.nav.products)}
                </NavLink>
              )}

              {integrationUser?.isAdmin && (
                <div className="nav-usermenu my-auto px-5">
                  <div className="nav-usermenu-button">
                    <NavLink
                      to={"/company-profile"}
                      id="user-menu-button"
                      aria-expanded="false"
                      aria-haspopup="true"
                      title={t(IntlKeys.nav.companyProfile)}
                    >
                      <img
                        src={integrationUser?.config.logo || SettingsIcon}
                        referrerPolicy="no-referrer"
                        alt="company"
                        className="max-w-14 max-h-14"
                      />
                    </NavLink>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav menu */}
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
            {t(IntlKeys.nav.environmentalAnalysis)}
          </NavLink>

          <NavLink
            to="/open-ai"
            className="nav-mobile-menu-link"
            aria-current="page"
          >
            {t(IntlKeys.nav.aiAssistant)}
          </NavLink>

          <NavLink
            to="/real-estates"
            className="nav-mobile-menu-link"
            aria-current="page"
          >
            {t(IntlKeys.nav.realEstates)}
          </NavLink>

          <NavLink
            to="/potential-customers"
            className="nav-mobile-menu-link"
            aria-current="page"
          >
            {t(IntlKeys.nav.potentialCustomers)}
          </NavLink>

          <NavLink
            to="/map-snapshots"
            className="nav-mobile-menu-link"
            aria-current="page"
          >
            {t(IntlKeys.nav.cards)}
          </NavLink>

          {!checkIsSubActive() && (
            <NavLink
              to="/products"
              className="nav-mobile-menu-link"
              aria-current="page"
            >
              {t(IntlKeys.nav.products)}
            </NavLink>
          )}

          {integrationUser?.isAdmin && (
            <NavLink
              to="/company-profile"
              className="nav-mobile-menu-link"
              aria-current="page"
            >
              {t(IntlKeys.nav.companyProfile)}
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default IntegrationNav;
