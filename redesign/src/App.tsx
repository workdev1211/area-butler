import React, {lazy, Suspense} from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Nav from "./layout/Nav";
import Footer from "./layout/Footer";
import {SearchContextProvider} from "./context/SearchContext";
import Authenticated from "./auth/authenticated";
import {PotentialCustomerContextProvider} from "./context/PotentialCustomerContext";

const LoadingMessage = () => (
    <div>Seite wird geladen...</div>
)

const ImpressPage = (
    lazy(() => (
        import('./pages/ImpressPage')
    ))
);

const PrivacyPage = (
    lazy(() => (
        import('./pages/PrivacyPage')
    ))
);

const SearchParamsPage = (
    lazy(() => (
        import('./pages/SearchParamsPage')
    ))
);

const SearchResultPage = (
    lazy(() => (
        import('./pages/SearchResultPage')
    ))
);

const PotentialCustomersPage = (
    lazy(() => (
        import('./pages/PotentialCustomersPage')
    ))
);

const PotentialCustomerPage = (
    lazy(() => (
        import('./pages/PotentialCustomerPage')
    ))
);

function App() {
    return (
        <Router>
            <div className="app">
                <Nav/>
                <Suspense fallback={<LoadingMessage/>}>
                    <Switch>
                        <Route path="/impress">
                            <ImpressPage/>
                        </Route>
                        <Route path="/privacy">
                            <PrivacyPage/>
                        </Route>
                        <Route path="/search-result">
                            <Authenticated>
                                <SearchContextProvider>
                                    <SearchResultPage/>
                                </SearchContextProvider>
                            </Authenticated>
                        </Route>
                        <Route path="/potential-customers/:customerId">
                            <Authenticated>
                                <PotentialCustomerContextProvider>
                                    <PotentialCustomerPage />
                                </PotentialCustomerContextProvider>
                            </Authenticated>
                        </Route>
                        <Route path="/potential-customers">
                            <Authenticated>
                                <PotentialCustomerContextProvider>
                                    <PotentialCustomersPage />
                                </PotentialCustomerContextProvider>
                            </Authenticated>
                        </Route>
                        <Route path="/">
                            <Authenticated>
                                <SearchContextProvider>
                                    <SearchParamsPage/>
                                </SearchContextProvider>
                            </Authenticated>
                        </Route>
                    </Switch>
                </Suspense>
                <Footer/>
            </div>
        </Router>
    );
}

export default App;
