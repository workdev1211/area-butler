import React, {FunctionComponent, useRef, useState} from 'react';
import Logo from 'assets/img/logo.png';
import useOnClickOutside from "../hooks/onclickoutside";
import {Link} from 'react-router-dom';
import LoginButton from '../auth/login-button';
import {useAuth0} from "@auth0/auth0-react";

type NavProps = {

}

const Nav: FunctionComponent<NavProps> = (props) => {

    const { logout, user, isAuthenticated } = useAuth0();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    let mobileMenuClass = 'hidden';
    if (mobileMenuOpen) {
        mobileMenuClass = 'sm:hidden';
    }

    let userMenuClass = 'hidden';
    if (userMenuOpen) {
        userMenuClass =  'origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none';
    }
    const userMenuRef = useRef(null);
    useOnClickOutside(userMenuRef, () => userMenuOpen && setUserMenuOpen(false));

    return (
        <nav>
            <div className="container mx-auto px-2 sm:px-0">
                <div className="relative flex items-center justify-between h-16">
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        <button type="button"
                                className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                aria-controls="mobile-menu" aria-expanded="false" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
                    <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                        <div className="flex-shrink-0 flex items-center">
                            <img className="block lg:hidden h-12 w-auto"
                                 src={Logo} alt="Logo"/>
                            <img className="hidden lg:block h-14 w-auto"
                                 src={Logo} alt="Logo"/>
                        </div>
                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            <div className="flex space-x-4">
                                <Link to="/" className="btn"
                                   aria-current="page">Start</Link>
                                   
                                { !isAuthenticated && <LoginButton></LoginButton> }
                            </div>
                        </div>
                    </div>
                    <div
                        className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        {/*<button type="button"*/}
                        {/*        className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">*/}
                        {/*    <span className="sr-only">View notifications</span>*/}
                        {/*    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"*/}
                        {/*         stroke="currentColor" aria-hidden="true">*/}
                        {/*        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"*/}
                        {/*              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>*/}
                        {/*    </svg>*/}
                        {/*</button>*/}

                        { isAuthenticated && <div className="ml-3 relative">
                            <div>
                                <button type="button"
                                        className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                                        id="user-menu-button" aria-expanded="false" aria-haspopup="true" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                                    <span className="sr-only">Benutzer Menü</span>
                                    <img className="h-8 w-8 rounded-full"
                                         src={user?.picture}
                                         alt=""/>
                                </button>
                            </div>

                            <div
                                ref={userMenuRef}
                                className={userMenuClass}
                                role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                                <Link to="/" className="block px-4 py-2 text-sm text-gray-700" role="menuitem"
                                      id="user-menu-item-0">Profil</Link>
                                <Link to="/" className="block px-4 py-2 text-sm text-gray-700" role="menuitem"
                                      id="user-menu-item-1">Einstellungen</Link>
                                <button onClick={() => logout({
                                    returnTo: window.location.origin
                                })} className="block px-4 py-2 text-sm text-gray-700" role="menuitem"
                                      id="user-menu-item-2">Abmelden</button>
                            </div>
                        </div> }
                    </div>
                </div>
            </div>

            <div className={mobileMenuClass} id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1">
                    <Link to="/" className="bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium"
                          aria-current="page">Dashboard</Link>
                    { !isAuthenticated && <LoginButton></LoginButton> }
                </div>
            </div>
        </nav>
    )
}

export default Nav;
