import { FC, useContext, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth0, User } from "@auth0/auth0-react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import "./Nav.scss";

import Logo from "assets/img/logo.svg";
import useOnClickOutside from "../hooks/onclickoutside";
import Authenticated from "auth/Authenticated";
import LoginButton from "../components/LoginButton";
import { UserContext } from "../context/UserContext";

const Nav: FC = () => {
  const userMenuRef = useRef<HTMLDivElement>(null);

  const {
    userState: { user },
  } = useContext(UserContext);

  const { logout, user: auth0User, isAuthenticated } = useAuth0();
  const { t } = useTranslation();

  const [currentUser, setCurrentUser] = useState<User>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(auth0User);
  }, [auth0User, isAuthenticated, setCurrentUser]);

  const isNavBarShown = !RegExp(/questionnaire.+/).test(
    window.location.pathname
  );

  const mobileMenuClass = !isMobileMenuOpen
    ? "hidden"
    : "nav-mobile-menu lg:hidden";

  const userMenuClass = !isUserMenuOpen
    ? "hidden"
    : "origin-top-right absolute right-2 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-2500";

  useOnClickOutside(userMenuRef, () => {
    if (isUserMenuOpen) {
      setIsUserMenuOpen(false);
    }
  });

  if (!isNavBarShown) {
    return null;
  }

  return (
    <nav>
      <div className="nav">
        {/* Mobile nav menu button */}
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
            <span className="sr-only">{t(IntlKeys.nav.menu)}</span>

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
          <NavLink to="/" className="nav-logo">
            <img
              className="block lg:hidden h-full w-auto"
              src={Logo}
              alt="Logo"
            />

            <img
              className="hidden lg:block h-full w-auto"
              src={Logo}
              alt="Logo"
            />
          </NavLink>

          {isNavBarShown && isAuthenticated && (
            <div className="hidden lg:flex lg:items-center w-full">
              <div className="nav-links">
                <NavLink
                  to="/search"
                  className="nav-link"
                  exact={true}
                  aria-current="page"
                >
                  {t(IntlKeys.nav.environmentalAnalysis)}
                </NavLink>

                <Authenticated>
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
                </Authenticated>
              </div>
            </div>
          )}
        </div>

        {/* Right side login button and menu */}
        {!isAuthenticated && (
          <div className="mr-10">
            <LoginButton />
          </div>
        )}

        {isNavBarShown && isAuthenticated && currentUser && (
          <div className="nav-usermenu" ref={userMenuRef}>
            <div className="nav-usermenu-button">
              <button
                type="button"
                id="user-menu-button"
                aria-expanded="false"
                aria-haspopup="true"
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                }}
              >
                {/* TODO translation required */}
                <span className="sr-only">Benutzer Menü</span>
                <img
                  src={user?.config.logo || currentUser.picture}
                  referrerPolicy="no-referrer"
                  alt="user"
                />
              </button>
            </div>

            <div
              className={userMenuClass}
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu-button"
            >
              <NavLink
                to="/user-profile"
                className="nav-usermenu-link"
                role="menuitem"
                exact={true}
                onClick={() => {
                  setIsUserMenuOpen(false);
                }}
                id="user-menu-item-1"
              >
                {t(IntlKeys.nav.profile)}
              </NavLink>

              {user?.isAdmin && (
                <NavLink
                  to="/company-profile"
                  className="nav-usermenu-link"
                  role="menuitem"
                  exact={true}
                  onClick={() => {
                    setIsUserMenuOpen(false);
                  }}
                  id="user-menu-item-1"
                >
                  {t(IntlKeys.nav.companyProfile)}
                </NavLink>
              )}

              <button
                onClick={() => {
                  logout({
                    returnTo: window.location.origin,
                  });

                  setIsUserMenuOpen(false);
                }}
                className="nav-usermenu-link"
                role="menuitem"
                id="user-menu-item-2"
              >
                {t(IntlKeys.nav.logout)}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile nav menu */}
      <div className={mobileMenuClass} id="mobile-menu">
        <div className="ml-5 flex flex-col gap-5 px-2 pt-2 pb-3 space-y-1 bg-white">
          <NavLink
            to="/search"
            className="nav-mobile-menu-link"
            exact={true}
            aria-current="page"
          >
            {t(IntlKeys.nav.environmentalAnalysis)}
          </NavLink>

          <Authenticated>
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
          </Authenticated>

          {!isAuthenticated && <LoginButton />}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
