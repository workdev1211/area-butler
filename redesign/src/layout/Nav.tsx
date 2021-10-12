import React, {FunctionComponent, useEffect, useRef, useState} from 'react';
import "./Nav.css";
import Logo from 'assets/img/logo.svg';
import useOnClickOutside from "../hooks/onclickoutside";
import {NavLink} from 'react-router-dom';
import LoginButton from '../auth/login-button';
import {useAuth0, User} from "@auth0/auth0-react";
import Authenticated from 'auth/authenticated';

const Nav: FunctionComponent = () => {

    const showNavBar = window.location.pathname !== '/questionnaire';

    const [currentUser, setCurrentUser] = useState<User>();
    const {logout, user, isAuthenticated} = useAuth0();

    useEffect(() => {
        setCurrentUser(user);
    }, [user, isAuthenticated, setCurrentUser])

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    let mobileMenuClass = 'hidden';
    if (mobileMenuOpen) {
        mobileMenuClass = 'nav-mobile-menu sm:hidden';
    }

    let userMenuClass = 'hidden';
    if (userMenuOpen) {
        userMenuClass = 'origin-top-right absolute right-2 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50';
    }
    const userMenuRef = useRef(null);
    useOnClickOutside(userMenuRef, () => userMenuOpen && setUserMenuOpen(false));

    return (
        <nav>
            <div className="nav">
                <div className="nav-button">
                    <button type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            aria-controls="mobile-menu" aria-expanded="false"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <span className="sr-only">Menü</span>

                        <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 24 24"
                             stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>

                        <svg className="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 24 24"
                             stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div className="h-full flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                    <NavLink to="/" className="nav-logo">
                        <img className="block lg:hidden h-full w-auto"
                             src={Logo} alt="Logo"/>
                        <img className="hidden lg:block h-full w-auto"
                             src={Logo} alt="Logo"/>
                    </NavLink>
                    {showNavBar && (<div className="hidden sm:flex sm:items-center">
                        <div className="nav-links">
                            <NavLink to="/" className="nav-link" exact={true}
                                     aria-current="page">Start</NavLink>
                            <Authenticated>
                                <NavLink to="/listings" className="nav-link" exact={true}
                                         aria-current="page">Meine Objekte</NavLink>
                                <NavLink to="/potential-customers" className="nav-link" exact={true}
                                         aria-current="page">Meine Interessenten</NavLink>
                            </Authenticated>
                        </div>
                    </div>)}
                </div>

                {showNavBar && isAuthenticated && currentUser && (<div
                    className="nav-usermenu">
                    <div className="nav-usermenu-button">
                        <button type="button"
                                id="user-menu-button" aria-expanded="false" aria-haspopup="true"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}>
                            <span className="sr-only">Benutzer Menü</span>
                            <img
                                src={currentUser.picture}
                                alt=""/>
                        </button>
                    </div>

                    <div
                        ref={userMenuRef}
                        className={userMenuClass}
                        role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                        <NavLink to="/" className="nav-usermenu-link" role="menuitem" exact={true}
                                 id="user-menu-item-1">Einstellungen</NavLink>
                        <button onClick={() => logout({
                            returnTo: window.location.origin
                        })} className="nav-usermenu-link" role="menuitem"
                                id="user-menu-item-2">Abmelden
                        </button>
                    </div>
                </div>)}

            </div>

            <div className={mobileMenuClass} id="mobile-menu">
                <div className="ml-5 flex flex-col gap-5 px-2 pt-2 pb-3 space-y-1 bg-white">
                    <NavLink to="/" className="nav-mobile-menu-link" exact={true}
                             aria-current="page">Start</NavLink>
                    <Authenticated>
                        <NavLink to="/listings" exact={true}
                                 className="nav-mobile-menu-link"
                                 aria-current="page">Meine Objekte</NavLink>
                        <NavLink to="/potential-customers" exact={true}
                                 className="nav-mobile-menu-link"
                                 aria-current="page">Meine Interessenten</NavLink>
                    </Authenticated>
                    {!isAuthenticated && <LoginButton/>}
                </div>
            </div>
        </nav>
    )
}

export default Nav;
